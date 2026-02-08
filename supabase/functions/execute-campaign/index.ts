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

    const { campaign_id } = await req.json();

    if (!campaign_id) {
      return new Response(JSON.stringify({ error: "campaign_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("marketing_campaigns")
      .select("*")
      .eq("id", campaign_id)
      .single();

    if (campaignError || !campaign) {
      return new Response(JSON.stringify({ error: "Campaign not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get targeted users (simplified - all profiles for now)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, email, full_name")
      .limit(1000);

    let usersTargeted = 0;

    for (const profile of profiles || []) {
      // Create notification
      const { data: notification } = await supabase
        .from("notifications")
        .insert({
          user_id: profile.user_id,
          title: campaign.notification_title || campaign.name,
          body: campaign.notification_body || campaign.message,
          type: "marketing",
          channel: "push",
          is_read: false,
        })
        .select()
        .single();

      // Record delivery
      await supabase.from("campaign_deliveries").insert({
        campaign_id,
        user_id: profile.user_id,
        notification_id: notification?.id,
        status: "sent",
        sent_at: new Date().toISOString(),
      });

      usersTargeted++;
    }

    // Update campaign status
    await supabase
      .from("marketing_campaigns")
      .update({
        status: "running",
        executed_at: new Date().toISOString(),
      })
      .eq("id", campaign_id);

    // Update stats
    await supabase.from("marketing_campaign_stats").upsert({
      campaign_id,
      users_targeted: usersTargeted,
      notifications_sent: usersTargeted,
    });

    return new Response(
      JSON.stringify({ success: true, users_targeted: usersTargeted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
