import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, proximity } = await req.json();
    
    if (!input || typeof input !== "string" || input.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Input must be at least 2 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!key) {
      console.error("[maps-autocomplete] GOOGLE_MAPS_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Maps service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(input.trim())}` +
      `&types=geocode|establishment` +
      `&key=${encodeURIComponent(key)}`;

    // Add proximity bias if provided
    if (proximity?.lat && proximity?.lng) {
      url += `&location=${proximity.lat},${proximity.lng}&radius=50000`;
    }

    console.log(`[maps-autocomplete] Fetching suggestions for: "${input.trim()}"`);

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("[maps-autocomplete] Google API error:", data.status, data.error_message);
      return new Response(JSON.stringify({ error: "Autocomplete service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const suggestions = (data.predictions ?? []).slice(0, 6).map((p: any) => ({
      description: p.description,
      place_id: p.place_id,
      main_text: p.structured_formatting?.main_text ?? p.description.split(",")[0],
    }));

    console.log(`[maps-autocomplete] Returning ${suggestions.length} suggestions`);

    return new Response(JSON.stringify({ ok: true, suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[maps-autocomplete] Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
