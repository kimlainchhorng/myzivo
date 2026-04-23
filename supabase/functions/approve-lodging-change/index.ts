/**
 * approve-lodging-change — host (or admin) approves/declines a change request.
 *
 * On approve for reschedule: applies new dates + new total to the reservation.
 * On decline: just records the decision.
 */
import { createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
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

    const { change_request_id, action, host_response } = await req.json();
    if (!change_request_id || !["approve", "decline"].includes(action)) {
      return new Response(JSON.stringify({ error: "invalid_request" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: cr, error: cErr } = await admin
      .from("lodge_reservation_change_requests")
      .select("id, reservation_id, store_id, type, status, proposed_check_in, proposed_check_out, proposed_total_cents")
      .eq("id", change_request_id)
      .maybeSingle();
    if (cErr || !cr) {
      return new Response(JSON.stringify({ error: "request_not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (cr.status !== "pending") {
      return new Response(JSON.stringify({ error: "already_decided" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Authorize: store owner or admin
    const { data: store } = await admin.from("restaurants").select("owner_id").eq("id", cr.store_id).maybeSingle();
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = (roles || []).some((r: any) => r.role === "admin");
    if (!isAdmin && store?.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const newStatus = action === "approve" ? "approved" : "declined";

    await admin
      .from("lodge_reservation_change_requests")
      .update({
        status: newStatus,
        host_response: host_response || null,
        decided_by: user.id,
        decided_at: new Date().toISOString(),
      })
      .eq("id", change_request_id);

    if (action === "approve" && cr.type === "reschedule" && cr.proposed_check_in && cr.proposed_check_out) {
      const nights = daysBetween(cr.proposed_check_in, cr.proposed_check_out);
      await admin
        .from("lodge_reservations")
        .update({
          check_in: cr.proposed_check_in,
          check_out: cr.proposed_check_out,
          nights,
          total_cents: cr.proposed_total_cents,
        })
        .eq("id", cr.reservation_id);
    }

    return new Response(JSON.stringify({ ok: true, status: newStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String((err as Error).message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
