/**
 * Send Segment Push Edge Function
 * Sends push notifications to users matching a segment or campaign
 */

import { serve, createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_DAILY_PUSHES = 5;

interface SegmentRules {
  roles?: string[];
  driver_is_online?: boolean;
  driver_status?: string;
  last_order_days_ago?: number;
  has_ordered_ever?: boolean;
  has_membership?: boolean;
  city?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { campaign_id, segment_id, title, body, url } = await req.json();

    let campaignTitle = title;
    let campaignBody = body;
    let campaignUrl = url;
    let rules: SegmentRules = {};
    let targetAll = false;

    // If campaign_id provided, load campaign details
    if (campaign_id) {
      const { data: campaign, error: campaignError } = await supabase
        .from("push_campaigns")
        .select("*, segment:push_segments(*)")
        .eq("id", campaign_id)
        .single();

      if (campaignError || !campaign) {
        return new Response(JSON.stringify({ error: "Campaign not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update campaign status to sending
      await supabase
        .from("push_campaigns")
        .update({ status: "sending" })
        .eq("id", campaign_id);

      campaignTitle = campaign.title;
      campaignBody = campaign.body;
      campaignUrl = campaign.url;
      targetAll = campaign.target_type === "all";
      
      if (campaign.segment) {
        rules = campaign.segment.rules_json || {};
      }
    } else if (segment_id) {
      const { data: segment } = await supabase
        .from("push_segments")
        .select("*")
        .eq("id", segment_id)
        .single();

      if (segment) {
        rules = segment.rules_json || {};
      }
    }

    // Resolve users from segment rules
    const userIds = await resolveSegmentUsers(supabase, rules, targetAll);
    const today = new Date().toISOString().split("T")[0];

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const userId of userIds) {
      try {
        // Check rate limit
        const { data: limit } = await supabase
          .from("push_user_daily_limits")
          .select("push_count")
          .eq("user_id", userId)
          .eq("date", today)
          .single();

        if (limit && limit.push_count >= MAX_DAILY_PUSHES) {
          // Log skip
          if (campaign_id) {
            await supabase.from("push_delivery_log").insert({
              campaign_id,
              user_id: userId,
              status: "skipped",
              skip_reason: "rate_limited",
            });
          }
          skipped++;
          continue;
        }

        // Get active subscriptions
        const { data: subscriptions } = await supabase
          .from("push_subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true);

        if (!subscriptions || subscriptions.length === 0) {
          if (campaign_id) {
            await supabase.from("push_delivery_log").insert({
              campaign_id,
              user_id: userId,
              status: "skipped",
              skip_reason: "no_subscription",
            });
          }
          skipped++;
          continue;
        }

        // Send via existing send-push-notification function
        const { error: pushError } = await supabase.functions.invoke("send-push-notification", {
          body: {
            user_id: userId,
            notification_type: "campaign",
            title: campaignTitle,
            body: campaignBody,
            data: { type: "campaign", url: campaignUrl, campaign_id },
          },
        });

        if (pushError) {
          if (campaign_id) {
            await supabase.from("push_delivery_log").insert({
              campaign_id,
              user_id: userId,
              status: "failed",
              error: pushError.message,
            });
          }
          failed++;
        } else {
          if (campaign_id) {
            await supabase.from("push_delivery_log").insert({
              campaign_id,
              user_id: userId,
              status: "sent",
            });
          }

          // Update rate limit
          await supabase
            .from("push_user_daily_limits")
            .upsert({
              user_id: userId,
              date: today,
              push_count: (limit?.push_count || 0) + 1,
            }, {
              onConflict: "user_id,date",
            });

          sent++;
        }
      } catch (err) {
        console.error(`Error sending to ${userId}:`, err);
        failed++;
      }
    }

    // Update campaign stats
    if (campaign_id) {
      await supabase
        .from("push_campaigns")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          targeted_count: userIds.length,
          sent_count: sent,
          failed_count: failed,
          skipped_count: skipped,
        })
        .eq("id", campaign_id);
    }

    return new Response(
      JSON.stringify({ sent, failed, skipped, targeted: userIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-segment-push error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function resolveSegmentUsers(
  supabase: any,
  rules: SegmentRules,
  targetAll: boolean
): Promise<string[]> {
  const userIds = new Set<string>();

  if (targetAll || Object.keys(rules).length === 0) {
    // Get all users with push subscriptions
    const { data } = await supabase
      .from("push_subscriptions")
      .select("user_id")
      .eq("is_active", true);
    
    data?.forEach((d: any) => d.user_id && userIds.add(d.user_id));
    return [...userIds];
  }

  // Role-based targeting
  if (rules.roles && rules.roles.length > 0) {
    for (const role of rules.roles) {
      if (role === "driver") {
        let query = supabase.from("drivers").select("user_id");
        if (rules.driver_is_online !== undefined) {
          query = query.eq("is_online", rules.driver_is_online);
        }
        if (rules.driver_status) {
          query = query.eq("status", rules.driver_status);
        }
        const { data } = await query;
        data?.forEach((d: any) => d.user_id && userIds.add(d.user_id));
      } else if (role === "merchant") {
        const { data } = await supabase
          .from("restaurants")
          .select("owner_id")
          .not("owner_id", "is", null);
        data?.forEach((r: any) => r.owner_id && userIds.add(r.owner_id));
      } else if (role === "customer") {
        if (rules.last_order_days_ago) {
          // Inactive customers
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - rules.last_order_days_ago);
          
          const { data: allOrders } = await supabase
            .from("food_orders")
            .select("customer_id")
            .not("customer_id", "is", null);
          
          const { data: recentOrders } = await supabase
            .from("food_orders")
            .select("customer_id")
            .gte("created_at", cutoffDate.toISOString());
          
          const allCustomers = new Set(allOrders?.map((o: any) => o.customer_id));
          const activeCustomers = new Set(recentOrders?.map((o: any) => o.customer_id));
          
          allCustomers.forEach((id) => {
            if (!activeCustomers.has(id)) userIds.add(id);
          });
        } else if (rules.has_ordered_ever) {
          const { data } = await supabase
            .from("food_orders")
            .select("customer_id")
            .not("customer_id", "is", null);
          
          const customers = new Set(data?.map((o: any) => o.customer_id));
          customers.forEach((id) => userIds.add(id));
        } else {
          // All profiles
          const { data } = await supabase
            .from("profiles")
            .select("user_id")
            .limit(10000);
          data?.forEach((p: any) => userIds.add(p.user_id));
        }
      } else if (role === "admin") {
        const { data } = await supabase
          .from("user_roles")
          .select("user_id")
          .in("role", ["admin", "super_admin"]);
        data?.forEach((r: any) => userIds.add(r.user_id));
      }
    }
  }

  // Membership filter
  if (rules.has_membership !== undefined) {
    const { data: members } = await supabase
      .from("user_memberships")
      .select("user_id")
      .eq("status", "active");
    
    const memberIds = new Set(members?.map((m: any) => m.user_id));
    
    if (rules.has_membership) {
      const filtered = [...userIds].filter((id) => memberIds.has(id));
      userIds.clear();
      filtered.forEach((id) => userIds.add(id));
    } else {
      const filtered = [...userIds].filter((id) => !memberIds.has(id));
      userIds.clear();
      filtered.forEach((id) => userIds.add(id));
    }
  }

  // City filter
  if (rules.city) {
    const { data: locations } = await supabase
      .from("saved_locations")
      .select("user_id")
      .ilike("city", `%${rules.city}%`);
    
    const cityUserIds = new Set(locations?.map((l: any) => l.user_id));
    const filtered = [...userIds].filter((id) => cityUserIds.has(id));
    userIds.clear();
    filtered.forEach((id) => userIds.add(id));
  }

  // Final filter: only users with active push subscriptions
  const { data: subscribed } = await supabase
    .from("push_subscriptions")
    .select("user_id")
    .eq("is_active", true)
    .in("user_id", [...userIds]);

  const subscribedIds = new Set(subscribed?.map((s: any) => s.user_id));
  return [...userIds].filter((id) => subscribedIds.has(id));
}
