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

    if (jobError) {
      throw jobError;
    }

    if (!job) {
      return json({ error: "Job not found" }, 404);
    }

    if (job.customer_id !== user.id) {
      return json({ error: "Forbidden" }, 403);
    }

    if (job.assigned_driver_id) {
      return json({ ok: true, already_assigned: true, job_id: jobId });
    }

    if (!["created", "requested", "dispatched"].includes(job.status)) {
      return json({ error: `Job status ${job.status} cannot be dispatched` }, 400);
    }

    const { data: offerRows, error: dispatchError } = await adminClient.rpc("dispatch_next_offer", {
      p_job_id: jobId,
      p_radius_meters: radiusMeters,
      p_offer_ttl_seconds: offerTtlSeconds,
    });

    if (dispatchError) {
      throw dispatchError;
    }

    const offer = Array.isArray(offerRows) ? offerRows[0] ?? null : offerRows ?? null;

    return json({
      ok: true,
      job_id: jobId,
      dispatched: Boolean(offer?.offer_id),
      offer,
    });
  } catch (error) {
    console.error("[dispatch-start]", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      500,
    );
  }
});
