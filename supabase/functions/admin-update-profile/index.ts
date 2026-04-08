import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";

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
    const { userId, avatarUrl, coverUrl, socialLinks, uploadFile } = body;

    if (!userId || typeof userId !== "string") {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle file upload if provided
    let uploadedUrl: string | null = null;
    if (uploadFile && typeof uploadFile === "object") {
      const { base64, bucket, contentType } = uploadFile;
      if (!base64 || !bucket) {
        return new Response(JSON.stringify({ error: "Invalid upload data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const ext = (contentType || "image/jpeg").split("/")[1] || "jpg";
      const filePath = `${userId}/${Date.now()}.${ext}`;
      const fileBytes = decode(base64);

      const { error: uploadError } = await adminClient.storage
        .from(bucket)
        .upload(filePath, fileBytes, {
          contentType: contentType || "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("[admin-update-profile] upload error:", uploadError);
        return new Response(JSON.stringify({ error: uploadError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: publicData } = adminClient.storage.from(bucket).getPublicUrl(filePath);
      uploadedUrl = publicData?.publicUrl ?? null;
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    if (uploadedUrl && body.uploadFile?.bucket === "avatars") updates.avatar_url = uploadedUrl;
    if (uploadedUrl && body.uploadFile?.bucket === "covers") updates.cover_url = uploadedUrl;
    if (typeof avatarUrl === "string") updates.avatar_url = avatarUrl;
    if (typeof coverUrl === "string") updates.cover_url = coverUrl;
    if (socialLinks && typeof socialLinks === "object") updates.social_links = socialLinks;

    if (Object.keys(updates).length > 0) {
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
    }

    console.log("[admin-update-profile] Updated profile for:", userId, "by:", caller.id);

    return new Response(JSON.stringify({ success: true, uploadedUrl }), {
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
