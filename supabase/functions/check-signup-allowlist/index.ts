import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ allowed: false, message: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user already exists in auth.users
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error checking existing users:", usersError);
      // Continue with allowlist check even if user check fails
    } else {
      const userExists = usersData?.users?.some(
        (u) => u.email?.toLowerCase() === normalizedEmail
      );

      if (userExists) {
        return new Response(
          JSON.stringify({
            allowed: false,
            message: "An account with this email already exists. Please sign in instead.",
            existingUser: true,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check allowlist
    const { data, error } = await supabaseAdmin
      .from("signup_allowlist")
      .select("id, used_at")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error("Error checking allowlist:", error);
      return new Response(
        JSON.stringify({ allowed: false, message: "Error checking allowlist" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({
          allowed: false,
          message: "This email is not authorized to sign up. Please request an invitation.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (data.used_at) {
      return new Response(
        JSON.stringify({
          allowed: false,
          message: "This invitation has already been used. Please sign in instead.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ allowed: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("check-signup-allowlist error:", err);
    return new Response(
      JSON.stringify({ allowed: false, message: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
