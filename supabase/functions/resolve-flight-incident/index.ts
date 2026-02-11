/**
 * Resolve Flight Incident
 * Handles incident resolution: clears pause, notifies customers, updates bookings
 */

import { serve, createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface ResolveIncidentRequest {
  incidentId: string;
  notifyCustomers?: boolean;
  resolutionNotes?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth: require service role key or admin user
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (token !== supabaseServiceKey) {
    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const roleCheck = createClient(supabaseUrl, supabaseServiceKey);
    const { data: isAdmin } = await roleCheck.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { incidentId, notifyCustomers, resolutionNotes }: ResolveIncidentRequest = await req.json();

    console.log(`[ResolveIncident] Processing incident ${incidentId}`);

    // Get the incident
    const { data: incident, error: incidentError } = await supabase
      .from("flight_incident_logs")
      .select("*")
      .eq("id", incidentId)
      .single();

    if (incidentError || !incident) {
      throw new Error("Incident not found");
    }

    if (incident.resolved_at) {
      return new Response(
        JSON.stringify({ success: true, message: "Incident already resolved" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clear emergency pause from launch settings
    const { error: unpauseError } = await supabase
      .from("flights_launch_settings")
      .update({
        emergency_pause: false,
        emergency_pause_reason: null,
        emergency_pause_at: null,
        incident_reason_code: null,
        incident_started_at: null,
        incident_notes: null,
        updated_at: new Date().toISOString(),
      })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (unpauseError) {
      console.error("[ResolveIncident] Failed to unpause:", unpauseError);
      throw unpauseError;
    }

    console.log("[ResolveIncident] Bookings resumed");

    // Notify customers if requested
    let customersResolved = 0;
    if (notifyCustomers && incident.affected_booking_ids?.length) {
      try {
        const notifyResponse = await fetch(`${supabaseUrl}/functions/v1/send-incident-notification`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            incidentId,
            notificationType: 'incident_resolved',
            affectedBookingIds: incident.affected_booking_ids,
          }),
        });

        const notifyResult = await notifyResponse.json();
        customersResolved = notifyResult.notified || 0;
        console.log(`[ResolveIncident] Notified ${customersResolved} customers`);
      } catch (notifyError) {
        console.error("[ResolveIncident] Notification error:", notifyError);
      }
    }

    // Update incident log
    const { error: updateError } = await supabase
      .from("flight_incident_logs")
      .update({
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes,
        customers_resolved: customersResolved,
        updated_at: new Date().toISOString(),
      })
      .eq("id", incidentId);

    if (updateError) {
      console.error("[ResolveIncident] Failed to update incident:", updateError);
    }

    // Create admin alert for resolution
    await supabase
      .from("flight_admin_alerts")
      .insert({
        alert_type: "incident_resolved",
        severity: "low",
        message: `✅ Incident resolved. Bookings resumed. ${customersResolved} customers notified.`,
      });

    console.log("[ResolveIncident] Incident resolved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        customersNotified: customersResolved,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[ResolveIncident] Error:", error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Resolution failed" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
