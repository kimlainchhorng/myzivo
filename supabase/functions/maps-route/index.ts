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
    const { origin_lat, origin_lng, dest_lat, dest_lng } = await req.json();
    
    if (
      origin_lat == null || origin_lng == null ||
      dest_lat == null || dest_lng == null
    ) {
      return new Response(JSON.stringify({ error: "Missing coordinates" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate coordinate ranges
    if (
      Math.abs(origin_lat) > 90 || Math.abs(dest_lat) > 90 ||
      Math.abs(origin_lng) > 180 || Math.abs(dest_lng) > 180
    ) {
      return new Response(JSON.stringify({ error: "Invalid coordinates" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!key) {
      console.error("[maps-route] GOOGLE_MAPS_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Maps service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Add departure_time=now for real-time traffic data
    const url = `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${origin_lat},${origin_lng}` +
      `&destination=${dest_lat},${dest_lng}` +
      `&mode=driving` +
      `&departure_time=now` +
      `&key=${encodeURIComponent(key)}`;

    console.log(`[maps-route] Fetching route: (${origin_lat},${origin_lng}) → (${dest_lat},${dest_lng})`);

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      console.error("[maps-route] Google API error:", data.status, data.error_message);
      return new Response(JSON.stringify({ ok: false, error: "No route found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const route = data.routes?.[0];
    const leg = route?.legs?.[0];

    if (!route || !leg) {
      return new Response(JSON.stringify({ ok: false, error: "No route found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert meters to miles
    const distanceMeters = leg.distance?.value ?? 0;
    const distanceMiles = distanceMeters / 1609.344;

    // Convert seconds to minutes (base duration without traffic)
    const durationSeconds = leg.duration?.value ?? 0;
    const durationMinutes = durationSeconds / 60;

    // Traffic-aware duration (when available)
    const durationInTrafficSeconds = leg.duration_in_traffic?.value ?? durationSeconds;
    const durationInTrafficMinutes = durationInTrafficSeconds / 60;

    // Calculate traffic ratio and level
    const trafficRatio = durationSeconds > 0 ? durationInTrafficSeconds / durationSeconds : 1.0;
    let trafficLevel: "light" | "moderate" | "heavy" = "moderate";
    if (trafficRatio < 1.1) {
      trafficLevel = "light";
    } else if (trafficRatio > 1.3) {
      trafficLevel = "heavy";
    }

    console.log(`[maps-route] Route found: ${distanceMiles.toFixed(2)} miles, ${Math.round(durationMinutes)} min (traffic: ${Math.round(durationInTrafficMinutes)} min, ${trafficLevel})`);

    return new Response(JSON.stringify({
      ok: true,
      distance_miles: Number(distanceMiles.toFixed(2)),
      duration_minutes: Math.max(1, Math.round(durationMinutes)),
      duration_in_traffic_minutes: Math.max(1, Math.round(durationInTrafficMinutes)),
      traffic_ratio: Number(trafficRatio.toFixed(2)),
      traffic_level: trafficLevel,
      polyline: route.overview_polyline?.points ?? null,
      start_address: leg.start_address,
      end_address: leg.end_address,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[maps-route] Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
