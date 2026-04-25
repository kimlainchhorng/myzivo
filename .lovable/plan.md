# Next Update — Phase 2B → 2H Rollout

Phase 2A is complete (0 linter warnings, granular permissions, storage buckets de-enumerated). This plan ships the remaining hardening + missing infrastructure across seven sub-phases. Each phase is independently shippable and verifiable.

---

## 2B — Anti-Attack Layer (rate limiting, WAF, brute force)

**Goal:** Block abusive traffic before it touches business logic.

- New table `api_rate_limits(bucket_key, window_start, count)` with sliding-window function `public.check_rate_limit(_key text, _limit int, _window_seconds int)`.
- New shared module `supabase/functions/_shared/rate-limit.ts` — keyed by `ip + user_id + route`, returns 429 with `Retry-After`.
- New shared module `_shared/waf.ts` — pattern blocklist for SQLi, XSS, path traversal, oversize payloads (>1MB default).
- New table `security_events(id, kind, ip, user_id, route, payload_hash, created_at)` for forensic trail.
- Brute-force defense extension to `auth_precheck_login`: progressive delay + device-fingerprint + impossible-travel detection (geo-distance / time).
- Wire `withRateLimit()` + `withWaf()` into the existing `_shared/respond.ts` middleware chain.
- Migrate the 5 hardened auth functions first, then top 10 highest-traffic endpoints (from `function_edge_logs`).

## 2C — Request Signing & Idempotency

- HMAC-SHA256 request signing for high-value routes (payments, admin mutations, webhooks). Shared `_shared/signing.ts` with `verifySignature()` + replay window (5 min) using `nonce_cache` table.
- New table `idempotency_records(key, route, response_hash, status_code, expires_at)` + `_shared/idempotency.ts` wrapper. Default TTL 24h.
- Apply to: `payments-*`, `food-orders-*`, `trips-*-create`, all admin write endpoints.

## 2D — Observability & Audit

- `_shared/logger.ts` — structured JSON logs with `correlation_id` (propagated via `x-request-id` header), latency, user_id, route, status.
- `_shared/audit.ts` — `recordAudit({actor, action, resource, before, after})` writes to existing `audit_logs` table; PII auto-redaction (email/phone/cards via regex).
- Real-time anomaly view `v_security_anomalies` (spike in 4xx/5xx, repeated 401/403, rate-limit hits) + a `security-alerts` edge function that posts to admin notifications.

## 2E — MFA & Session Management

- New tables: `user_mfa_factors(user_id, type, secret_encrypted, verified_at)`, `user_sessions(id, user_id, device, ip, ua, last_seen, revoked_at)`.
- TOTP enrollment + verification edge functions (`mfa-enroll`, `mfa-verify`, `mfa-disable`) with backup codes.
- Account → Security UI: list active sessions, revoke individually or globally, view login history (uses existing `login_audit`), enable/disable TOTP.
- Step-up auth for sensitive ops (wallet withdraw, password change, role grant).

## 2F — Frontend Security Headers & CSP

- Add CSP, HSTS, Referrer-Policy, Permissions-Policy, X-Frame-Options via `index.html` meta + Lovable hosting headers where supported.
- Subresource Integrity for any third-party scripts.
- Lock `iframe` embedding (frame-ancestors 'self' hizivo.com zivollc.com).

## 2G — Background Jobs & Feature Flags

- New table `jobs_queue(id, kind, payload, status, attempts, run_at, locked_by, locked_at)` + `process-jobs` edge function (cron every 1 min) with exponential backoff and dead-letter handling.
- Migrate fire-and-forget work currently inline in edge functions (email sends, push fan-out, analytics rollups) onto the queue.
- New table `feature_flags(key, enabled, rollout_pct, audience jsonb)` + `useFeatureFlag(key)` hook + `_shared/flags.ts` for edge-side checks.

## 2H — Data Governance (GDPR/CCPA)

- `account-export-data` edge function: zip of all user-owned rows + storage objects, delivered via signed URL.
- `account-erase` edge function: soft-delete + 30-day purge job (runs through 2G queue), with admin-side hold capability.
- Consent ledger table `user_consents(user_id, kind, granted_at, revoked_at, version)` + UI surface in Account → Privacy.

---

## Technical Details

**New shared modules** (all under `supabase/functions/_shared/`):
`rate-limit.ts`, `waf.ts`, `signing.ts`, `idempotency.ts`, `logger.ts`, `audit.ts`, `flags.ts`, `mfa.ts`.

**Middleware composition** (extends existing `respond.ts`):
```text
withCors → withWaf → withRateLimit → withSignature? → withJwt → withZod → withIdempotency? → handler → withAudit → withLogger
```

**New tables** (all RLS service_role-only except `feature_flags` which is public-read):
`api_rate_limits`, `security_events`, `nonce_cache`, `idempotency_records`, `user_mfa_factors`, `user_sessions`, `jobs_queue`, `feature_flags`, `user_consents`.

**Tests:** Each phase ships Deno tests for the shared module + integration tests against 2 representative endpoints. Vitest coverage for new UI (Security page, MFA enrollment, sessions list).

**Verification report:** After 2H, generate `/mnt/documents/phase-2bh-verification-report.md` with linter results, endpoint middleware coverage matrix, and security_events sample.

---

## Rollout Order & Effort

1. 2B Anti-attack — highest impact, ~1 session
2. 2D Observability — needed to measure 2B/2C — ~0.5 session
3. 2C Signing/Idempotency — ~1 session
4. 2E MFA + Sessions — ~1 session (UI heavy)
5. 2G Jobs + Flags — ~0.5 session
6. 2F Security headers — ~0.25 session
7. 2H GDPR tooling — ~0.5 session

Approve to start with **2B + 2D together** (they share the logger/event tables), then proceed sequentially.

---

## Progress — 2026-04-25 (Phase 2B/2C/2D/2G/2H foundation shipped)

**Database (migration applied):**
- `idempotency_records` (key+route PK, 24h TTL, BRIN expiry index, service_role only)
- `nonce_cache` (5-minute replay window, BRIN expiry, service_role only)
- `jobs_queue` (kind/payload/status/attempts/run_at/lock, partial index on pending, admin read)
- `user_consents` (GDPR consent ledger, user-owned RLS)
- `user_mfa_factors` (TOTP/backup/WebAuthn, user own select+delete, secrets via service role only)
- `cleanup_expired_security_records()` housekeeping function
- Reused existing `security_events`, `feature_flags`, `user_sessions` tables (no schema collision)

**Shared edge modules (`supabase/functions/_shared/`):**
- `waf.ts` — SQLi/XSS/path-traversal/oversize blocklist with URL decode + body sniff (5 tests)
- `logger.ts` — structured JSON logger with x-request-id correlation propagation
- `audit.ts` — `recordSecurityEvent` + `recordAudit` + `redactPii` (2 tests)
- `signing.ts` — HMAC-SHA256 request signing + replay protection
- `idempotency.ts` — `withIdempotency` wrapper for duplicate-safe mutations
- `flags.ts` — edge-side feature-flag evaluator with deterministic bucketing + 30s cache
- `withSecurity.ts` — composer that wires WAF + correlation ID + structured logging into any handler

**Frontend:**
- `src/hooks/useFeatureFlag.ts` — reactive flag check with 30s cache + bucketed rollout
- `index.html` — added `X-Frame-Options: SAMEORIGIN`, CSP `frame-ancestors`/`base-uri`/`form-action`/`object-src 'none'`

**Verification:** Deno test suite — **43 passed / 0 failed** across `_shared/` and the 5 hardened auth functions. Build cache clean.

**Skipped per project directive:** backend rate limiting (no infra primitives yet — see `<no-backend-rate-limiting>` rule).

**Next sub-phases ready to ship:**
- 2B-extra: brute-force enrichment (impossible-travel + device fingerprint) on `auth_precheck_login`
- 2C-apply: wire `withIdempotency` into `food-orders-create`, `payments-*`, `trips-*-create`
- 2D-apply: wire `withSecurity` into top-10 traffic edge functions; add `v_security_anomalies` view
- 2E: `mfa-enroll` / `mfa-verify` / `mfa-disable` edge functions + Account Security UI
- 2G: `process-jobs` cron edge function + migrate inline fan-outs onto queue
- 2H: `account-export-data` + `account-erase` edge functions
