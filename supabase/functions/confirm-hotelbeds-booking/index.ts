/**
 * Confirm Hotelbeds Booking
 * Called after payment succeeds to confirm actual bookings with Hotelbeds APIs
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmRequest {
  orderId: string;
}

interface BookingResult {
  itemId: string;
  success: boolean;
  reference?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ConfirmRequest = await req.json();
    const { orderId } = body;

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from("travel_orders")
      .select(`
        *,
        travel_order_items (*)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      throw new Error("Order not found");
    }

    console.log("[ConfirmBooking] Processing order:", order.order_number);

    const items = order.travel_order_items || [];
    const results: BookingResult[] = [];
    let allSuccessful = true;

    // Process each item
    for (const item of items) {
      try {
        let bookingResult: { success: boolean; reference?: string; error?: string };

        // Build holder info for Hotelbeds
        const holder = {
          name: order.holder_name.split(" ")[0] || order.holder_name,
          surname: order.holder_name.split(" ").slice(1).join(" ") || "Guest",
          email: order.holder_email,
          phone: order.holder_phone || "",
        };

        if (item.type === "hotel") {
          // Call hotelbeds-hotels edge function
          const hotelResponse = await fetch(`${supabaseUrl}/functions/v1/hotelbeds-hotels`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              action: "book",
              holder,
              rooms: [{
                rateKey: item.meta?.rateKey,
                paxes: [
                  { type: "AD", name: holder.name, surname: holder.surname },
                ],
              }],
              clientReference: `ZIVO-${order.order_number}`,
              remark: `ZIVO Booking - Order ${order.order_number}`,
            }),
          });

          const hotelData = await hotelResponse.json();
          bookingResult = {
            success: hotelData.success,
            reference: hotelData.data?.booking?.reference,
            error: hotelData.error,
          };

        } else if (item.type === "activity") {
          // Call hotelbeds-activities edge function
          const activityResponse = await fetch(`${supabaseUrl}/functions/v1/hotelbeds-activities`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              action: "book",
              holder,
              activities: [{
                rateKey: item.meta?.rateKey,
                from: item.start_date,
                to: item.end_date || item.start_date,
                paxes: [
                  { name: holder.name, surname: holder.surname, age: 30 },
                ],
              }],
              clientReference: `ZIVO-${order.order_number}`,
            }),
          });

          const activityData = await activityResponse.json();
          bookingResult = {
            success: activityData.success,
            reference: activityData.data?.booking?.reference,
            error: activityData.error,
          };

        } else if (item.type === "transfer") {
          // Call hotelbeds-transfers edge function
          const transferResponse = await fetch(`${supabaseUrl}/functions/v1/hotelbeds-transfers`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              action: "book",
              holder,
              transfers: [{
                rateKey: item.meta?.rateKey,
                transferDetails: item.meta?.transferDetails || [],
              }],
              clientReference: `ZIVO-${order.order_number}`,
              remark: item.meta?.remarks,
            }),
          });

          const transferData = await transferResponse.json();
          bookingResult = {
            success: transferData.success,
            reference: transferData.data?.booking?.reference,
            error: transferData.error,
          };

        } else {
          bookingResult = { success: false, error: `Unknown item type: ${item.type}` };
        }

        // Update item status
        const newStatus = bookingResult.success ? "confirmed" : "failed";
        await supabase
          .from("travel_order_items")
          .update({
            status: newStatus,
            provider_reference: bookingResult.reference || null,
          })
          .eq("id", item.id);

        // Log audit event for this item
        await supabase.from("booking_audit_logs").insert({
          order_id: orderId,
          user_id: order.user_id,
          event: bookingResult.success ? "item_confirmed" : "item_failed",
          meta: {
            item_id: item.id,
            item_type: item.type,
            provider_reference: bookingResult.reference,
            error: bookingResult.error,
          },
        });

        results.push({
          itemId: item.id,
          success: bookingResult.success,
          reference: bookingResult.reference,
          error: bookingResult.error,
        });

        if (!bookingResult.success) {
          allSuccessful = false;
        }

        console.log(`[ConfirmBooking] Item ${item.id} (${item.type}):`, bookingResult);

      } catch (itemError) {
        console.error(`[ConfirmBooking] Error processing item ${item.id}:`, itemError);
        
        await supabase
          .from("travel_order_items")
          .update({ status: "failed" })
          .eq("id", item.id);

        results.push({
          itemId: item.id,
          success: false,
          error: itemError instanceof Error ? itemError.message : "Unknown error",
        });

        allSuccessful = false;
      }
    }

    // Update order status based on results
    const newOrderStatus = allSuccessful ? "confirmed" : "failed";
    await supabase
      .from("travel_orders")
      .update({ status: newOrderStatus })
      .eq("id", orderId);

    // Log final audit event
    await supabase.from("booking_audit_logs").insert({
      order_id: orderId,
      user_id: order.user_id,
      event: allSuccessful ? "booking_confirmed" : "booking_failed",
      meta: {
        order_number: order.order_number,
        results,
        all_successful: allSuccessful,
      },
    });

    // If any item failed, create support ticket
    if (!allSuccessful) {
      console.error("[ConfirmBooking] Some items failed for order:", order.order_number);
      
      // Could insert into a support_tickets table here
      // For now, just log it prominently
      await supabase.from("booking_audit_logs").insert({
        order_id: orderId,
        user_id: order.user_id,
        event: "support_ticket_needed",
        meta: {
          order_number: order.order_number,
          failed_items: results.filter((r) => !r.success),
          reason: "Booking confirmation failed after payment",
        },
      });
    }

    // Trigger confirmation email
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-travel-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ orderId }),
      });
    } catch (emailError) {
      console.error("[ConfirmBooking] Error sending confirmation email:", emailError);
    }

    console.log("[ConfirmBooking] Order", order.order_number, "status:", newOrderStatus);

    return new Response(
      JSON.stringify({
        success: allSuccessful,
        orderNumber: order.order_number,
        status: newOrderStatus,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("[ConfirmBooking] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
