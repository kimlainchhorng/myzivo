import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EatsDispatchRequest {
  order_id: string;
  exclude_driver_ids?: string[];
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
  active_order_count: number;
  fcm_token: string | null;
  apns_token: string | null;
}

// Configuration
const MAX_ACTIVE_ORDERS = 2;
const AVG_SPEED_KM_PER_MIN = 0.5; // ~30 km/h in city traffic
const MAX_SEARCH_RADIUS_KM = 15;

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

// Calculate ETA based on distances with demand buffer
function calculateETA(
  driverLat: number, 
  driverLng: number,
  restaurantLat: number, 
  restaurantLng: number,
  customerLat: number | null, 
  customerLng: number | null,
  surgeMultiplier: number = 1.0
) {
  const distanceToRestaurant = calculateDistance(driverLat, driverLng, restaurantLat, restaurantLng);
  const etaPickupMinutes = Math.ceil(distanceToRestaurant / AVG_SPEED_KM_PER_MIN);
  
  let etaDeliveryMinutes = 15; // Default estimate
  if (customerLat && customerLng) {
    const distanceToCustomer = calculateDistance(restaurantLat, restaurantLng, customerLat, customerLng);
    etaDeliveryMinutes = Math.ceil(distanceToCustomer / AVG_SPEED_KM_PER_MIN);
  }
  
  // Add demand buffer based on surge level
  let demandBuffer = 0;
  if (surgeMultiplier > 1.5) {
    demandBuffer = 10; // High demand: +10 min
  } else if (surgeMultiplier > 1.0) {
    demandBuffer = 5;  // Medium demand: +5 min
  }
  
  const totalMinutes = etaPickupMinutes + etaDeliveryMinutes + demandBuffer;
  const now = new Date();
  
  return {
    eta_pickup: new Date(now.getTime() + etaPickupMinutes * 60 * 1000).toISOString(),
    eta_dropoff: new Date(now.getTime() + totalMinutes * 60 * 1000).toISOString(),
    eta_minutes: totalMinutes,
    demand_buffer: demandBuffer,
  };
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
    const { order_id, exclude_driver_ids = [] }: EatsDispatchRequest = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "order_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[eats-auto-dispatch] Processing order: ${order_id}`);

    // Fetch the order with restaurant info
    const { data: order, error: orderError } = await supabase
      .from("food_orders")
      .select(`
        *,
        restaurants:restaurant_id (
          id, name, address, lat, lng
        )
      `)
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error("[eats-auto-dispatch] Order not found:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only dispatch if order is ready and not assigned
    if (order.status !== "ready_for_pickup" || order.driver_id) {
      console.log(`[eats-auto-dispatch] Order already processed: status=${order.status}, driver_id=${order.driver_id}`);
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Order already assigned or not ready for pickup",
          status: order.status,
          driver_id: order.driver_id
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if needs_driver is explicitly false (pickup order)
    if (order.needs_driver === false) {
      console.log("[eats-auto-dispatch] Order is pickup, no driver needed");
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Order is pickup, no driver needed"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get restaurant coordinates
    const restaurant = order.restaurants;
    if (!restaurant?.lat || !restaurant?.lng) {
      console.log("[eats-auto-dispatch] Restaurant missing coordinates");
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Restaurant missing coordinates"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find all eligible drivers with active order count
    // Query drivers first
    const { data: availableDrivers, error: driversError } = await supabase
      .from("drivers")
      .select("id, user_id, full_name, current_lat, current_lng, rating, total_trips, fcm_token, apns_token")
      .eq("is_online", true)
      .eq("status", "verified")
      .neq("eats_enabled", false)
      .neq("is_suspended", true)
      .not("current_lat", "is", null)
      .not("current_lng", "is", null);

    if (driversError) {
      console.error("[eats-auto-dispatch] Error fetching drivers:", driversError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch available drivers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[eats-auto-dispatch] Found ${availableDrivers?.length || 0} online drivers`);

    if (!availableDrivers || availableDrivers.length === 0) {
      console.log("[eats-auto-dispatch] No available drivers found");
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "No available drivers found",
          driver_count: 0
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get active order counts for each driver
    const driverIds = availableDrivers.map(d => d.id);
    const { data: activeOrders } = await supabase
      .from("food_orders")
      .select("driver_id")
      .in("driver_id", driverIds)
      .in("status", ["confirmed", "ready_for_pickup", "in_progress"]);

    // Count active orders per driver
    const activeOrderCounts = new Map<string, number>();
    for (const ao of activeOrders || []) {
      if (ao.driver_id) {
        activeOrderCounts.set(ao.driver_id, (activeOrderCounts.get(ao.driver_id) || 0) + 1);
      }
    }

    // Calculate distances and filter by load + distance
    const driversWithDistance: DriverWithDistance[] = availableDrivers
      .map(driver => ({
        ...driver,
        distance_km: calculateDistance(
          restaurant.lat,
          restaurant.lng,
          driver.current_lat,
          driver.current_lng
        ),
        active_order_count: activeOrderCounts.get(driver.id) || 0
      }))
      .filter(d => 
        d.active_order_count < MAX_ACTIVE_ORDERS && 
        d.distance_km <= MAX_SEARCH_RADIUS_KM &&
        !exclude_driver_ids.includes(d.id)
      )
      .sort((a, b) => a.distance_km - b.distance_km);

    console.log(`[eats-auto-dispatch] ${driversWithDistance.length} eligible drivers after filtering`);

    if (driversWithDistance.length === 0) {
      console.log("[eats-auto-dispatch] No eligible drivers (all overloaded or too far)");
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "No eligible drivers available (all busy or too far)",
          driver_count: 0
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Select nearest driver (DIRECT mode)
    const nearestDriver = driversWithDistance[0];
    console.log(`[eats-auto-dispatch] Nearest driver: ${nearestDriver.full_name} at ${nearestDriver.distance_km.toFixed(2)}km`);

    // Fetch current surge multiplier for demand-aware ETA
    let surgeMultiplier = 1.0;
    try {
      const { data: surgeData } = await supabase
        .from("surge_multipliers")
        .select("multiplier")
        .eq("zone", "GLOBAL")
        .single();
      
      if (surgeData?.multiplier) {
        surgeMultiplier = Math.min(Number(surgeData.multiplier), 2.5); // Cap at 2.5x
        console.log(`[eats-auto-dispatch] Current surge multiplier: ${surgeMultiplier}`);
      }
    } catch (surgeErr) {
      console.log("[eats-auto-dispatch] Could not fetch surge, using default");
    }

    // Calculate ETA with demand buffer
    const eta = calculateETA(
      nearestDriver.current_lat,
      nearestDriver.current_lng,
      restaurant.lat,
      restaurant.lng,
      order.delivery_lat,
      order.delivery_lng,
      surgeMultiplier
    );

    console.log(`[eats-auto-dispatch] ETA: ${eta.eta_minutes} min (includes ${eta.demand_buffer} min demand buffer)`);

    // Atomically assign driver to prevent race conditions
    const { data: updatedOrder, error: updateError } = await supabase
      .from("food_orders")
      .update({
        driver_id: nearestDriver.id,
        status: "in_progress",
        assigned_at: new Date().toISOString(),
        eta_pickup: eta.eta_pickup,
        eta_dropoff: eta.eta_dropoff,
        eta_minutes: eta.eta_minutes,
        updated_at: new Date().toISOString()
      })
      .eq("id", order_id)
      .eq("status", "ready_for_pickup")
      .is("driver_id", null)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      console.error("[eats-auto-dispatch] Failed to assign driver:", updateError);
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Failed to assign driver - order may have been claimed",
          error: updateError?.message
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log dispatch event
    await supabase.from("order_events").insert({
      order_id,
      event_type: "driver_assigned",
      meta: {
        driver_id: nearestDriver.id,
        driver_name: nearestDriver.full_name,
        distance_km: nearestDriver.distance_km,
        eta_minutes: eta.eta_minutes,
        dispatch_type: "auto"
      }
    });

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
          title: "🍔 New Delivery Order",
          body: `Pickup from ${restaurant.name}`,
          notification_type: "eats_order_assigned",
          data: {
            order_id,
            restaurant_name: restaurant.name,
            restaurant_address: restaurant.address,
            delivery_address: order.delivery_address,
            payout_cents: order.driver_payout_cents
          }
        })
      });

      const notifyResult = await notifyResponse.json();
      console.log("[eats-auto-dispatch] Driver notification result:", notifyResult);
    } catch (notifyError) {
      console.error("[eats-auto-dispatch] Failed to send notification:", notifyError);
    }

    console.log(`[eats-auto-dispatch] Successfully assigned driver ${nearestDriver.id} to order ${order_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Driver assigned successfully",
        order_id,
        driver: {
          id: nearestDriver.id,
          name: nearestDriver.full_name,
          distance_km: Number(nearestDriver.distance_km.toFixed(2)),
          rating: nearestDriver.rating
        },
        eta: eta
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[eats-auto-dispatch] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
