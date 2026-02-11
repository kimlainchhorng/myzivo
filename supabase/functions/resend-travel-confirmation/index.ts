/**
 * Resend Travel Confirmation Email
 * Allows users to request their confirmation email to be resent
 * Rate limited to 3 per hour per order
 */
import { serve, createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface ResendRequest {
  orderId: string;
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

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid authentication");
    }

    const body: ResendRequest = await req.json();
    const { orderId } = body;

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from("travel_orders")
      .select("id, user_id, order_number, holder_email, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    if (order.user_id !== user.id) {
      throw new Error("Unauthorized - order does not belong to user");
    }

    // Check rate limit: max 3 emails per hour per order
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("travel_email_logs")
      .select("id", { count: "exact" })
      .eq("order_id", orderId)
      .eq("template", "booking_confirmation")
      .gte("created_at", oneHourAgo);

    if ((count ?? 0) >= 3) {
      throw new Error("Rate limit exceeded. You can request a maximum of 3 confirmation emails per hour.");
    }

    // Log the email request
    await supabase.from("travel_email_logs").insert({
      order_id: orderId,
      to_email: order.holder_email,
      template: "booking_confirmation",
      status: "queued",
    });

    // Call the send-travel-confirmation function
    const confirmResponse = await fetch(`${supabaseUrl}/functions/v1/send-travel-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ orderId }),
    });

    const confirmResult = await confirmResponse.json();

    // Update email log status
    if (confirmResult.success) {
      await supabase
        .from("travel_email_logs")
        .update({ status: "sent" })
        .eq("order_id", orderId)
        .eq("template", "booking_confirmation")
        .eq("status", "queued");
    } else {
      await supabase
        .from("travel_email_logs")
        .update({ status: "failed", error_message: confirmResult.error })
        .eq("order_id", orderId)
        .eq("template", "booking_confirmation")
        .eq("status", "queued");
    }

    // Log audit event
    await supabase.from("booking_audit_logs").insert({
      order_id: orderId,
      user_id: user.id,
      event: "confirmation_email_resent",
      meta: {
        recipient: order.holder_email,
        order_number: order.order_number,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Confirmation email sent",
        recipient: order.holder_email,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("[ResendConfirmation] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
