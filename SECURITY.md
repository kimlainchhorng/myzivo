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
