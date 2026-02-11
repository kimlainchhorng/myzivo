/**
 * Push Campaign Scheduler Edge Function
 * Processes scheduled push campaigns when their send_at time arrives
 * 
 * Run via cron: Every 5 minutes
 */

import { serve, createClient } from "../_shared/deps.ts";

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

    const now = new Date().toISOString();

    // Find campaigns that are scheduled and ready to send
    const { data: campaigns, error } = await supabase
      .from("push_campaigns")
      .select("id, name")
      .eq("status", "scheduled")
      .lte("send_at", now);

    if (error) {
      throw error;
    }

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      campaigns: [] as { id: string; name: string; status: string; sent?: number }[],
    };

    for (const campaign of campaigns || []) {
      try {
        // Call send-segment-push for each campaign
        const { data, error: sendError } = await supabase.functions.invoke("send-segment-push", {
          body: { campaign_id: campaign.id },
        });

        if (sendError) {
          console.error(`Failed to send campaign ${campaign.id}:`, sendError);
          
          // Mark campaign as failed
          await supabase
            .from("push_campaigns")
            .update({ status: "failed" })
            .eq("id", campaign.id);

          results.failed++;
          results.campaigns.push({
            id: campaign.id,
            name: campaign.name,
            status: "failed",
          });
        } else {
          results.sent++;
          results.campaigns.push({
            id: campaign.id,
            name: campaign.name,
            status: "sent",
            sent: data?.sent || 0,
          });
        }

        results.processed++;
      } catch (err) {
        console.error(`Error processing campaign ${campaign.id}:`, err);
        results.failed++;
        results.campaigns.push({
          id: campaign.id,
          name: campaign.name,
          status: "error",
        });
      }
    }

    console.log(`Push campaign scheduler completed: ${results.processed} processed, ${results.sent} sent, ${results.failed} failed`);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("push-campaign-scheduler error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
