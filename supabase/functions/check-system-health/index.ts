import { serve, createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Check all services for non-operational states
    const { data: services } = await supabase
      .from("service_health_status")
      .select("service_name, service_key, status, error_rate, response_time_ms");

    const alerts: { title: string; message: string; severity: string; category: string }[] = [];

    for (const svc of services || []) {
      if (svc.status === "down") {
        alerts.push({
          title: `${svc.service_name} is DOWN`,
          message: `Service ${svc.service_key} is currently offline.`,
          severity: "critical",
          category: "system_health",
        });
      } else if (svc.status === "degraded") {
        alerts.push({
          title: `${svc.service_name} is Degraded`,
          message: `Service ${svc.service_key} is experiencing degraded performance.`,
          severity: "high",
          category: "system_health",
        });
      }

      // Check high error rate
      if (svc.error_rate && svc.error_rate > 20) {
        alerts.push({
          title: `High Error Rate: ${svc.service_name}`,
          message: `Error rate for ${svc.service_key} is ${svc.error_rate}% (threshold: 20%).`,
          severity: "high",
          category: "system_health",
        });
      }
    }

    // 2. Check performance_metrics for error spikes in last 10 minutes
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentMetrics } = await supabase
      .from("performance_metrics")
      .select("service, success")
      .gte("created_at", tenMinAgo);

    const byService: Record<string, { total: number; errors: number }> = {};
    for (const m of recentMetrics || []) {
      const svc = (m as any).service;
      if (!byService[svc]) byService[svc] = { total: 0, errors: 0 };
      byService[svc].total++;
      if (!(m as any).success) byService[svc].errors++;
    }

    for (const [svc, stats] of Object.entries(byService)) {
      if (stats.total >= 5) {
        const rate = (stats.errors / stats.total) * 100;
        if (rate > 20) {
          alerts.push({
            title: `Error Spike: ${svc}`,
            message: `${Math.round(rate)}% error rate in last 10 minutes (${stats.errors}/${stats.total} calls).`,
            severity: rate > 50 ? "critical" : "high",
            category: "system_health",
          });
        }
      }
    }

    // 3. Insert alerts into admin_notifications
    if (alerts.length > 0) {
      await supabase.from("admin_notifications").insert(
        alerts.map((a) => ({
          title: a.title,
          message: a.message,
          severity: a.severity,
          category: a.category,
        }))
      );

      // Also log to system_logs
      await supabase.from("system_logs").insert(
        alerts.map((a) => ({
          level: a.severity === "critical" ? "error" : "warning",
          source: "check-system-health",
          message: `${a.title}: ${a.message}`,
        }))
      );
    }

    return new Response(
      JSON.stringify({ checked: services?.length || 0, alertsCreated: alerts.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
