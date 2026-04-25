// Lightweight Web Application Firewall for edge functions.
// Pattern-based blocklist for common SQLi / XSS / path-traversal / oversize payloads.
// Designed to be cheap (regex on small slices) and to fail-open on unexpected errors so
// it never blocks legitimate traffic during incidents.

const SQLI = /(\bunion\b\s+\bselect\b|\bselect\b.+\bfrom\b|\bdrop\s+table\b|\binsert\s+into\b|--\s|;\s*--|\bor\s+1=1\b|\bxp_cmdshell\b|\bsleep\s*\(|\bbenchmark\s*\(|information_schema\.)/i;
const XSS = /(<script\b|javascript:|onerror\s*=|onload\s*=|<iframe\b|<svg[^>]*on\w+=)/i;
const TRAVERSAL = /(\.\.[\/\\]){2,}|\/etc\/passwd|\/proc\/self|\\windows\\system32/i;
const NULL_BYTE = /%00|\x00/;

export const MAX_BODY_BYTES = 1_048_576; // 1 MB

export type WafResult =
  | { ok: true }
  | { ok: false; reason: string; pattern: string };

function scan(text: string): WafResult {
  if (NULL_BYTE.test(text)) return { ok: false, reason: 'null_byte', pattern: 'null' };
  if (SQLI.test(text)) return { ok: false, reason: 'sqli', pattern: 'sqli' };
  if (XSS.test(text)) return { ok: false, reason: 'xss', pattern: 'xss' };
  if (TRAVERSAL.test(text)) return { ok: false, reason: 'path_traversal', pattern: 'traversal' };
  return { ok: true };
}

/**
 * Inspect the URL (path + query) plus a snapshot of the body (first 64 KB)
 * for malicious patterns. Returns {ok:false} when a pattern matches.
 */
export async function inspectRequest(req: Request): Promise<WafResult> {
  try {
    const url = new URL(req.url);
    const target = `${url.pathname}?${url.search}`;
    const headCheck = scan(target);
    if (!headCheck.ok) return headCheck;

    const lenHeader = req.headers.get('content-length');
    if (lenHeader && Number(lenHeader) > MAX_BODY_BYTES) {
      return { ok: false, reason: 'payload_too_large', pattern: 'size' };
    }

    const ct = req.headers.get('content-type') ?? '';
    if (req.method !== 'GET' && req.method !== 'HEAD' && /json|text|form/i.test(ct)) {
      const cloned = req.clone();
      const buf = await cloned.arrayBuffer();
      if (buf.byteLength > MAX_BODY_BYTES) {
        return { ok: false, reason: 'payload_too_large', pattern: 'size' };
      }
      const slice = new TextDecoder().decode(buf.slice(0, 65_536));
      const bodyCheck = scan(slice);
      if (!bodyCheck.ok) return bodyCheck;
    }
    return { ok: true };
  } catch {
    // Fail-open on inspection errors — better to let the handler decide than to 500.
    return { ok: true };
  }
}

export function clientIp(req: Request): string | null {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  return req.headers.get('cf-connecting-ip')
    ?? req.headers.get('x-real-ip')
    ?? null;
}
