import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { serve, createClient } from "../_shared/deps.ts";
import { publicCorsHeaders } from "../_shared/cors.ts";

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...publicCorsHeaders,
      "Content-Type": "application/json",
    },
  });

// deno-lint-ignore no-explicit-any
async function manualDispatch(adminClient: any, job: any, jobId: string, radiusMeters: number, offerTtlSeconds: number) {
  // Get job pickup coordinates
  const { data: fullJob } = await adminClient
    .from("jobs")
    .select("pickup_lat, pickup_lng")
    .eq("id", jobId)
    .maybeSingle();

  if (!fullJob?.pickup_lat || !fullJob?.pickup_lng) {
    console.error("[dispatch-start] Job missing pickup coordinates");
    return null;
  }

  // Find nearby online drivers
  const { data: nearby } = await adminClient
    .from("drivers_status")
    .select("driver_id, lat, lng")
    .eq("is_online", true)
    .eq("driver_state", "online_available");

  if (!nearby || nearby.length === 0) {
    console.info("[dispatch-start] No online drivers found");
    return null;
  }

  // Filter by radius using Haversine
  const toRad = (d: number) => (d * Math.PI) / 180;
  const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Get already-offered driver IDs for this job to avoid duplicates
  const { data: existingOffers } = await adminClient
    .from("job_offers")
    .select("driver_id")
    .eq("job_id", jobId);

  const alreadyOffered = new Set((existingOffers || []).map((o: { driver_id: string }) => o.driver_id));

  const candidates = nearby
    .filter((d: { driver_id: string; lat: number; lng: number }) =>
      d.lat && d.lng && !alreadyOffered.has(d.driver_id) && d.driver_id !== job.customer_id
    )
    .map((d: { driver_id: string; lat: number; lng: number }) => ({
      ...d,
      distance: haversine(fullJob.pickup_lat, fullJob.pickup_lng, d.lat, d.lng),
    }))
    .filter((d: { distance: number }) => d.distance <= radiusMeters)
    .sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance);

  if (candidates.length === 0) {
    console.info("[dispatch-start] No eligible drivers within radius");
    return null;
  }

  const best = candidates[0];
  const expiresAt = new Date(Date.now() + offerTtlSeconds * 1000).toISOString();

  const { data: offerData, error: insertError } = await adminClient
    .from("job_offers")
    .upsert(
      {
        job_id: jobId,
        driver_id: best.driver_id,
        status: "pending",
        expires_at: expiresAt,
      },
      { onConflict: "job_id,driver_id" }
    )
    .select("id")
    .maybeSingle();

  if (insertError) {
    console.error("[dispatch-start] Insert job_offers error:", insertError);
    return null;
  }

  // Update job status to dispatched
  await adminClient
    .from("jobs")
    .update({ status: "dispatched" })
    .eq("id", jobId);

  return { offer_id: offerData?.id, driver_id: best.driver_id, distance_m: Math.round(best.distance) };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: publicCorsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    if (!authHeader) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "Supabase env is not configured" }, 500);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const jobId = typeof body.job_id === "string" ? body.job_id : "";
    const offerTtlSeconds = Number.isFinite(body.offer_ttl_seconds)
      ? Math.max(10, Math.min(120, Number(body.offer_ttl_seconds)))
      : 25;
    const radiusMeters = Number.isFinite(body.radius_meters)
      ? Math.max(200, Math.min(50000, Number(body.radius_meters)))
      : 1600;

    if (!jobId) {
      return json({ error: "job_id is required" }, 400);
    }

    const { data: job, error: jobError } = await adminClient
      .from("jobs")
      .select("id, customer_id, status, assigned_driver_id")
      .eq("id", jobId)
      .maybeSingle();

    if (jobError) throw jobError;
    if (!job) return json({ error: "Job not found" }, 404);
    if (job.customer_id !== user.id) return json({ error: "Forbidden" }, 403);
    if (job.assigned_driver_id) return json({ ok: true, already_assigned: true, job_id: jobId });

    if (!["created", "requested", "dispatched"].includes(job.status)) {
      return json({ error: `Job status ${job.status} cannot be dispatched` }, 400);
    }

    // Try RPC first; fall back to manual matching
    let offer = null;
    try {
      const { data: offerRows, error: dispatchError } = await adminClient.rpc("dispatch_next_offer", {
        p_job_id: jobId,
        p_radius_meters: radiusMeters,
        p_offer_ttl_seconds: offerTtlSeconds,
      });

      if (dispatchError) {
        console.warn("[dispatch-start] RPC error, using manual dispatch:", dispatchError.message);
        offer = await manualDispatch(adminClient, job, jobId, radiusMeters, offerTtlSeconds);
      } else {
        offer = Array.isArray(offerRows) ? offerRows[0] ?? null : offerRows ?? null;
      }
    } catch {
      console.warn("[dispatch-start] RPC unavailable, using manual dispatch");
      offer = await manualDispatch(adminClient, job, jobId, radiusMeters, offerTtlSeconds);
    }

    console.info(`dispatch-start: job ${jobId} → offer=${offer?.offer_id ?? "none"}`);

    return json({
      ok: true,
      job_id: jobId,
      dispatched: Boolean(offer?.offer_id),
      offer,
    });
  } catch (error) {
    console.error("[dispatch-start]", error);
    return json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      500,
    );
  }
});
