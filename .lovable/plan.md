# ZIVO Cybersecurity Upgrade Plan

Goal: raise the platform's baseline security to 2026 production standards across web, mobile (Capacitor), and edge functions — without breaking existing flows.

Below is what we already have, what's missing, and what I'll add.

---

## 1. HTTP Security Headers (NEW — biggest gap)

`public/_headers` currently only sets caching. I'll add:

- **Strict-Transport-Security**: `max-age=63072000; includeSubDomains; preload` — force HTTPS for 2 years across hizivo.com, zivollc.com, zivodriver.com.
- **Content-Security-Policy** (report-only first, then enforce): allowlist Supabase, Stripe, Google Maps, Duffel, Travelpayouts, Twilio, LiveKit, Meta Pixel, GA. Block inline scripts where possible (nonce-based) and disallow `object-src`, restrict `frame-ancestors 'self'`.
- **X-Frame-Options**: `SAMEORIGIN` (clickjacking protection).
- **X-Content-Type-Options**: `nosniff`.
- **Referrer-Policy**: `strict-origin-when-cross-origin`.
- **Permissions-Policy**: lock down `camera`, `microphone`, `geolocation`, `payment` to self only (needed for video calls / ride GPS / Stripe).
- **Cross-Origin-Opener-Policy**: `same-origin-allow-popups` (needed for Google OAuth popup).
- **Cross-Origin-Resource-Policy**: `same-site`.

## 2. Authentication & Session Hardening

- **Session rotation on sensitive actions**: force `supabase.auth.refreshSession()` after password change, two-step toggle, payout add, email change.
- **Re-authentication gate**: require fresh login (<5 min) for: deleting account, changing payout method, disabling two-step, viewing wallet cash-out details. Add `useFreshAuth(maxAgeSec)` hook.
- **Upgrade `passwordHash.ts`**: bump PBKDF2 iterations 200k → 600k (current OWASP 2026 guidance) with versioned hash format so existing hashes still verify.
- **Login-alert emails**: extend existing `login_alerts` table — send email on new device/IP via existing `send-otp-email` template variant.
- **Device binding for high-trust actions**: tie payout/withdrawal to a previously-seen `device_tokens` entry; new device = require email OTP.

## 3. Edge Function Hardening

- **Standardize JWT validation**: audit all `supabase/functions/*` and ensure each one calls `getClaims(token)` (some legacy ones still trust the header). I'll add a shared `requireUser()` helper in `_shared/auth.ts`.
- **Tighten CORS allowlist**: replace `*` with explicit origins (hizivo.com, zivollc.com, zivodriver.com, lovable.app preview) on payment/payout/admin/backup functions. Already partially done — finish remaining ~20 functions.
- **Server-side rate limiting**: extend the existing `rate-limiter` function with sliding-window limits for: login (5/min/IP), OTP send (3/15min/phone), payment intents (10/hr/user), profile edits (30/hr/user). Persist in `rate_limit_buckets` table.
- **Webhook signature verification**: confirm Stripe, Twilio, Duffel webhooks all verify signatures and reject replays (timestamp ±5 min).
- **Input validation**: add Zod schemas to the top 15 most-called functions (payments, profile, posting, chat send, ride request).

## 4. Database / RLS Audit

- Run `supabase--linter` and `security--run_security_scan` and fix every `error` / `warn`.
- Re-verify `profiles` table policy (it's intentionally public-readable) — confirm sensitive columns (`phone`, `email`, `birthdate`, `payout_method`) are NOT in the public selection.
- Add a **column-level grant** revocation script for `payout_method`, `stripe_customer_id`, `aba_account_number` — only `service_role` can read.
- Add a missing `DELETE` policy review for: `messages`, `posts`, `stories`, `device_tokens`.
- Confirm `user_roles` table has the `has_role()` SECURITY DEFINER pattern (already in memory, just verify).

## 5. Client-Side Protections (upgrades to existing)

- **`RuntimeSecurityGuard`**: extend to also detect and block prototype-pollution attempts and freeze critical globals (`Object.prototype`, `Array.prototype`).
- **`urlSafety.ts`**: refresh allowlist; add SSRF-style protections for any user-pasted URLs that get fetched server-side (block `localhost`, `169.254.*`, `10.*`, `192.168.*`, `127.*`).
- **DOMPurify** wrapper: introduce `src/lib/security/sanitizeHtml.ts` and replace any remaining `dangerouslySetInnerHTML` (audit will list them).
- **Clipboard hygiene**: clear copied wallet addresses / OTPs from clipboard after 30s on mobile (Capacitor Clipboard plugin).
- **Screen-capture blocker**: enable Android `FLAG_SECURE` on wallet, two-step setup, and locked-media unlock screens.

## 6. Abuse & Fraud Prevention

- Strengthen existing `assess-fraud` 10-signal scorer: add **velocity check** (>3 ride requests in 60s = block), **impossible-travel** (GPS jump >900km/h), **payment-method recycling** (same card across >5 accounts).
- **Account-takeover protection**: lock account after 10 failed logins from new IPs in 1h, require email verification to unlock (extends current progressive lockout).
- **Comment/post spam filter**: integrate the existing `chatContentSafety.ts` logic into post creation flow (already in chat, missing on posts).

## 7. Privacy & Compliance Touch-ups

- Add **CSP report endpoint** edge function (`csp-report`) that logs violations to a new `csp_violations` table — helps tune the policy.
- Add **`X-Robots-Tag: noindex`** on `/admin/*`, `/account/*`, `/wallet`, `/chat/*` server responses (via `_headers` path rules).
- Document the new posture in `SECURITY.md` and bump `security.txt` Expires date.

## 8. Audit Logging

- New `security_audit_log` table (append-only, RLS: only admins can read, only service_role can write) capturing: login, password change, two-step toggle, payout change, role change, admin actions, account deletion. Add a small `logSecurityEvent()` helper used across edge functions.

---

## Rollout order (so nothing breaks)

1. **Day 1 — Headers & RLS:** add HTTP security headers (CSP in *report-only* mode), run linter + scan, fix findings, add `security_audit_log` table.
2. **Day 2 — Auth upgrades:** PBKDF2 600k with versioned hashes, fresh-auth gate, login-alert emails, device binding for payouts.
3. **Day 3 — Edge function sweep:** shared `requireUser()` + Zod validation + tightened CORS + signature replay checks on the top ~20 functions.
4. **Day 4 — Client & abuse:** RuntimeSecurityGuard upgrade, DOMPurify wrapper, clipboard hygiene, FLAG_SECURE, fraud-scorer additions, post-spam filter.
5. **Day 5 — CSP enforce:** review report-only violations, switch CSP to enforce mode, update `SECURITY.md` + `security.txt`.

---

## Files that will change (high-level)

- `public/_headers` — security headers + CSP
- `src/lib/auth/passwordHash.ts` — versioned PBKDF2
- `src/lib/security/*` — new `sanitizeHtml.ts`, upgraded `urlSafety.ts`, new `freshAuth.ts`
- `src/components/security/RuntimeSecurityGuard.tsx` — prototype freeze
- `supabase/functions/_shared/auth.ts` — new `requireUser()`
- `supabase/functions/_shared/cors.ts` — finalized allowlist
- `supabase/functions/rate-limiter/index.ts` — sliding window
- `supabase/functions/csp-report/index.ts` — NEW
- New table migrations: `security_audit_log`, `csp_violations`, `rate_limit_buckets` (if missing)
- `SECURITY.md`, `public/security.txt`, `public/.well-known/security.txt`

No breaking UX changes for end users — only added prompts on truly sensitive actions (payouts / account deletion).

**Approve and I'll execute in the order above, starting with headers + RLS scan.**
