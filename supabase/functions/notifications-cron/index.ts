/**
 * notifications-cron
 * ------------------
 * Hourly cron that fires *time-based* notifications — the kind that no
 * single DB row change can trigger. Each scan is idempotent (keyed by an
 * idempotency_key the dispatcher dedupes on inside a 24h window) so the
 * same notification will not be sent twice if cron re-runs.
 *
 * Current scans:
 *   1. Flight check-in reminders   — 24h before departure_time
 *   2. Hotel check-in reminders    — day before check_in date
 *   3. Subscription renewal nudge  — 3 days before expires_at
 *   4. Subscription expiring soon  — 1 day before expires_at
 *   5. Subscription expired today  — expires_at passed in the last hour
 *
 * Auth: cron-secret OR service-role; refuses everything else.
 */
import { serve, createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const j = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return j(500, { error: "Server misconfigured" });

  // Auth: accept cron secret header/query OR service-role bearer token.
  const cronSecretExpected = Deno.env.get("CRON_SECRET") ?? "";
  const url = new URL(req.url);
  const providedSecret =
    url.searchParams.get("secret") ?? req.headers.get("x-cron-secret") ?? "";
  const auth = req.headers.get("Authorization") ?? "";
  const isService = auth === `Bearer ${serviceKey}`;
  const cronOk = !!cronSecretExpected && providedSecret === cronSecretExpected;
  if (!isService && !cronOk) return j(401, { error: "Unauthorized" });

  const supabase = createClient(supabaseUrl, serviceKey);
  const now = Date.now();

  const dispatchOne = async (payload: {
    user_id: string;
    event_type: string;
    title: string;
    body?: string;
    data?: Record<string, unknown>;
    channels?: ("inbox" | "push" | "email" | "sms")[];
    idempotency_key: string;
    category?: "transactional" | "marketing" | "social" | "chat";
  }) => {
    try {
      const r = await fetch(`${supabaseUrl}/functions/v1/notify-dispatch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      return r.ok;
    } catch {
      return false;
    }
  };

  const results = {
    flight_checkin_reminder: 0,
    lodge_checkin_reminder: 0,
    subscription_renewal_3d: 0,
    subscription_renewal_1d: 0,
    subscription_expired: 0,
    errors: [] as string[],
  };

  // -- 1. Flight check-in reminders (24h before departure) -------------------
  try {
    const start = new Date(now + 24 * 3600_000);
    const end = new Date(now + 25 * 3600_000); // one-hour window matches cron cadence
    const { data: flights, error } = await supabase
      .from("flight_bookings")
      .select("id, customer_id, booking_reference, flight_id, flights:flight_id(departure_time, origin_airport, destination_airport)")
      .gte("flights.departure_time", start.toISOString())
      .lt("flights.departure_time", end.toISOString())
      .eq("payment_status", "paid")
      .neq("status", "cancelled")
      .limit(500);
    if (error) throw error;
    for (const f of flights ?? []) {
      const dep = (f as any).flights?.departure_time;
      if (!dep) continue;
      const ok = await dispatchOne({
        user_id: (f as any).customer_id,
        event_type: "flight_checkin_reminder",
        title: "Check in for your flight",
        body: `Departs in 24h — ref ${(f as any).booking_reference}`,
        data: { booking_id: (f as any).id, url: `/bookings?booking_id=${(f as any).id}` },
        channels: ["inbox", "push", "email"],
        idempotency_key: `flight_checkin:${(f as any).id}`,
      });
      if (ok) results.flight_checkin_reminder++;
    }
  } catch (e) {
    results.errors.push(`flight: ${e instanceof Error ? e.message : String(e)}`);
  }

  // -- 2. Lodge check-in reminders (~24h before check_in date) ---------------
  try {
    const tomorrow = new Date(now + 24 * 3600_000).toISOString().slice(0, 10);
    const { data: stays, error } = await supabase
      .from("lodge_reservations")
      .select("id, guest_id, check_in")
      .eq("check_in", tomorrow)
      .neq("status", "cancelled")
      .not("guest_id", "is", null)
      .limit(500);
    if (error) throw error;
    for (const s of stays ?? []) {
      const ok = await dispatchOne({
        user_id: (s as any).guest_id,
        event_type: "lodge_checkin_reminder",
        title: "Check-in is tomorrow",
        body: "We're looking forward to hosting you.",
        data: { reservation_id: (s as any).id, url: `/bookings?booking_id=${(s as any).id}` },
        channels: ["inbox", "push", "email"],
        idempotency_key: `lodge_checkin:${(s as any).id}`,
      });
      if (ok) results.lodge_checkin_reminder++;
    }
  } catch (e) {
    results.errors.push(`lodge: ${e instanceof Error ? e.message : String(e)}`);
  }

  // -- 3+4+5. Creator subscriptions ------------------------------------------
  try {
    // 3 days out
    const win3aStart = new Date(now + 3 * 24 * 3600_000).toISOString();
    const win3aEnd = new Date(now + 3 * 24 * 3600_000 + 3600_000).toISOString();
    // 1 day out
    const win1dStart = new Date(now + 24 * 3600_000).toISOString();
    const win1dEnd = new Date(now + 25 * 3600_000).toISOString();
    // expired in the last hour
    const expStart = new Date(now - 3600_000).toISOString();
    const expEnd = new Date(now).toISOString();

    const [r3, r1, rExp] = await Promise.all([
      supabase
        .from("creator_subscriptions")
        .select("id, subscriber_id, creator_id, expires_at")
        .eq("status", "active")
        .gte("expires_at", win3aStart)
        .lt("expires_at", win3aEnd)
        .limit(500),
      supabase
        .from("creator_subscriptions")
        .select("id, subscriber_id, creator_id, expires_at")
        .eq("status", "active")
        .gte("expires_at", win1dStart)
        .lt("expires_at", win1dEnd)
        .limit(500),
      supabase
        .from("creator_subscriptions")
        .select("id, subscriber_id, creator_id, expires_at, status")
        .neq("status", "active")
        .gte("expires_at", expStart)
        .lt("expires_at", expEnd)
        .limit(500),
    ]);

    for (const s of r3.data ?? []) {
      const ok = await dispatchOne({
        user_id: (s as any).subscriber_id,
        event_type: "subscription_renewal_reminder",
        title: "Subscription renews in 3 days",
        body: "Tap to update your payment method or cancel.",
        data: { subscription_id: (s as any).id, url: "/account/subscriptions" },
        channels: ["inbox", "push", "email"],
        idempotency_key: `sub_renewal_3d:${(s as any).id}`,
      });
      if (ok) results.subscription_renewal_3d++;
    }
    for (const s of r1.data ?? []) {
      const ok = await dispatchOne({
        user_id: (s as any).subscriber_id,
        event_type: "subscription_renewal_soon",
        title: "Subscription renews tomorrow",
        body: "Make sure your payment method is up to date.",
        data: { subscription_id: (s as any).id, url: "/account/subscriptions" },
        channels: ["inbox", "push", "email"],
        idempotency_key: `sub_renewal_1d:${(s as any).id}`,
      });
      if (ok) results.subscription_renewal_1d++;
    }
    for (const s of rExp.data ?? []) {
      const ok = await dispatchOne({
        user_id: (s as any).subscriber_id,
        event_type: "subscription_expired",
        title: "Subscription expired",
        body: "Renew to keep accessing exclusive content.",
        data: { subscription_id: (s as any).id, url: "/account/subscriptions" },
        channels: ["inbox", "push", "email"],
        idempotency_key: `sub_expired:${(s as any).id}`,
      });
      if (ok) results.subscription_expired++;
    }
  } catch (e) {
    results.errors.push(`subscriptions: ${e instanceof Error ? e.message : String(e)}`);
  }

  return j(200, { ok: true, ts: new Date().toISOString(), results });
});
