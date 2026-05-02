// chat-transfer-coins — peer-to-peer coin transfer + chat message
import { createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    if (!jwt) return json({ error: "Unauthorized" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
    const { data: udata } = await userClient.auth.getUser();
    if (!udata?.user) return json({ error: "Unauthorized" }, 401);
    const fromUser = udata.user.id;

    const body = await req.json().catch(() => ({}));
    const toUser = String(body.to_user || "").trim();
    const amount = Math.max(1, Math.floor(Number(body.amount) || 0));
    const note = body.note ? String(body.note).slice(0, 200) : null;

    if (!toUser || amount <= 0) return json({ error: "Invalid input" }, 400);
    if (toUser === fromUser) return json({ error: "Cannot send to yourself" }, 400);

    const admin = createClient(url, service);
    const { error: rpcErr } = await admin.rpc("fn_transfer_coins", {
      p_from: fromUser, p_to: toUser, p_amount: amount,
    });
    if (rpcErr) return json({ error: rpcErr.message || "Transfer failed" }, 400);

    const { data: msg, error: msgErr } = await admin
      .from("direct_messages")
      .insert({
        sender_id: fromUser,
        receiver_id: toUser,
        message: `💰 Sent ${amount} coins${note ? ` — ${note}` : ""}`,
        message_type: "coin_transfer",
        gift_payload: { amount, note, kind: "coin_transfer" },
      })
      .select("id").single();
    if (msgErr) return json({ error: "Transfer ok, message failed", message_error: msgErr.message }, 207);

    await admin.from("coin_transfers").insert({
      from_user: fromUser, to_user: toUser, amount, note, message_id: msg.id, status: "completed",
    });

    const { data: bal } = await admin.from("user_coin_balances").select("balance").eq("user_id", fromUser).maybeSingle();
    return json({ ok: true, message_id: msg.id, new_balance: bal?.balance ?? null });
  } catch (e) {
    return json({ error: (e as Error).message || "Internal error" }, 500);
  }
});

function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
