# Phase 1B–E Mega-Drop: Verification Report ✅ + Shared Toolkit + Auth Hardening + Tests + Dashboard Shell

**Already done (no approval needed — used DB + artifact tools):**
- ✅ Phase 1A DB indexes verified: **0 unindexed FKs**, all 16 composite/BRIN indexes present.
- ✅ Verification report saved to `/mnt/documents/phase-1a-verification-report.md`.

**This plan ships everything else in one coordinated release:**

---

## 1. Shared edge-function API toolkit (`supabase/functions/_shared/`)

Existing `cors.ts` + `deps.ts` are kept untouched. Adds:

- `auth.ts` — `requireUser(req)` returns `{ userId, claims, supabase, token }`. Uses `supabase.auth.getClaims(token)` (fast, no DB roundtrip), falls back to `getUser(token)`. Throws `UnauthorizedError` on missing/invalid bearer. Plus `getServiceRoleClient()` for post-auth privileged ops.
- `errors.ts` — `UnauthorizedError`, `ValidationError`, `HttpError`, and `withErrorHandling(handler, fnName)` wrapper that translates them to 401/400/4xx JSON responses with CORS headers attached.
- `validate.ts` — Zod-compatible `parseBody(req, schema)` / `parseQuery(req, schema)`. Plus a **tiny built-in `v` validator** (`v.object`, `v.email`, `v.minLength`, `v.exactDigits`, etc.) so functions don't need to bundle Zod just for shape checks. Schemas with `safeParse` from real Zod also work.
- `respond.ts` — `ok(req, body, status?)`, `err(req, message, status?, extra?)`, `preflight(req)` — all auto-attach `getCorsHeaders(req)`.
- `test-utils.ts` — `callFn(name, opts)`, `preflight(name)`, `assertCors(res)`, `assertUnauthorized(res)`, `assertValidationError(res, field)`. Loads `.env` via Deno dotenv, reads `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` (falls back to `SUPABASE_*`), defaults Origin to `https://hizivo.com` so the existing CORS whitelist accepts it.

(All five files are written exactly as drafted in the previous turn — no Zod runtime dependency required.)

## 2. Migrate the first 5 endpoints to the new toolkit

Auth-related functions get hardened first:

| Function | Changes |
|---|---|
| `public-signup` | Replace inline CORS + manual checks with `withErrorHandling` + `parseBody(v.object({email, password (min 8), fullName, phone optional}))`. Same response shape on success. |
| `send-otp-email` | `withErrorHandling` + `parseBody(v.object({email}))`. Public endpoint (no `requireUser`) — explicitly documented. |
| `send-otp-sms` | `withErrorHandling` + `parseBody(v.object({phone (E.164)}))`. Public, documented. |
| `verify-otp-code` | `withErrorHandling` + `parseBody(v.object({email, code (6 digits)}))`. Internal logic unchanged, response shape preserved. |
| `verify-otp-sms` | Same pattern as `verify-otp-code` for phone+code. |

For each: response shape on `200` is unchanged; only `400`/`401`/`500` envelopes are standardized to `{ error, fieldErrors? }`. CORS continues using the existing `getCorsHeaders(req)` whitelist (no behavior change for browsers).

These five functions are NOT JWT-protected by design (signup + OTP request/verify happen *before* the user has a session). The `requireUser` helper is wired and ready, but only `account-summary`-style protected functions will use it in the next batch — auth functions only get **CORS + Zod + error standardization**.

## 3. Automated tests (Deno) — `supabase/functions/<name>/index.test.ts`

For each of the 5 hardened functions plus a `_shared/smoke_test.ts`:

- **OPTIONS preflight** → 204 with valid CORS allow-origin + allow-headers (incl. `authorization`).
- **Invalid body** (missing required field, wrong type, malformed JSON) → 400 with `fieldErrors` mentioning the field.
- **Wrong-origin preflight** (`Origin: https://evil.com`) → response either omits or empties `Access-Control-Allow-Origin`.
- For protected fns (next batch): **missing/garbage Authorization** → 401.
- **Happy path** is exercised against the public-signup test using a uniquely-generated email; response is 200/202 with `success: true`.
- A `_shared/smoke_test.ts` loops over all hardened functions and asserts CORS+invalid-body behavior in one run — a single command via `supabase--test_edge_functions` produces the regression signal.

End-to-end coverage runs against the **deployed** functions through the Supabase functions URL (real CORS, real auth path). No mocks in transport layer.

## 4. Unified Admin Dashboard Shell — Restaurant pilot

New components under `src/components/admin/shell/`:

- `AdminShell.tsx` — `SidebarProvider` + `min-h-screen flex w-full`, header with always-visible `SidebarTrigger`, content area, mobile safe-area aware. Wraps children.
- `AdminSidebar.tsx` — uses shadcn `Sidebar collapsible="icon"` + `NavLink`. Reads `nav` config prop with `{ section, items: [{ title, url, icon }] }[]`. Active route highlight + auto-expanded group containing active item.
- `AdminTopbar.tsx` — store switcher (placeholder dropdown ready for multi-store), command-palette trigger, notifications bell, profile menu.
- `useAdminContext.tsx` — `{ vertical, currentStoreId, role }`, persists `currentStoreId` to localStorage.
- `nav/restaurant.ts` — Restaurant nav config: Dashboard, Orders, Menu, Tables, Staff, Reviews, Promotions, Analytics, Settings — each pointing to existing `/eats/restaurant-dashboard` sub-routes (initially the dashboard route; sub-routes added in Phase 4b).

**Restaurant page integration:**
- Update `EatsRestaurantDashboard.tsx` to render its existing content inside `<AdminShell vertical="restaurant" nav={restaurantNav}>...</AdminShell>`. No content/logic changes, no route changes — purely a layout wrapper.
- `BusinessDashboard.tsx` (generic business shell) gets the same wrapper as a second pilot, with a `business` nav config. Reverts cleanly by removing the wrapper.
- Wrapped routes stay behind `<ProtectedRoute>` (already applied at `App.tsx` level).

No new routes; everything is additive and behind the existing protected-route guard.

## 5. Frontend tests for the shell

- `src/components/admin/shell/AdminShell.test.tsx` — renders with mocked `react-router-dom` + `SidebarProvider`, asserts: SidebarTrigger present, nav items render, active item gets active class, ProtectedRoute integration left to existing app-level coverage.

## Delivery order (single approval, all in this drop)

1. Write `_shared/auth.ts`, `errors.ts`, `validate.ts`, `respond.ts`, `test-utils.ts`.
2. Refactor 5 auth functions to use the toolkit (preserving response shapes).
3. Write 5 per-function `*.test.ts` + 1 `_shared/smoke_test.ts`.
4. Write `src/components/admin/shell/*` + `nav/restaurant.ts` + `nav/business.ts`.
5. Wrap `EatsRestaurantDashboard.tsx` and `BusinessDashboard.tsx` in `<AdminShell>`.
6. Add `AdminShell.test.tsx`.
7. Run frontend tests (`vitest`) + edge-function tests (`supabase--test_edge_functions`).
8. Append a "Stage B/C/D/E shipped" section to `/mnt/documents/phase-1-rollout-checklist.md`.

## Files changed/created

**New (12):**
- `supabase/functions/_shared/auth.ts`
- `supabase/functions/_shared/errors.ts`
- `supabase/functions/_shared/validate.ts`
- `supabase/functions/_shared/respond.ts`
- `supabase/functions/_shared/test-utils.ts`
- `supabase/functions/_shared/smoke_test.ts`
- `supabase/functions/public-signup/index.test.ts`
- `supabase/functions/send-otp-email/index.test.ts`
- `supabase/functions/send-otp-sms/index.test.ts`
- `supabase/functions/verify-otp-code/index.test.ts`
- `supabase/functions/verify-otp-sms/index.test.ts`
- `src/components/admin/shell/{AdminShell,AdminSidebar,AdminTopbar,useAdminContext}.tsx` + `nav/{restaurant,business}.ts` + `AdminShell.test.tsx`

**Edited (7):**
- `supabase/functions/public-signup/index.ts`
- `supabase/functions/send-otp-email/index.ts`
- `supabase/functions/send-otp-sms/index.ts`
- `supabase/functions/verify-otp-code/index.ts`
- `supabase/functions/verify-otp-sms/index.ts`
- `src/pages/EatsRestaurantDashboard.tsx`
- `src/pages/business/BusinessDashboard.tsx`

## Risk and rollback

- **Toolkit files are additive** — no existing function imports them yet, so adding them is zero-risk.
- **Auth function refactors preserve `200` response shape exactly**; only error envelopes change. Rollback per-function = redeploy previous version.
- **Dashboard shell is purely a wrapper** — remove `<AdminShell>` to instantly revert. No route changes, no DB changes.
- **Tests** run via the Lovable test tools; no CI changes required.

## Out of scope (next drop)

- Hardening the next 25 edge functions (orders/payments/chat/admin batches).
- Other vertical dashboards (Grocery/Retail/Cafe/Service/Mobility).
- Store switcher backend (currently placeholder UI).
- Command palette commands (palette is shipped empty, ready for registrations).
