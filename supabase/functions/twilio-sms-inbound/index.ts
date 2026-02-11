/**
 * Twilio SMS Inbound Webhook
 * Handles STOP/UNSUBSCRIBE and START keywords per TCPA/CTIA guidelines
 */

import { serve, createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// CTIA compliant keywords
const OPT_OUT_KEYWORDS = ["stop", "unsubscribe", "cancel", "end", "quit", "stopall"];
const OPT_IN_KEYWORDS = ["start", "subscribe", "yes", "unstop"];
const HELP_KEYWORDS = ["help", "info"];

function maskPhone(phone: string): string {
  if (phone.length >= 4) {
    return "***-***-" + phone.slice(-4);
  }
  return "***";
}

// Generate TwiML response
function twimlResponse(message: string): Response {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${message}</Message>
</Response>`;

  return new Response(twiml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
      ...corsHeaders,
    },
  });
}

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

    // Parse Twilio webhook form data
    const formData = await req.formData();
    const fromPhone = formData.get("From") as string;
    const body = (formData.get("Body") as string || "").trim().toLowerCase();
    const messageSid = formData.get("MessageSid") as string;

    if (!fromPhone || !body) {
      console.log("Missing From or Body in webhook payload");
      return new Response("OK", { status: 200 });
    }

    console.log(`Inbound SMS from ${maskPhone(fromPhone)}: "${body}"`);

    // Normalize phone to E.164 (Twilio sends +1XXXXXXXXXX format)
    const phoneE164 = fromPhone.startsWith("+") ? fromPhone : `+${fromPhone}`;

    // Find user by phone number
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, email")
      .eq("phone_e164", phoneE164)
      .maybeSingle();

    if (profileError) {
      console.error("Error looking up profile:", profileError);
    }

    const userId = profile?.user_id || null;

    // Check for opt-out keywords
    if (OPT_OUT_KEYWORDS.includes(body)) {
      console.log(`Opt-out request from ${maskPhone(phoneE164)}`);

      if (userId) {
        // Update profile
        await supabase
          .from("profiles")
          .update({
            sms_opted_out: true,
            sms_opted_out_at: new Date().toISOString(),
            sms_consent: false,
          })
          .eq("user_id", userId);

        // Update notification preferences
        await supabase
          .from("notification_preferences")
          .update({ sms_enabled: false })
          .eq("user_id", userId);

        // Log to audit
        await supabase.from("notification_audit").insert({
          user_id: userId,
          channel: "sms",
          event_type: "opt_out",
          destination_masked: maskPhone(phoneE164),
          provider_id: messageSid,
          status: "opted_out",
          metadata: { keyword: body, inbound: true },
        });
      }

      return twimlResponse(
        "You have been unsubscribed from ZIVO SMS notifications. Reply START to re-subscribe."
      );
    }

    // Check for opt-in keywords
    if (OPT_IN_KEYWORDS.includes(body)) {
      console.log(`Opt-in request from ${maskPhone(phoneE164)}`);

      if (userId) {
        // Update profile
        await supabase
          .from("profiles")
          .update({
            sms_opted_out: false,
            sms_opted_out_at: null,
            sms_consent: true,
          })
          .eq("user_id", userId);

        // Update notification preferences
        await supabase
          .from("notification_preferences")
          .update({ sms_enabled: true })
          .eq("user_id", userId);

        // Log to audit
        await supabase.from("notification_audit").insert({
          user_id: userId,
          channel: "sms",
          event_type: "opt_in",
          destination_masked: maskPhone(phoneE164),
          provider_id: messageSid,
          status: "sent",
          metadata: { keyword: body, inbound: true },
        });
      }

      return twimlResponse(
        "Welcome back! You will now receive ZIVO SMS notifications. Reply STOP to unsubscribe."
      );
    }

    // Check for help keywords
    if (HELP_KEYWORDS.includes(body)) {
      return twimlResponse(
        "ZIVO SMS: Reply STOP to unsubscribe, START to re-subscribe. Msg&data rates may apply. Support: hizivo.com/support"
      );
    }

    // Unknown message - log but don't respond
    console.log(`Unrecognized inbound SMS from ${maskPhone(phoneE164)}: "${body}"`);

    // Return empty TwiML (no reply for unrecognized messages)
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        status: 200,
        headers: { "Content-Type": "text/xml", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in twilio-sms-inbound:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Return 200 to prevent Twilio retries
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        status: 200,
        headers: { "Content-Type": "text/xml", ...corsHeaders },
      }
    );
  }
});
