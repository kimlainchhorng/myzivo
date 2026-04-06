import { createClient } from "npm:@supabase/supabase-js@2";

const corsH = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsH });
  }

  try {
    const { user_id, user_agent } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ valid: true }), {
        headers: { ...corsH, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if this device/user combo has risk events
    const { data: riskEvents } = await supabase
      .from("risk_events")
      .select("id")
      .eq("user_id", user_id)
      .eq("status", "open")
      .limit(5);

    const valid = !riskEvents || riskEvents.length < 3;

    return new Response(JSON.stringify({ valid }), {
      headers: { ...corsH, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("check-device-integrity error:", err);
    return new Response(JSON.stringify({ valid: true }), {
      headers: { ...corsH, "Content-Type": "application/json" },
    });
  }
});
