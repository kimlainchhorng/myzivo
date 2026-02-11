/**
 * ZIVO Eats — Twilio Voice Webhook
 * Returns TwiML to connect caller to the target participant
 */
import { serve, createClient } from "../_shared/deps.ts";

serve(async (req) => {
  // Twilio sends form-urlencoded data for webhooks
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session");
  const toRole = url.searchParams.get("to_role");
  const logId = url.searchParams.get("log_id");

  if (!sessionId || !toRole) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sorry, this call cannot be completed. Missing session information.</Say>
  <Hangup/>
</Response>`,
      { headers: { "Content-Type": "application/xml" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch session
    const { data: session, error } = await supabaseClient
      .from("call_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("status", "active")
      .single();

    if (error || !session) {
      console.error("Session not found or expired:", error);
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sorry, this call session has expired or is no longer active.</Say>
  <Hangup/>
</Response>`,
        { headers: { "Content-Type": "application/xml" } }
      );
    }

    // Get target phone based on role
    let targetPhone: string | null = null;
    let targetName = "the other party";

    switch (toRole) {
      case "customer":
        targetPhone = session.customer_phone;
        targetName = "the customer";
        break;
      case "driver":
        targetPhone = session.driver_phone;
        targetName = "the driver";
        break;
      case "merchant":
        targetPhone = session.merchant_phone;
        targetName = "the restaurant";
        break;
    }

    if (!targetPhone) {
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sorry, we don't have a phone number for ${targetName}.</Say>
  <Hangup/>
</Response>`,
        { headers: { "Content-Type": "application/xml" } }
      );
    }

    // Update call log if provided
    if (logId) {
      await supabaseClient
        .from("call_logs")
        .update({ outcome: "connecting" })
        .eq("id", logId);
    }

    // Return TwiML to dial the target
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Connecting you now. Your phone number is kept private.</Say>
  <Dial callerId="${session.twilio_proxy_number}" timeout="30" action="${Deno.env.get("SUPABASE_URL")}/functions/v1/eats-twilio-status?log_id=${logId || ""}">
    <Number>${targetPhone}</Number>
  </Dial>
  <Say voice="Polly.Joanna">The call could not be completed. Please try again later.</Say>
</Response>`;

    return new Response(twiml, {
      headers: { "Content-Type": "application/xml" },
    });

  } catch (err) {
    console.error("Voice webhook error:", err);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sorry, an error occurred. Please try again.</Say>
  <Hangup/>
</Response>`,
      { headers: { "Content-Type": "application/xml" } }
    );
  }
});
