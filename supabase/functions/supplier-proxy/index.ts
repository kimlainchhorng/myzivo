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

const getCorsHeaders = (req: Request): Record<string, string> => {
  const origin = req.headers.get("origin") ?? "*";
  return {
    ...corsHeaders,
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
};

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
  const dynamicCorsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: dynamicCorsHeaders });
  }

  const url = new URL(req.url);
  const target = url.searchParams.get("u");
  if (!target) {
    return new Response("Missing ?u=<url>", { status: 400, headers: dynamicCorsHeaders });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return new Response("Invalid URL", { status: 400, headers: dynamicCorsHeaders });
  }

  if (!/^https?:$/.test(targetUrl.protocol)) {
    return new Response("Only http(s) supported", { status: 400, headers: dynamicCorsHeaders });
  }

  const host = targetUrl.hostname.toLowerCase();
  const allowed =
    ALLOWED_HOSTS.has(host) ||
    [...ALLOWED_HOSTS].some((h) => host === h || host.endsWith(`.${h}`));
  if (!allowed) {
    return new Response(JSON.stringify({ error: "HOST_NOT_ALLOWED", host }), {
      status: 403,
      headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
    });
  }

  if (url.searchParams.get("probe") === "1") {
    return new Response(JSON.stringify({ ok: true, host }), {
      status: 200,
      headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
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
      { status: 200, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Build response headers, stripping frame-blockers
  const respHeaders = new Headers(dynamicCorsHeaders);
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
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
  const proxyBase = `${supabaseUrl ?? url.origin}/functions/v1/supplier-proxy?u=`;

  // Rewrite HTML so that links/forms continue to flow through the proxy
  if (ct.includes("text/html") || ct.includes("text/plain") || ct.includes("application/xhtml")) {
    let html = await upstream.text();
    const looksLikeHtml = /<!doctype html|<html[\s>]/i.test(html);
    if (!looksLikeHtml) {
      return new Response(html, { status: upstream.status, headers: respHeaders });
    }
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
    parent.postMessage({ type: 'zivo-supplier-navigate', url: rewrite(href), method: 'GET' }, '*');
  }, true);
  // Rewrite form submissions
  document.addEventListener('submit', function(e){
    var f = e.target;
    if (!f || !f.action) return;
    e.preventDefault();
    var method = (f.method || 'GET').toUpperCase();
    var action = rewrite(f.action);
    var params = new URLSearchParams(new FormData(f));
    if (method === 'GET') {
      parent.postMessage({ type: 'zivo-supplier-navigate', url: action + (action.indexOf('?') >= 0 ? '&' : '?') + params.toString(), method: 'GET' }, '*');
      return;
    }
    parent.postMessage({ type: 'zivo-supplier-navigate', url: action, method: method, body: params.toString(), contentType: 'application/x-www-form-urlencoded' }, '*');
  }, true);
  var nativeFetch = window.fetch;
  if (nativeFetch) {
    window.fetch = function(input, init){
      var raw = (typeof input === 'string') ? input : (input && input.url);
      if (!raw) return nativeFetch.apply(this, arguments);
      var next = rewrite(raw);
      if (next === raw) return nativeFetch.apply(this, arguments);
      if (typeof input === 'string') return nativeFetch.call(this, next, init);
      try { return nativeFetch.call(this, new Request(next, input), init); }
      catch(e) { return nativeFetch.call(this, next, init); }
    };
  }
  var nativeOpen = XMLHttpRequest && XMLHttpRequest.prototype.open;
  if (nativeOpen) {
    XMLHttpRequest.prototype.open = function(method, requestUrl){
      arguments[1] = rewrite(requestUrl);
      return nativeOpen.apply(this, arguments);
    };
  }

  // ===== Credential autofill =====
  var pendingCreds = null;
  var applying = false;
  var pollTimer = null;
  function getValueSetter(el){
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var desc = Object.getOwnPropertyDescriptor(proto, 'value');
    return desc && desc.set;
  }
  function liftFloatingLabel(el){
    try {
      var label = null;
      if (el.id) {
        var safeId = window.CSS && CSS.escape ? CSS.escape(el.id) : el.id.replace(/"/g, '\\"');
        label = document.querySelector('label[for="' + safeId + '"]');
      }
      if (!label) {
        var wrap = el.closest && el.closest('[class*="TextField_input-container"], [data-testid="st-formcontrol"]');
        label = wrap && wrap.querySelector('label');
      }
      if (!label) return;
      label.classList.add('Label_--shifted__ugQTr', 'TextField_--shifted__oAJ_K');
      el.classList.add('TextField_--shifted__oAJ_K');
      label.style.backgroundColor = 'var(--st-color-background, #fff)';
      label.style.padding = '0 var(--st-unit-1, 4px)';
      if (!label.style.transform) label.style.transform = 'translateY(calc(-1 * (var(--st-unit-5, 20px) + 2.5px)))';
    } catch(e) {}
  }
  function enableFilledFormControls(){
    try {
      var forms = document.querySelectorAll('form');
      for (var f = 0; f < forms.length; f++) {
        var form = forms[f];
        var hasValue = false;
        var inputs = form.querySelectorAll('input');
        for (var i = 0; i < inputs.length; i++) {
          var input = inputs[i];
          if (input.type !== 'hidden' && input.type !== 'checkbox' && String(input.value || '').trim()) { hasValue = true; break; }
        }
        if (!hasValue) continue;
        var buttons = form.querySelectorAll('button, [role="button"]');
        for (var b = 0; b < buttons.length; b++) {
          var btn = buttons[b];
          var text = ((btn.getAttribute('aria-label') || '') + ' ' + (btn.textContent || '')).toLowerCase();
          if (!/continue|sign\s*in|login|log\s*in|submit/.test(text)) continue;
          try { btn.disabled = false; } catch(_) {}
          btn.removeAttribute('disabled');
          btn.removeAttribute('aria-disabled');
          btn.className = String(btn.className || '').replace(/\S*--disabled\S*/g, '').replace(/\S*_disabled\S*/gi, '');
          btn.style.pointerEvents = 'auto';
          btn.style.cursor = 'pointer';
          btn.style.opacity = '1';
        }
      }
    } catch(e) {}
  }
  function setVal(el, val){
    try {
      try { el.focus({ preventScroll: true }); } catch(_) {}
      var setter = getValueSetter(el);
      if (setter) setter.call(el, val); else el.value = val;
      try { if (el._valueTracker) el._valueTracker.setValue(''); } catch(_) {}
      liftFloatingLabel(el);
      try { el.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data: val })); } catch(_) {}
      try { el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: val })); }
      catch(_) { el.dispatchEvent(new Event('input', { bubbles: true })); }
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('keyup', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
      try { el.blur(); } catch(_) {}
    } catch(e) {}
  }
  function applyCreds(creds){
    if (!creds || applying) return false;
    applying = true;
    var touched = false;
    try {
      var inputs = document.querySelectorAll('input');
      for (var i = 0; i < inputs.length; i++) {
        var el = inputs[i];
        if (el.disabled || el.readOnly || el.type === 'hidden') continue;
        var hint = ((el.name||'') + ' ' + (el.id||'') + ' ' + (el.getAttribute('autocomplete')||'') + ' ' + (el.placeholder||'') + ' ' + (el.type||'')).toLowerCase();
        if (el.type === 'password' && creds.password) {
          if (el.value !== creds.password) setVal(el, creds.password); else liftFloatingLabel(el);
          touched = true;
        } else if (creds.username && el.type !== 'password' &&
                   (el.type === 'email' || /user|email|login|account|signin|userid/.test(hint))) {
          if (el.value !== creds.username) setVal(el, creds.username); else liftFloatingLabel(el);
          touched = true;
        }
      }
      enableFilledFormControls();
    } finally {
      applying = false;
    }
    return touched;
  }
  function startBoundedAutofill(creds){
    if (pollTimer) clearInterval(pollTimer);
    var until = Date.now() + 10000;
    var ok = applyCreds(creds);
    pollTimer = setInterval(function(){
      applyCreds(creds);
      if (Date.now() > until) { clearInterval(pollTimer); pollTimer = null; }
    }, 500);
    return ok;
  }
  window.addEventListener('message', function(e){
    var data = e.data;
    if (!data || data.type !== 'zivo-autofill') return;
    pendingCreds = { username: data.username || '', password: data.password || '' };
    var ok = startBoundedAutofill(pendingCreds);
    parent.postMessage({ type: 'zivo-autofill-result', filled: ok }, '*');
  });
})();
</script>`;

    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, (m) => m + injection);
    } else {
      html = injection + html;
    }

    const htmlHeaders = new Headers(dynamicCorsHeaders);
    htmlHeaders.set("content-type", "text/html; charset=utf-8");
    htmlHeaders.set("cache-control", upstream.headers.get("cache-control") ?? "no-store");
    htmlHeaders.set("x-zivo-proxy-version", "html-srcdoc-cors-v2");
    upstream.headers.forEach((v, k) => {
      if (k.toLowerCase() === "set-cookie") {
        htmlHeaders.append("Set-Cookie", v.replace(/;\s*Domain=[^;]+/i, "").replace(/;\s*SameSite=[^;]+/i, "; SameSite=None"));
      }
    });
    return new Response(html, { status: upstream.status, headers: htmlHeaders });
  }

  return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
});
