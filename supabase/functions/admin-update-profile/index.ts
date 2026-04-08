import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allowedRoles = ["admin", "super_admin", "support"];
    const { data: roleRows } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .in("role", allowedRoles);

    if ((roleRows ?? []).length === 0) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { userId, avatarUrl, coverUrl, socialLinks } = body;

    if (!userId || typeof userId !== "string") {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};
    if (typeof avatarUrl === "string") updates.avatar_url = avatarUrl;
    if (typeof coverUrl === "string") updates.cover_url = coverUrl;
    if (socialLinks && typeof socialLinks === "object") updates.social_links = socialLinks;

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try updating by user_id first, then by id
    const { error: updateError1 } = await adminClient
      .from("profiles")
      .update(updates)
      .eq("user_id", userId);

    if (updateError1) {
      const { error: updateError2 } = await adminClient
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (updateError2) {
        console.error("[admin-update-profile] update error:", updateError2);
        return new Response(JSON.stringify({ error: updateError2.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    console.log("[admin-update-profile] Updated profile for:", userId, "by:", caller.id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
