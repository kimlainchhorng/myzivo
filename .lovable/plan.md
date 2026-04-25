## Goal

Turn the home-screen "Partner Admin" card into a **"Business Page"** entry point. Because the user is already signed into Zivo, skip partner-login entirely and walk them through a clean 5-step setup wizard (Business → Type → Contact → Profile → Cover → Done). Wizard auto-routes them to the correct dashboard based on the business type they pick.

## UX Flow

```text
AppHome → "Business Page" card  ──▶  /business/new
   (only shown when user has no       │
    existing partner role)            ▼
                          ┌──────────────────────────────┐
                          │ 1. Business basics           │  full business name
                          │                              │  business phone
                          │                              │  business email
                          ├──────────────────────────────┤
                          │ 2. Business type             │  pick from grouped
                          │   "Set type of business"     │  STORE_CATEGORY_OPTIONS
                          │                              │  (Stay / Food / Shop /
                          │                              │   Auto / Beauty / Services)
                          │                              │  → drives dashboard route
                          ├──────────────────────────────┤
                          │ 3. Contact person            │  first + last name
                          │                              │  phone, email
                          │                              │  (prefilled from profile)
                          ├──────────────────────────────┤
                          │ 4. Profile photo  [Skip]     │  optional logo upload
                          ├──────────────────────────────┤
                          │ 5. Cover photo    [Skip]     │  optional banner upload
                          ├──────────────────────────────┤
                          │ ✓ Complete → Go to dashboard │
                          └──────────────────────────────┘
                                       │
              ┌────────────────────────┼─────────────────────────────┐
              ▼                        ▼                             ▼
      hotel/resort/guesthouse   restaurant/cafe/bakery/drink   everything else
      → /admin/stores/:id            → /restaurant/dashboard    → /admin/stores/:id
        ?tab=lodge-overview          (creates restaurants row    (creates store_profiles
                                      when category=restaurant)   row, setup_complete=true)
```

Key UX rules:
- Steps 4 and 5 have a visible **Skip** button alongside Continue.
- Steps 1–3 require their fields; inline validation, no toasts on every keystroke.
- Top progress bar (5 dots) + Back button on every step except step 1.
- Auto-save draft to `store_profiles` on each step transition so users can resume.
- On completion: `setup_complete = true`, success toast, route to dashboard.

## Changes

### 1. `src/pages/app/AppHome.tsx`
- Rename the fallback card label "Partner Admin" → **"Business Page"**, subtitle → **"Create your business page on Zivo"**.
- Change `onClick` from `navigate("/partner-login")` → `navigate("/business/new")`.
- Keep the existing "owner store detected" branch unchanged (users who already have a store still see ops).

### 2. New page `src/pages/business/BusinessPageWizard.tsx`
- 5-step wizard component using existing `Card`, `Button`, `Input`, `Label`, `framer-motion` patterns from `StoreSetup.tsx`.
- Reuses `STORE_CATEGORY_OPTIONS` (grouped chips) for the "Set type of business" step.
- Reuses `formatPhone` and the `store-assets` storage bucket upload pattern from `StoreSetup.tsx` for logo/banner.
- On submit, upserts `store_profiles` (owner_id = auth.uid, category, name, phone, email, logo_url, banner_url, setup_complete=true) and:
  - if category is `restaurant|cafe|bakery|drink`, also inserts a minimal `restaurants` row and routes to `/restaurant/dashboard`,
  - if category is lodging (`hotel|resort|guesthouse`), routes to `/admin/stores/:id?tab=lodge-overview`,
  - else routes to `/admin/stores/:id`.
- Prefills contact step with `profiles.full_name`, `profiles.phone`, `user.email`.
- If the user already has a `store_profiles` row with `setup_complete=true`, redirect straight to the dashboard (no double-setup).

### 3. `src/App.tsx`
- Add lazy route: `<Route path="/business/new" element={<ProtectedRoute><BusinessPageWizard /></ProtectedRoute>} />`.

### 4. (No DB migration needed)
All target tables (`store_profiles`, `restaurants`, `profiles`) already exist with the required columns.

## Technical Notes

- Reuse existing routing convention (`isLodgingStoreCategory`) used by `PartnerLogin.tsx` so dashboard handoff stays consistent.
- Restaurant branch: only insert into `restaurants` if no row with `owner_id = auth.uid` exists yet (mirrors `PartnerLogin` lookup).
- Skip buttons set the field to `null` server-side so users can fill it in later from the dashboard's profile page.
- Wizard layout follows existing mobile-native patterns: safe-area top padding, sticky bottom action bar with Back / Skip / Continue.
- Fallback unchanged for unauthenticated users — `ProtectedRoute` will redirect to `/auth?redirect=/business/new`.
