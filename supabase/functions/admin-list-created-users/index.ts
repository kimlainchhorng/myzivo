import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser();
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

    const canManageAccounts = (roleRows ?? []).length > 0;

    if (!canManageAccounts) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const matchedUsers: Array<{
      id: string;
      email: string;
      created_at: string | null;
      user_metadata?: Record<string, unknown>;
    }> = [];

    for (let page = 1; page <= 10; page += 1) {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage: 1000,
      });

      if (error) {
        throw error;
      }

      const users = data.users ?? [];
      if (users.length === 0) break;

      for (const user of users) {
        const email = user.email?.toLowerCase() ?? "";
        const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
        const createdViaAdmin =
          metadata.created_via === "admin_user_accounts";
        const isGeneratedZivoAccount = email.endsWith("@zivo.app");

        if (email && (createdViaAdmin || isGeneratedZivoAccount)) {
          matchedUsers.push({
            id: user.id,
            email: user.email ?? "",
            created_at: user.created_at ?? null,
            user_metadata: metadata,
          });
        }
      }

      if (users.length < 1000) break;
    }

    const uniqueUsers = Array.from(
      new Map(matchedUsers.map((user) => [user.id, user])).values(),
    )
      .sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime(),
      )
      .slice(0, 100);

    const userIds = uniqueUsers.map((user) => user.id);
    let profiles: Array<{
      user_id: string;
      avatar_url: string | null;
      cover_url: string | null;
      social_facebook: string | null;
      social_instagram: string | null;
      social_tiktok: string | null;
      social_snapchat: string | null;
      social_x: string | null;
      social_linkedin: string | null;
      social_telegram: string | null;
      social_links: Record<string, unknown> | null;
    }> = [];

    if (userIds.length) {
      const primaryQuery = await adminClient
        .from("profiles")
        .select(
          "user_id, avatar_url, cover_url, social_facebook, social_instagram, social_tiktok, social_snapchat, social_x, social_linkedin, social_telegram, social_links",
        )
        .in("user_id", userIds);

      if (primaryQuery.error) {
        if (
          primaryQuery.error.message.includes("social_links") &&
          primaryQuery.error.message.includes("schema cache")
        ) {
          const fallbackQuery = await adminClient
            .from("profiles")
            .select(
              "user_id, avatar_url, cover_url, social_facebook, social_instagram, social_tiktok, social_snapchat, social_x, social_linkedin, social_telegram",
            )
            .in("user_id", userIds);

          if (fallbackQuery.error) {
            throw fallbackQuery.error;
          }

          profiles = (fallbackQuery.data ?? []).map((profile) => ({
            ...profile,
            social_links: null,
          }));
        } else {
          throw primaryQuery.error;
        }
      } else {
        profiles = (primaryQuery.data ?? []) as typeof profiles;
      }
    }

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [profile.user_id, profile]),
    );

    const accounts = uniqueUsers.map((user) => {
      const metadata = user.user_metadata ?? {};
      const profile = profileMap.get(user.id);
      const emailPrefix =
        user.email.split("@")[0]?.split("+")[0] ?? "user";
      const socialLinks = {
        ...(profile?.social_links &&
        typeof profile.social_links === "object"
          ? profile.social_links
          : {}),
        ...(profile?.social_facebook
          ? { facebook: profile.social_facebook }
          : {}),
        ...(profile?.social_instagram
          ? { instagram: profile.social_instagram }
          : {}),
        ...(profile?.social_tiktok
          ? { tiktok: profile.social_tiktok }
          : {}),
        ...(profile?.social_snapchat
          ? { snapchat: profile.social_snapchat }
          : {}),
        ...(profile?.social_x ? { x: profile.social_x } : {}),
        ...(profile?.social_linkedin
          ? { linkedin: profile.social_linkedin }
          : {}),
        ...(profile?.social_telegram
          ? { telegram: profile.social_telegram }
          : {}),
      };

      return {
        userId: user.id,
        username:
          (typeof metadata.username === "string" && metadata.username) ||
          (typeof metadata.full_name === "string" && metadata.full_name) ||
          emailPrefix,
        email: user.email,
        password: "",
        createdAt: user.created_at ?? new Date().toISOString(),
        avatarUrl: profile?.avatar_url ?? null,
        coverUrl: profile?.cover_url ?? null,
        socialLinks,
      };
    });

    return new Response(JSON.stringify({ accounts }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("admin-list-created-users error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
