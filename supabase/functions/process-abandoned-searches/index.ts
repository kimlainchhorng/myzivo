/**
 * Process Abandoned Searches Edge Function
 * 
 * Runs on a schedule to find and email users who searched but didn't checkout
 * Should be invoked by a cron job every 15-30 minutes
 */

import { serve, createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get abandoned search settings
    const { data: settings } = await supabase
      .from("email_settings")
      .select("setting_value")
      .eq("setting_key", "abandoned_search")
      .single();

    const emailSettings = settings?.setting_value as Record<string, unknown> || {
      enabled: true,
      delay_minutes: 45
    };

    if (!emailSettings.enabled) {
      return new Response(
        JSON.stringify({ success: true, message: "Abandoned search emails disabled", processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const delayMinutes = (emailSettings.delay_minutes as number) || 45;
    const cutoffTime = new Date(Date.now() - delayMinutes * 60 * 1000).toISOString();

    // Find abandoned searches that haven't been emailed yet
    const { data: abandonedSearches, error: fetchError } = await supabase
      .from("abandoned_searches")
      .select("*")
      .eq("checkout_initiated", false)
      .eq("email_sent", false)
      .lt("searched_at", cutoffTime)
      .limit(50); // Process in batches

    if (fetchError) {
      throw new Error(`Failed to fetch abandoned searches: ${fetchError.message}`);
    }

    if (!abandonedSearches || abandonedSearches.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No abandoned searches to process", processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing ${abandonedSearches.length} abandoned searches`);

    let processed = 0;
    let errors = 0;

    for (const search of abandonedSearches) {
      try {
        const searchParams = search.search_params as Record<string, unknown> || {};
        
        // Build continue search URL
        const baseUrl = `https://hizovo.com/${search.search_type}`;
        const continueSearchUrl = `${baseUrl}?origin=${searchParams.origin || ''}&destination=${searchParams.destination || ''}&departureDate=${searchParams.departureDate || ''}&returnDate=${searchParams.returnDate || ''}&utm_source=email&utm_medium=abandoned_search&utm_campaign=recovery`;

        // Send abandoned search email
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-travel-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            type: "abandoned_search",
            recipientEmail: search.email,
            data: {
              origin: searchParams.origin,
              destination: searchParams.destination,
              searchType: search.search_type,
              departureDate: searchParams.departureDate,
              returnDate: searchParams.returnDate,
              continueSearchUrl,
              searchSessionId: search.search_session_id,
            },
          }),
        });

        if (emailResponse.ok) {
          // Mark as emailed
          await supabase
            .from("abandoned_searches")
            .update({
              email_sent: true,
              email_sent_at: new Date().toISOString(),
            })
            .eq("id", search.id);

          processed++;
        } else {
          errors++;
          console.error(`Failed to send email to ${search.email}`);
        }
      } catch (err) {
        errors++;
        console.error(`Error processing search ${search.id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed abandoned searches`,
        processed,
        errors,
        total: abandonedSearches.length
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Process abandoned searches error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
