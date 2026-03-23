/**
 * ABA Payway Payment Link Generator
 * Creates a checkout payment link for Cambodian users via ABA Payway API.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ABA_API_BASE = "https://checkout-sandbox.payway.com.kh";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const merchantId = Deno.env.get("ABA_PAYWAY_MERCHANT_ID");
    if (!merchantId) throw new Error("ABA_PAYWAY_MERCHANT_ID is not configured");

    const apiKey = Deno.env.get("ABA_PAYWAY_API_KEY");
    if (!apiKey) throw new Error("ABA_PAYWAY_API_KEY is not configured");

    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { amount, currency, description, return_url, reference } = body;

    // Validate inputs
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validCurrencies = ["USD", "KHR"];
    const cur = (currency || "USD").toUpperCase();
    if (!validCurrencies.includes(cur)) {
      return new Response(JSON.stringify({ error: "Currency must be USD or KHR" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build ABA Payway payment link request
    const payloadHash = await generateHash(
      `${merchantId}${reference || ""}${amount.toFixed(2)}`,
      apiKey
    );

    const abaPayload = {
      tran_id: reference || crypto.randomUUID().replace(/-/g, "").substring(0, 20),
      merchant_id: merchantId,
      amount: amount.toFixed(2),
      currency: cur,
      description: description || "ZIVO Payment",
      return_url: return_url ? btoa(return_url) : "",
      hash: payloadHash,
      payment_option: "abapay cards",
    };

    // Return signed form data for client-side form POST to ABA
    // ABA Payway purchase endpoint only accepts browser form POSTs, not server-to-server calls
    return new Response(
      JSON.stringify({
        success: true,
        payment_url: `${ABA_API_BASE}/api/payment-gateway/v1/payments/purchase`,
        tran_id: abaPayload.tran_id,
        checkout_data: abaPayload,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("ABA Payway checkout error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/** Generate HMAC-SHA512 hash for ABA Payway request signing */
async function generateHash(data: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
