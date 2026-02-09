/**
 * Twilio SMS Status Webhook
 * Handles delivery status callbacks from Twilio
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-twilio-signature",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Parse form data from Twilio webhook
    const formData = await req.formData();
    const messageSid = formData.get("MessageSid") as string;
    const messageStatus = formData.get("MessageStatus") as string;
    const errorCode = formData.get("ErrorCode") as string | null;
    const errorMessage = formData.get("ErrorMessage") as string | null;

    console.log(`SMS Status Update - SID: ${messageSid}, Status: ${messageStatus}, Error: ${errorCode}`);

    if (!messageSid) {
      return new Response("Missing MessageSid", { status: 400 });
    }

    // Map Twilio status to our status
    let status: string;
    let errorText: string | null = null;

    switch (messageStatus) {
      case "delivered":
        status = "sent";
        break;
      case "sent":
        status = "sent"; // Still in transit
        break;
      case "failed":
      case "undelivered":
        status = "failed";
        errorText = errorCode ? `Twilio error ${errorCode}: ${errorMessage || "Unknown"}` : null;
        break;
      case "queued":
      case "sending":
        status = "queued";
        break;
      default:
        status = "queued";
    }

    // Update notification record
    const { data: updated, error: updateError } = await supabase
      .from("notifications")
      .update({
        status,
        error_message: errorText,
        sent_at: status === "sent" ? new Date().toISOString() : null,
      })
      .eq("provider_message_id", messageSid)
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("Failed to update notification:", updateError);
    } else if (updated) {
      console.log(`Updated notification ${updated.id} to status: ${status}`);
    } else {
      console.log(`No notification found for SID: ${messageSid}`);
    }

    // Return 200 OK to Twilio
    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error: unknown) {
    console.error("Error in twilio-sms-status:", error);
    // Still return 200 to prevent Twilio retries
    return new Response("Error processed", { status: 200, headers: corsHeaders });
  }
});
