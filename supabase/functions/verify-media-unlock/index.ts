import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data } = await anonClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("Not authenticated");

    const { message_id } = await req.json();
    if (!message_id) throw new Error("Missing message_id");

    // Check if there's a completed unlock
    const { data: unlock } = await supabaseClient
      .from("media_unlocks")
      .select("*")
      .eq("message_id", message_id)
      .eq("buyer_id", user.id)
      .eq("status", "completed")
      .maybeSingle();

    if (unlock) {
      return new Response(JSON.stringify({ unlocked: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check pending unlocks and verify with Stripe
    const { data: pending } = await supabaseClient
      .from("media_unlocks")
      .select("*")
      .eq("message_id", message_id)
      .eq("buyer_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pending?.stripe_session_id) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });
      const session = await stripe.checkout.sessions.retrieve(pending.stripe_session_id);

      if (session.payment_status === "paid") {
        await supabaseClient
          .from("media_unlocks")
          .update({ status: "completed", updated_at: new Date().toISOString() })
          .eq("id", pending.id);

        // Notify the media owner they earned money from an unlock
        try {
          const { data: msg } = await supabaseClient
            .from("messages")
            .select("sender_id")
            .eq("id", message_id)
            .single();
          if (msg?.sender_id && msg.sender_id !== user.id) {
            const { data: buyerProfile } = await supabaseClient
              .from("profiles")
              .select("full_name")
              .eq("user_id", user.id)
              .single();
            const amountCents = pending.price_cents || session.amount_total || 0;
            const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
            const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
            await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceKey}` },
              body: JSON.stringify({
                user_id: msg.sender_id,
                notification_type: "media_unlocked",
                title: "Content Unlocked! 💎",
                body: `${buyerProfile?.full_name || "Someone"} unlocked your media${amountCents > 0 ? ` for $${(amountCents / 100).toFixed(2)}` : ""}`,
                data: { type: "media_unlocked", buyer_id: user.id, message_id, action_url: "/wallet" },
              }),
            });
          }
        } catch (e) { console.error("[verify-media-unlock] Push notify error:", e); }

        return new Response(JSON.stringify({ unlocked: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ unlocked: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
