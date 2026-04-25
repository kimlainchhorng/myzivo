## Goal

Harden `BusinessPageWizard` so it (1) actually saves without the schema error you saw, (2) refuses duplicate slugs gracefully, (3) warns before losing in-progress work, (4) confirms what was saved at every step, and (5) always lands on a real dashboard route.

## Bugs found while exploring

1. **Schema error in screenshot** — `store_profiles` has no `email` column. The wizard sends `email: bizEmail` on insert/update, which is what produces *"Could not find the 'email' column of 'store_profiles' in the schema cache"*. Real columns: `name, slug, category, phone, logo_url, banner_url, owner_id, setup_complete, …` (no email).
2. **Restaurant route is broken** — wizard redirects to `/restaurant/dashboard` but no such route exists in `src/App.tsx`. The actual route is `/eats/restaurant-dashboard`.
3. **No slug collision handling** — `slugify(name)` can collide with another business's slug, and the DB has a unique index on `slug`, so the insert silently fails with a 23505 error.
4. **No leave-warning** — back button / browser nav / route change discards everything typed.
5. **No per-step confirmation** — user has no signal that step data was captured.

## What we'll change

### 1. Fix the schema error (blocking)
- Stop sending `email` to `store_profiles` (it's not a column).
- Keep business email in component state and persist it on the matching `restaurants` row (which does support email) for restaurant categories, and on the user's `profiles.email` only if user opts in later. For non-restaurant categories, drop it from the payload — we'll surface a TODO if a column is added later.

### 2. Duplicate slug protection
- Before insert, query `store_profiles` for existing rows where `slug = candidate AND owner_id <> current user`.
- If taken, auto-append a short numeric suffix (`-2`, `-3`, …) up to 5 attempts; after that, show inline error on Step 1: *"That business name is already taken — try a small variation."* and keep the user on Step 1 with focus on the name field.
- Also catch Postgres `23505` from the insert as a final safety net and surface the same friendly message.

### 3. Leave-wizard confirm dialog
- Track `isDirty` (true once any field is touched and `setup_complete` not yet true).
- Add a `useBeforeUnload` handler for full-page reload/close.
- Intercept the in-app Back button and any `navigate(-1)` from Step >1 with an `<AlertDialog>`: *"Leave setup? Your progress on this step won't be saved."* with **Stay** / **Leave** actions.
- Soft-save partial progress (without `setup_complete`) on every successful **Continue**, so returning to `/business/new` later resumes mid-flow.

### 4. "Setup saved" + "Next: …" status summary
- After each successful **Continue**, show a small toast: *"Step saved · Next: Business type"* (etc.).
- Add a compact summary chip row beneath the progress bar listing completed steps with a green check (`Basics ✓ · Type ✓ · Contact …`). Tapping a completed chip jumps back to that step (read-only-ish, but editable).

### 5. Dashboard routing + fallback
- Verified destinations:
  - Lodging categories → `/admin/stores/:storeId?tab=lodge-overview` ✓ exists.
  - Generic store categories → `/admin/stores/:storeId` ✓ exists.
  - Restaurants/cafes/bakeries/drinks → currently points at `/restaurant/dashboard` which **doesn't exist**. Change to `/eats/restaurant-dashboard` (the real route).
- Add a centralized `resolveBusinessDashboardRoute(category, storeId)` helper.
- Add a final fallback: if the resolved route would 404 (unknown category), route to `/admin/stores/:storeId` and toast *"Opened your generic dashboard — pick a category later to unlock more tools."*

### 6. Light type cleanup
- Cast the upsert payload through a typed helper instead of `Record<string, any>` / `(supabase as any)`.

## Files to edit

- `src/pages/business/BusinessPageWizard.tsx` — all of the above.
- `src/lib/business/dashboardRoute.ts` *(new, tiny)* — `resolveBusinessDashboardRoute()` + restaurant category set, reused by the wizard and by the auto-redirect-on-mount block.

## Out of scope (call out, do not do)

- No new DB migrations. We won't add an `email` column to `store_profiles` unless you ask — the wizard will simply stop sending it.
- No changes to the home card or the `/business/new` route registration (already shipped).
- No redesign of the dashboards themselves.

## Acceptance checks

- Completing the wizard with category = *Restaurant* lands on `/eats/restaurant-dashboard` with no console errors.
- Completing with category = *Hotel* lands on `/admin/stores/:id?tab=lodge-overview`.
- Re-running with the same business name as another owner shows the friendly duplicate message and keeps the user on Step 1.
- Pressing Back mid-wizard opens the confirm dialog; choosing **Stay** keeps state; **Leave** discards.
- Reopening `/business/new` after a partial save resumes on the next incomplete step with previous fields prefilled.
- Each Continue press shows a "Step saved · Next: …" toast and advances the chip checkmarks.