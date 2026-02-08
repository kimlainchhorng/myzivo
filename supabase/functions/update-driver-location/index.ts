import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// GPS spoof detection thresholds
const MAX_SPEED_MPH = 120; // Maximum realistic speed
const MAX_JUMP_MILES = 2; // Maximum realistic jump distance
const MIN_JUMP_TIME_SECONDS = 10; // Minimum time for large jump to be suspicious
const BAD_ACCURACY_THRESHOLD = 100; // Accuracy in meters

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.7613; // Earth radius in miles
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nowISO(): string {
  return new Date().toISOString();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { lat, lng, heading, speed, accuracy } = body;

    if (lat == null || lng == null) {
      return new Response(JSON.stringify({ error: "Missing lat/lng" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser();
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Get driver record
    const { data: driver, error: driverError } = await supabaseAdmin
      .from("drivers")
      .select("id, is_online, is_suspended")
      .eq("user_id", userId)
      .single();

    if (driverError || !driver) {
      return new Response(JSON.stringify({ error: "Driver not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if driver is suspended
    if (driver.is_suspended) {
      return new Response(
        JSON.stringify({ ok: false, suspended: true, reason: "Account suspended" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Ignore updates if driver is offline
    if (!driver.is_online) {
      return new Response(
        JSON.stringify({ ok: true, ignored: true, reason: "Driver offline" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const driverId = driver.id;
    const now = Date.now();

    // Load previous location from driver_location_history
    const { data: prevLocation } = await supabaseAdmin
      .from("driver_location_history")
      .select("lat, lng, recorded_at")
      .eq("driver_id", driverId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let isSuspicious = false;
    let speedMph: number | null = null;
    let distanceJumpMiles: number | null = null;
    let suspiciousReasons: string[] = [];

    // Check for GPS spoofing indicators
    if (prevLocation?.lat != null && prevLocation?.lng != null && prevLocation?.recorded_at) {
      const distance = haversineMiles(
        Number(prevLocation.lat),
        Number(prevLocation.lng),
        Number(lat),
        Number(lng)
      );
      distanceJumpMiles = distance;

      const prevTime = new Date(prevLocation.recorded_at).getTime();
      const deltaSeconds = Math.max(1, (now - prevTime) / 1000);
      const deltaHours = deltaSeconds / 3600;

      speedMph = distance / deltaHours;

      // Rule 1: Impossible speed (> 120 mph average)
      if (speedMph > MAX_SPEED_MPH) {
        isSuspicious = true;
        suspiciousReasons.push(`speed_${Math.round(speedMph)}_mph`);
      }

      // Rule 2: Large jump in short time (> 2 miles in < 10 seconds)
      if (distance > MAX_JUMP_MILES && deltaSeconds < MIN_JUMP_TIME_SECONDS) {
        isSuspicious = true;
        suspiciousReasons.push(`jump_${distance.toFixed(2)}_miles_in_${deltaSeconds}s`);
      }
    }

    // Rule 3: Bad accuracy repeatedly (tracked but not auto-flagged as suspicious alone)
    if (accuracy != null && accuracy > BAD_ACCURACY_THRESHOLD) {
      // Log but don't auto-flag unless combined with other issues
      console.log(`[GPS] Bad accuracy: ${accuracy}m for driver ${driverId}`);
    }

    // Update driver's current location in drivers table (includes last_active_at)
    await supabaseAdmin
      .from("drivers")
      .update({
        current_lat: lat,
        current_lng: lng,
        last_active_at: nowISO(),
        updated_at: nowISO(),
      })
      .eq("id", driverId);

    // Also upsert to driver_locations table for efficient realtime subscriptions
    await supabaseAdmin
      .from("driver_locations")
      .upsert({
        driver_id: driverId,
        lat,
        lng,
        heading: heading ?? null,
        speed: speed ?? null,
        updated_at: nowISO(),
      }, { onConflict: "driver_id" });

    // Insert into location history with GPS spoof detection data
    await supabaseAdmin.from("driver_location_history").insert({
      driver_id: driverId,
      lat,
      lng,
      heading: heading ?? null,
      speed: speed ?? null,
      accuracy: accuracy ?? null,
      prev_lat: prevLocation?.lat ?? null,
      prev_lng: prevLocation?.lng ?? null,
      prev_recorded_at: prevLocation?.recorded_at ?? null,
      is_suspicious: isSuspicious,
      speed_mph: speedMph,
      distance_jump_miles: distanceJumpMiles,
      recorded_at: nowISO(),
    });

    // If suspicious, log risk event and check rate limits
    if (isSuspicious) {
      // Log risk event (this will trigger the auto-suspend check via DB trigger)
      await supabaseAdmin.from("risk_events").insert({
        driver_id: driverId,
        user_id: userId,
        event_type: "gps_suspicious",
        severity: 3,
        details: {
          lat,
          lng,
          prev_lat: prevLocation?.lat,
          prev_lng: prevLocation?.lng,
          speed_mph: speedMph,
          distance_miles: distanceJumpMiles,
          accuracy,
          reasons: suspiciousReasons,
        },
      });

      // Check if we should block based on GPS flags today
      const { data: limits } = await supabaseAdmin
        .from("driver_limits")
        .select("gps_flags_today, is_blocked")
        .eq("driver_id", driverId)
        .maybeSingle();

      const currentFlags = (limits?.gps_flags_today ?? 0) + 1;

      // Update GPS flags count
      await supabaseAdmin
        .from("driver_limits")
        .upsert({
          driver_id: driverId,
          gps_flags_today: currentFlags,
          updated_at: nowISO(),
        }, { onConflict: "driver_id" });

      // Check if driver got auto-suspended by the trigger
      const { data: updatedDriver } = await supabaseAdmin
        .from("drivers")
        .select("is_suspended")
        .eq("id", driverId)
        .single();

      if (updatedDriver?.is_suspended) {
        return new Response(
          JSON.stringify({
            ok: false,
            suspended: true,
            reason: "Account suspended due to GPS anomalies",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        suspicious: isSuspicious,
        speed_mph: speedMph ? Math.round(speedMph) : null,
        distance_miles: distanceJumpMiles ? Number(distanceJumpMiles.toFixed(2)) : null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("update-driver-location error:", error);
    return new Response(
      JSON.stringify({ error: `Internal error: ${String(error)}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
