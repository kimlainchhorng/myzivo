import { createClient } from "../_shared/deps.ts";

// Cron cleanup: closes Twilio Proxy sessions for rides that ended >5min ago.
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

async function closeTwilioSession(sessionSid: string) {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
  const token = Deno.env.get("TWILIO_AUTH_TOKEN")!;
  const proxySid = Deno.env.get("TWILIO_PROXY_SERVICE_SID")!;
  const auth = btoa(`${sid}:${token}`);
  const r = await fetch(`https://proxy.twilio.com/v1/Services/${proxySid}/Sessions/${sessionSid}`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "Status=closed",
  });
  return r.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Find sessions whose ride is completed/cancelled OR expired
    const { data: sessions } = await admin
      .from("trip_call_sessions")
      .select("id, twilio_proxy_session_sid, ride_request_id, expires_at, ride_requests!inner(status)")
      .lt("expires_at", cutoff)
      .not("twilio_proxy_session_sid", "is", null)
      .limit(100);

    let closed = 0;
    for (const s of (sessions as any[]) || []) {
      try {
        if (s.twilio_proxy_session_sid) {
          await closeTwilioSession(s.twilio_proxy_session_sid);
        }
        await admin.from("trip_call_sessions").update({ twilio_proxy_session_sid: null } as any).eq("id", s.id);
        closed++;
      } catch (e) {
        console.warn("[close-trip-call-sessions] close failed", s.id, e);
      }
    }

    return new Response(JSON.stringify({ ok: true, closed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[close-trip-call-sessions]", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
