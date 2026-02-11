import { serve, createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DispatchRequest {
  trip_id: string;
  driver_id?: string; // Optional - if not provided, find nearest available driver
  force?: boolean; // Force assign even if driver has active trip
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
  is_online: boolean;
  is_busy: boolean;
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

    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin"
    });

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const { trip_id, driver_id, force = false }: DispatchRequest = await req.json();

    if (!trip_id) {
      return new Response(
        JSON.stringify({ error: "trip_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the trip
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", trip_id)
      .single();

    if (tripError || !trip) {
      return new Response(
        JSON.stringify({ error: "Trip not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if trip is already assigned
    if (trip.driver_id && trip.status !== "requested" && !force) {
      return new Response(
        JSON.stringify({ 
          error: "Trip already assigned",
          current_driver_id: trip.driver_id,
          status: trip.status
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let selectedDriver: DriverWithDistance | null = null;

    if (driver_id) {
      // Specific driver requested - fetch and validate
      const { data: driver, error: driverError } = await supabase
        .from("drivers")
        .select("id, user_id, full_name, current_lat, current_lng, rating, total_trips, vehicle_type, is_online, is_busy, is_suspended")
        .eq("id", driver_id)
        .single();

      if (driverError || !driver) {
        return new Response(
          JSON.stringify({ error: "Driver not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (driver.is_suspended) {
        return new Response(
          JSON.stringify({ error: "Driver is suspended" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (driver.is_busy && !force) {
        return new Response(
          JSON.stringify({ error: "Driver is busy with another trip. Use force=true to override." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const distance = calculateDistance(
        trip.pickup_lat,
        trip.pickup_lng,
        driver.current_lat || 0,
        driver.current_lng || 0
      );

      selectedDriver = { ...driver, distance_km: distance };
    } else {
      // Find nearest available driver
      const { data: availableDrivers, error: driversError } = await supabase
        .from("drivers")
        .select("id, user_id, full_name, current_lat, current_lng, rating, total_trips, vehicle_type, is_online, is_busy")
        .eq("is_online", true)
        .eq("is_busy", false)
        .eq("verification_status", "verified")
        .eq("is_suspended", false)
        .not("current_lat", "is", null)
        .not("current_lng", "is", null);

      if (driversError) {
        console.error("Error fetching drivers:", driversError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch available drivers" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!availableDrivers || availableDrivers.length === 0) {
        return new Response(
          JSON.stringify({ 
            error: "No available drivers found",
            suggestion: "All drivers are either offline, busy, or unverified"
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      selectedDriver = driversWithDistance[0];

      console.log(`Found ${driversWithDistance.length} available drivers. Nearest: ${selectedDriver.full_name} at ${selectedDriver.distance_km.toFixed(2)}km`);
    }

    if (!selectedDriver) {
      return new Response(
        JSON.stringify({ error: "No driver available for dispatch" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update trip with assigned driver
    const { error: updateError } = await supabase
      .from("trips")
      .update({
        driver_id: selectedDriver.id,
        status: "assigned"
      })
      .eq("id", trip_id);

    if (updateError) {
      console.error("Error updating trip:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to assign driver to trip" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark driver as busy
    await supabase
      .from("drivers")
      .update({ is_busy: true })
      .eq("id", selectedDriver.id);

    // Log admin action
    await supabase.from("admin_driver_actions").insert({
      admin_id: user.id,
      driver_id: selectedDriver.id,
      action_type: "manual_dispatch",
      reason: `Manually dispatched to trip ${trip_id}`,
      metadata: {
        trip_id,
        pickup_address: trip.pickup_address,
        dropoff_address: trip.dropoff_address,
        distance_to_pickup_km: selectedDriver.distance_km,
        force_assigned: force
      }
    });

    // Send notification to driver
    try {
      const notifyResponse = await fetch(`${supabaseUrl}/functions/v1/send-driver-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          driver_id: selectedDriver.id,
          title: "New Trip Assigned",
          body: `You have been assigned a trip from ${trip.pickup_address}`,
          notification_type: "trip_assigned",
          data: {
            trip_id,
            pickup_address: trip.pickup_address,
            dropoff_address: trip.dropoff_address
          }
        })
      });

      console.log("Driver notification sent:", await notifyResponse.json());
    } catch (notifyError) {
      console.error("Failed to send driver notification:", notifyError);
      // Don't fail the dispatch if notification fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Trip dispatched successfully",
        trip_id,
        driver: {
          id: selectedDriver.id,
          name: selectedDriver.full_name,
          vehicle_type: selectedDriver.vehicle_type,
          distance_to_pickup_km: Number(selectedDriver.distance_km.toFixed(2)),
          rating: selectedDriver.rating
        },
        estimated_arrival_minutes: Math.ceil(selectedDriver.distance_km * 2) // Rough estimate: 2 min per km
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in manual-dispatch:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
