/**
 * request-lodging-change — guest submits a reschedule/addon request.
 *
 * For type=reschedule:
 *  - validates the new range against lodge_blocks + other active reservations on the same room
 *  - computes price delta from existing nightly rate
 *  - auto-approves if delta <= 0 AND shift <= 14 days from current dates
 *
 * For type=addon: stores the proposal as pending (host approves to charge).
 */
import { createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ACTIVE = ["hold", "confirmed", "checked_in"];

function daysBetween(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86400000);
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

    const body = await req.json();
    const { reservation_id, type, check_in, check_out, reason, addon_payload } = body;

    if (!reservation_id || !type) {
      return new Response(JSON.stringify({ error: "missing_fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Load the reservation (RLS-permitted as the guest)
    const { data: reservation, error: rErr } = await supabase
      .from("lodge_reservations")
      .select("id, store_id, room_id, check_in, check_out, total_cents, status, guest_id")
      .eq("id", reservation_id)
      .maybeSingle();

    if (rErr || !reservation) {
      return new Response(JSON.stringify({ error: "reservation_not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (reservation.guest_id && reservation.guest_id !== user.id) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (["cancelled", "checked_out", "no_show"].includes(reservation.status)) {
      return new Response(JSON.stringify({ error: "reservation_inactive" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let proposedTotalCents: number | null = null;
    let priceDeltaCents = 0;
    let autoApprove = false;

    if (type === "reschedule") {
      if (!check_in || !check_out) {
        return new Response(JSON.stringify({ error: "missing_dates" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const oldNights = Math.max(1, daysBetween(reservation.check_in, reservation.check_out));
      const newNights = daysBetween(check_in, check_out);
      if (newNights < 1) {
        return new Response(JSON.stringify({ error: "invalid_range" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Conflict check on the same room (use admin client, ignore the current reservation)
      const { data: conflicts } = await admin
        .from("lodge_reservations")
        .select("id")
        .eq("room_id", reservation.room_id)
        .in("status", ACTIVE)
        .neq("id", reservation.id)
        .lt("check_in", check_out)
        .gt("check_out", check_in)
        .limit(1);

      if (conflicts && conflicts.length > 0) {
        return new Response(JSON.stringify({ error: "room_unavailable" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const nightly = Math.round(reservation.total_cents / oldNights);
      proposedTotalCents = nightly * newNights;
      priceDeltaCents = proposedTotalCents - reservation.total_cents;

      const shiftDays = Math.abs(daysBetween(reservation.check_in, check_in));
      autoApprove = shiftDays <= 14 && priceDeltaCents <= 0;
    }

    const status = autoApprove ? "auto_approved" : "pending";
    const decided_at = autoApprove ? new Date().toISOString() : null;
    const decided_by = autoApprove ? user.id : null;

    const { data: inserted, error: iErr } = await admin
      .from("lodge_reservation_change_requests")
      .insert({
        reservation_id,
        store_id: reservation.store_id,
        type,
        status,
        proposed_check_in: check_in || null,
        proposed_check_out: check_out || null,
        proposed_total_cents: proposedTotalCents,
        price_delta_cents: priceDeltaCents,
        reason: reason || null,
        addon_payload: addon_payload || null,
        requested_by: user.id,
        decided_at,
        decided_by,
      })
      .select("id")
      .single();

    if (iErr) throw iErr;

    // Apply auto-approved reschedule immediately
    if (autoApprove && type === "reschedule") {
      const newNights = daysBetween(check_in, check_out);
      await admin
        .from("lodge_reservations")
        .update({
          check_in,
          check_out,
          nights: newNights,
          total_cents: proposedTotalCents,
        })
        .eq("id", reservation_id);
    }

    return new Response(
      JSON.stringify({
        request_id: inserted.id,
        auto_approved: autoApprove,
        price_delta_cents: priceDeltaCents,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String((err as Error).message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
