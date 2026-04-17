// pair-go-live: lets a paired phone (no auth) start/end live streams as the store owner.
// Validates the pair token against live_pair_sessions (must be confirmed + not expired/revoked)
// then performs the action server-side using the service role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  pair_token?: string;
  action?: "start" | "end" | "heartbeat";
  stream_id?: string;
  payload?: {
    title?: string;
    topic?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const { pair_token, action } = body;

    if (!pair_token || typeof pair_token !== "string") {
      return json(400, { error: "pair_token is required" });
    }
    if (!action || !["start", "end", "heartbeat"].includes(action)) {
      return json(400, { error: "invalid action" });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Validate the pair session via the secure RPC
    const { data: sessRows, error: sessErr } = await admin.rpc(
      "get_paired_session_by_token",
      { p_token: pair_token },
    );
    if (sessErr) {
      return json(401, { error: sessErr.message });
    }
    const sess = Array.isArray(sessRows) ? sessRows[0] : sessRows;
    if (!sess || !sess.store_owner_id) {
      return json(401, { error: "Pairing not valid for this store" });
    }

    const storeOwnerId = sess.store_owner_id as string;
    const storeId = sess.store_id as string;
    const storeName = (sess.store_name as string) ?? "Live Shop";
    const storeAvatar = (sess.store_avatar_url as string) ?? null;

    if (action === "start") {
      const title = (body.payload?.title || `${storeName} Live`).slice(0, 200);
      const topic = body.payload?.topic || "General";

      // Resume existing live stream if owner already has one
      const { data: existing } = await admin
        .from("live_streams")
        .select("id")
        .eq("user_id", storeOwnerId)
        .eq("status", "live")
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        return json(200, { stream_id: existing.id, resumed: true });
      }

      const { data: created, error: insErr } = await admin
        .from("live_streams")
        .insert({
          user_id: storeOwnerId,
          title,
          topic,
          host_name: storeName,
          host_avatar: storeAvatar,
          status: "live",
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insErr) return json(500, { error: insErr.message });
      return json(200, { stream_id: created.id, store_id: storeId });
    }

    if (action === "end") {
      if (!body.stream_id) return json(400, { error: "stream_id required" });
      const { error: updErr } = await admin
        .from("live_streams")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", body.stream_id)
        .eq("user_id", storeOwnerId)
        .eq("status", "live");
      if (updErr) return json(500, { error: updErr.message });
      return json(200, { ok: true });
    }

    // heartbeat — no-op for now, just confirm pairing still valid
    return json(200, { ok: true, store_id: storeId });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
});
