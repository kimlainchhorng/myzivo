import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Security: Restrict CORS to known origins only
const allowedOrigins = new Set([
  "https://myzivo.lovable.app",
  "https://hizivo.com",
  "https://zivorestaurant.lovable.app",
  "https://zivodriver.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
]);

// Security: Exact domain matching for target apps
const allowedAppDomains = new Set([
  "myzivo.lovable.app",
  "hizivo.com",
  "zivorestaurant.lovable.app",
  "zivodriver.lovable.app",
  "localhost",
]);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };
}

function extractDomain(targetApp: string): string | null {
  // If it looks like a full URL, parse it
  if (targetApp.startsWith("http://") || targetApp.startsWith("https://")) {
    try {
      return new URL(targetApp).hostname;
    } catch {
      return null;
    }
  }
  // Otherwise treat as domain directly (e.g., "hizivo.com")
  // Validate it looks like a domain (no path, no query)
  if (/^[a-zA-Z0-9.-]+$/.test(targetApp)) {
    return targetApp;
  }
  return null;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Security: Reject requests from unknown origins
  const origin = req.headers.get("origin") || "";
  if (origin && !allowedOrigins.has(origin)) {
    return new Response(
      JSON.stringify({ error: "Forbidden origin" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    
    if (claimsError || !claimsData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { targetApp } = await req.json();
    
    // Security: Extract and validate domain using exact matching
    const targetDomain = extractDomain(targetApp);
    if (!targetDomain || !allowedAppDomains.has(targetDomain)) {
      return new Response(
        JSON.stringify({ error: "Invalid target app" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a short-lived cross-app token (stores in DB)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const crossAppToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute expiry

    const { error: insertError } = await serviceClient
      .from("cross_app_tokens")
      .insert({
        token: crossAppToken,
        user_id: claimsData.user.id,
        target_app: targetApp,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ token: crossAppToken }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
