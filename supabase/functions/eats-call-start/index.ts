/**
 * ZIVO Eats — Start Masked Call
 * Initiate a privacy-protected call between order participants
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CallRole = "customer" | "driver" | "merchant";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");

    if (!twilioAccountSid || !twilioAuthToken) {
      return new Response(JSON.stringify({ error: "Twilio not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request
    const { order_id, from_role, to_role } = await req.json();
    
    if (!order_id || !from_role || !to_role) {
      return new Response(JSON.stringify({ error: "order_id, from_role, to_role required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["customer", "driver", "merchant"].includes(from_role) ||
        !["customer", "driver", "merchant"].includes(to_role)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get auth user
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch active session for this order
    const { data: session, error: sessionError } = await supabaseClient
      .from("call_sessions")
      .select("*")
      .eq("order_id", order_id)
      .eq("status", "active")
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "No active call session for this order" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is the from_role participant
    const isFromCustomer = from_role === "customer" && user.id === session.customer_user_id;
    const isFromDriver = from_role === "driver" && user.id === session.driver_user_id;
    const isFromMerchant = from_role === "merchant" && user.id === session.merchant_user_id;

    if (!isFromCustomer && !isFromDriver && !isFromMerchant) {
      return new Response(JSON.stringify({ error: "You are not authorized as this role" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: max 3 calls per 5 minutes per order
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: recentCalls } = await supabaseClient
      .from("call_logs")
      .select("*", { count: "exact", head: true })
      .eq("related_order_id", order_id)
      .gte("created_at", fiveMinAgo);

    if (recentCalls && recentCalls >= 3) {
      return new Response(JSON.stringify({ 
        error: "Rate limit: Maximum 3 calls per 5 minutes",
        retry_after: 300 
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get phones
    const fromPhone = from_role === "customer" ? session.customer_phone :
                      from_role === "driver" ? session.driver_phone :
                      session.merchant_phone;

    const toPhone = to_role === "customer" ? session.customer_phone :
                    to_role === "driver" ? session.driver_phone :
                    session.merchant_phone;

    const toUserId = to_role === "customer" ? session.customer_user_id :
                     to_role === "driver" ? session.driver_user_id :
                     session.merchant_user_id;

    if (!fromPhone) {
      return new Response(JSON.stringify({ error: "Your phone number is not on file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!toPhone) {
      return new Response(JSON.stringify({ error: `${to_role} phone number is not available` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create call log
    const { data: callLog, error: logError } = await supabaseClient
      .from("call_logs")
      .insert({
        phone: session.twilio_proxy_number,
        related_order_id: order_id,
        related_driver_id: from_role === "driver" || to_role === "driver" ? session.driver_user_id : null,
        related_restaurant_id: null, // Could fetch restaurant ID if needed
        call_direction: "outbound",
        outcome: "initiated",
        notes: `${from_role} calling ${to_role}`,
        created_by: user.id,
      })
      .select()
      .single();

    if (logError) {
      console.error("Failed to create call log:", logError);
    }

    // Build TwiML webhook URL
    const functionBaseUrl = `${supabaseUrl}/functions/v1`;
    const voiceUrl = `${functionBaseUrl}/eats-twilio-voice?session=${session.id}&to_role=${to_role}&log_id=${callLog?.id || ""}`;
    const statusUrl = `${functionBaseUrl}/eats-twilio-status`;

    // Create Twilio call
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`;
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const formData = new URLSearchParams();
    formData.append("From", session.twilio_proxy_number);
    formData.append("To", fromPhone); // Call the initiator first
    formData.append("Url", voiceUrl);
    formData.append("StatusCallback", statusUrl);
    formData.append("StatusCallbackEvent", "initiated");
    formData.append("StatusCallbackEvent", "ringing");
    formData.append("StatusCallbackEvent", "answered");
    formData.append("StatusCallbackEvent", "completed");

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok) {
      console.error("Twilio error:", twilioData);
      
      // Update call log with failure
      if (callLog?.id) {
        await supabaseClient
          .from("call_logs")
          .update({ outcome: "failed", notes: `Twilio error: ${twilioData.message || "Unknown"}` })
          .eq("id", callLog.id);
      }

      return new Response(JSON.stringify({ error: "Failed to initiate call" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update call log with Twilio SID
    if (callLog?.id) {
      await supabaseClient
        .from("call_logs")
        .update({ notes: `SID: ${twilioData.sid}` })
        .eq("id", callLog.id);
    }

    return new Response(JSON.stringify({
      success: true,
      call_sid: twilioData.sid,
      status: "initiated",
      message: "Call initiated. You will receive a call from our masked number.",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Call start error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
