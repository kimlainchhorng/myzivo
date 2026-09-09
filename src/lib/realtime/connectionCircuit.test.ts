import {describe,it,expect,vi} from 'vitest';
import {createClient} from '@supabase/supabase-js';
import {installRealtimeCircuit,liveUpdateSnapshot,retryLiveUpdates,setRealtimeRouteActive} from './connectionCircuit';
import {routeNeedsRealtime} from './routePolicy';

describe('Realtime circuit with the installed SDK transport',()=>{
  it('automatically retries five times, pauses static routes, preserves the cap and recovers explicitly',async()=>{
    vi.useFakeTimers();
    let attempts=0,fail=true;
    class Transport {
      static CONNECTING=0;static OPEN=1;static CLOSING=2;static CLOSED=3;
      readyState=0;binaryType='';onopen:((e:Event)=>void)|null=null;onerror:((e:Event)=>void)|null=null;
      onclose:((e:CloseEvent)=>void)|null=null;onmessage:((e:MessageEvent)=>void)|null=null;
      constructor(){
        attempts++;
        setTimeout(()=>{if(fail){this.readyState=3;this.onerror?.(new Event('error'));this.onclose?.({code:1011,wasClean:false} as CloseEvent);}
          else{this.readyState=1;this.onopen?.(new Event('open'));}},10);
      }
      send(raw:string){
        const m=JSON.parse(raw);
        if(m[3]==='phx_join'||m[3]==='phx_leave')queueMicrotask(()=>this.onmessage?.({data:JSON.stringify([m[0],m[1],m[2],'phx_reply',{status:'ok',response:{postgres_changes:[]}}])} as MessageEvent));
      }
      close(){this.readyState=3;queueMicrotask(()=>this.onclose?.({code:1000,wasClean:true} as CloseEvent));}
    }
    const client=createClient('https://example.supabase.co','public-key',{auth:{persistSession:false,autoRefreshToken:false},realtime:{transport:Transport as never}});
    installRealtimeCircuit(client.realtime);setRealtimeRouteActive(true);
    client.channel('transport-health').subscribe();
    await vi.advanceTimersByTimeAsync(40_000);
    expect(attempts).toBe(5);expect(liveUpdateSnapshot()).toBe('unavailable');
    client.realtime.connect();expect(attempts).toBe(5);
    setRealtimeRouteActive(false);expect(liveUpdateSnapshot()).toBe('idle');
    client.channel('static-registration').subscribe();await vi.advanceTimersByTimeAsync(1000);expect(attempts).toBe(5);
    setRealtimeRouteActive(true);await vi.advanceTimersByTimeAsync(1000);expect(attempts).toBe(5);expect(liveUpdateSnapshot()).toBe('unavailable');
    fail=false;retryLiveUpdates();await vi.advanceTimersByTimeAsync(100);
    expect(attempts).toBe(6);expect(liveUpdateSnapshot()).toBe('connected');
    setRealtimeRouteActive(false);await vi.advanceTimersByTimeAsync(100);expect(liveUpdateSnapshot()).toBe('idle');
    const removed=client.removeAllChannels();await vi.advanceTimersByTimeAsync(35_000);await removed;
    vi.useRealTimers();
  });
  it('makes one attempt per page load, not a burst, while the endpoint is failing',async()=>{
    // The report was "the feed makes 5 attempts per load". Five is the whole
    // budget, spent over ~15s of exponential spacing -- but that is only true if
    // exactly one attempt is ever in flight. A burst would spend the budget
    // instantly and raise the banner in the first second. Pin the spacing.
    vi.useFakeTimers();
    let attempts=0;
    class Failing {
      static CONNECTING=0;static OPEN=1;static CLOSING=2;static CLOSED=3;
      readyState=0;binaryType='';onopen:((e:Event)=>void)|null=null;onerror:((e:Event)=>void)|null=null;
      onclose:((e:CloseEvent)=>void)|null=null;onmessage:((e:MessageEvent)=>void)|null=null;
      constructor(){
        attempts++;
        setTimeout(()=>{this.readyState=3;this.onerror?.(new Event('error'));this.onclose?.({code:1011,wasClean:false} as CloseEvent);},10);
      }
      send(){}
      close(){this.readyState=3;queueMicrotask(()=>this.onclose?.({code:1000,wasClean:true} as CloseEvent));}
    }
    const client=createClient('https://example.supabase.co','public-key',{auth:{persistSession:false,autoRefreshToken:false},realtime:{transport:Failing as never}});
    installRealtimeCircuit(client.realtime);setRealtimeRouteActive(true);
    client.channel('burst-check').subscribe();

    // First backoff is 1s, so nothing may retry inside it.
    await vi.advanceTimersByTimeAsync(900);
    expect(attempts,'a failing endpoint must not be retried inside the first backoff').toBe(1);
    // Second attempt lands after 1s, and still only one at a time.
    await vi.advanceTimersByTimeAsync(1_200);
    expect(attempts).toBe(2);
    // The budget is spent over seconds, not at once.
    await vi.advanceTimersByTimeAsync(40_000);
    expect(attempts).toBe(5);

    const removed=client.removeAllChannels();await vi.advanceTimersByTimeAsync(35_000);await removed;
    vi.useRealTimers();
  });

  it('keeps live workflow routes enabled while static travel pages need no socket',()=>{
    for(const path of ['/flights','/hotels','/jobs','/contact','/legal/privacy','/login'])expect(routeNeedsRealtime(path)).toBe(false);
    for(const path of ['/feed','/chat','/wallet','/eats/orders/123','/hotels/booking/123'])expect(routeNeedsRealtime(path)).toBe(true);
  });
});
