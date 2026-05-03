/**
 * create-lodging-paypal-order
 * ----------------------------
 * Creates a PayPal Order for a held lodging reservation. The frontend redirects
 * the guest to the returned `approve_url` (or uses the PayPal JS SDK with the
 * order_id). On approval, the buyer is sent to ${return_url}?paypal_order=...
 * which the SPA hands to capture-lodging-paypal-order.
 *
 * Requires PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET env vars. PAYPAL_MODE selects
 * sandbox vs live (defaults to live to match paypal-payout).
 */
import { createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const PAYPAL_MODE = Deno.env.get("PAYPAL_MODE") ?? "live";
const PAYPAL_BASE = PAYPAL_MODE === "sandbox"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

async function getAccessToken(): Promise<string> {
  const id = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  if (!id || !secret) throw new Error("PayPal credentials not configured");

  const auth = btoa(`${id}:${secret}`);
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${await res.text()}`);
  return (await res.json()).access_token;
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { reservation_id, store_id, amount_cents, mode, return_url, cancel_url } = await req.json();
    if (!reservation_id || !amount_cents || amount_cents <= 0) {
      return new Response(JSON.stringify({ error: "Missing reservation_id or amount_cents" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Verify the caller owns the reservation and it's in a payable state.
    const { data: r } = await admin
      .from("lodge_reservations")
      .select("id, guest_id, store_id, status, payment_status, paid_cents, total_cents, deposit_cents, paypal_order_id")
      .eq("id", reservation_id)
      .maybeSingle();
    if (!r) {
      return new Response(JSON.stringify({ error: "Reservation not found" }), {
        status: 404, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (r.guest_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (["paid", "captured", "authorized", "refunded", "refund_pending"].includes((r as any).payment_status)) {
      return new Response(JSON.stringify({ error: "Reservation already settled" }), {
        status: 409, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const token = await getAccessToken();
    const intent = mode === "deposit" ? "AUTHORIZE" : "CAPTURE";

    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `lodging-${reservation_id}-${amount_cents}-${mode}`,
      },
      body: JSON.stringify({
        intent,
        purchase_units: [{
          reference_id: reservation_id,
          custom_id: reservation_id,
          description: `ZIVO lodging ${mode === "deposit" ? "deposit" : "stay"}`,
          amount: { currency_code: "USD", value: (amount_cents / 100).toFixed(2) },
        }],
        application_context: {
          brand_name: "ZIVO",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: return_url || `${req.headers.get("origin") ?? ""}/trips`,
          cancel_url: cancel_url || `${req.headers.get("origin") ?? ""}/trips`,
        },
      }),
    });

    const orderJson = await orderRes.json();
    if (!orderRes.ok) {
      const msg = orderJson?.message || orderJson?.details?.[0]?.description || "PayPal order create failed";
      return new Response(JSON.stringify({ error: msg }), {
        status: 502, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const approveLink = orderJson.links?.find((l: any) => l.rel === "approve")?.href ?? null;

    await admin
      .from("lodge_reservations")
      .update({
        payment_provider: "paypal",
        paypal_order_id: orderJson.id,
        payment_status: "pending",
      })
      .eq("id", reservation_id);

    return new Response(JSON.stringify({
      order_id: orderJson.id,
      approve_url: approveLink,
      mode: intent,
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[create-lodging-paypal-order]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
