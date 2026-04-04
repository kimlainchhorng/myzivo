import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, cover_url")
      .eq("id", userId)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const name = profile.full_name || "ZIVO User";
    const profileUrl = `https://hizivo.com/user/${userId}`;
    const avatar = profile.avatar_url || "https://hizovo.com/og-image.png";
    const cover = profile.cover_url || avatar;
    const description = `Check out ${name}'s profile on ZIVO — One app for every journey.`;

    // Check if request is from a social media crawler
    const userAgent = req.headers.get("user-agent") || "";
    const isCrawler = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Slackbot|TelegramBot|Pinterest|Discordbot/i.test(userAgent);

    if (isCrawler) {
      // Serve HTML with OG meta tags for crawlers
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(name)} on ZIVO</title>
  <meta property="og:type" content="profile" />
  <meta property="og:title" content="${escapeHtml(name)} on ZIVO" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(cover)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${escapeHtml(profileUrl)}" />
  <meta property="og:site_name" content="ZIVO" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(name)} on ZIVO" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(cover)}" />
  <link rel="canonical" href="${escapeHtml(profileUrl)}" />
</head>
<body>
  <script>window.location.href = "${escapeHtml(profileUrl)}";</script>
  <p>Redirecting to <a href="${escapeHtml(profileUrl)}">${escapeHtml(name)}'s profile</a>...</p>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      });
    }

    // For regular requests, return JSON
    return new Response(JSON.stringify({
      name,
      avatar_url: avatar,
      cover_url: cover,
      profile_url: profileUrl,
      og: {
        title: `${name} on ZIVO`,
        description,
        image: cover,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
