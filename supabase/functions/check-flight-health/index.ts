/**
 * Check Flight Health
 * Monitors booking failures and auto-pauses if threshold exceeded
 * Called after ticketing failures or on schedule
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Auto-pause thresholds
const FAILURE_THRESHOLD = 3;
const TIME_WINDOW_MINUTES = 15;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("[HealthCheck] Running flight health check...");

    // Check if already paused
    const { data: launchSettings } = await supabase
      .from("flights_launch_settings")
      .select("status, emergency_pause")
      .limit(1)
      .single();

    if (launchSettings?.emergency_pause) {
      console.log("[HealthCheck] Already paused, skipping check");
      return new Response(
        JSON.stringify({ status: "already_paused" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only auto-pause in LIVE mode
    if (launchSettings?.status !== 'live') {
      console.log("[HealthCheck] Not in LIVE mode, skipping auto-pause check");
      return new Response(
        JSON.stringify({ status: "test_mode" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check recent failures
    const timeWindowStart = new Date();
    timeWindowStart.setMinutes(timeWindowStart.getMinutes() - TIME_WINDOW_MINUTES);

    const { data: recentFailures, error: failureError } = await supabase
      .from("flight_bookings")
      .select("id, booking_reference, ticketing_error")
      .eq("ticketing_status", "failed")
      .gte("created_at", timeWindowStart.toISOString());

    if (failureError) {
      throw failureError;
    }

    const failureCount = recentFailures?.length || 0;
    console.log(`[HealthCheck] Found ${failureCount} failures in last ${TIME_WINDOW_MINUTES} minutes`);

    if (failureCount >= FAILURE_THRESHOLD) {
      console.log(`[HealthCheck] Threshold exceeded (${FAILURE_THRESHOLD}), triggering auto-pause`);

      // Auto-pause flights
      const { error: pauseError } = await supabase
        .from("flights_launch_settings")
        .update({
          emergency_pause: true,
          emergency_pause_reason: `Auto-paused: ${failureCount} booking failures in ${TIME_WINDOW_MINUTES} minutes`,
          emergency_pause_at: new Date().toISOString(),
          incident_reason_code: 'failure_spike',
          incident_started_at: new Date().toISOString(),
          incident_notes: `Automatic pause triggered by health check. Failures: ${recentFailures?.map(f => f.booking_reference).join(', ')}`,
          updated_at: new Date().toISOString(),
        })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all rows

      if (pauseError) {
        console.error("[HealthCheck] Failed to pause:", pauseError);
        throw pauseError;
      }

      // Create incident log
      const { error: incidentError } = await supabase
        .from("flight_incident_logs")
        .insert({
          incident_type: 'auto_pause',
          reason_code: 'failure_spike',
          description: `Auto-paused after ${failureCount} booking failures in ${TIME_WINDOW_MINUTES} minutes`,
          failure_count_trigger: failureCount,
          affected_booking_ids: recentFailures?.map(f => f.id) || [],
          affected_bookings_count: failureCount,
        });

      if (incidentError) {
        console.error("[HealthCheck] Failed to create incident log:", incidentError);
      }

      // Create critical admin alert
      await supabase
        .from("flight_admin_alerts")
        .insert({
          alert_type: "auto_pause_triggered",
          severity: "critical",
          message: `⚠️ Flights AUTO-PAUSED: ${failureCount} failures in ${TIME_WINDOW_MINUTES} minutes. Review immediately.`,
        });

      console.log("[HealthCheck] Auto-pause complete");

      return new Response(
        JSON.stringify({
          status: "auto_paused",
          failureCount,
          affectedBookings: recentFailures?.map(f => f.booking_reference) || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Health check passed
    return new Response(
      JSON.stringify({
        status: "healthy",
        failureCount,
        threshold: FAILURE_THRESHOLD,
        timeWindowMinutes: TIME_WINDOW_MINUTES,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[HealthCheck] Error:", error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Health check failed" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
