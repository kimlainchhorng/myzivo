## Goal

When you tap the "Hotel/Resort Admin" card on the Hotels Home tab, open a new **public Hotel & Resort detail page** for that property — like a hotel listing page (cover, name, location, rating, amenities, rooms, rates, contact). The existing operator buttons (Open Ops / Run QA / Operations Hub / View QA Report) stay as quick actions on the card for the owner, but the rest of the card surface becomes a tap-target that opens the public detail page.

## What changes

### 1. New public page: `src/pages/lodging/HotelResortDetailPage.tsx`
Route: `/hotel/:storeId`

Sections (top → bottom):
- Cover image (from `lodge_property_profile.cover_url` → fallback `stores.logo_url` → fallback gradient)
- Property header: name, category badge ("Hotel" / "Resort"), star rating, address line, "Ready" badge if `setup_complete`
- Quick stats row: rooms count, rate plans count, check-in/out times, languages
- About / description (`lodge_property_profile.description`)
- Amenities grid (icons from `lodge_property_profile.amenities`)
- Rooms preview: horizontal scroll of `lodge_rooms` (photo, name, max guests, nightly price)
- Rates / packages preview (top 3 active rate plans with "View all rates" link)
- Location card with map preview (reuse existing map component if available, else static address)
- Contact / Book actions: "Check Availability" (primary), "Call", "Message", "Share"
- Owner-only footer band: if `ownerStore?.id === storeId`, show inline "Open Admin Dashboard" button → `/admin/stores/{id}?tab=lodge-overview`

Data fetching: reuse `useLodgePropertyProfile(storeId)` and `useLodgeRooms(storeId)`; add a small `useLodgeRatePlans(storeId)` hook if not already present (check existing hooks first; otherwise inline a simple Supabase query).

States: skeleton on load, NotFound card if store id is invalid or not a lodging store, share button uses Web Share API with branded fallback.

### 2. Update Hotels Home card in `src/pages/app/AppHome.tsx` (around lines 480–501)
- Add a richer preview before the buttons:
  - Show **cover image banner** at the top of the card (h-28, rounded-t-2xl, gradient overlay), pulling `lodgingProfile.data?.cover_url || ownerStore.logo_url`
  - Add a **stats strip** under the name: `{roomsCount} rooms · {ratePlansCount} rates · {pendingRequestsCount} requests` (use existing hooks; missing counts shown as "—")
- Wrap the **non-button area** (cover + header + stats + progress) in a `<button>` / clickable `<div role="button">` that navigates to `/hotel/{ownerStore.id}`
- Keep the 4 existing action buttons (Open Ops, Run QA, Operations Hub, View QA Report) as-is, with `e.stopPropagation()` so they don't trigger the card's tap
- Add `aria-label="Open hotel detail page"` on the tap surface

### 3. Wire route in `src/App.tsx`
Add lazy import + route inside the customer-app routes section, alongside other `/hotel*` paths:
```tsx
const HotelResortDetailPage = lazy(() => import("./pages/lodging/HotelResortDetailPage"));
// ...
<Route path="/hotel/:storeId" element={<RouteErrorBoundary section="HotelDetail"><HotelResortDetailPage /></RouteErrorBoundary>} />
```

This does **not** conflict with existing `/hotels/:city` (plural) or `/hotel-admin` routes.

## Out of scope
- No real booking flow yet — "Check Availability" opens a sheet that says "Booking opens soon" + share/contact actions (mirrors existing partner-handoff pattern). This can be wired to Hotelbeds/RateHawk later.
- No changes to `/hotels/:city` SEO landing pages.
- No schema changes — uses existing `lodge_property_profile`, `lodge_rooms`, `stores` tables.

## Files

**Created**
- `src/pages/lodging/HotelResortDetailPage.tsx`

**Edited**
- `src/pages/app/AppHome.tsx` (Hotels card → richer preview + tap-to-open)
- `src/App.tsx` (add `/hotel/:storeId` route)
