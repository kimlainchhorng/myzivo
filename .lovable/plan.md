# Phase 2 — Security Hardening & Missing Infrastructure Upgrades

Phase 1 shipped database indexes, the shared edge toolkit, auth hardening for 5 endpoints, edge tests, and the unified admin shell. Phase 2 closes the attacker surface across the full platform (163 edge functions, 100+ tables, 13 storage buckets) and adds the production-grade infrastructure ZIVO is currently missing.

---

## Part A — Anti-Attack Hardening (Defense-in-Depth)

### A1. Rate Limiting & Abuse Prevention (currently missing)

Build a **shared rate-limit module** (`supabase/functions/_shared/rate-limit.ts`) backed by a new `api_rate_limits` table:

- Sliding-window counter per (ip, user_id, route, action)
- Tiered limits: anonymous = 30 req/min, authenticated = 120 req/min, admin = 600 req/min
- Sensitive routes (login, signup, OTP, password-reset, payment) = 5 req/min per IP + 10/hour per identifier
- Returns standard `429 Too Many Requests` with `Retry-After` header
- Auto-bans IPs after 50 failures in 10 minutes (`api_ip_blocklist` table)

Apply to: all auth endpoints, OTP send/verify, password reset, public-signup, contact forms, payment endpoints.

### A2. Web Application Firewall Layer

New `_shared/waf.ts` runs on every request:

- **SQL injection patterns** — block `';--`, `UNION SELECT`, `xp_cmdshell`, `pg_sleep` in any string field
- **XSS patterns** — block `<script`, `javascript:`, `onerror=`, `onload=` in non-HTML inputs
- **Path traversal** — block `../`, `..\\`, encoded variants in any path parameter
- **Prototype pollution** — strip `__proto__`, `constructor`, `prototype` from JSON bodies
- **Oversized payloads** — reject bodies > 1 MB (configurable per endpoint)
- **Suspicious user agents** — block known scanners (sqlmap, nikto, nmap, masscan)

All blocks are logged to `security_events` table for monitoring.

### A3. Request Signing & Replay Protection

For high-value endpoints (payments, admin actions, refunds, payout):

- Require `X-Request-Signature` header (HMAC-SHA256 of body + timestamp using session-derived secret)
- Reject requests with timestamp drift > 60 seconds (replay protection)
- Nonce table (`api_request_nonces`) to reject duplicate requests within 5-minute window

### A4. Brute-Force & Credential Stuffing Defense

Extend existing `auth_precheck_login` with:

- **Device fingerprinting** — track (IP, user-agent, screen resolution, language) hashes
- **Impossible-travel detection** — flag logins from > 500 km away within 1 hour
- **Breached-password check** — call k-anonymity API (haveibeenpwned) on signup/password-change
- **Account lockout escalation** — 5 failures = 15 min lock, 10 = 1 hr, 20 = require admin unlock + email user
- **Captcha trigger** — after 3 failures, require Cloudflare Turnstile (already free, no SDK needed)

### A5. Storage Bucket Hardening

The linter flagged **13 public buckets allowing listing**. Fix:

- Replace `USING (bucket_id = 'X')` SELECT policies with `USING (bucket_id = 'X' AND (storage.foldername(name))[1] = auth.uid()::text)` for user-scoped buckets
- For genuinely public buckets (avatars, post media, stickers): keep public read but **disable LIST operation** by removing `objects` SELECT policy and forcing direct-URL access only
- Add `Content-Disposition: attachment` headers via storage transformations to prevent inline HTML/SVG XSS
- Reject uploads with executable MIME types (`application/x-*`, `text/html`, `image/svg+xml` unless sanitized)
- Enforce per-user upload quotas (`storage_quotas` table; default 5 GB)

### A6. Database Linter Cleanup (25 outstanding warnings)

| Issue | Count | Fix |
|---|---|---|
| `RLS Enabled No Policy` | 6 tables | Audit each, add explicit deny-all policy or owner-scoped policy |
| `Function Search Path Mutable` | 1 function | Add `SET search_path = public` |
| `Extension in Public` | 1 (likely `pg_trgm`/`unaccent`) | Move to `extensions` schema |
| `RLS Policy Always True` (UPDATE/DELETE/INSERT) | 4 policies | Replace with owner-scoped or service-role-only checks |
| `Public Bucket Allows Listing` | 13 buckets | Apply A5 fixes |

### A7. Content Security Policy + Frontend Hardening

Add to `index.html` and a Vite plugin generating per-route headers:

- **CSP**: `default-src 'self'; img-src 'self' data: https://*.supabase.co https://lh3.googleusercontent.com; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' wss://*.supabase.co https://*.supabase.co; frame-ancestors 'none'; form-action 'self'`
- **Subresource Integrity (SRI)** on any third-party scripts (Stripe, Google Maps, Twilio)
- **HSTS**: `max-age=31536000; includeSubDomains; preload`
- **X-Frame-Options: DENY**, **X-Content-Type-Options: nosniff**, **Referrer-Policy: strict-origin-when-cross-origin**, **Permissions-Policy** restricting camera/mic/geolocation to same-origin
- **Trusted Types** policy to block DOM XSS sinks (innerHTML, eval)

### A8. PII & Secret Leak Prevention

- Add `_shared/redact.ts` that auto-redacts emails, phone numbers, card numbers, JWTs, API keys from all log outputs
- Replace every `console.log(error)` in edge functions with `logger.error(redact(error))`
- Pre-commit hook (already supported by Lovable) scans for hardcoded `sk_`, `eyJ`, `AIza` patterns

---

## Part B — Missing Production Infrastructure

### B1. Centralized Audit Log (currently fragmented)

Single `audit_logs` table (already exists) but only 6 functions write to it. Refactor to:

- Wrap **all admin actions, payment ops, role changes, profile changes, content moderation** in `_shared/audit.ts` `recordAudit()` helper
- Capture: actor_id, target_id, action, resource_type, resource_id, old_values, new_values, ip, user_agent, request_id
- Immutable via trigger (`BEFORE UPDATE/DELETE` raise exception, except for `service_role`)
- Admin UI page `/admin/audit-log` with filters by actor, resource, time range

### B2. Observability Stack

- **Request correlation IDs**: Inject `X-Request-Id` (UUID) at edge entry, propagate through all DB calls and logs
- **Structured logging**: `_shared/logger.ts` outputs JSON `{ level, ts, request_id, user_id, route, msg, ctx }` consumed by Supabase analytics
- **Error budget tracking**: New `error_budget_daily` view aggregating 4xx/5xx by function for SLO dashboard
- **Performance traces**: Wrap slow operations (> 500 ms) in `withTrace()` that records to `performance_traces` table

### B3. Secret Rotation & Key Management

- Document all 40+ secrets in `mem://security/secrets-inventory` with owner, rotation schedule, last rotated
- Add quarterly rotation reminder script (`scripts/check-secret-age.ts`)
- Move sensitive secrets behind a secret-broker function instead of direct `Deno.env.get()` in business logic — reduces blast radius if a function is compromised
- Implement JWT signing key rotation playbook (Supabase signing-keys system)

### B4. Distributed Idempotency Keys

For payment, refund, payout, OTP-send operations:

- Require `Idempotency-Key` header (UUID v4)
- New `idempotency_records` table caches the response for 24 hours
- Replays return the cached response instead of executing again
- Prevents double-charges from network retries

### B5. Fraud-Detection Service Extension

Extend existing `assess-fraud` function with:

- Velocity rules (orders/hour, payments/hour per user, IP, device)
- New-account risk scoring (account age + verification level + first-purchase amount)
- Geo-mismatch detection (billing country ≠ IP country ≠ device locale)
- Outputs `fraud_signals` table; high-risk transactions require manual review

### B6. Backup, Recovery & Data Retention

- Automated daily DB snapshot verification job (Supabase already snapshots; we add a restore-test edge function `verify-backup-restore` running weekly)
- Storage bucket lifecycle: move objects > 90 days old to cold storage
- GDPR-compliant **data-export** function (`/account/export-data` returning ZIP of user's records)
- GDPR **right-to-erasure** function (`/account/delete-account` cascading deletes + audit trail)
- Configurable retention policies per table (chat messages: 2 years, audit logs: 7 years, telemetry: 90 days)

### B7. Admin Role Granularity

Currently roles are coarse. Add fine-grained permissions:

- `permissions` table: `(role, resource, action)` — e.g. `(support, food_orders, refund)`
- `has_permission(_user_id, _resource, _action)` security-definer function
- Replace blunt `isAdmin` checks in edge functions with `requirePermission(claims.sub, 'food_orders', 'refund')`
- Roles to add: `support`, `finance`, `moderator`, `dispatcher`, `merchant_manager` (each with curated permission sets)

### B8. Real-Time Anomaly Alerts

New `security-monitor` edge function (cron every 5 min) that:

- Detects spikes in 4xx/5xx, login failures, payment failures
- Detects new admin role grants (any user gaining `admin` triggers immediate alert)
- Detects mass-deletion patterns (> 100 row deletes by single user in 1 minute)
- Sends to a webhook configurable per environment (Slack/Discord/Email)

### B9. Continue Auth-Endpoint Hardening (Phase 1 batch 2)

Apply the shared toolkit to the **next 5 endpoints**:

- `auth-precheck-login` — already partially hardened, migrate to shared toolkit
- `auth-refresh-session` (if exists; otherwise create)
- `reset-password` / `request-password-reset`
- `change-email` / `confirm-email-change`
- `admin-create-user`, `admin-delete-user`, `admin-update-profile`

Each gets: shared CORS, `withErrorHandling`, Zod validation, rate-limit decorator, audit log entry, Deno test suite.

### B10. Edge-Function Test Coverage Expansion

Currently 5 functions have tests. Target: top 25 highest-traffic functions.

- Generate test scaffolds via a `scripts/scaffold-edge-tests.ts` helper
- Add CI job `bun run test:edge` that runs all `*.test.ts` files
- Add **mutation testing** for the shared toolkit (`_shared/`) to catch regressions
- Add **fuzz tests** on Zod schemas using `fast-check`-equivalent for Deno

---

## Part C — Net-New Features the Platform Lacks

### C1. Two-Factor Authentication (TOTP)

- New `user_mfa_factors` table (encrypted secret, recovery codes)
- `enroll-mfa`, `verify-mfa`, `disable-mfa` edge functions
- UI in `/account/security` with QR code (using `otpauth` lib client-side)
- Enforced for admin/finance roles; optional for users
- Backup codes (10 single-use codes per user)

### C2. Session Management UI

- `/account/security/sessions` page listing active sessions (device, IP, last seen, location)
- One-click "revoke session" and "revoke all other sessions"
- Email notification on every new device login

### C3. API Key System (for enterprise/business customers)

- `/business/api-keys` page to mint scoped API keys
- `api_keys` table with hashed key, scopes, rate limit override, expiration
- `_shared/api-key-auth.ts` accepts either JWT or `X-API-Key` header

### C4. Webhook Outbox Pattern

For external integrations (Stripe, Twilio, Duffel, partners):

- All outbound webhooks queued in `webhook_outbox` table
- Worker function processes with exponential backoff (max 5 retries over 24 hrs)
- Dead-letter queue for failed deliveries
- Replay UI for admins

### C5. Feature Flag System

- `feature_flags` table (name, rollout_percentage, allowlist_user_ids, enabled)
- React hook `useFeatureFlag(name)` + edge helper `isFeatureEnabled(name, userId)`
- Admin UI `/admin/feature-flags` for toggling
- Enables safe gradual rollout of dashboards, payment changes, AI features

### C6. Background Job Queue

Currently jobs run inline. Add:

- `jobs_queue` table (priority, payload, attempts, scheduled_for, status)
- `job-worker` cron edge function processing queue every 30 sec
- Standard job types: `send-email`, `process-payout`, `recompute-analytics`, `expire-otp`, `cleanup-storage`

---

## Technical Details

**New shared modules:**
```
supabase/functions/_shared/
  rate-limit.ts      # Sliding-window limiter
  waf.ts             # Pattern blocker
  audit.ts           # recordAudit() helper
  logger.ts          # Structured JSON logger
  redact.ts          # PII/secret redaction
  api-key-auth.ts    # Dual JWT/API-key auth
  idempotency.ts     # Idempotency-Key handler
  permissions.ts     # requirePermission()
  signing.ts         # HMAC request signing
```

**New tables (migration):**
```
api_rate_limits, api_ip_blocklist, security_events,
api_request_nonces, idempotency_records, fraud_signals,
permissions, user_mfa_factors, mfa_recovery_codes,
api_keys, webhook_outbox, feature_flags, jobs_queue,
storage_quotas, performance_traces, login_history
```

**Frontend additions:**
```
src/lib/security/
  csp.ts, sri.ts, trustedTypes.ts
src/pages/account/security/
  SessionsPage.tsx, MfaPage.tsx, ApiKeysPage.tsx
src/pages/admin/
  AuditLogPage.tsx, FeatureFlagsPage.tsx, SecurityEventsPage.tsx
```

**Migrations:** ~6 phased SQL migrations (one per concern group) so each can be reviewed and rolled back independently.

---

## Phased Rollout (recommended order)

| Phase | Scope | Risk | Est. duration |
|---|---|---|---|
| **2A** | A6 linter cleanup + A5 storage policies + B7 permissions | Low | 1 turn |
| **2B** | A1 rate-limit + A2 WAF + A3 signing + A4 brute-force | Medium | 2 turns |
| **2C** | B1 audit + B2 observability + B4 idempotency + B8 alerts | Medium | 2 turns |
| **2D** | B9 next-5 auth endpoints + B10 test expansion | Low | 1 turn |
| **2E** | A7 CSP/SRI/security headers + A8 PII redaction | Low | 1 turn |
| **2F** | B3 secret rotation + B5 fraud + B6 backup/GDPR | Medium | 1 turn |
| **2G** | C1 MFA + C2 sessions UI + C5 feature flags | Medium | 2 turns |
| **2H** | C3 API keys + C4 webhook outbox + C6 job queue | Medium | 2 turns |

Total: ~12 implementation turns, fully reversible per phase.

---

## What gets delivered with approval

On approval, I will execute **Phase 2A immediately** in a single turn:
- Resolve all 25 Supabase linter warnings (6 RLS gaps, 13 storage policies, 4 always-true policies, 1 search-path, 1 extension)
- Ship the `permissions` table + `has_permission()` function
- Generate `/mnt/documents/phase-2a-security-report.md`

Then prompt for which subsequent phase (2B → 2H) to ship next, or `"go all"` to execute the full roadmap sequentially.
