/**
 * ABA Payway Deep Link Generator
 * Creates an ABA mobile app deep link for Cambodian users via ABA PayWay API.
 * Uses multipart/form-data and HMAC-SHA512 hash per ABA's spec.
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

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cur = (currency || "USD").toUpperCase();
    const tranId = (reference || crypto.randomUUID().replace(/-/g, "")).substring(0, 20);
    const reqTime = formatDate(new Date());

    // Build payload fields — ORDER MATTERS for hash
    const payloadFields: Record<string, string> = {
      tran_id: tranId,
      amount: amount.toFixed(2),
      payment_option: "abapay_deeplink",
      return_url: return_url ? btoa(return_url) : "",
      currency: cur,
    };

    // Hash = HMAC-SHA512(req_time + merchant_id + all payload values in order, api_key)
    const hashInput = [reqTime, merchantId, ...Object.values(payloadFields)].join("");
    const hash = await generateHash(hashInput, apiKey);

    // Build multipart/form-data
    const formData = new FormData();
    formData.append("req_time", reqTime);
    formData.append("merchant_id", merchantId);
    for (const [key, value] of Object.entries(payloadFields)) {
      formData.append(key, value);
    }
    formData.append("hash", hash);

    console.log("[ABA] Sending request to ABA API:", {
      url: `${ABA_API_BASE}/api/payment-gateway/v1/payments/purchase`,
      tran_id: tranId,
      amount: amount.toFixed(2),
      payment_option: "abapay_deeplink",
      currency: cur,
    });

    const abaResponse = await fetch(
      `${ABA_API_BASE}/api/payment-gateway/v1/payments/purchase`,
      { method: "POST", body: formData }
    );

    const abaText = await abaResponse.text();
    console.log("[ABA] Response status:", abaResponse.status, "body:", abaText);

    if (!abaResponse.ok) {
      return new Response(
        JSON.stringify({ error: "ABA API error", status: abaResponse.status, details: abaText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let abaData;
    try {
      abaData = JSON.parse(abaText);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid ABA response", details: abaText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        tran_id: tranId,
        abapay_deeplink: abaData.abapay_deeplink || null,
        qr_string: abaData.qrString || abaData.qr_string || null,
        raw: abaData,
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

/** Format date as yyyyMMddHHmmss */
function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

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
