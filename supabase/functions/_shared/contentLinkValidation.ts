/**
 * Server-side mirror of src/lib/security/contentLinkValidation.ts
 *
 * Use this from any edge function that accepts free-form user text
 * (post captions, comments, bios, reviews, support tickets, refund
 * disputes, lost-item reports, community descriptions, etc.) so that
 * a malicious client calling Supabase REST directly cannot bypass the
 * JS gate.
 *
 * Keep the rule set in sync with the client copy. The two should
 * agree, but the server is authoritative.
 *
 * Usage in an edge function:
 *
 *   import { scanContentForLinks } from "../_shared/contentLinkValidation.ts";
 *   const scan = scanContentForLinks(body.caption);
 *   if (!scan.ok) {
 *     return new Response(JSON.stringify({ error: "blocked_link", urls: scan.blocked }), { status: 422 });
 *   }
 */

const URL_REGEX = /(https?:\/\/[^\s<>"']+|(?:[a-z0-9-]+\.)+[a-z]{2,}\/[^\s<>"']*)/gi;

const SUSPICIOUS_TLDS = new Set([
  ".zip", ".mov", ".country", ".kim", ".cricket", ".science", ".work",
  ".party", ".gq", ".cf", ".tk", ".ml", ".ga", ".top", ".xin", ".loan",
]);

const URL_SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "ow.ly", "goo.gl", "is.gd", "buff.ly",
  "rebrand.ly", "cutt.ly", "lnkd.in", "shorturl.at", "t.ly", "rb.gy",
  "tiny.cc", "soo.gd", "clck.ru", "shorte.st", "adf.ly", "bc.vc",
  "short.io", "qr.ae", "s.id", "v.gd",
]);

const ZIVO_OWNED_HOSTS = ["hizivo.com", "myzivo.lovable.app"];

const ALLOWED_PARTNER_DOMAINS = new Set([
  "aviasales.com", "tp.media", "tpo.li", "hotellook.com", "economybookings.com",
  "qeeq.com", "getrentacar.com", "kiwitaxi.com", "gettransfer.com", "intui.travel",
  "tiqets.com", "wegotrip.com", "ticketnetwork.com", "airalo.com", "drimsim.com",
  "yesim.app", "radicalstorage.com", "airhelp.com", "compensair.com",
  "booking.com", "expedia.com", "hotels.com", "duffel.com", "links.duffel.com",
  "skyscanner.com", "skyscanner.net", "rentalcover.com",
  "hizivo.com", "myzivo.lovable.app",
]);

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp: number[] = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a.charCodeAt(i - 1) === b.charCodeAt(j - 1)
        ? prev
        : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}

function assess(url: string): "trusted" | "neutral" | "suspicious" | "blocked" {
  let host = "";
  try {
    const u = new URL(url);
    host = u.hostname.toLowerCase();
    const proto = u.protocol.toLowerCase();
    if (proto !== "http:" && proto !== "https:") return "blocked";
    if (u.username || u.password) return "blocked";
    if (host.split(".").some((p) => p.startsWith("xn--"))) return "suspicious";
  } catch {
    return "blocked";
  }

  for (const own of ZIVO_OWNED_HOSTS) {
    if (host === own || host.endsWith(`.${own}`)) {
      return "trusted";
    }
    const dist = levenshtein(host, own);
    if (dist > 0 && dist <= 2) return "blocked";
  }

  if (URL_SHORTENERS.has(host)) return "suspicious";
  for (const tld of SUSPICIOUS_TLDS) if (host.endsWith(tld)) return "suspicious";
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return "suspicious";
  if (url.length > 250) return "suspicious";

  for (const partner of ALLOWED_PARTNER_DOMAINS) {
    if (host === partner || host.endsWith(`.${partner}`)) return "trusted";
  }

  return "neutral";
}

export interface ContentLinkScan {
  blocked: string[];
  suspicious: string[];
  ok: boolean;
}

export function scanContentForLinks(text: string | null | undefined): ContentLinkScan {
  const result: ContentLinkScan = { blocked: [], suspicious: [], ok: true };
  if (!text) return result;

  const seen = new Set<string>();
  const matches = text.match(URL_REGEX) || [];
  for (const raw of matches) {
    const cleaned = raw.replace(/[.,;:!?)"']+$/g, "");
    const href = cleaned.startsWith("http") ? cleaned : `https://${cleaned}`;
    if (seen.has(href)) continue;
    seen.add(href);
    const level = assess(href);
    if (level === "blocked") result.blocked.push(href);
    else if (level === "suspicious") result.suspicious.push(href);
  }
  result.ok = result.blocked.length === 0;
  return result;
}
