// create-p2p-transfer — creates chat-backed wallet sends and money requests.
import { createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MIN_AMOUNT_CENTS = 100;
const MAX_AMOUNT_CENTS = 100_000_00;

type Mode = "send" | "request";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return json(null);
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "unauthorized", message: "Please sign in again" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData.user) {
      return json({ error: "unauthorized", message: "Please sign in again" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const currentUserId = authData.user.id;
    const counterpartyId = String(body?.counterparty_id ?? "").trim();
    const amountCents = Math.round(Number(body?.amount_cents ?? 0));
    const mode = String(body?.mode ?? "send") === "request" ? "request" : "send";
    const note = String(body?.note ?? "").trim().slice(0, 80);

    if (!isUuid(counterpartyId)) {
      return json({ error: "invalid_recipient", message: "Recipient is not valid" }, 400);
    }
    if (counterpartyId === currentUserId) {
      return json({ error: "invalid_recipient", message: "Choose someone else" }, 400);
    }
    if (!Number.isFinite(amountCents) || amountCents < MIN_AMOUNT_CENTS || amountCents > MAX_AMOUNT_CENTS) {
      return json({ error: "invalid_amount", message: "Enter a valid amount" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const senderId = mode === "request" ? counterpartyId : currentUserId;
    const receiverId = mode === "request" ? currentUserId : counterpartyId;

    if (mode === "send") {
      const { data: wallet, error: walletError } = await admin
        .from("customer_wallets")
        .select("balance_cents")
        .eq("user_id", currentUserId)
        .maybeSingle();
      if (walletError) {
        return json({ error: "wallet_unavailable", message: "Wallet is not ready yet" }, 400);
      }
      if (Number(wallet?.balance_cents ?? 0) < amountCents) {
        return json({ error: "insufficient_funds", message: "Not enough wallet balance" }, 400);
      }
    }

    const transferId = crypto.randomUUID();
    const { error: transferError } = await admin
      .from("p2p_transfers")
      .insert({
        id: transferId,
        sender_id: senderId,
        receiver_id: receiverId,
        amount_cents: amountCents,
        note: note || null,
        status: "pending",
      });
    if (transferError) {
      console.error("[create-p2p-transfer] transfer insert failed", transferError);
      return json({ error: "transfer_failed", message: "Couldn't create transfer" }, 400);
    }

    const message =
      mode === "request"
        ? `Requested $${(amountCents / 100).toFixed(2)}${note ? ` for "${note}"` : ""}`
        : `Sent $${(amountCents / 100).toFixed(2)}${note ? ` for "${note}"` : ""}`;

    const { data: messageRow, error: messageError } = await admin
      .from("direct_messages")
      .insert({
        sender_id: currentUserId,
        receiver_id: counterpartyId,
        message,
        message_type: "p2p_transfer",
        file_payload: { transferId, amount_cents: amountCents, note: note || null, mode },
      })
      .select("id")
      .single();

    if (messageError || !messageRow) {
      console.error("[create-p2p-transfer] message insert failed", messageError);
      await admin.from("p2p_transfers").delete().eq("id", transferId);
      return json({ error: "message_failed", message: "Couldn't create chat request" }, 400);
    }

    await admin
      .from("p2p_transfers")
      .update({ message_id: messageRow.id })
      .eq("id", transferId);

    return json({ ok: true, transfer_id: transferId, message_id: messageRow.id, mode });
  } catch (error) {
    console.error("[create-p2p-transfer]", error);
    return json({ error: "internal_error", message: "Couldn't complete transfer" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
