## Goal

Sweep the whole stack — frontend deps, Vite/React, Supabase DB, edge functions, API performance — flag what's outdated, what's slow, and what's half-built. Then upgrade/fix in a controlled order.

## Current state (from inspection)

**Frontend deps** — already on bleeding edge: React 19.2, Vite 8, Tailwind 4, TS 6, Supabase JS 2.106, Capacitor 8, Stripe v9, Zod 4. Nothing major to bump.

**Backend** — Supabase Postgres 17.6, GoTrue 2.188, CLI 2.100, ~200+ migrations, ~150 edge functions.

**Known debt** (from `docs/supabase-performance-upgrade-report.md`, 2026-05-18):
- 97 `auth_rls_initplan` warnings (RLS calling `auth.uid()` per row instead of `(select auth.uid())`)
- 3,048 `multiple_permissive_policies` warnings (overlapping RLS policies on same table/role/action)
- 1 `security_definer_view` error on `public.bots_directory`
- Security-definer functions executable by anon/authenticated
- Functions with mutable `search_path`
- Public bucket listing warnings

**Known runtime issues** (from console logs):
- Edge function `duffel-destination-prices` failing (FunctionsFetchError → fallback)
- `check-zivo-plus` failing on load
- Profile fetch failing (`Load failed`)
- Module script import failing (likely stale chunk after deploy)

**Half-built / suspected gaps**:
- Hotel scraping pipeline (Booking.com importers) has lots of one-off JSON logs at repo root — needs cleanup/finalization
- Firecrawl connector not wired (you declined earlier) → Chaiya Palace seed still pending
- Many `probe-*.mjs` scripts at repo root suggest debugging leftovers

## Plan — phased, each phase shippable independently

### Phase 1 — DB speed cleanup (biggest win, lowest risk)

1. **Fix `auth_rls_initplan` (97 warnings)** — script-rewrite every policy that calls `auth.uid()`, `auth.jwt()`, `auth.role()` directly to wrap them in `(select …)`. This makes Postgres evaluate once per query instead of per row. Huge speedup on large tables (`posts`, `messages`, `notifications`, `activity_feed`).
2. **Consolidate `multiple_permissive_policies` (3,048 warnings)** — for each (table, role, action) with N permissive policies, merge into one `USING (cond1 OR cond2 OR …)`. Done table-by-table, starting with hottest tables (use `pg_stat_user_tables` to rank).
3. **Add missing indexes** — run `pg_stat_statements` snapshot and add covering indexes for top-20 slow queries (focus on feed ranking, chat unread, dispatch matching).
4. **Connection pooling** — verify Supavisor transaction-mode is used for edge functions and session-mode only where needed.

### Phase 2 — Security advisor fixes

5. Drop/recreate `public.bots_directory` without `SECURITY DEFINER`, or convert to a SECURITY INVOKER function.
6. `REVOKE EXECUTE … FROM anon, authenticated` on every security-definer function that doesn't need public access; keep only the ones explicitly callable via RPC.
7. Set `SET search_path = public, pg_temp` on every flagged function.
8. Lock down public storage buckets — disable bucket listing, keep object-level public reads where needed.

### Phase 3 — Edge functions reliability & speed

9. Audit the failing functions visible in console (`duffel-destination-prices`, `check-zivo-plus`) — likely cold-start timeouts or missing secrets. Add response caching (Edge cache headers + KV-style cache in `service_health_status`) and a circuit breaker so frontend stops retrying.
10. Standardize on `npm:` specifiers (drop esm.sh) for stable deploys — referenced in your own edge-function knowledge file.
11. Add `EdgeRuntime.waitUntil` for fire-and-forget logging so user-facing latency drops.
12. Pin Deno lockfile or remove `deno.lock` files from functions where deploys have been flaky.

### Phase 4 — Frontend perf

13. Bundle audit — verify the lucide-react no-barrel-import rule is enforced (already in memory). Add `vite-bundle-visualizer` run and trim anything >100KB that's not lazy-loaded.
14. Route-level code splitting audit — confirm `Lazy@unknown` in the stack trace isn't masking an oversized chunk.
15. Add `<link rel="preload">` for the LCP image on `/feed` and `/index`.
16. Image pipeline — already have `SmartImage`; extend it to use Supabase Storage `render/image` transformer everywhere (currently only avatars per memory).

### Phase 5 — Half-built features to finish or remove

17. **Hotel scraper pipeline** — decide: finish (Firecrawl connector + scheduled job) OR archive the 30+ `booking-*.json` files and `probe-*.mjs` files at repo root.
18. **Chaiya Palace seed** — connect Firecrawl OR build the manual admin upload form (your earlier choice is still open).
19. **Cleanup** — move debugging scripts (`check-*.ts`, `debug-*.ts`, `fix-*.ts`, `probe-*.mjs`, `update-gallery.ts`) into `scripts/` or delete.

## What I need from you before I start

Pick which phases to run, and in what order. My recommendation:

> **Run Phase 1 first** (DB speed) — single migration, measurable improvement, zero frontend risk. Then Phase 2 (security), then 3 (edge fn reliability). Phase 4 & 5 can wait.

Also tell me:
- **A.** Should I tackle all 4 phases now, or just Phase 1?
- **B.** For Phase 5 cleanup — archive the half-built hotel scraper pipeline, or finish it (Firecrawl)?
- **C.** Any tables I should leave alone in Phase 1 (e.g. tables your scheduled jobs hit constantly)?
