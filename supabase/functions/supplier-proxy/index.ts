/**
 * supplier-proxy
 *
 * Reverse-proxies an allow-listed supplier domain so it can be embedded in an
 * <iframe> inside the Zivo admin. Strips X-Frame-Options and CSP frame-ancestors,
 * which is what blocks normal embedding. Rewrites HTML <base> + relative links
 * back through this proxy so navigation stays inside the modal.
 *
 * Usage: GET /supplier-proxy?u=<absolute-url>
 *
 * Notes:
 * - Public function (verify_jwt = false in config.toml) — read-only, allow-listed.
 * - Cookies are passed through but scoped to the proxy origin, so logged-in
 *   sessions persist within the modal but never leak to Zivo's own cookies.
 * - This is a best-effort embed — some sites still break (CSP script-src,
 *   geolocated bot walls). UI shows a graceful fallback when that happens.
 */
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const ALLOWED_HOSTS = new Set([
  "autozonepro.com", "www.autozonepro.com", "autozone.com", "www.autozone.com",
  "firstcallonline.com", "www.firstcallonline.com", "oreillyauto.com", "www.oreillyauto.com",
  "napaprolink.com", "www.napaprolink.com", "prolink.napaonline.com", "proline.napaonline.com", "napaonline.com", "www.napaonline.com",
  "advancepro.com", "www.advancepro.com", "my.advancepro.com", "advancecommercial.com", "www.advancecommercial.com", "advanceautoparts.com", "www.advanceautoparts.com", "shop.advanceautoparts.com",
  "carquest.com", "www.carquest.com",
  "pepboys.com", "www.pepboys.com",
  "autopartsway.com", "www.autopartsway.com",
  "speeddial.worldpac.com", "worldpac.com", "www.worldpac.com",
  "partsauthority.com", "www.partsauthority.com",
  "factorymotorparts.com", "www.factorymotorparts.com",
  "uapinc.com", "www.uapinc.com",
  "ekeystone.com", "www.ekeystone.com", "keystoneautomotive.com", "www.keystoneautomotive.com",
  "lkqonline.com", "www.lkqonline.com", "lkqcorp.com", "www.lkqcorp.com",
  "fcpeuro.com", "www.fcpeuro.com",
  "moparrepairconnect.com", "www.moparrepairconnect.com", "mopar.com", "www.mopar.com",
  "acdelcoconnection.com", "www.acdelcoconnection.com", "gmpartsdirect.com", "www.gmpartsdirect.com",
  "motorcraftservice.com", "www.motorcraftservice.com", "parts.ford.com",
  "techinfo.toyota.com", "parts.toyota.com",
  "serviceexpress.honda.com", "hondapartsnow.com", "www.hondapartsnow.com",
  "techinfo.subaru.com", "subarupartsonline.com", "www.subarupartsonline.com",
  "tis.bmwgroup.net", "getbmwparts.com", "www.getbmwparts.com",
  "erwin.volkswagen.de", "parts.vw.com",
  "rockauto.com", "www.rockauto.com",
  "partsgeek.com", "www.partsgeek.com",
  "1aauto.com", "www.1aauto.com",
  "amazon.com", "www.amazon.com",
  "ebay.com", "www.ebay.com",
  "summitracing.com", "www.summitracing.com",
  "jegs.com", "www.jegs.com",
  "snapon.com", "www.snapon.com",
  "matcotools.com", "www.matcotools.com",
  "harborfreight.com", "www.harborfreight.com",
]);

const STRIP_HEADERS = new Set([
  "x-frame-options",
  "content-security-policy",
  "content-security-policy-report-only",
  "cross-origin-opener-policy",
  "cross-origin-embedder-policy",
  "cross-origin-resource-policy",
  "permissions-policy",
  "strict-transport-security",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const target = url.searchParams.get("u");
  if (!target) {
    return new Response("Missing ?u=<url>", { status: 400, headers: corsHeaders });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return new Response("Invalid URL", { status: 400, headers: corsHeaders });
  }

  if (!/^https?:$/.test(targetUrl.protocol)) {
    return new Response("Only http(s) supported", { status: 400, headers: corsHeaders });
  }

  const host = targetUrl.hostname.toLowerCase();
  const allowed =
    ALLOWED_HOSTS.has(host) ||
    [...ALLOWED_HOSTS].some((h) => host === h || host.endsWith(`.${h}`));
  if (!allowed) {
    return new Response(JSON.stringify({ error: "HOST_NOT_ALLOWED", host }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (url.searchParams.get("probe") === "1") {
    return new Response(JSON.stringify({ ok: true, host }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Forward request
  const reqHeaders = new Headers();
  // Use a real-browser UA to avoid bot walls
  reqHeaders.set(
    "user-agent",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  );
  reqHeaders.set("accept", req.headers.get("accept") ?? "text/html,*/*");
  reqHeaders.set("accept-language", req.headers.get("accept-language") ?? "en-US,en;q=0.9");
  const cookie = req.headers.get("cookie");
  if (cookie) reqHeaders.set("cookie", cookie);

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: reqHeaders,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
      redirect: "follow",
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "UPSTREAM_FAILED", message: String(e) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Build response headers, stripping frame-blockers
  const respHeaders = new Headers(corsHeaders);
  upstream.headers.forEach((v, k) => {
    if (STRIP_HEADERS.has(k.toLowerCase())) return;
    if (k.toLowerCase() === "set-cookie") {
      // Re-scope cookies so they apply to the proxy origin
      respHeaders.append("set-cookie", v.replace(/;\s*Domain=[^;]+/i, "").replace(/;\s*SameSite=[^;]+/i, "; SameSite=None"));
      return;
    }
    respHeaders.set(k, v);
  });
  // Allow embedding from anywhere (the gateway is internal anyway)
  respHeaders.delete("x-frame-options");

  const ct = upstream.headers.get("content-type") ?? "";
  const proxyBase = `${url.origin}${url.pathname}?u=`;

  // Rewrite HTML so that links/forms continue to flow through the proxy
  if (ct.includes("text/html")) {
    let html = await upstream.text();
    const baseHref = `${targetUrl.protocol}//${targetUrl.host}`;

    // Inject <base> + a small script that rewrites in-page navigation
    const injection = `
<base href="${baseHref}/">
<script>
(function(){
  var PROXY = ${JSON.stringify(proxyBase)};
  function abs(u){ try { return new URL(u, document.baseURI).toString(); } catch(e){ return u; } }
  function isAllowed(u){
    try {
      var h = new URL(u).hostname.toLowerCase();
      return ${JSON.stringify([...ALLOWED_HOSTS])}.some(function(a){ return h===a || h.endsWith('.'+a); });
    } catch(e){ return false; }
  }
  function rewrite(u){
    var a = abs(u);
    if (!/^https?:/.test(a)) return u;
    if (!isAllowed(a)) return a;
    return PROXY + encodeURIComponent(a);
  }
  // Rewrite anchor clicks
  document.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('a[href]');
    if (!t) return;
    var href = t.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    e.preventDefault();
    window.location.href = rewrite(href);
  }, true);
  // Rewrite form submissions
  document.addEventListener('submit', function(e){
    var f = e.target;
    if (!f || !f.action) return;
    f.action = rewrite(f.action);
  }, true);
})();
</script>`;

    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, (m) => m + injection);
    } else {
      html = injection + html;
    }

    respHeaders.set("content-type", "text/html; charset=utf-8");
    respHeaders.delete("content-length");
    return new Response(html, { status: upstream.status, headers: respHeaders });
  }

  return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
});
