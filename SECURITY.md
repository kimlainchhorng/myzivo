# ZIVO Security Policy

## Dependency Management

- **Monthly review**: All npm and Deno dependencies are reviewed monthly for security patches.
- **Edge function pinning**: All edge functions import from `supabase/functions/_shared/deps.ts` with pinned versions.
- **Stripe API version**: Standardized to `2025-08-27.basil` across all functions.
- **Supabase JS version**: Pinned to `@2.57.2` for edge functions.

## Security Architecture

- **Authentication**: Supabase Auth with Google OAuth, email OTP, and session management.
- **Authorization**: Role-based access via `user_roles` table and `has_role()` RPC (never client-side checks).
- **CORS**: Sensitive endpoints (payments, payouts, backups) use origin whitelist via `_shared/cors.ts`.
- **Rate limiting**: Server-side via `rate-limiter` edge function + client-side fallback.
- **Fraud detection**: Multi-tier system with GPS spoofing detection, velocity checks, and delivery PIN.

## HTTP Security Headers (2026-04 hardening)

Configured in `public/_headers`. Applied to every response:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy-Report-Only` — strict allowlist for Supabase, Stripe, Google Maps, Duffel, Twilio, Meta Pixel, GA. Reports go to `/functions/v1/csp-report` (logged in `csp_violations`).
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — restricts camera/mic/geo/payment to `self`; blocks USB, Bluetooth, MIDI, Serial, FLoC.
- `Cross-Origin-Opener-Policy: same-origin-allow-popups` (Google OAuth)
- `Cross-Origin-Resource-Policy: same-site`
- `X-Robots-Tag: noindex` on `/admin/*`, `/account/*`, `/wallet/*`, `/chat/*`.

CSP is in **report-only** mode for one cycle so violations can be reviewed in `csp_violations` before enforcement.

## Data Protection (2026-04 hardening)

- **Profile PII**: `email`, `phone`, `phone_e164`, `date_of_birth`, `kyc_*`, `background_check_*`, `admin_role`, `payout_hold`, `phone_hash`, `share_code`, etc. are no longer SELECTable by `authenticated` or `anon` roles. Owners read their own profile via `public.get_my_profile()` (SECURITY DEFINER); admins via `public.admin_get_profile(uuid)`.
- **Shared CVs**: removed permissive RLS policy. CVs are now fetched only via `public.get_cv_by_share_code(text)` which requires the exact share code.
- **Audit log**: `public.security_audit_log` (admin-readable, service-role-writable) records logins, password changes, two-step toggles, payout changes, role changes, and account deletions.

## Known Open Risks (tracked)

- **Chat media buckets** (`chat_uploads`, `chat-media-files`) are still public. Direct URLs to chat photos/videos are accessible without auth. Migrating to private requires a coordinated change: switch all `getPublicUrl` call sites to `createSignedUrl`, store storage paths (not URLs) on `direct_messages`/`messages`, and backfill historical rows. Tracked for the next security cycle.
- **Realtime `messages` channels** allow broad subscription. RLS on the underlying table prevents row leakage but topic-name metadata is visible. Tracked.

## Incident Response

- **Contact**: security@hizivo.com
- **Response time**: Critical issues acknowledged within 4 hours.
- **Escalation**: Critical payment/fraud alerts auto-notify admins via `send-notification` edge function.

## Responsible Disclosure

If you discover a security vulnerability, please report it to **security@hizivo.com**. Do not create public issues. We will acknowledge receipt within 48 hours and provide a timeline for resolution.

## Backup & Recovery

- **RTO**: < 4 hours
- **RPO**: < 1 hour
- **Database backups**: Hourly incremental, daily full via `run-database-backup` edge function.
- **Storage backups**: Daily manifest via `run-storage-backup` edge function.
- **Retention**: Database 30 days, storage manifests 90 days.
