// supabase/functions/livekit-token/index.ts
// Issues a short-lived LiveKit JWT for an authenticated user to join a room.
// Also creates the matching `video_call_sessions` row on first join (host),
// and a `video_call_participants` row on every join.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { AccessToken } from "https://esm.sh/livekit-server-sdk@2.7.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  roomName: string;
  callType?: "audio" | "video";
  asHost?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lkUrl = Deno.env.get("LIVEKIT_URL");
    const lkKey = Deno.env.get("LIVEKIT_API_KEY");
    const lkSecret = Deno.env.get("LIVEKIT_API_SECRET");

    if (!lkUrl || !lkKey || !lkSecret) {
      return json({ error: "LiveKit secrets missing" }, 500);
    }

    // Identify the caller from their JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: uerr } = await userClient.auth.getUser();
    if (uerr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const body = (await req.json()) as Body;
    if (!body?.roomName || typeof body.roomName !== "string" || body.roomName.length > 80) {
      return json({ error: "Invalid roomName" }, 400);
    }

    const admin = createClient(url, serviceKey);

    // Find or create the session row
    const { data: existing } = await admin
      .from("video_call_sessions")
      .select("id, host_id, mode, ended_at")
      .eq("room_name", body.roomName)
      .maybeSingle();

    let sessionId: string;
    let isHost = false;

    if (!existing || existing.ended_at) {
      // First joiner becomes host
      const { data: created, error: cerr } = await admin
        .from("video_call_sessions")
        .insert({
          room_name: body.roomName,
          host_id: user.id,
          mode: "sfu",
          call_type: body.callType ?? "video",
        })
        .select("id")
        .single();
      if (cerr) return json({ error: cerr.message }, 500);
      sessionId = created.id;
      isHost = true;
    } else {
      sessionId = existing.id;
      isHost = existing.host_id === user.id;
    }

    // Upsert participant row
    await admin
      .from("video_call_participants")
      .upsert(
        {
          session_id: sessionId,
          user_id: user.id,
          is_host: isHost,
          joined_at: new Date().toISOString(),
          left_at: null,
        },
        { onConflict: "session_id,user_id" },
      );

    // Mint LiveKit JWT (1 h)
    const at = new AccessToken(lkKey, lkSecret, {
      identity: user.id,
      name: user.email ?? user.id,
      ttl: 60 * 60,
    });
    at.addGrant({
      roomJoin: true,
      room: body.roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomRecord: isHost,
      roomAdmin: isHost,
    });

    const token = await at.toJwt();

    return json({
      token,
      url: lkUrl,
      sessionId,
      isHost,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
