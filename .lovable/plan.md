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
