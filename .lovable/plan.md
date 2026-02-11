

## Phase 7: Security Hardening -- 10 Critical Updates

Comprehensive security sweep covering all 10 areas: authentication, authorization, secrets, headers, logging, file uploads, payments, fraud, backups, and dependency management.

---

### Update 1: Session Security Hardening (Authentication)

**Problem:** Session tokens persist indefinitely in `localStorage`, no idle timeout, no session invalidation on password change.

**Changes:**
- **`src/contexts/AuthContext.tsx`**: Add idle timeout (30 min inactivity auto-logout). Track last activity via `mousemove`/`keydown` events. Add `SESSION_MAX_AGE` constant (24 hours) that forces re-auth. Clear `sessionStorage` and `localStorage` auth artifacts on sign-out.
- **`src/lib/security/sessionSecurity.ts`** (new): Create session security utilities -- idle timer, session age checker, and a `useSessionGuard` hook that wraps the auth context.

---

### Update 2: Authorization Lockdown (Edge Functions)

**Problem:** 90+ edge functions use `Access-Control-Allow-Origin: "*"` (wildcard CORS). Sensitive functions like `create-ride-payment-intent`, `create-flight-checkout`, `process-refund`, and `execute-p2p-payout` accept requests from any origin.

**Changes:**
- **`supabase/functions/_shared/cors.ts`** (new): Create a shared CORS module with origin whitelist (`myzivo.lovable.app`, `hizovo.com`, `www.hizovo.com`, preview URLs, `localhost:*` for dev). Export `getCorsHeaders(req)` and `isAllowedOrigin(origin)`.
- **Update 15 sensitive edge functions** to import and use the shared CORS module instead of wildcard:
  - `create-ride-payment-intent`, `create-eats-payment-intent`, `create-flight-checkout`, `create-travel-checkout`, `create-p2p-checkout`
  - `process-refund`, `process-p2p-refund`, `process-p2p-payout`, `execute-p2p-payout`
  - `process-travel-cancellation`, `process-flight-refund`
  - `stripe-webhook` (keep signature verification, restrict origin)
  - `run-database-backup`, `run-storage-backup`, `assess-fraud`

Non-sensitive public functions (search, exchange-rates, maps) can remain with wildcard CORS.

---

### Update 3: Secrets Management Audit

**Problem:** The hCaptcha module (`captcha.ts`) has a hardcoded placeholder site key `'your-hcaptcha-site-key'`. The `isCaptchaRequired()` function reads from `localStorage` which is user-manipulable.

**Changes:**
- **`src/lib/security/captcha.ts`**: Remove `localStorage`-based `isCaptchaRequired()`. Replace with a server-driven approach -- captcha requirement should come from edge function responses (e.g., when rate limiter returns `requiresCaptcha: true`). Remove the hardcoded placeholder key constant.
- **`src/config/adminConfig.ts`**: Add a comment noting the `ADMIN_EMAILS` allowlist is a defense-in-depth layer only; the `user_roles` table via `check_user_role` RPC is the authoritative source. (No functional change, this is already correct.)

---

### Update 4: Security Headers (Browser Protections)

**Problem:** No Content Security Policy, no X-Frame-Options, no X-Content-Type-Options, no Referrer-Policy. The `index.html` loads an external script from `emrld.ltd` with no integrity check.

**Changes:**
- **`index.html`**: Add security meta tags:
  - `<meta http-equiv="X-Content-Type-Options" content="nosniff">`
  - `<meta http-equiv="X-Frame-Options" content="DENY">`
  - `<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">`
  - `<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(self)">`
  - Content-Security-Policy meta tag with `default-src 'self'`, whitelisted domains for Supabase, Stripe, Google Maps, Unsplash, fonts, and the emrld.ltd script.
- **`index.html`**: Add `integrity` and `crossorigin` attributes to the emrld.ltd script, or add it to the CSP script-src whitelist.

---

### Update 5: Logging, Monitoring, and Alerting Enhancements

**Problem:** Audit logs exist but lack structured severity levels and no client-side error boundary reporting. No centralized alert escalation for critical events.

**Changes:**
- **`src/lib/security/auditLog.ts`**: Add severity levels (`critical`, `high`, `medium`, `low`) to audit events. Add `logCriticalEvent()` helper that both logs to the audit_logs table and triggers the `send-notification` edge function for immediate admin alerts.
- **`src/lib/security/errorReporting.ts`** (new): Create a global error boundary reporter that catches unhandled errors and `unhandledrejection` events. Log to console and optionally to a `client_error_logs` table (if exists) or just console in production. Track error frequency to detect attack patterns (e.g., rapid auth failures).
- **`src/main.tsx`**: Wire up the global error handler on app initialization.

---

### Update 6: File Upload Protections

**Problem:** No client-side file validation for uploads (driver docs, KYC, menu photos). No file type or size restrictions enforced before Supabase storage upload.

**Changes:**
- **`src/lib/security/fileUploadValidation.ts`** (new): Create upload validation utilities:
  - `validateFileType(file, allowedTypes)` -- check MIME type and extension against whitelist
  - `validateFileSize(file, maxSizeMB)` -- enforce max file size (e.g., 10MB for images, 25MB for PDFs)
  - `sanitizeFileName(name)` -- strip path traversal characters, special chars, limit length
  - `ALLOWED_IMAGE_TYPES`, `ALLOWED_DOCUMENT_TYPES` constants
  - `validateUpload(file, options)` -- combined validator returning `{ valid, errors[] }`
- **`src/lib/security/index.ts`**: Export the new file upload module.

---

### Update 7: Payment and Payout Protection (Stripe)

**Problem:** The Stripe webhook handler falls back to `JSON.parse(body)` without signature verification when `STRIPE_WEBHOOK_SECRET` is missing (line 83-85 of `stripe-webhook/index.ts`). This allows anyone to send fake webhook events.

**Changes:**
- **`supabase/functions/stripe-webhook/index.ts`**: Remove the development fallback. If `webhookSecret` or `signature` is missing, return 400 immediately. All webhook events MUST be signature-verified in production.
- **`supabase/functions/create-ride-payment-intent/index.ts`**: Add idempotency key validation -- check if a payment intent already exists for this ride before creating a duplicate.
- **`supabase/functions/create-flight-checkout/index.ts`**: Add amount verification -- re-fetch the offer price from the database before creating checkout to prevent price tampering.

---

### Update 8: Abuse and Fraud Protections

**Problem:** The `assess-fraud` function is comprehensive but the client-side `searchProtection.ts` uses in-memory Maps that reset on page refresh. No persistent abuse tracking for unauthenticated users.

**Changes:**
- **`src/lib/security/searchProtection.ts`**: Persist abuse counters in `sessionStorage` (survives navigation, cleared on tab close). Add exponential backoff for repeat offenders (1st block = 10s, 2nd = 30s, 3rd = 60s).
- **`src/lib/security/rateLimiter.ts`**: Add `flight_booking` rate limit action (5 bookings per hour per user). Add pre-flight check that calls rate limiter before initiating checkout flows.
- **`supabase/functions/rate-limiter/index.ts`**: Add IP-based rate limiting for flight searches (`flights_search_ip` already defined but not enforced). When bot score > 70, auto-block for 5 minutes.

---

### Update 9: Backups and Disaster Recovery

**Problem:** Database backup (`run-database-backup`) has a `BATCH_SIZE` of 10,000 but Supabase query limit is 1,000. Tables with >1,000 rows get silently truncated. No backup verification/integrity check.

**Changes:**
- **`supabase/functions/run-database-backup/index.ts`**: Implement pagination -- loop with `.range()` to fetch all rows in 1,000-row pages. Add SHA-256 hash of backup JSON for integrity verification. Store hash in `backup_logs.metadata`.
- **`supabase/functions/run-storage-backup/index.ts`**: Add recursive folder traversal (currently only goes 1 level deep). Add file count verification after manifest upload.
- Both functions: Add `flight_bookings` and `food_orders` to backup table list if not already present.

---

### Update 10: Dependency and Patch Management

**Problem:** No automated dependency auditing. The project uses many packages without version pinning strategy documentation. Some edge functions import from `esm.sh` with varying Supabase client versions (`@2`, `@2.49.1`, `@2.57.2`).

**Changes:**
- **`supabase/functions/_shared/deps.ts`** (new): Create a centralized dependency file for edge functions that re-exports all shared imports with pinned versions:
  - `supabase-js@2.57.2`
  - `stripe@18.5.0`
  - `std@0.190.0` (Deno standard library)
  This ensures all edge functions use the same versions.
- **`SECURITY.md`** (new): Create a security policy document covering:
  - Dependency update schedule (monthly review)
  - Edge function version pinning policy
  - Incident response contact
  - Responsible disclosure instructions
- Update 5-10 edge functions with the most critical version mismatches to import from `_shared/deps.ts`.

---

### Summary

| # | Area | Files | Type |
|---|------|-------|------|
| 1 | Session security | `AuthContext.tsx`, new `sessionSecurity.ts` | Enhancement |
| 2 | CORS lockdown | New `_shared/cors.ts`, 15 edge functions | Hardening |
| 3 | Secrets audit | `captcha.ts` | Fix |
| 4 | Security headers | `index.html` | Hardening |
| 5 | Logging/alerting | `auditLog.ts`, new `errorReporting.ts`, `main.tsx` | Enhancement |
| 6 | File uploads | New `fileUploadValidation.ts`, `index.ts` | New |
| 7 | Payment protection | `stripe-webhook`, `create-ride-payment-intent`, `create-flight-checkout` | Critical fix |
| 8 | Fraud/abuse | `searchProtection.ts`, `rateLimiter.ts`, rate-limiter edge fn | Enhancement |
| 9 | Backups | `run-database-backup`, `run-storage-backup` | Critical fix |
| 10 | Dependencies | New `_shared/deps.ts`, new `SECURITY.md` | Governance |

**Total: ~25 files modified/created. No database migrations required.**

