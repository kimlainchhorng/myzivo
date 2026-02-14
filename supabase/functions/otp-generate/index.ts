import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateOtp(digits: number): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate caller
    const authHeader = req.headers.get("authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client to get caller identity
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authErr,
    } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { job_id, digits = 4, ttl_minutes = 120 } = await req.json();

    if (!job_id) {
      return new Response(JSON.stringify({ error: "job_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const encKey = Deno.env.get("OTP_ENCRYPTION_KEY");

    // Verify caller is the job customer
    const { data: job, error: jobErr } = await admin
      .from("jobs")
      .select("id, customer_id, status")
      .eq("id", job_id)
      .single();

    if (jobErr || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (job.customer_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for existing unverified, non-expired OTP
    const { data: existing } = await admin
      .from("job_otps")
      .select("job_id, otp_last4, expires_at, verified_at")
      .eq("job_id", job_id)
      .is("verified_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    // If caller wants to regenerate, we always create a new one
    // Generate OTP
    const clampedDigits = Math.min(Math.max(digits, 4), 6);
    const otp = generateOtp(clampedDigits);
    const otpHash = await sha256Hex(otp);
    const expiresAt = new Date(Date.now() + ttl_minutes * 60 * 1000).toISOString();

    // Upsert: delete old unverified OTPs for this job, insert new
    await admin
      .from("job_otps")
      .delete()
      .eq("job_id", job_id)
      .is("verified_at", null);

    const insertPayload: Record<string, unknown> = {
      job_id,
      otp_hash: otpHash,
      otp_last4: otp.slice(-4),
      otp_plain: otp,
      expires_at: expiresAt,
      attempts: 0,
      max_attempts: 5,
    };

    const { error: insertErr } = await admin.from("job_otps").insert(insertPayload);

    if (insertErr) {
      console.error("[otp-generate] Insert error:", insertErr);
      return new Response(JSON.stringify({ error: "Failed to generate OTP" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[otp-generate] Generated ${clampedDigits}-digit OTP for job ${job_id}`);

    return new Response(
      JSON.stringify({
        ok: true,
        otp,
        digits: clampedDigits,
        expires_at: expiresAt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[otp-generate] Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
