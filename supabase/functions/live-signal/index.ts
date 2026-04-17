/**
 * live-signal — Authoritative WebRTC signaling endpoint.
 *
 * Why an edge function instead of direct table inserts?
 *   - Verifies the caller actually owns / is paired to the stream
 *   - Rate-limits per (user, stream) to stop signal floods
 *   - Auto-prunes signals older than 10 minutes
 *   - Records publisher heartbeats so the desktop can auto-end stale streams
 *
 * POST /live-signal
 *   { stream_id, from_role, to_role, type, payload? }
 */
// @ts-ignore - Deno std
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-pair-token, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Role = "publisher" | "viewer";
type SignalType = "join" | "offer" | "answer" | "ice" | "bye" | "heartbeat";

const ALLOWED_TYPES: SignalType[] = [
  "join",
  "offer",
  "answer",
  "ice",
  "bye",
  "heartbeat",
];

// In-memory rate limit: 30 signals / 5 s per (user, stream)
const buckets = new Map<string, number[]>();
function rateLimit(key: string, limit = 30, windowMs = 5_000): boolean {
  const now = Date.now();
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) return false;
  arr.push(now);
  buckets.set(key, arr);
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Auth — require a logged-in user OR a paired-device token.
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  const pairToken = req.headers.get("x-pair-token");

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stream_id: string | undefined = body?.stream_id;
  const from_role: Role | undefined = body?.from_role;
  const to_role: Role | undefined = body?.to_role;
  const type: SignalType | undefined = body?.type;
  const payload = body?.payload ?? {};

  if (
    !stream_id ||
    !from_role ||
    !to_role ||
    !type ||
    !ALLOWED_TYPES.includes(type) ||
    (from_role !== "publisher" && from_role !== "viewer") ||
    (to_role !== "publisher" && to_role !== "viewer")
  ) {
    return new Response(JSON.stringify({ error: "invalid_payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Resolve effective user id — either auth.uid() or the paired session's owner
  let effectiveUserId: string | null = null;
  let pairedStoreOwnerId: string | null = null;
  const { data: userRes } = await userClient.auth.getUser();
  if (userRes?.user?.id) effectiveUserId = userRes.user.id;

  if (!effectiveUserId && pairToken) {
    const { data: sess } = await admin
      .from("live_pair_sessions")
      .select("store_owner_id, status, device_expires_at, revoked_at")
      .eq("token", pairToken)
      .maybeSingle();
    if (
      sess &&
      sess.status === "confirmed" &&
      !sess.revoked_at &&
      (!sess.device_expires_at || new Date(sess.device_expires_at) > new Date())
    ) {
      effectiveUserId = sess.store_owner_id;
      pairedStoreOwnerId = sess.store_owner_id;
    }
  }

  if (!effectiveUserId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Confirm the stream exists, and (for publisher) that the caller owns it
  const { data: stream } = await admin
    .from("live_streams")
    .select("id, user_id, status, ended_at")
    .eq("id", stream_id)
    .maybeSingle();

  if (!stream) {
    return new Response(JSON.stringify({ error: "stream_not_found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (from_role === "publisher" && stream.user_id !== effectiveUserId) {
    return new Response(JSON.stringify({ error: "not_publisher" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!rateLimit(`${effectiveUserId}:${stream_id}`)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Heartbeat is a no-op signal that just refreshes the row
  if (type === "heartbeat") {
    if (from_role === "publisher") {
      await admin
        .from("live_streams")
        .update({ last_publisher_heartbeat: new Date().toISOString() })
        .eq("id", stream_id)
        .eq("user_id", effectiveUserId);
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error: insertError } = await admin.from("live_stream_signals").insert({
    stream_id,
    from_role,
    to_role,
    type,
    payload,
  });

  if (insertError) {
    return new Response(
      JSON.stringify({ error: "insert_failed", details: insertError.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Refresh heartbeat on every publisher signal too
  if (from_role === "publisher") {
    await admin
      .from("live_streams")
      .update({ last_publisher_heartbeat: new Date().toISOString() })
      .eq("id", stream_id)
      .eq("user_id", effectiveUserId);
  }

  // Opportunistic prune (cheap, fire-and-forget)
  admin
    .from("live_stream_signals")
    .delete()
    .lt("created_at", new Date(Date.now() - 10 * 60_000).toISOString())
    .then(() => null, () => null);

  return new Response(JSON.stringify({ ok: true, paired: !!pairedStoreOwnerId }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
