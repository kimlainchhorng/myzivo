/**
 * PairedStreamViewer — Desktop viewer for the paired phone's live broadcast.
 *
 * Flow:
 *   1. Wait for the phone to create a `live_streams` row (status='live') for
 *      the paired store owner.
 *   2. Open a recvonly RTCPeerConnection.
 *   3. Send a "join" signal → phone responds with "offer" → we send "answer".
 *   4. Exchange ICE candidates via Realtime.
 *   5. Render the received MediaStream in a muted <video>.
 */
import { useEffect, useRef, useState } from "react";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { optimizeAvatar } from "@/utils/optimizeAvatar";
import { supabase } from "@/integrations/supabase/client";
import { ICE_SERVERS, sendSignal, subscribeSignals } from "@/lib/liveWebrtc";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  storeOwnerId: string;
  storeName?: string | null;
  storeAvatarUrl?: string | null;
  streamIdHint?: string | null;
}

type ViewerState =
  | "waiting-for-stream"
  | "connecting"
  | "live"
  | "disconnected";

export default function PairedStreamViewer({
  storeOwnerId,
  storeName,
  storeAvatarUrl,
  streamIdHint,
}: Props) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [streamId, setStreamId] = useState<string | null>(streamIdHint ?? null);
  const [state, setState] = useState<ViewerState>(streamIdHint ? "connecting" : "waiting-for-stream");

  useEffect(() => {
    if (streamIdHint) {
      setStreamId((prev) => (prev === streamIdHint ? prev : streamIdHint));
      setState("connecting");
    }
  }, [streamIdHint]);

  // 1) Find the active live stream for this store owner (poll + realtime)
  useEffect(() => {
    if (!storeOwnerId) return;
    let cancelled = false;

    const findLive = async () => {
      if (streamIdHint) {
        if (!cancelled) {
          setStreamId(streamIdHint);
          setState("connecting");
        }
        return;
      }

      const { data } = await (supabase as any)
        .from("live_streams")
        .select("id")
        .eq("user_id", storeOwnerId)
        .eq("status", "live")
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (data?.id) {
        setStreamId((prev) => (prev === data.id ? prev : data.id));
        setState("connecting");
      } else {
        setStreamId(null);
        setState("waiting-for-stream");
        if (videoRef.current) videoRef.current.srcObject = null;
      }
    };

    findLive();
    const poll = setInterval(findLive, 3000);

    const ch = supabase
      .channel(`paired-viewer-watch-${storeOwnerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_streams", filter: `user_id=eq.${storeOwnerId}` },
        (payload: any) => {
          if (payload.new?.status === "live" && !payload.new?.ended_at && !cancelled) {
            setStreamId(payload.new.id);
            setState("connecting");
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_streams", filter: `user_id=eq.${storeOwnerId}` },
        (payload: any) => {
          if (cancelled) return;
          if (payload.new?.status === "live" && !payload.new?.ended_at) {
            setStreamId(payload.new.id);
            setState("connecting");
            return;
          }
          if (payload.new?.status === "ended") {
            setStreamId((prev) => (prev === payload.new.id ? null : prev));
            setState("waiting-for-stream");
            if (videoRef.current) videoRef.current.srcObject = null;
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      clearInterval(poll);
      try { supabase.removeChannel(ch); } catch {}
    };
  }, [storeOwnerId, streamIdHint]);

  // 2) Once we have a streamId, set up the WebRTC viewer connection
  useEffect(() => {
    if (!streamId) return;

    let active = true;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    const pendingIce: RTCIceCandidateInit[] = [];
    setState("connecting");
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    const flushIce = async () => {
      while (pendingIce.length) {
        const c = pendingIce.shift()!;
        try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) {
          console.warn("[viewer] queued ICE failed", e);
        }
      }
    };

    pc.ontrack = (ev) => {
      if (videoRef.current && ev.streams[0]) {
        videoRef.current.srcObject = ev.streams[0];
        setState("live");
      }
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate && active) {
        sendSignal(streamId, "viewer", "publisher", "ice", ev.candidate.toJSON());
      }
    };

    pc.onconnectionstatechange = () => {
      const nextState = pc.connectionState;
      if (nextState === "connected") {
        setState("live");
        return;
      }

      if (nextState === "failed" || nextState === "disconnected" || nextState === "closed") {
        setState("disconnected");
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          if (!active) return;
          if (videoRef.current) videoRef.current.srcObject = null;
          setStreamId(null);
          setState("waiting-for-stream");
        }, 1200);
      }
    };

    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });

    const unsub = subscribeSignals(streamId, "viewer", async (row) => {
      try {
        if (row.type === "offer") {
          if (pc.signalingState !== "stable") {
            console.log("[viewer] ignoring offer, state=", pc.signalingState);
            return;
          }
          await pc.setRemoteDescription(new RTCSessionDescription(row.payload));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal(streamId, "viewer", "publisher", "answer", { type: answer.type, sdp: answer.sdp });
          await flushIce();
        } else if (row.type === "ice" && row.payload) {
          if (!pc.remoteDescription) {
            pendingIce.push(row.payload);
            return;
          }
          try { await pc.addIceCandidate(new RTCIceCandidate(row.payload)); } catch (e) {
            console.warn("[viewer] addIceCandidate failed", e);
          }
        } else if (row.type === "bye") {
          if (videoRef.current) videoRef.current.srcObject = null;
          setStreamId(null);
          setState("waiting-for-stream");
        }
      } catch (e) {
        console.warn("[PairedStreamViewer] signal handling error", e);
      }
    });

    if (user?.id) {
      (supabase as any)
        .from("live_viewers")
        .insert({ stream_id: streamId, user_id: user.id })
        .then(() => null, () => null);
    }

    sendSignal(streamId, "viewer", "publisher", "join", {});
    // Retry join only while we have NOT yet received an offer (no remote desc).
    // Once negotiation has started, retrying would force the publisher to
    // re-create the offer and thrash ICE — never reaching "connected".
    const joinRetry = setInterval(() => {
      if (!active) return;
      if (pc.remoteDescription) return; // offer already received
      if (pc.connectionState === "connected") return;
      sendSignal(streamId, "viewer", "publisher", "join", {});
    }, 2000);

    return () => {
      active = false;
      clearInterval(joinRetry);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (user?.id) {
        (supabase as any)
          .from("live_viewers")
          .delete()
          .eq("stream_id", streamId)
          .eq("user_id", user.id)
          .then(() => null, () => null);
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      try { unsub(); } catch {}
      try { pc.close(); } catch {}
      pcRef.current = null;
    };
  }, [streamId, user?.id]);

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover bg-black"
      />

      {state !== "live" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-zinc-900 to-black px-6 text-center">
          <Avatar className="h-16 w-16 ring-2 ring-white/20 shadow-xl">
            <AvatarImage src={optimizeAvatar(storeAvatarUrl ?? null, 128)} alt={storeName ?? ""} />
            <AvatarFallback className="bg-zinc-800 text-white text-xl font-bold">
              {storeName?.[0]?.toUpperCase() ?? "S"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-white font-bold text-sm">{storeName ?? "Live Shop"}</p>
            {state === "waiting-for-stream" && (
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                Waiting for phone to go live…
              </div>
            )}
            {state === "connecting" && (
              <div className="flex items-center gap-2 text-emerald-400 text-xs">
                <Wifi className="h-3 w-3 animate-pulse" />
                Connecting to phone…
              </div>
            )}
            {state === "disconnected" && (
              <div className="flex items-center gap-2 text-red-400 text-xs">
                <WifiOff className="h-3 w-3" />
                Reconnecting to latest stream…
              </div>
            )}
          </div>
        </div>
      )}

      {state === "live" && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-red-500 rounded-full px-2 py-1 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-white text-[10px] font-black tracking-wider">LIVE</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full pl-0.5 pr-2 py-0.5">
            <Avatar className="h-5 w-5 ring-1 ring-white/30">
              <AvatarImage src={optimizeAvatar(storeAvatarUrl ?? null, 48)} alt={storeName ?? ""} />
              <AvatarFallback className="bg-zinc-700 text-white text-[9px] font-bold">
                {storeName?.[0]?.toUpperCase() ?? "S"}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] font-semibold text-white truncate max-w-[120px]">{storeName}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Paired" />
          </div>
        </div>
      )}
    </div>
  );
}
