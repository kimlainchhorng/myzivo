## Goal

Tapping the **Hotels** pill on Home opens a full Hotels & Resorts landing page (not just the flat list). The landing page features a hero search, popular destinations, featured properties, and the full directory below.

## Changes

### 1. New page: `src/pages/lodging/HotelsLandingPage.tsx`
Route: `/hotels` (replaces today's `/hotels-list` as the primary entry point; old route stays as alias).

Sections, top to bottom:

```text
┌─────────────────────────────────┐
│  HERO  (gradient + cover image) │
│  "Find your perfect stay"       │
│  [ Search city or hotel...   ] │
├─────────────────────────────────┤
│  Popular Destinations  →        │
│  [PP] [Siem Reap] [Sihanoukville]
│  [Kep] [Kampot] [Battambang]   │
│  (horizontal scroll cards w/ img)
├─────────────────────────────────┤
│  Featured Properties  →         │
│  (horizontal carousel of top    │
│   3-6 setup_complete stores)    │
├─────────────────────────────────┤
│  All Hotels & Resorts           │
│  [filter chips: All Hotels ...] │
│  ▣ property card                │
│  ▣ property card                │
└─────────────────────────────────┘
```

Behavior:
- Hero search input is sticky-collapsed when scrolled past (mirror current sticky header pattern).
- Tapping a destination chip pre-fills the search/filter to that city.
- Featured carousel pulls from the same `stores` query, filtered to `setup_complete = true`, ordered by name. Tap → `/hotel/:storeId`.
- "All Hotels & Resorts" reuses the existing `PropertyCard` and filter chips logic from `HotelsResortsDirectoryPage.tsx`.

Imports follow project rule: default imports from `lucide-react/dist/esm/icons/<name>` (no barrel imports).

### 2. Update `src/pages/app/AppHome.tsx`
- "Hotels" pill: single tap navigates to `/hotels` immediately (skip the second-tap-to-open behavior).
- `tabSearchRoutes.hotels` → `/hotels`.
- The Hotel/Resort Admin card stays as-is on the Home Hotels tab (so admins still land there from notifications).

### 3. Routing in `src/App.tsx`
- Register `/hotels` → `HotelsLandingPage` (lazy + ErrorBoundary, same pattern as existing routes).
- Keep `/hotels-list` route pointing to the existing `HotelsResortsDirectoryPage` so any old links still resolve.

### 4. Quiet runtime fix
The current preview shows a Vite cache error: `does not provide an export named 'ArrowLeft'`. Re-saving the file (which the new code will do anyway) resolves the stale Vite optimize-deps cache. No code change needed beyond the touch.

## Out of scope
- No real booking/availability (still uses the existing contact-modal flow on `HotelResortDetailPage`).
- No new database tables — popular destinations are a static curated list in code.
- No changes to admin/Ops pages.

## Files

- **Create**: `src/pages/lodging/HotelsLandingPage.tsx`
- **Edit**: `src/pages/app/AppHome.tsx` (pill onClick + search route)
- **Edit**: `src/App.tsx` (register `/hotels` route)
