/**
 * cancel-lodging-reservation — guest cancels their own reservation.
 *
 * Refund policy:
 *  - 7+ days before check-in:  100% of paid_cents
 *  - 2-6 days:                  50%
 *  - <48h or after check-in:    0%
 *
 * Records a change_request audit row and flips reservation.status -> 'cancelled'.
 * Stripe refund is recorded as a request; actual capture is handled by an
 * existing process-refund worker (out of scope here).
 */
import { createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function hoursUntil(iso: string) {
  return (new Date(iso).getTime() - Date.now()) / 3600000;
}

function refundFor(checkIn: string, paidCents: number) {
  const h = hoursUntil(checkIn);
  if (h >= 24 * 7) return paidCents;
  if (h >= 48) return Math.round(paidCents * 0.5);
  return 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { reservation_id, reason } = await req.json();
    if (!reservation_id) {
      return new Response(JSON.stringify({ error: "missing_reservation_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: r } = await supabase
      .from("lodge_reservations")
      .select("id, store_id, check_in, status, paid_cents, guest_id")
      .eq("id", reservation_id)
      .maybeSingle();
    if (!r) return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r.guest_id && r.guest_id !== user.id) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (["cancelled", "checked_out", "no_show"].includes(r.status)) {
      return new Response(JSON.stringify({ error: "already_inactive" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const refundCents = refundFor(r.check_in, r.paid_cents || 0);

    // Audit row
    await admin.from("lodge_reservation_change_requests").insert({
      reservation_id,
      store_id: r.store_id,
      type: "cancel",
      status: "auto_approved",
      refund_cents: refundCents,
      reason: reason || null,
      requested_by: user.id,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
    });

    // Apply cancellation
    await admin
      .from("lodge_reservations")
      .update({ status: "cancelled" })
      .eq("id", reservation_id);

    return new Response(
      JSON.stringify({ ok: true, status: "cancelled", refund_cents: refundCents }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String((err as Error).message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
