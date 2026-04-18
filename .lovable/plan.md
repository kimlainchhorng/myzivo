
## Plan — v2026 Cybersecurity & Legal Hardening Pass

You want stronger protection across **policies, law, cybersecurity, link safety, and infra (API/Supabase/server)**.

### 1. Cybersecurity — App & Client
- Strict **Content-Security-Policy** (CSP) + Trusted Types to neutralize XSS
- **Subresource Integrity (SRI)** on third-party CDN scripts
- Clickjacking: `X-Frame-Options: DENY` + `frame-ancestors 'none'`
- **HSTS preload** headers

### 2. Link & URL Safety (anti-phishing / hacker-link defense)
- Upgrade `urlSafety.ts`: punycode/IDN homograph detection, expanded malicious-TLD blocklist
- All external links → `rel="noopener noreferrer nofollow"` + interstitial warning for unknown domains
- Block `javascript:`, `data:`, `vbscript:`, `file:` schemes platform-wide
- New `scan-url` edge function: Google Safe Browsing + internal blocklist check before message/post submission

### 3. API & Edge Function Hardening
- **Rate limiting** middleware on login, OTP, payment, admin endpoints (sliding window, Postgres-backed)
- **Zod input validation** on every edge function
- Tighten `_shared/cors.ts` — remove wildcard fallback for sensitive endpoints
- **Replay protection** (nonce + timestamp) on payment/payout calls
- Cloudflare Turnstile on signup, password reset, high-value forms

### 4. Supabase / Database Security
- Full RLS audit via linter + security scanner
- **MFA-required RLS policies** on admin tables (`auth.aal2`)
- New `auth_failed_attempts` table + trigger → auto-lock after 10 fails / 15min
- **Audit log triggers** on `profiles`, `wallet_transactions`, `admin_actions` (immutable, append-only)

### 5. Session & Device Hijack Defense ("hacker from power-windows")
- **Session fingerprinting** (UA + IP class + screen hash) — invalidate on mismatch
- Enforce `window.opener = null` on all `_blank` links platform-wide
- Cross-origin isolation: `COOP: same-origin`, `COEP: require-corp`
- Devtools-open warning during wallet / password-change flows

### 6. Legal / Policy Pages v2026
- Refresh **Terms, Privacy, Cookies, Acceptable Use, DMCA, Partner Disclosure** with 2026 GDPR/CCPA/CPRA + EU AI Act + KSA/UAE/Cambodia clauses
- New **Security Policy** page (`/legal/security`) + **Vulnerability Disclosure** (`/legal/vdp`)
- Add `security.txt` at root
- Cookie banner: granular consent (necessary / analytics / marketing) with audit trail

### 7. Verify
- Run `security--run_security_scan` + `supabase--linter` after migration
- Re-run `dependency_scan` — patch any high/critical CVEs

**Scope**: ~15 files, 1 DB migration, 2 new edge functions. Approve and I'll roll out all 7 in one pass.
