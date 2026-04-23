import { createClient } from "../_shared/deps.ts";
import Stripe from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Addon = { id?: string; name?: string; label?: string; price_cents?: number; amount_cents?: number; unit?: string; pricing_unit?: string };
type Selection = { id: string; quantity?: number };

function unitTotal(price: number, unit: string, qty: number, nights: number, guests: number) {
  if (unit === "per_night") return price * nights * qty;
  if (unit === "per_guest") return price * guests * qty;
  if (unit === "per_person_night") return price * guests * nights * qty;
  return price * qty;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return new Response(JSON.stringify({ error: "unauthenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { reservation_id, selections } = await req.json();
    if (!reservation_id || !Array.isArray(selections) || selections.length === 0) {
      return new Response(JSON.stringify({ error: "invalid_request" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: r } = await admin
      .from("lodge_reservations")
      .select("id, store_id, room_id, guest_id, guest_email, adults, children, nights, total_cents, paid_cents, extras_cents, addons, addon_selections, status")
      .eq("id", reservation_id)
      .maybeSingle();
    if (!r) return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r.guest_id !== user.id) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (["cancelled", "checked_out", "no_show"].includes(r.status)) return new Response(JSON.stringify({ error: "reservation_inactive" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: room } = await admin.from("lodge_rooms").select("addons").eq("id", r.room_id).maybeSingle();
    const catalog = Array.isArray(room?.addons) ? room.addons as Addon[] : [];
    const guests = Math.max(1, Number(r.adults || 1) + Number(r.children || 0));
    const nights = Math.max(1, Number(r.nights || 1));
    const normalized: any[] = [];
    let total = 0;

    for (const sel of selections as Selection[]) {
      const qty = Math.max(1, Math.min(20, Number(sel.quantity || 1)));
      const addon = catalog.find((a) => String(a.id || a.name || a.label) === String(sel.id));
      if (!addon) return new Response(JSON.stringify({ error: "addon_not_available", addon_id: sel.id }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const price = Number(addon.price_cents ?? addon.amount_cents ?? 0);
      const unit = String(addon.unit || addon.pricing_unit || "per_stay");
      const lineTotal = unitTotal(price, unit, qty, nights, guests);
      total += lineTotal;
      normalized.push({ id: sel.id, name: addon.name || addon.label || "Add-on", unit, quantity: qty, price_cents: price, total_cents: lineTotal });
    }

    if (total <= 0) return new Response(JSON.stringify({ error: "nothing_to_charge" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: r.guest_email || user.email, limit: 1 });
    const customer = customers.data[0];
    if (!customer) return new Response(JSON.stringify({ error: "no_saved_payment_method" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const fullCustomer = await stripe.customers.retrieve(customer.id) as Stripe.Customer;
    let paymentMethod = typeof fullCustomer.invoice_settings?.default_payment_method === "string" ? fullCustomer.invoice_settings.default_payment_method : undefined;
    if (!paymentMethod) {
      const methods = await stripe.paymentMethods.list({ customer: customer.id, type: "card", limit: 1 });
      paymentMethod = methods.data[0]?.id;
    }
    if (!paymentMethod) return new Response(JSON.stringify({ error: "no_saved_payment_method" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const pi = await stripe.paymentIntents.create({ amount: total, currency: "usd", customer: customer.id, payment_method: paymentMethod, off_session: true, confirm: true, description: `Lodging add-ons for reservation ${r.id}`, metadata: { reservation_id: r.id, store_id: r.store_id, type: "lodging_addons" } });
    if (pi.status !== "succeeded") return new Response(JSON.stringify({ error: "payment_not_completed", payment_status: pi.status }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const existingSelections = Array.isArray(r.addon_selections) ? r.addon_selections : [];
    const existingAddons = Array.isArray(r.addons) ? r.addons : [];
    const now = new Date().toISOString();
    await admin.from("lodge_reservation_change_requests").insert({ reservation_id: r.id, store_id: r.store_id, type: "addon", status: "auto_approved", addon_payload: normalized, price_delta_cents: total, requested_by: user.id, decided_by: user.id, decided_at: now, applied_at: now, stripe_payment_intent_id: pi.id, payment_status: "captured" });
    for (const item of normalized) await admin.from("lodge_reservation_charges").insert({ reservation_id: r.id, store_id: r.store_id, label: item.name, amount_cents: item.total_cents });
    await admin.from("lodge_reservations").update({ extras_cents: Number(r.extras_cents || 0) + total, total_cents: Number(r.total_cents || 0) + total, paid_cents: Number(r.paid_cents || 0) + total, addon_selections: [...existingSelections, ...normalized], addons: [...existingAddons, ...normalized], payment_status: "captured", last_payment_error: null }).eq("id", r.id);

    return new Response(JSON.stringify({ ok: true, charged_cents: total, payment_intent_id: pi.id, items: normalized }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String((err as Error).message || err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
