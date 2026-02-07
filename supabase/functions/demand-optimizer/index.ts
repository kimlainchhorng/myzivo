/**
 * Demand Optimizer Edge Function
 * Runs scheduled jobs for demand prediction and driver positioning
 * 
 * Schedule via pg_cron:
 * - Every 15 minutes: Aggregate demand snapshots
 * - Every hour (on the hour): Generate forecasts
 * - Every 30 minutes: Recommend driver positions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OptimizationResult {
  snapshots_created: number;
  forecasts_generated: number;
  recommendations_created: number;
  performance_updates: number;
  errors: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const result: OptimizationResult = {
      snapshots_created: 0,
      forecasts_generated: 0,
      recommendations_created: 0,
      performance_updates: 0,
      errors: [],
    };

    // Parse request body for job type
    let jobType = "all";
    try {
      const body = await req.json();
      jobType = body.job_type || "all";
    } catch {
      // Default to running all jobs
    }

    const currentMinute = new Date().getMinutes();
    const currentHour = new Date().getHours();

    // 1. Aggregate demand snapshots (every 15 minutes or on demand)
    if (jobType === "all" || jobType === "snapshot" || currentMinute % 15 === 0) {
      console.log("[DemandOptimizer] Running demand snapshot aggregation...");
      const { data: snapshotCount, error: snapshotError } = await supabase.rpc("aggregate_demand_snapshot");
      
      if (snapshotError) {
        console.error("[DemandOptimizer] Snapshot error:", snapshotError);
        result.errors.push(`Snapshot: ${snapshotError.message}`);
      } else {
        result.snapshots_created = snapshotCount || 0;
        console.log(`[DemandOptimizer] Created ${result.snapshots_created} demand snapshots`);
      }
    }

    // 2. Generate forecasts (every hour on the hour or on demand)
    if (jobType === "all" || jobType === "forecast" || currentMinute === 0) {
      console.log("[DemandOptimizer] Running forecast generation...");
      const { data: forecastCount, error: forecastError } = await supabase.rpc("generate_all_forecasts");
      
      if (forecastError) {
        console.error("[DemandOptimizer] Forecast error:", forecastError);
        result.errors.push(`Forecast: ${forecastError.message}`);
      } else {
        result.forecasts_generated = forecastCount || 0;
        console.log(`[DemandOptimizer] Generated forecasts for ${result.forecasts_generated} zones`);
      }
    }

    // 3. Recommend driver positions (every 30 minutes or on demand)
    if (jobType === "all" || jobType === "reposition" || currentMinute % 30 === 0) {
      console.log("[DemandOptimizer] Running driver reposition recommendations...");
      const { data: repoCount, error: repoError } = await supabase.rpc("recommend_driver_positions");
      
      if (repoError) {
        console.error("[DemandOptimizer] Reposition error:", repoError);
        result.errors.push(`Reposition: ${repoError.message}`);
      } else {
        result.recommendations_created = repoCount || 0;
        console.log(`[DemandOptimizer] Created ${result.recommendations_created} reposition recommendations`);
      }
    }

    // 4. Update driver performance stats (every hour or on demand)
    if (jobType === "all" || jobType === "performance" || currentMinute === 0) {
      console.log("[DemandOptimizer] Updating driver performance stats...");
      const { data: perfCount, error: perfError } = await supabase.rpc("update_all_driver_performance");
      
      if (perfError) {
        console.error("[DemandOptimizer] Performance error:", perfError);
        result.errors.push(`Performance: ${perfError.message}`);
      } else {
        result.performance_updates = perfCount || 0;
        console.log(`[DemandOptimizer] Updated ${result.performance_updates} driver performance scores`);
      }
    }

    // 5. Check for surge predictions and create alerts
    if (jobType === "all" || jobType === "alerts") {
      const { data: surgeZones, error: surgeError } = await supabase
        .from("demand_forecasts")
        .select("zone_code, predicted_orders, predicted_drivers_needed, current_drivers_online")
        .eq("surge_predicted", true)
        .gte("forecast_for", new Date().toISOString())
        .lte("forecast_for", new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString());

      if (!surgeError && surgeZones && surgeZones.length > 0) {
        console.log(`[DemandOptimizer] ${surgeZones.length} zones with predicted surge`);
        
        for (const zone of surgeZones) {
          const shortage = zone.predicted_drivers_needed - zone.current_drivers_online;
          if (shortage >= 3) {
            // Create automation alert for significant shortages
            await supabase.from("automation_alerts").insert({
              alert_type: "demand_surge",
              severity: shortage >= 5 ? "high" : "medium",
              title: `Driver shortage predicted in ${zone.zone_code}`,
              description: `Expected ${zone.predicted_orders} orders but only ${zone.current_drivers_online} drivers online. Need ${zone.predicted_drivers_needed} drivers.`,
              metadata: {
                zone_code: zone.zone_code,
                predicted_orders: zone.predicted_orders,
                predicted_drivers: zone.predicted_drivers_needed,
                current_drivers: zone.current_drivers_online,
                shortage: shortage,
              },
            });
          }
        }
      }
    }

    // 6. Cleanup old data (once per day at midnight)
    if (currentHour === 0 && currentMinute === 0) {
      console.log("[DemandOptimizer] Running cleanup of old data...");
      
      // Delete snapshots older than 60 days
      await supabase
        .from("demand_snapshots")
        .delete()
        .lt("created_at", new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());
      
      // Delete forecasts older than 7 days
      await supabase
        .from("demand_forecasts")
        .delete()
        .lt("forecast_for", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      // Delete expired recommendations older than 7 days
      await supabase
        .from("driver_reposition_recommendations")
        .delete()
        .lt("expires_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      console.log("[DemandOptimizer] Cleanup complete");
    }

    console.log("[DemandOptimizer] Optimization complete:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[DemandOptimizer] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
