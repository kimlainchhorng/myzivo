import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = {
      abandoned_cart: { processed: 0, sent: 0 },
      reengagement: { processed: 0, sent: 0 },
      birthday: { processed: 0, sent: 0 },
    };

    const now = new Date();

    // ─── 1. ABANDONED CART (30-60 min old pending orders) ───
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
    const sixtyMinAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    const { data: abandonedOrders } = await supabase
      .from("food_orders")
      .select("id, customer_id, restaurant_id, total")
      .in("status", ["cart", "pending"])
      .gte("created_at", sixtyMinAgo)
      .lte("created_at", thirtyMinAgo)
      .limit(100);

    for (const order of abandonedOrders || []) {
      results.abandoned_cart.processed++;

      // Check if already sent
      const { data: existing } = await supabase
        .from("automated_message_log")
        .select("id")
        .eq("user_id", order.customer_id)
        .eq("trigger_type", "abandoned_cart")
        .eq("trigger_ref", order.id)
        .maybeSingle();

      if (existing) continue;

      // Check user preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("automated_messages_enabled, automated_cart_reminders, email_enabled, in_app_enabled")
        .eq("user_id", order.customer_id)
        .maybeSingle();

      if (prefs && (!prefs.automated_messages_enabled || !prefs.automated_cart_reminders)) continue;

      // Verify order is still abandoned (not completed)
      const { data: currentOrder } = await supabase
        .from("food_orders")
        .select("status")
        .eq("id", order.id)
        .single();

      if (!currentOrder || !["cart", "pending"].includes(currentOrder.status)) continue;

      // Send notification
      const message = "You left items in your cart! Complete your order before prices change.";
      const channel = prefs?.in_app_enabled !== false ? "push" : "email";

      await supabase.from("notifications").insert({
        user_id: order.customer_id,
        title: "Don't forget your order! 🛒",
        body: message,
        type: "automated",
        channel,
        is_read: false,
      });

      await supabase.from("automated_message_log").insert({
        user_id: order.customer_id,
        trigger_type: "abandoned_cart",
        trigger_ref: order.id,
        channel,
        message_preview: message,
      });

      results.abandoned_cart.sent++;
    }

    // ─── 2. RE-ENGAGEMENT (no orders in 7 days) ───
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

    // Get users who have ordered before but not in 7 days
    const { data: activeUsers } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .limit(500);

    for (const profile of activeUsers || []) {
      results.reengagement.processed++;

      // Check if they have recent orders
      const { data: recentOrders } = await supabase
        .from("food_orders")
        .select("id")
        .eq("customer_id", profile.user_id)
        .gte("created_at", sevenDaysAgo)
        .limit(1);

      if (recentOrders && recentOrders.length > 0) continue;

      // Check they have at least one past order
      const { data: anyOrders } = await supabase
        .from("food_orders")
        .select("id")
        .eq("customer_id", profile.user_id)
        .limit(1);

      if (!anyOrders || anyOrders.length === 0) continue;

      // Check cooldown (14 days since last reengagement message)
      const { data: recentMsg } = await supabase
        .from("automated_message_log")
        .select("id")
        .eq("user_id", profile.user_id)
        .eq("trigger_type", "reengagement")
        .gte("sent_at", fourteenDaysAgo)
        .maybeSingle();

      if (recentMsg) continue;

      // Check preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("automated_messages_enabled, automated_reengagement, email_enabled, in_app_enabled")
        .eq("user_id", profile.user_id)
        .maybeSingle();

      if (prefs && (!prefs.automated_messages_enabled || !prefs.automated_reengagement)) continue;

      const message = "We miss you! Here's a special offer to welcome you back.";
      const channel = "push";

      await supabase.from("notifications").insert({
        user_id: profile.user_id,
        title: "We miss you! 💛",
        body: message,
        type: "automated",
        channel,
        is_read: false,
      });

      await supabase.from("automated_message_log").insert({
        user_id: profile.user_id,
        trigger_type: "reengagement",
        trigger_ref: `inactive_${now.toISOString().slice(0, 10)}`,
        channel,
        message_preview: message,
      });

      results.reengagement.sent++;
    }

    // ─── 3. BIRTHDAY COUPON ───
    const todayMonth = now.getMonth() + 1;
    const todayDay = now.getDate();
    const thisYear = now.getFullYear().toString();

    const { data: birthdayProfiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, date_of_birth")
      .not("date_of_birth", "is", null)
      .limit(1000);

    for (const profile of birthdayProfiles || []) {
      if (!profile.date_of_birth) continue;

      const dob = new Date(profile.date_of_birth);
      if (dob.getMonth() + 1 !== todayMonth || dob.getDate() !== todayDay) continue;

      results.birthday.processed++;

      // Check if already sent this year
      const { data: existingBday } = await supabase
        .from("automated_message_log")
        .select("id")
        .eq("user_id", profile.user_id)
        .eq("trigger_type", "birthday")
        .eq("trigger_ref", `birthday_${thisYear}`)
        .maybeSingle();

      if (existingBday) continue;

      // Check preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("automated_messages_enabled, automated_birthday, email_enabled, in_app_enabled")
        .eq("user_id", profile.user_id)
        .maybeSingle();

      if (prefs && (!prefs.automated_messages_enabled || !prefs.automated_birthday)) continue;

      const name = profile.full_name?.split(" ")[0] || "there";
      const message = `Happy Birthday, ${name}! 🎂 Enjoy a special treat on us.`;

      await supabase.from("notifications").insert({
        user_id: profile.user_id,
        title: "Happy Birthday! 🎉",
        body: message,
        type: "automated",
        channel: "push",
        is_read: false,
      });

      await supabase.from("automated_message_log").insert({
        user_id: profile.user_id,
        trigger_type: "birthday",
        trigger_ref: `birthday_${thisYear}`,
        channel: "push",
        message_preview: message,
      });

      results.birthday.sent++;
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
