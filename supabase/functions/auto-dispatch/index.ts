import { serve, createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutoDispatchRequest {
  trip_id?: string;
  job_id?: string;
  max_drivers?: number;
  offer_ttl_seconds?: number;
}

interface DriverWithDistance {
  id: string;
  user_id: string;
  full_name: string;
  current_lat: number;
  current_lng: number;
  distance_km: number;
  rating: number;
  total_trips: number;
  vehicle_type: string;
  fcm_token: string | null;
  apns_token: string | null;
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const { trip_id, job_id, max_drivers = 3, offer_ttl_seconds = 25 }: AutoDispatchRequest = await req.json();

    // ─── JOB-BASED DISPATCH ───
    if (job_id) {
      console.log(`[auto-dispatch] Processing job: ${job_id}, max_drivers=${max_drivers}, ttl=${offer_ttl_seconds}s`);

      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", job_id)
        .single();

      if (jobError || !job) {
        console.error("[auto-dispatch] Job not found:", jobError);
        return new Response(
          JSON.stringify({ error: "Job not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (job.assigned_driver_id) {
        return new Response(
          JSON.stringify({ success: false, message: "Job already assigned", status: job.status }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find online, available drivers
      const { data: availableDrivers, error: driversError } = await supabase
        .from("drivers")
        .select("id, user_id, full_name, current_lat, current_lng, rating, total_trips, vehicle_type, fcm_token, apns_token")
        .eq("is_online", true)
        .eq("is_busy", false)
        .eq("is_suspended", false)
        .not("current_lat", "is", null)
        .not("current_lng", "is", null)
        .limit(max_drivers * 3);

      if (driversError) {
        console.error("[auto-dispatch] Error fetching drivers:", driversError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch available drivers" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[auto-dispatch] Found ${availableDrivers?.length || 0} online drivers for job`);

      if (!availableDrivers || availableDrivers.length === 0) {
        return new Response(
          JSON.stringify({ success: false, message: "No available drivers found", driver_count: 0 }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If job has pickup coords, sort by distance; otherwise pick first available
      let selectedDriver = availableDrivers[0];
      if (job.pickup_lat && job.pickup_lng) {
        const driversWithDistance = availableDrivers
          .map((d: any) => ({ ...d, distance_km: calculateDistance(job.pickup_lat, job.pickup_lng, d.current_lat, d.current_lng) }))
          .sort((a: any, b: any) => a.distance_km - b.distance_km);
        selectedDriver = driversWithDistance[0];
      }

      // Assign driver to job atomically
      const { data: updatedJob, error: updateError } = await supabase
        .from("jobs")
        .update({
          assigned_driver_id: selectedDriver.id,
          status: "assigned",
          updated_at: new Date().toISOString(),
        })
        .eq("id", job_id)
        .is("assigned_driver_id", null)
        .select()
        .single();

      if (updateError || !updatedJob) {
        console.error("[auto-dispatch] Failed to assign driver to job:", updateError);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to assign driver - job may have been claimed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark driver as busy
      await supabase.from("drivers").update({ is_busy: true, updated_at: new Date().toISOString() }).eq("id", selectedDriver.id);

      console.log(`[auto-dispatch] Assigned driver ${selectedDriver.id} to job ${job_id}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Driver assigned successfully",
          job_id,
          driver: {
            id: selectedDriver.id,
            name: selectedDriver.full_name,
            vehicle_type: selectedDriver.vehicle_type,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── TRIP-BASED DISPATCH (existing) ───
    if (!trip_id) {
      return new Response(
        JSON.stringify({ error: "trip_id or job_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[auto-dispatch] Processing trip: ${trip_id}`);

    // Fetch the trip
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", trip_id)
      .single();

    if (tripError || !trip) {
      console.error("[auto-dispatch] Trip not found:", tripError);
      return new Response(
        JSON.stringify({ error: "Trip not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only auto-dispatch if trip is in 'requested' status and not already assigned
    if (trip.status !== "requested" || trip.driver_id) {
      console.log(`[auto-dispatch] Trip already processed: status=${trip.status}, driver_id=${trip.driver_id}`);
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Trip already assigned or not in requested status",
          status: trip.status,
          driver_id: trip.driver_id
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if pickup coordinates exist
    if (!trip.pickup_lat || !trip.pickup_lng) {
      console.log("[auto-dispatch] Trip missing pickup coordinates");
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Trip missing pickup coordinates"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find all online, available drivers
    const { data: availableDrivers, error: driversError } = await supabase
      .from("drivers")
      .select("id, user_id, full_name, current_lat, current_lng, rating, total_trips, vehicle_type, fcm_token, apns_token")
      .eq("is_online", true)
      .eq("is_busy", false)
      .eq("is_suspended", false)
      .eq("rides_enabled", true)
      .not("current_lat", "is", null)
      .not("current_lng", "is", null);

    if (driversError) {
      console.error("[auto-dispatch] Error fetching drivers:", driversError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch available drivers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[auto-dispatch] Found ${availableDrivers?.length || 0} online drivers`);

    // No drivers available - keep status as 'requested'
    if (!availableDrivers || availableDrivers.length === 0) {
      console.log("[auto-dispatch] No available drivers found, keeping status as requested");
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "No available drivers found",
          status: "requested",
          driver_count: 0
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate distances and sort by nearest
    const driversWithDistance: DriverWithDistance[] = availableDrivers
      .map(driver => ({
        ...driver,
        distance_km: calculateDistance(
          trip.pickup_lat,
          trip.pickup_lng,
          driver.current_lat,
          driver.current_lng
        )
      }))
      .sort((a, b) => a.distance_km - b.distance_km);

    // Select nearest driver
    const nearestDriver = driversWithDistance[0];
    console.log(`[auto-dispatch] Nearest driver: ${nearestDriver.full_name} at ${nearestDriver.distance_km.toFixed(2)}km`);

    // Update trip with assigned driver using atomic update to prevent race conditions
    const { data: updatedTrip, error: updateError } = await supabase
      .from("trips")
      .update({
        driver_id: nearestDriver.id,
        status: "accepted",
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", trip_id)
      .eq("status", "requested")  // Atomic check to prevent race conditions
      .is("driver_id", null)
      .select()
      .single();

    if (updateError || !updatedTrip) {
      console.error("[auto-dispatch] Failed to assign driver (race condition or error):", updateError);
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Failed to assign driver - trip may have been claimed",
          error: updateError?.message
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark driver as busy
    await supabase
      .from("drivers")
      .update({ 
        is_busy: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", nearestDriver.id);

    // Send push notification to driver
    try {
      const notifyResponse = await fetch(`${supabaseUrl}/functions/v1/send-driver-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          driver_id: nearestDriver.id,
          title: "New Trip Assigned",
          body: `Pickup: ${trip.pickup_address}`,
          notification_type: "trip_assigned",
          data: {
            trip_id,
            pickup_address: trip.pickup_address,
            dropoff_address: trip.dropoff_address,
            fare_amount: trip.fare_amount
          }
        })
      });

      const notifyResult = await notifyResponse.json();
      console.log("[auto-dispatch] Driver notification result:", notifyResult);
    } catch (notifyError) {
      console.error("[auto-dispatch] Failed to send driver notification:", notifyError);
      // Don't fail the dispatch if notification fails
    }

    console.log(`[auto-dispatch] Successfully assigned driver ${nearestDriver.id} to trip ${trip_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Driver assigned successfully",
        trip_id,
        driver: {
          id: nearestDriver.id,
          name: nearestDriver.full_name,
          vehicle_type: nearestDriver.vehicle_type,
          distance_to_pickup_km: Number(nearestDriver.distance_km.toFixed(2)),
          rating: nearestDriver.rating
        },
        estimated_arrival_minutes: Math.ceil(nearestDriver.distance_km * 2) // Rough estimate: 2 min per km
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[auto-dispatch] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
