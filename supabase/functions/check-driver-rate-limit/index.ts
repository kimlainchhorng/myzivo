import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Thresholds for driver rate limiting
const MAX_CANCELS_PER_DAY = 5;
const MAX_GPS_FLAGS_PER_DAY = 10;
const CANCEL_BLOCK_HOURS = 4;
const GPS_BLOCK_HOURS = 24;

function nowISO(): string {
  return new Date().toISOString();
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
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
    const { action } = body; // "cancel_trip" | "gps_suspicious"

    if (!action || !["cancel_trip", "gps_suspicious"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use 'cancel_trip' or 'gps_suspicious'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create admin client for database operations
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
      .select("id, is_suspended")
      .eq("user_id", userId)
      .single();

    if (driverError || !driver) {
      return new Response(JSON.stringify({ error: "Driver not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (driver.is_suspended) {
      return new Response(
        JSON.stringify({ ok: false, blocked: true, reason: "Account suspended" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const driverId = driver.id;
    const today = todayDate();

    // Load or initialize driver limits
    let { data: limits } = await supabaseAdmin
      .from("driver_limits")
      .select("*")
      .eq("driver_id", driverId)
      .maybeSingle();

    if (!limits) {
      const { data: created, error: createError } = await supabaseAdmin
        .from("driver_limits")
        .insert({ driver_id: driverId, last_reset: today })
        .select()
        .single();

      if (createError) {
        console.error("Failed to create driver limits:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to initialize limits" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      limits = created;
    }

    // Reset daily counters if new day
    if (limits.last_reset !== today) {
      const { data: reset, error: resetError } = await supabaseAdmin
        .from("driver_limits")
        .update({
          cancels_today: 0,
          gps_flags_today: 0,
          last_reset: today,
          updated_at: nowISO(),
        })
        .eq("driver_id", driverId)
        .select()
        .single();

      if (!resetError && reset) {
        limits = reset;
      }
    }

    // Check if currently blocked
    if (
      limits.is_blocked &&
      limits.blocked_until &&
      new Date(limits.blocked_until).getTime() > Date.now()
    ) {
      return new Response(
        JSON.stringify({
          ok: false,
          blocked: true,
          blocked_until: limits.blocked_until,
          reason: limits.block_reason || "Rate limit exceeded",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Unblock if block expired
    if (
      limits.is_blocked &&
      limits.blocked_until &&
      new Date(limits.blocked_until).getTime() <= Date.now()
    ) {
      await supabaseAdmin
        .from("driver_limits")
        .update({ is_blocked: false, blocked_until: null, block_reason: null, updated_at: nowISO() })
        .eq("driver_id", driverId);
      limits.is_blocked = false;
    }

    // Increment counters based on action
    let cancels = limits.cancels_today ?? 0;
    let gpsFlags = limits.gps_flags_today ?? 0;

    if (action === "cancel_trip") {
      cancels += 1;
    } else if (action === "gps_suspicious") {
      gpsFlags += 1;
    }

    // Check thresholds
    let shouldBlock = false;
    let blockHours = 0;
    let blockReason = "";

    if (action === "cancel_trip" && cancels > MAX_CANCELS_PER_DAY) {
      shouldBlock = true;
      blockHours = CANCEL_BLOCK_HOURS;
      blockReason = `Exceeded daily cancellation limit (${MAX_CANCELS_PER_DAY})`;
    } else if (action === "gps_suspicious" && gpsFlags > MAX_GPS_FLAGS_PER_DAY) {
      shouldBlock = true;
      blockHours = GPS_BLOCK_HOURS;
      blockReason = `Excessive GPS anomalies detected (${MAX_GPS_FLAGS_PER_DAY})`;
    }

    if (shouldBlock) {
      const blockedUntil = new Date(
        Date.now() + blockHours * 60 * 60 * 1000
      ).toISOString();

      await supabaseAdmin
        .from("driver_limits")
        .update({
          is_blocked: true,
          blocked_until: blockedUntil,
          block_reason: blockReason,
          cancels_today: cancels,
          gps_flags_today: gpsFlags,
          total_blocks: (limits.total_blocks ?? 0) + 1,
          updated_at: nowISO(),
        })
        .eq("driver_id", driverId);

      // Log risk event
      await supabaseAdmin.from("risk_events").insert({
        driver_id: driverId,
        user_id: userId,
        event_type: "driver_rate_limit_block",
        severity: 4,
        details: {
          action,
          cancels,
          gpsFlags,
          blockedUntil,
          blockReason,
        },
      });

      return new Response(
        JSON.stringify({
          ok: false,
          blocked: true,
          blocked_until: blockedUntil,
          reason: blockReason,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update counters
    await supabaseAdmin
      .from("driver_limits")
      .update({
        cancels_today: cancels,
        gps_flags_today: gpsFlags,
        updated_at: nowISO(),
      })
      .eq("driver_id", driverId);

    return new Response(
      JSON.stringify({
        ok: true,
        cancels_today: cancels,
        gps_flags_today: gpsFlags,
        cancels_remaining: MAX_CANCELS_PER_DAY - cancels,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("check-driver-rate-limit error:", error);
    return new Response(
      JSON.stringify({ error: `Internal error: ${String(error)}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
