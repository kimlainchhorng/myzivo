/**
 * Admin Travel Dashboard API
 * Provides KPIs, orders management, and admin operations
 */
import { serve, createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface AdminRequest {
  action: "dashboard" | "orders" | "order_detail" | "resend_confirmation" | "flag_order" | "update_notes" | "provider_status";
  orderId?: string;
  page?: number;
  limit?: number;
  status?: string;
  searchQuery?: string;
  flagReason?: string;
  notes?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get admin user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid authentication");
    }

    // Verify admin role using is_any_admin function
    const { data: isAdmin } = await supabase.rpc("is_any_admin", {
      _user_id: user.id,
    });

    if (!isAdmin) {
      // Fallback to checking standard admin role
      const { data: hasAdminRole } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      
      if (!hasAdminRole) {
        throw new Error("Admin access required");
      }
    }

    const body: AdminRequest = await req.json();
    const { action } = body;

    switch (action) {
      case "dashboard": {
        // Get dashboard KPIs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();
        
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoISO = weekAgo.toISOString();
        
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStartISO = monthStart.toISOString();

        const [
          todayOrders,
          weekOrders,
          monthOrders,
          todayRevenue,
          weekRevenue,
          pendingCancellations,
          failedBookings,
          openTickets,
          paymentFailures,
          providerHealth,
        ] = await Promise.all([
          supabase.from("travel_orders").select("id", { count: "exact" }).gte("created_at", todayISO),
          supabase.from("travel_orders").select("id", { count: "exact" }).gte("created_at", weekAgoISO),
          supabase.from("travel_orders").select("id", { count: "exact" }).gte("created_at", monthStartISO),
          supabase.from("travel_orders").select("total").eq("status", "confirmed").gte("created_at", todayISO),
          supabase.from("travel_orders").select("total").eq("status", "confirmed").gte("created_at", weekAgoISO),
          supabase.from("travel_orders").select("id", { count: "exact" }).eq("cancellation_status", "requested"),
          supabase.from("travel_orders").select("id", { count: "exact" }).eq("status", "failed"),
          supabase.from("support_tickets").select("id", { count: "exact" }).eq("status", "open"),
          supabase.from("travel_payments").select("id", { count: "exact" }).eq("status", "failed"),
          supabase.from("provider_health").select("*").eq("provider_name", "hotelbeds").single(),
        ]);

        const stats = {
          todayOrders: todayOrders.count ?? 0,
          weekOrders: weekOrders.count ?? 0,
          monthOrders: monthOrders.count ?? 0,
          todayRevenue: (todayRevenue.data || []).reduce((sum, o) => sum + (o.total || 0), 0),
          weekRevenue: (weekRevenue.data || []).reduce((sum, o) => sum + (o.total || 0), 0),
          pendingCancellations: pendingCancellations.count ?? 0,
          failedBookings: failedBookings.count ?? 0,
          openTickets: openTickets.count ?? 0,
          paymentFailures: paymentFailures.count ?? 0,
          providerHealth: providerHealth.data || { provider_name: "hotelbeds", status: "unknown" },
        };

        return new Response(
          JSON.stringify({ success: true, data: stats }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "orders": {
        const page = body.page || 1;
        const limit = Math.min(body.limit || 20, 100);
        const offset = (page - 1) * limit;

        let query = supabase
          .from("travel_orders")
          .select(`
            *,
            travel_order_items (id, type, title, start_date, end_date, supplier_status, provider_reference),
            travel_payments (id, status, stripe_checkout_session_id, amount)
          `, { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (body.status && body.status !== "all") {
          query = query.eq("status", body.status);
        }

        if (body.searchQuery) {
          query = query.or(`order_number.ilike.%${body.searchQuery}%,holder_email.ilike.%${body.searchQuery}%,holder_name.ilike.%${body.searchQuery}%`);
        }

        const { data: orders, count, error } = await query;

        if (error) throw error;

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: orders, 
            total: count,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit)
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "order_detail": {
        if (!body.orderId) throw new Error("Order ID required");

        const { data: order, error } = await supabase
          .from("travel_orders")
          .select(`
            *,
            travel_order_items (*),
            travel_payments (*)
          `)
          .eq("id", body.orderId)
          .single();

        if (error) throw error;

        // Get audit logs for this order
        const { data: auditLogs } = await supabase
          .from("booking_audit_logs")
          .select("*")
          .eq("order_id", body.orderId)
          .order("created_at", { ascending: false })
          .limit(50);

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: { ...order, audit_logs: auditLogs || [] }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "resend_confirmation": {
        if (!body.orderId) throw new Error("Order ID required");

        // Call the resend confirmation function
        const response = await fetch(`${supabaseUrl}/functions/v1/resend-travel-confirmation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader,
          },
          body: JSON.stringify({ orderId: body.orderId }),
        });

        const result = await response.json();

        // Log admin action
        await supabase.from("admin_audit_logs").insert({
          admin_id: user.id,
          action: "resend_confirmation",
          entity_type: "travel_order",
          entity_id: body.orderId,
          metadata: { result },
        });

        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "flag_order": {
        if (!body.orderId) throw new Error("Order ID required");

        const { data: currentOrder } = await supabase
          .from("travel_orders")
          .select("flagged_for_review")
          .eq("id", body.orderId)
          .single();

        const newFlagState = !currentOrder?.flagged_for_review;

        const { error } = await supabase
          .from("travel_orders")
          .update({
            flagged_for_review: newFlagState,
            flagged_reason: newFlagState ? body.flagReason : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.orderId);

        if (error) throw error;

        // Log admin action
        await supabase.from("admin_audit_logs").insert({
          admin_id: user.id,
          action: newFlagState ? "flag_order" : "unflag_order",
          entity_type: "travel_order",
          entity_id: body.orderId,
          new_values: { flagged: newFlagState, reason: body.flagReason },
        });

        return new Response(
          JSON.stringify({ success: true, flagged: newFlagState }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update_notes": {
        if (!body.orderId) throw new Error("Order ID required");

        const { error } = await supabase
          .from("travel_orders")
          .update({
            admin_notes: body.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.orderId);

        if (error) throw error;

        // Log admin action
        await supabase.from("admin_audit_logs").insert({
          admin_id: user.id,
          action: "update_admin_notes",
          entity_type: "travel_order",
          entity_id: body.orderId,
          new_values: { notes: body.notes },
        });

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "provider_status": {
        const { data: providers, error } = await supabase
          .from("provider_health")
          .select("*");

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data: providers }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error("Invalid action");
    }
  } catch (error: unknown) {
    console.error("[AdminTravelDashboard] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
