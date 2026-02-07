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
    const { place_id } = await req.json();
    
    if (!place_id || typeof place_id !== "string") {
      return new Response(JSON.stringify({ error: "Missing place_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!key) {
      console.error("[maps-place-details] GOOGLE_MAPS_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Maps service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${encodeURIComponent(place_id)}` +
      `&fields=formatted_address,geometry/location,name` +
      `&key=${encodeURIComponent(key)}`;

    console.log(`[maps-place-details] Fetching details for place_id: ${place_id}`);

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      console.error("[maps-place-details] Google API error:", data.status, data.error_message);
      return new Response(JSON.stringify({ error: "Place details unavailable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = data.result;
    const lat = result?.geometry?.location?.lat;
    const lng = result?.geometry?.location?.lng;

    if (lat == null || lng == null) {
      return new Response(JSON.stringify({ error: "No coordinates found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[maps-place-details] Found: ${result?.formatted_address} (${lat}, ${lng})`);

    return new Response(JSON.stringify({
      ok: true,
      address: result?.formatted_address ?? "",
      name: result?.name ?? "",
      lat,
      lng,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[maps-place-details] Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
