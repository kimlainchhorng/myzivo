## Goal

A multi-phase platform upgrade across **all** ZIVO shop dashboards (Restaurant, Grocery/Store, Cafe, Retail, Service, Truck/Mobility, Generic Business) plus the underlying database, edge-function API, and end-to-end performance — both web and app. Each phase ships independently. Breaking schema/API changes are allowed, with migration scripts and a versioned API surface.

> Scope is large (~161 edge functions, ~40+ dashboards). This plan is the **roadmap**. After approval, each phase becomes its own implementation request so we can review and ship in safe slices.

---

## Phase 0 — Audit & guardrails (1 short request)

Before touching anything:

1. **DB inventory** — run a script that dumps, per public table: row count, table+index size, sequential-scan ratio (`pg_stat_user_tables`), missing indexes (foreign keys without index, columns frequently in `WHERE`), tables without RLS, RLS policies referencing the same table (recursion risk).
2. **Edge function inventory** — categorize all 161 functions by: caller (client / cron / webhook), auth strategy (JWT-verified vs service-role), CORS hygiene, input validation present (Zod or none), shared module usage. Output a CSV at `/mnt/documents/edge-fn-audit.csv`.
3. **Dashboard inventory** — list every dashboard page, its data sources, and current queries. Output `/mnt/documents/dashboard-inventory.md`.
4. **Performance baseline** — Lighthouse + bundle analyzer numbers for: marketing pages, app shell, each dashboard. Saved as a baseline to compare after each phase.

Deliverable: 3 audit files in `/mnt/documents/`. No code changes.

---

## Phase 1 — Database restructure (foundation)

### 1a. Schema cleanup migration
- Consolidate overlapping tables (e.g. `store_profiles` + `restaurants` overlap revealed by the wizard work — unify under `store_profiles` with `category`-driven extensions in a `restaurant_settings` child table).
- Move all role checks to the `user_roles` + `has_role()` pattern (audit any role columns still on `profiles`).
- Drop unused/empty tables flagged in the audit (with a one-week soft-deprecation window: rename to `_deprecated_` first, drop in Phase 1c).
- Standardize timestamp columns (`created_at`, `updated_at` with trigger-driven `updated_at`).

### 1b. Indexes & partitioning
- Add covering indexes on all FK columns missing them.
- Composite indexes for the top 20 hot queries (orders by store + status + date, messages by chat + created_at, etc.).
- Partition large append-only tables by month: `orders`, `messages`, `notifications`, `analytics_events`, `audit_logs`.
- Add `BRIN` indexes on partitioned timestamp columns.

### 1c. RLS hardening
- Replace any inline `SELECT … FROM same_table` policies with `SECURITY DEFINER` helper functions (recursion risk).
- For every table with RLS enabled, ensure all four operations (SELECT/INSERT/UPDATE/DELETE) have an explicit policy or an explicit "deny all" comment.
- Add a tested `is_store_owner(_store_id)` and `is_store_staff(_store_id, _role)` helper to centralize dashboard authorization.

### 1d. Data archival
- Move rows older than 18 months from hot tables (`messages`, `notifications`, `analytics_events`) into `_archive` schema tables. Read paths fall back to UNION when needed.

Deliverables: SQL migrations + updated `types.ts` (auto-regenerated) + RLS policy doc.

---

## Phase 2 — API / Edge Function modernization

### 2a. Shared toolkit (`supabase/functions/_shared/`)
- `cors.ts` — single source of CORS headers.
- `validate.ts` — Zod helpers + standard 400 envelope `{ error: { code, message, fields } }`.
- `auth.ts` — `requireUser(req)`, `requireStoreOwner(req, storeId)`, `requireRole(req, role)`.
- `rateLimit.ts` — Redis-backed (Upstash) limiter with in-memory fallback.
- `gateway.ts` — typed wrapper for connector-gateway calls (`LOVABLE_API_KEY` + connection key headers).
- `logger.ts` — structured JSON logging with request_id propagation.

### 2b. Versioning
- Group functions by domain (`v2-orders-*`, `v2-shop-*`, `v2-payments-*`).
- Old `v1` endpoints stay alive but log a deprecation warning header `X-Deprecated: true` and an EOL date.

### 2c. Refactor critical functions
Top-10 traffic functions (from edge logs) get rewritten on the new toolkit first:
- order placement, payment capture, dispatch matching, push send, search, chat send, notification fanout, analytics ingest, cron summarizers, OTP send.
Each gains: Zod validation, rate limit, structured logs, JWT verification, unit tests with `Deno.test`.

### 2d. Webhooks reliability
- All inbound webhooks (Stripe, Twilio, Duffel) get an `inbound_webhook_events` table with idempotency-key dedup + replay endpoint for support.

Deliverables: new `_shared/` modules, ~10 refactored functions per sub-phase, deprecation log in `mem://`.

---

## Phase 3 — Speed / Performance

### 3a. Frontend bundle
- Convert remaining eager imports to `lazy()` route splits — target every page > 30KB gzipped.
- Add `vite-plugin-compression` (brotli) and ensure published host serves `br`.
- Replace heavy deps where possible (audit `moment`, full-icon imports, etc.).
- Image pipeline: switch all `<img>` to a `<SmartImage>` component that emits `srcSet` from Supabase Storage transform URLs (`?width=…&quality=…&format=webp`).

### 3b. Data fetching
- Standardize on TanStack Query with shared `staleTime` defaults (lists: 30s, details: 5m, configs: 1h).
- Add `prefetchQuery` on hover for primary nav links.
- Realtime subscriptions: dedupe via a single `useRealtimeChannel(channel)` hook to stop the N-tab fanout.

### 3c. Backend hot paths
- Materialized view `mv_store_dashboard_stats` (orders today / 7d / 30d, revenue, top items, avg prep time) refreshed every 60s by a cron edge function. Dashboard SELECTs hit the MV instead of recomputing.
- Add `EXPLAIN ANALYZE`-based fixes for the slowest 20 queries surfaced by `pg_stat_statements`.

### 3d. CDN & caching
- Cache `GET` responses for public read endpoints with `Cache-Control: s-maxage=…` headers + ETag support.

Targets: **LCP < 2.5s on 4G** (public/marketing) and **dashboard tab switches < 800ms p95**.

---

## Phase 4 — Unified Shop Dashboard shell + per-vertical workflows

### 4a. Shared `<DashboardShell>`
- Single layout: collapsible sidebar (desktop) / bottom tab bar (mobile), command palette (`Cmd+K`), global notification tray, store switcher (for owners with multiple stores), real-time presence dot.
- Per-vertical config object drives nav items, actions, and KPI cards — so all six dashboards reuse the same shell.

### 4b. Per-vertical screens (each ships as its own request)
1. **Restaurant** (`EatsRestaurantDashboard`): live order rail (KDS-style), menu manager with bulk price edit, prep-time tracker, table/QR ordering, daily close summary.
2. **Grocery / Store** (`StoreDashboard`): inventory with low-stock alerts + CSV import, picker assignments, shelf labels print, real-time order picking screen.
3. **Cafe**: simplified Restaurant variant — quick-tap menu, loyalty stamp manager.
4. **Retail**: catalog manager, variant matrix, barcode scanner (web BarcodeDetector + native plugin), POS-lite session.
5. **Service** (bookings): calendar week view, staff/resource scheduler, service-add-on builder, deposit collection.
6. **Truck / Mobility**: live driver map, dispatch board, surge controls, payout summary.
7. **Generic Business**: lightweight CRM + simple "products / services / hours / messages" tabs (fallback dashboard).

Each vertical shares: orders table, customer drawer, messaging panel, analytics card, settings modal.

### 4c. Cross-cutting workflow upgrades
- **Bulk actions** everywhere lists exist (accept/reject N orders, bulk price edit, bulk message customers).
- **Saved views** per dashboard (filters + columns persist to `user_dashboard_views` table).
- **Inline editing** in tables (no modal round-trip for trivial edits).
- **Export to CSV/PDF** on every list.
- **Activity log drawer** per entity (who changed what, when).
- **Empty/loading/error states** standardized via `<DataState>` component.

---

## Phase 5 — Software / Tooling

- **Testing**: extend Vitest suites to every refactored page; add Playwright smoke tests for the critical flow per vertical.
- **CI**: lint + typecheck + test on every push (already partially in place — verify and harden).
- **Feature flags**: lightweight `feature_flags` table + `useFlag('flag_name')` hook so each Phase-4 dashboard can roll out behind a switch.
- **Error monitoring**: Sentry-style capture in `_shared/logger.ts` + a frontend `ErrorBoundary` per route group.
- **Docs**: living `/docs` route inside the admin area auto-generated from edge-function Zod schemas.

---

## Suggested order & estimated requests

| Phase | What ships | Approx. requests |
|---|---|---|
| 0 | Audit files in `/mnt/documents/` | 1 |
| 1a–d | DB restructure + RLS + archival | 3–4 |
| 2a–d | API toolkit + 10-fn refactor + webhook log | 3 |
| 3a–d | Bundle + data fetching + MV + CDN | 2–3 |
| 4a | Shared DashboardShell | 1 |
| 4b | One vertical per request | 7 |
| 4c | Cross-cutting workflow upgrades | 2 |
| 5 | Tests + flags + monitoring + docs | 2 |

Total: ~22–24 focused requests. Each is independently shippable and reversible.

---

## What I need from you to start Phase 0

Just say "go" and I'll run the audit (read-only DB queries + filesystem scan) and produce the three audit files. From there, you pick which phase to attack next based on what the audit surfaces.
