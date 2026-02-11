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

    // Find scheduled campaigns that should start
    const { data: toStart } = await supabase
      .from("marketing_campaigns")
      .select("id")
      .eq("status", "scheduled")
      .lte("start_date", now);

    for (const campaign of toStart || []) {
      // Call execute-campaign for each
      await supabase.functions.invoke("execute-campaign", {
        body: { campaign_id: campaign.id },
      });
    }

    // Find running campaigns that should complete
    const { data: toComplete } = await supabase
      .from("marketing_campaigns")
      .select("id")
      .eq("status", "running")
      .not("end_date", "is", null)
      .lte("end_date", now);

    for (const campaign of toComplete || []) {
      await supabase
        .from("marketing_campaigns")
        .update({ status: "completed" })
        .eq("id", campaign.id);
    }

    return new Response(
      JSON.stringify({
        started: toStart?.length || 0,
        completed: toComplete?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
