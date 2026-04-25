# Phase 1 Mega-Rollout: DB Indexes + API Hardening + Tests + Unified Dashboard Shell

Ship all four workstreams in one coordinated release, sequenced to minimize downtime and risk.

## Scope

1. **DB**: Add 279 FK indexes + ~20 composite hot-path indexes (CONCURRENTLY where possible).
2. **API**: Shared CORS/auth/Zod toolkit + harden top 30 edge functions.
3. **Tests**: Automated CORS/auth/Zod regression suite for edge functions.
4. **Dashboard**: Unified `<DashboardShell>` + migrate Restaurant dashboard.
5. **Rollout**: Phased checklist with rollback gates.

---

## 1. Database Indexes

**New migration**: `supabase/migrations/<ts>_phase1_indexes.sql`

- Generate `CREATE INDEX IF NOT EXISTS` for each of the 279 unindexed FKs from `db-audit.md`.
  - Naming: `idx_<table>_<column>` (suffix `_fk` if collision).
- Add ~20 composite indexes on hot tables flagged in audit (80–100% seq-scan rate):
  - `food_orders (store_id, status, created_at DESC)`
  - `food_orders (user_id, created_at DESC)`
  - `trips (driver_id, status, created_at DESC)`
  - `trips (rider_id, status, created_at DESC)`
  - `messages (chat_id, created_at DESC)`
  - `notifications (user_id, read_at NULLS FIRST, created_at DESC)`
  - `orders (store_id, status, created_at DESC)`
  - `pricing_config (region, vehicle_type)`
  - …plus ~12 more from audit
- BRIN indexes on append-only timestamps (`messages.created_at`, `notifications.created_at`, `audit_logs.created_at`).
- Migration tool runs in transactions; for very large tables we'll split into a follow-up migration using `CREATE INDEX CONCURRENTLY` (cannot run in tx) — flagged in checklist.
- Post-migration: `ANALYZE` hot tables.

## 2. Shared API Toolkit

**New files** under `supabase/functions/_shared/`:

- `cors.ts` — re-export `corsHeaders` from `@supabase/supabase-js/cors` + `handlePreflight(req)` helper.
- `auth.ts` — `requireUser(req)` → returns `{ userId, claims, supabase }` or throws `UnauthorizedError`.
- `validate.ts` — `parseBody(req, schema)` and `parseQuery(req, schema)` Zod helpers returning typed data or `400` with `flatten()` errors.
- `respond.ts` — `ok(data)`, `err(status, message)`, `zodErr(error)` — all auto-merge `corsHeaders`.
- `errors.ts` — `UnauthorizedError`, `ValidationError`, `withErrorHandling(handler)` wrapper.

**Harden top 30 edge functions** (highest-traffic from audit):
- Replace inline CORS with shared import.
- Wrap handler in `withErrorHandling`.
- Add `requireUser` for any non-webhook endpoint.
- Add Zod schema for body/query; reject on parse fail.
- Keep behavior identical otherwise (no breaking response shape changes in this batch).

Remaining ~130 functions: tracked for Phase 2b in checklist (not in this drop).

## 3. Automated Tests

**Per hardened function**: `supabase/functions/<name>/index.test.ts` covering:
- `OPTIONS` returns 204/200 with correct CORS headers.
- Missing/invalid JWT → 401.
- Invalid body (missing required field) → 400 with field errors.
- Valid request → 200 (mocked where external).

**Shared test helper**: `supabase/functions/_shared/test-utils.ts` — `dotenv/load`, `callFn(name, opts)`, `assertCors(res)`, `assertUnauthorized(res)`, `assertZodError(res, field)`.

Use `supabase--test_edge_functions` to run; add a CI-style "smoke" pattern that runs CORS+auth tests across all hardened functions.

## 4. Unified Dashboard Shell (Restaurant first)

**New components** under `src/components/dashboard/shell/`:
- `DashboardShell.tsx` — layout: sidebar + topbar + content area, responsive, safe-area aware.
- `DashboardSidebar.tsx` — collapsible nav, vertical-aware sections via `navConfig` prop.
- `DashboardTopbar.tsx` — store switcher, search/command palette trigger, notifications, profile.
- `StoreSwitcher.tsx` — multi-store dropdown, persists selection to localStorage + URL.
- `CommandPalette.tsx` — `cmdk`-based, registers actions per dashboard.
- `useDashboardContext.tsx` — current store, role, vertical, permissions.

**Migrate Restaurant dashboard**:
- Wrap `src/pages/business/restaurant/*` pages in `<DashboardShell vertical="restaurant" nav={restaurantNav}>`.
- Extract restaurant-specific nav config to `src/config/dashboards/restaurant.ts`.
- Preserve all existing routes & functionality.

Other verticals (Grocery, Retail, Cafe, Service, Mobility) stay on legacy layout this round; tracked in checklist.

## 5. Phased Rollout Checklist

Generated as `/mnt/documents/phase-1-rollout-checklist.md`:

```text
Stage A — DB indexes (low risk, no code dep)
  [ ] Apply migration on staging
  [ ] Verify pg_stat_user_indexes shows scans
  [ ] ANALYZE hot tables
  [ ] Apply on prod (off-peak window)
  [ ] Monitor seq_scan ratio for 24h

Stage B — Shared API toolkit (no behavior change)
  [ ] Deploy _shared/* (no callers yet)
  [ ] Run shared unit tests

Stage C — Hardened edge functions (rolling)
  [ ] Deploy 5 fns → smoke tests → 30min soak
  [ ] Repeat in batches of 5 until 30 done
  [ ] Rollback plan: redeploy previous version per fn

Stage D — Dashboard shell (Restaurant only)
  [ ] Feature flag `dashboard_shell_v2` on staging
  [ ] QA Restaurant flows end-to-end
  [ ] Enable for 10% → 50% → 100% of restaurant orgs

Stage E — Post-rollout
  [ ] Compare LCP/TTFB vs baseline
  [ ] File Phase 2 backlog (remaining 130 fns, other verticals)
```

---

## Technical Notes

- Migration uses `IF NOT EXISTS` everywhere — safe to re-run.
- Large-table indexes that can't fit in a transaction will be emitted as a separate non-transactional migration file the user must apply manually via SQL editor (linked at end).
- Zod is already a dep on the frontend; for edge functions we import via `npm:zod@^3`.
- No `verify_jwt` config changes — auth enforced in code per platform guidance.
- Restaurant dashboard migration is purely additive (wrap in shell); no route changes, fully reversible by removing the wrapper.
- All response shapes preserved on hardened functions; only error envelopes for 400/401 are standardized (`{ error: string | Record<string, string[]> }`).

## Deliverables

- 1–2 SQL migration files (indexes).
- `supabase/functions/_shared/*` (5 files).
- 30 hardened edge functions + 30 test files.
- `src/components/dashboard/shell/*` + Restaurant nav config + wrapped pages.
- `/mnt/documents/phase-1-rollout-checklist.md`.

## Out of Scope (next phases)

- Remaining ~130 edge functions.
- Grocery/Retail/Cafe/Service/Mobility dashboard migration.
- Table partitioning, materialized views, `<SmartImage>`, feature-flag service.
