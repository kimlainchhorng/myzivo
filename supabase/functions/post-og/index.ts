import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Temporary landing origin until hizivo.com deep-link rewrites are fixed.
const APP_ORIGIN = "https://endearing-tiramisu-95e81d.netlify.app";
const SOCIAL_CRAWLER_UA = /facebookexternalhit|facebot|twitterbot|xbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|skypeuripreview|pinterest|redditbot|embedly|meta-externalagent|meta-externalfetcher/i;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type PostMeta = {
  id: string;
  caption: string | null;
  mediaType: "image" | "video";
  mediaUrl: string;
  authorName: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("post");
    const userAgent = req.headers.get("user-agent") ?? "";

    if (!postId) {
      return new Response(JSON.stringify({ error: "post required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const postMeta = await resolvePostMeta(supabase, postId);
    if (!postMeta) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shareLandingUrl = `${APP_ORIGIN}/reels?post=${encodeURIComponent(postMeta.id)}`;
    const description = postMeta.caption?.trim() || `Check out this post by ${postMeta.authorName} on ZIVO.`;

    if (!SOCIAL_CRAWLER_UA.test(userAgent)) {
      return Response.redirect(shareLandingUrl, 302);
    }

    const ogType = postMeta.mediaType === "video" ? "video.other" : "article";
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(postMeta.authorName)} on ZIVO</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:title" content="${escapeHtml(postMeta.authorName)} on ZIVO" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(postMeta.mediaUrl)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(postMeta.mediaUrl)}" />
  <meta property="og:image:alt" content="${escapeHtml(postMeta.authorName)} post" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${escapeHtml(shareLandingUrl)}" />
  <meta property="og:site_name" content="ZIVO" />
  ${postMeta.mediaType === "video" ? `<meta property="og:video" content="${escapeHtml(postMeta.mediaUrl)}" /><meta property="og:video:secure_url" content="${escapeHtml(postMeta.mediaUrl)}" /><meta property="og:video:type" content="video/mp4" />` : ""}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(postMeta.authorName)} on ZIVO" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(postMeta.mediaUrl)}" />
  <meta name="twitter:url" content="${escapeHtml(shareLandingUrl)}" />
  <link rel="canonical" href="${escapeHtml(shareLandingUrl)}" />
</head>
<body>
  <script>window.location.replace("${escapeHtml(shareLandingUrl)}");</script>
  <p>Redirecting to <a href="${escapeHtml(shareLandingUrl)}">post on ZIVO</a>...</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: new Headers({
        ...corsHeaders,
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=300",
        "vary": "User-Agent, Accept-Encoding",
      }),
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function resolvePostMeta(
  supabase: ReturnType<typeof createClient>,
  postId: string
): Promise<PostMeta | null> {
  const { data: userPost } = await supabase
    .from("user_posts")
    .select("id, caption, media_url, media_type, user_id")
    .eq("id", postId)
    .maybeSingle();

  if (userPost?.media_url) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", userPost.user_id)
      .maybeSingle();

    return {
      id: userPost.id,
      caption: userPost.caption,
      mediaType: userPost.media_type === "video" || userPost.media_type === "reel" ? "video" : "image",
      mediaUrl: userPost.media_url,
      authorName: profile?.full_name?.trim() || "ZIVO User",
    };
  }

  const { data: storePost } = await supabase
    .from("store_posts")
    .select("id, caption, media_urls, media_type, store_id")
    .eq("id", postId)
    .maybeSingle();

  if (storePost?.media_urls?.length) {
    const { data: store } = await supabase
      .from("store_profiles")
      .select("name")
      .eq("id", storePost.store_id)
      .maybeSingle();

    return {
      id: storePost.id,
      caption: storePost.caption,
      mediaType: storePost.media_type === "video" ? "video" : "image",
      mediaUrl: storePost.media_urls[0],
      authorName: store?.name?.trim() || "ZIVO Store",
    };
  }

  return null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
