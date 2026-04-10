import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Invalid auth token");
    const userId = userData.user.id;

    // Parse & validate input
    const { amount_cents, method, note } = await req.json();

    if (!amount_cents || typeof amount_cents !== "number" || amount_cents < 500) {
      throw new Error("Minimum withdrawal is $5.00");
    }
    if (amount_cents > 1_000_000_00) {
      throw new Error("Amount exceeds maximum");
    }
    if (!method || !["bank_transfer", "aba"].includes(method)) {
      throw new Error("Invalid withdrawal method");
    }

    // Get current wallet balance (with row lock via service role)
    const { data: wallet, error: walletError } = await supabase
      .from("customer_wallets")
      .select("id, balance_cents")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      throw new Error("Wallet not found. Please contact support.");
    }

    const currentBalance = wallet.balance_cents ?? 0;
    if (amount_cents > currentBalance) {
      throw new Error(`Insufficient balance. Available: $${(currentBalance / 100).toFixed(2)}`);
    }

    const newBalance = currentBalance - amount_cents;
    const methodLabel = method === "aba" ? "ABA / KHQR" : "Bank Transfer";
    const description = `Withdrawal via ${methodLabel}${note ? ` — ${note}` : ""}`;

    // Insert transaction record
    const { error: txError } = await supabase
      .from("customer_wallet_transactions")
      .insert({
        user_id: userId,
        amount_cents: -amount_cents,
        balance_after_cents: newBalance,
        type: "withdrawal",
        description,
      });

    if (txError) {
      console.error("Transaction insert error:", txError);
      throw new Error("Failed to record withdrawal");
    }

    // Deduct balance
    const { error: updateError } = await supabase
      .from("customer_wallets")
      .update({
        balance_cents: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Balance update error:", updateError);
      throw new Error("Failed to update balance");
    }

    // Send Telegram notification to admin
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
    if (botToken && chatId) {
      const msg = `💸 *Withdrawal Request*\nUser: ${userId}\nAmount: $${(amount_cents / 100).toFixed(2)}\nMethod: ${methodLabel}\nNote: ${note || "—"}\nNew Balance: $${(newBalance / 100).toFixed(2)}`;
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: msg,
            parse_mode: "Markdown",
          }),
        });
      } catch (e) {
        console.error("Telegram notification failed:", e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        new_balance_cents: newBalance,
        amount_cents,
        method: methodLabel,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Withdrawal failed";
    console.error("[WITHDRAWAL ERROR]", message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
