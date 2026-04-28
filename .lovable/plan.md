# Hotels Landing Page — Phase 1 Upgrades

Single file rewrite of `src/pages/lodging/HotelsLandingPage.tsx`. No DB changes; reads existing tables (`store_profiles`, `lodge_rooms`, `lodge_property_profile`) — both confirmed populated for Koh Sdach Resort.

## Fixes
- **Tighter hero**: smaller headline (20px), reduced padding (`pt-3 pb-4`), search h-11.
- **Drop the "Ready" pill** on featured cards — replaced with conditional **Verified** badge (emerald) when `store_profiles.is_verified = true`.
- **De-dupe "New" badge**: keep only one star pill per card.
- **Empty state CTA**: when no results show "List your property" → `/business/onboarding`; when filters active show "Clear filters".

## New: Booking essentials
- **Date range picker** (shadcn Calendar in Popover, `mode="range"`) — defaults today → tomorrow, computes nights.
- **Guests + Rooms popover** with stepper (1–20 guests, 1–10 rooms), default 2/1.
- **Min price-from** per property pulled from `lodge_rooms.base_rate_cents` (active only) → "from $XX /night" + total for stay when nights > 1.
- **Amenity icons row** on each card (Wi-Fi, Pool, Breakfast, Pets) derived from `lodge_property_profile.popular_amenities` + `facilities`.

## New: Discovery
- **Quick filter chips** above destinations: Near me · Beachfront · Pool · Breakfast · Free Wi-Fi · Family · Pet-friendly. Multi-select; AND-matched against amenity haystack.
- **Near me** chip uses `navigator.geolocation` (8s timeout, low accuracy). UI-only for now — sets active state; sort-by-distance comes in Phase 2 once we add lat/lng to `store_profiles`.

## Data layer
Two new lightweight queries gated on `storeIds.length > 0`:
- `lodge-min-rates` → `{ store_id, base_rate_cents }` where `is_active=true`, reduced client-side to min per store.
- `lodge-amenities` → `{ store_id, popular_amenities, facilities }`.

## Files
- `src/pages/lodging/HotelsLandingPage.tsx` (rewrite)

## Out of scope (Phase 2)
Map view, sort dropdown, wishlist, "viewing now" social proof, city sub-pages, editorial sections, distance-based sorting.
