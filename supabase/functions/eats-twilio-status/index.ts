/**
 * ZIVO Eats — Twilio Status Callback
 * Updates call_logs based on Twilio call status events
 */
import { serve, createClient } from "../_shared/deps.ts";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const logId = url.searchParams.get("log_id");

    // Parse form data from Twilio
    const formData = await req.formData();
    const callSid = formData.get("CallSid") as string;
    const callStatus = formData.get("CallStatus") as string;
    const callDuration = formData.get("CallDuration") as string;
    const dialCallStatus = formData.get("DialCallStatus") as string; // For <Dial> action callbacks

    console.log("Twilio status callback:", {
      logId,
      callSid,
      callStatus,
      dialCallStatus,
      callDuration,
    });

    if (!logId) {
      // No log to update, just acknowledge
      return new Response("OK", { status: 200 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Map Twilio status to our status
    const statusToOutcome = (status: string): string => {
      switch (status?.toLowerCase()) {
        case "queued":
        case "initiated":
          return "initiated";
        case "ringing":
          return "ringing";
        case "in-progress":
        case "answered":
          return "in_progress";
        case "completed":
          return "completed";
        case "busy":
          return "busy";
        case "no-answer":
          return "no_answer";
        case "canceled":
        case "failed":
        default:
          return "failed";
      }
    };

    // Use dialCallStatus if available (from <Dial> action), otherwise use callStatus
    const finalStatus = dialCallStatus || callStatus;
    const outcome = statusToOutcome(finalStatus);

    // Update call log
    const updateData: Record<string, any> = {
      outcome,
      notes: `SID: ${callSid}, Status: ${finalStatus}`,
    };

    // Add duration if call completed
    if (outcome === "completed" && callDuration) {
      updateData.duration_seconds = parseInt(callDuration, 10);
    }

    await supabaseClient
      .from("call_logs")
      .update(updateData)
      .eq("id", logId);

    // Return TwiML for action callbacks (prevents Twilio from playing default message)
    if (dialCallStatus) {
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response/>`,
        { headers: { "Content-Type": "application/xml" } }
      );
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("Status callback error:", err);
    return new Response("Error", { status: 500 });
  }
});
