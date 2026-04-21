import { createClient } from "../_shared/deps.ts";

// Immediate Twilio Proxy session teardown for a single ride.
// Invoked by a Postgres trigger when ride_requests.status hits a terminal value.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function closeTwilioSession(sessionSid: string): Promise<boolean> {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
  const token = Deno.env.get("TWILIO_AUTH_TOKEN")!;
  const proxySid = Deno.env.get("TWILIO_PROXY_SERVICE_SID")!;
  const auth = btoa(`${sid}:${token}`);
  const r = await fetch(`https://proxy.twilio.com/v1/Services/${proxySid}/Sessions/${sessionSid}`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "Status=closed",
  });
  if (!r.ok && r.status !== 404) {
    const txt = await r.text();
    console.warn("[close-ride-call-session] twilio close failed", r.status, txt);
    return false;
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Reject anon: require service role bearer (the trigger uses it)
    const authHeader = req.headers.get("Authorization") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!authHeader.includes(serviceKey)) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { ride_request_id } = await req.json();
    if (!ride_request_id) {
      return new Response(JSON.stringify({ error: "ride_request_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: sessions } = await admin
      .from("trip_call_sessions")
      .select("id, twilio_proxy_session_sid")
      .eq("ride_request_id", ride_request_id)
      .not("twilio_proxy_session_sid", "is", null);

    let closed = 0;
    for (const s of (sessions as any[]) || []) {
      try {
        if (s.twilio_proxy_session_sid) {
          await closeTwilioSession(s.twilio_proxy_session_sid);
        }
        await admin
          .from("trip_call_sessions")
          .update({ twilio_proxy_session_sid: null, expires_at: new Date().toISOString() } as any)
          .eq("id", s.id);
        closed++;
      } catch (e) {
        console.warn("[close-ride-call-session] failed for", s.id, e);
      }
    }

    return new Response(JSON.stringify({ ok: true, closed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[close-ride-call-session]", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
