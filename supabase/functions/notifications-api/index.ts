/**
 * Notifications API Edge Function
 * Handles: list my notifications, mark as read, admin operations
 */
import { serve, createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";

    // Check if admin for admin operations
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const isAdmin = userRole?.role && ['admin', 'super_admin', 'operations', 'support'].includes(userRole.role);

    switch (action) {
      // ============================================
      // List user's notifications
      // ============================================
      case "list": {
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = parseInt(url.searchParams.get("offset") || "0");
        const unreadOnly = url.searchParams.get("unread") === "true";

        let query = supabase
          .from("notifications")
          .select("*", { count: "exact" })
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (unreadOnly) {
          query = query.eq("is_read", false);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        // Get unread count
        const { count: unreadCount } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false);

        return new Response(
          JSON.stringify({
            notifications: data || [],
            total: count || 0,
            unread_count: unreadCount || 0
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // ============================================
      // Mark as read
      // ============================================
      case "mark-read": {
        if (req.method !== "POST") {
          return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const body = await req.json();
        const { notification_ids, mark_all } = body;

        if (mark_all) {
          // Mark all as read
          const { error } = await supabase
            .from("notifications")
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq("user_id", user.id)
            .eq("is_read", false);

          if (error) throw error;

          return new Response(
            JSON.stringify({ success: true, message: "All notifications marked as read" }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        if (!notification_ids || !Array.isArray(notification_ids)) {
          return new Response(
            JSON.stringify({ error: "notification_ids array required" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .in("id", notification_ids);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // ============================================
      // Admin: List all notifications
      // ============================================
      case "admin-list": {
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: "Admin access required" }),
            { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const limit = parseInt(url.searchParams.get("limit") || "100");
        const offset = parseInt(url.searchParams.get("offset") || "0");
        const status = url.searchParams.get("status");
        const channel = url.searchParams.get("channel");

        let query = supabase
          .from("notifications")
          .select(`
            *,
            profiles:user_id (email, full_name)
          `, { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (status) {
          query = query.eq("status", status);
        }
        if (channel) {
          query = query.eq("channel", channel);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        // Get stats
        const { data: stats } = await supabase.rpc('get_notification_stats');

        return new Response(
          JSON.stringify({
            notifications: data || [],
            total: count || 0,
            stats: stats || {}
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // ============================================
      // Admin: Resend failed notification
      // ============================================
      case "admin-resend": {
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: "Admin access required" }),
            { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        if (req.method !== "POST") {
          return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const { notification_id } = await req.json();

        // Get the original notification
        const { data: notification, error: fetchError } = await supabase
          .from("notifications")
          .select("*")
          .eq("id", notification_id)
          .single();

        if (fetchError || !notification) {
          return new Response(
            JSON.stringify({ error: "Notification not found" }),
            { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Call send-notification to resend
        const sendResponse = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            user_id: notification.user_id,
            order_id: notification.order_id,
            template: notification.template,
            channel: notification.channel,
            variables: notification.metadata?.variables || {},
            title: notification.title,
            body: notification.body,
            action_url: notification.action_url
          })
        });

        const result = await sendResponse.json();

        return new Response(
          JSON.stringify(result),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // ============================================
      // Admin: Send manual notification
      // ============================================
      case "admin-send": {
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: "Admin access required" }),
            { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        if (req.method !== "POST") {
          return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const payload = await req.json();

        // Call send-notification
        const sendResponse = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify(payload)
        });

        const result = await sendResponse.json();

        return new Response(
          JSON.stringify(result),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

  } catch (error: any) {
    console.error("Notifications API error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
