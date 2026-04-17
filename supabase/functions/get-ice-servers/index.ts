/**
 * get-ice-servers — returns STUN + TURN ICE servers for the live WebRTC flow.
 *
 * Uses Twilio Network Traversal Service (NTS) to mint short-lived TURN
 * credentials (TTL ~1h). Twilio NTS is server-managed: we never ship TURN
 * usernames/passwords in the bundle.
 *
 * Falls back to STUN-only if Twilio is not configured or the call fails,
 * so the function never blocks the live flow.
 */
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const STUN_FALLBACK = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");

  let iceServers: RTCIceServer[] = [...STUN_FALLBACK];

  if (sid && token) {
    try {
      const auth = btoa(`${sid}:${token}`);
      // Ttl is in seconds; 1 hour covers any reasonable broadcast.
      const body = new URLSearchParams({ Ttl: "3600" });
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Tokens.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        },
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.ice_servers)) {
          // Twilio returns { url, urls?, username?, credential? }
          // Normalize to spec-compliant `urls`.
          iceServers = data.ice_servers.map((s: any) => {
            const out: RTCIceServer = { urls: s.urls ?? s.url };
            if (s.username) (out as any).username = s.username;
            if (s.credential) (out as any).credential = s.credential;
            return out;
          });
          // Add a TURNS (TLS:443) entry so we can punch through deep-packet-
          // inspection firewalls (corporate / hotel Wi-Fi) that block plain
          // UDP/TCP TURN. Twilio's NTS doesn't include this by default.
          const sample = iceServers.find(
            (s: any) =>
              typeof s.urls === "string" && s.urls.startsWith("turn:") && s.username,
          ) as any;
          if (sample) {
            iceServers.push({
              urls: "turns:global.turn.twilio.com:443?transport=tcp",
              username: sample.username,
              credential: sample.credential,
            } as RTCIceServer);
          }
        } else {
          console.warn("[get-ice-servers] Twilio returned no ice_servers");
        }
      } else {
        const txt = await res.text();
        console.warn("[get-ice-servers] Twilio NTS failed", res.status, txt);
      }
    } catch (e) {
      console.warn("[get-ice-servers] Twilio NTS threw", e);
    }
  } else {
    console.warn("[get-ice-servers] Twilio creds missing — STUN only");
  }

  return new Response(
    JSON.stringify({ iceServers, ttlSeconds: 3600 }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    },
  );
});
