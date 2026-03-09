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
    // No auth required — route calculation is a public utility

    const { origin_lat, origin_lng, dest_lat, dest_lng, waypoints } = await req.json();
    
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
      Math.abs(origin_lng) > 180 || Math.abs(dest_lng) > 180 ||
      !isFinite(origin_lat) || !isFinite(origin_lng) ||
      !isFinite(dest_lat) || !isFinite(dest_lng)
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
    let url = `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${origin_lat},${origin_lng}` +
      `&destination=${dest_lat},${dest_lng}` +
      `&mode=driving` +
      `&departure_time=now` +
      `&key=${encodeURIComponent(key)}`;

    // Add waypoints if provided
    if (Array.isArray(waypoints) && waypoints.length > 0) {
      const waypointStr = waypoints
        .filter((wp: any) => wp?.lat != null && wp?.lng != null)
        .map((wp: any) => `${wp.lat},${wp.lng}`)
        .join("|");
      if (waypointStr) {
        url += `&waypoints=${encodeURIComponent(waypointStr)}`;
      }
    }

    console.debug(`[maps-route] Fetching route for user: ${user.id}`);

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
    const legs = route?.legs;

    if (!route || !legs || legs.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "No route found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sum distance and duration across all legs (multi-stop support)
    let totalDistanceMeters = 0;
    let totalDurationSeconds = 0;
    let totalDurationInTrafficSeconds = 0;

    const legDetails = [];
    for (const leg of legs) {
      const legDistM = leg.distance?.value ?? 0;
      const legDurS = leg.duration?.value ?? 0;
      const legDurTrafficS = leg.duration_in_traffic?.value ?? legDurS;

      totalDistanceMeters += legDistM;
      totalDurationSeconds += legDurS;
      totalDurationInTrafficSeconds += legDurTrafficS;

      legDetails.push({
        distance_miles: Number((legDistM / 1609.344).toFixed(2)),
        duration_minutes: Math.max(1, Math.round(legDurS / 60)),
        duration_in_traffic_minutes: Math.max(1, Math.round(legDurTrafficS / 60)),
        start_address: leg.start_address,
        end_address: leg.end_address,
      });
    }

    const distanceMiles = totalDistanceMeters / 1609.344;
    const durationMinutes = totalDurationSeconds / 60;
    const durationInTrafficMinutes = totalDurationInTrafficSeconds / 60;

    // Calculate traffic ratio and level
    const trafficRatio = totalDurationSeconds > 0 ? totalDurationInTrafficSeconds / totalDurationSeconds : 1.0;
    let trafficLevel: "light" | "moderate" | "heavy" = "moderate";
    if (trafficRatio < 1.1) {
      trafficLevel = "light";
    } else if (trafficRatio > 1.3) {
      trafficLevel = "heavy";
    }

    const firstLeg = legs[0];
    const lastLeg = legs[legs.length - 1];

    // Compute ETA as ISO string
    const etaMs = Date.now() + (totalDurationInTrafficSeconds * 1000);
    const eta_iso = new Date(etaMs).toISOString();

    return new Response(JSON.stringify({
      ok: true,
      distance_miles: Number(distanceMiles.toFixed(2)),
      duration_minutes: Math.max(1, Math.round(durationMinutes)),
      duration_in_traffic_minutes: Math.max(1, Math.round(durationInTrafficMinutes)),
      traffic_ratio: Number(trafficRatio.toFixed(2)),
      traffic_level: trafficLevel,
      eta_iso,
      polyline: route.overview_polyline?.points ?? null,
      start_address: firstLeg.start_address,
      end_address: lastLeg.end_address,
      legs: legDetails,
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
