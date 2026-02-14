import { createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const encKey = Deno.env.get("OTP_ENCRYPTION_KEY");

    if (!encKey) {
      console.error("[otp-get] OTP_ENCRYPTION_KEY not configured");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Authenticate caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { job_id } = await req.json();
    if (!job_id) {
      return new Response(JSON.stringify({ error: "job_id required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Verify caller is the job customer or assigned driver
    const { data: job, error: jobErr } = await admin
      .from("jobs")
      .select("customer_id, assigned_driver_id, status")
      .eq("id", job_id)
      .single();

    if (jobErr || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (job.customer_id !== user.id && job.assigned_driver_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Call the RPC to decrypt OTP
    const { data, error: rpcErr } = await admin.rpc("get_job_otp_plain", {
      p_job_id: job_id,
      p_enc_key: encKey,
    });

    if (rpcErr) {
      console.error("[otp-get] RPC error:", rpcErr);
      // Fallback: try reading otp_plain directly
      const { data: fallback } = await admin
        .from("job_otps")
        .select("otp_plain, expires_at")
        .eq("job_id", job_id)
        .is("verified_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fallback?.otp_plain) {
        return new Response(
          JSON.stringify({ ok: true, otp: fallback.otp_plain, expires_at: fallback.expires_at }),
          { headers: { ...cors, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ ok: true, otp: null, expires_at: null }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return new Response(JSON.stringify({ ok: true, otp: null, expires_at: null }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, otp: row.otp, expires_at: row.expires_at }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[otp-get] Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
