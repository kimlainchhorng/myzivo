
# Navigation & Routing Cleanup Plan for ZIVO

## Overview

This plan addresses the scattered UI elements and inconsistent routing by implementing a clean, unified navigation system with proper redirects and organized page content.

---

## Current Issues Identified

1. **Duplicate Routes**: Both `/book-flight` and `/flights` exist; `/book-hotel` and `/hotels` exist
2. **Mixed Navigation Systems**: Two separate navigation components (`NavBar.tsx` and `Header.tsx` with mega menus) causing confusion
3. **Mega Menu in Wrong Places**: The `Header.tsx` uses large mega menu dropdowns that may render incorrectly on certain pages
4. **Legacy Route Links**: Internal links still reference `/book-flight`, `/book-hotel` instead of canonical routes
5. **FlightBooking.tsx Bloat**: Contains 100+ component imports creating a cluttered page

---

## Implementation Plan

### Phase 1: Establish Canonical Routes with Redirects

**Create a new redirect component** to handle legacy URLs:

```text
File: src/components/routing/RouteRedirects.tsx
```

**Route Mapping:**
| Old Route | New Route | Action |
|-----------|-----------|--------|
| `/book-flight` | `/flights` | Redirect with query params |
| `/book-hotel` | `/hotels` | Redirect with query params |
| `/travel-extras` | `/extras` | Redirect |
| `/zivo-rides` | `/rides` | Redirect |
| `/zivo-eats` | `/eats` | Redirect |

**Update `App.tsx`:**
- Replace `FlightLanding` at `/book-flight` with a `Navigate` component to `/flights`
- Replace `HotelLanding` at `/book-hotel` with a `Navigate` component to `/hotels`
- Keep query parameters using a custom redirect handler

---

### Phase 2: Unify Navigation System

**Consolidate to single desktop navigation** in `NavBar.tsx`:

Current structure (keep but enhance):
```text
Top Nav Items:
├── Travel (dropdown)
│   ├── Flights → /flights
│   ├── Hotels → /hotels
│   └── Car Rental → /rent-car
├── Rides → /rides (direct link)
├── Eats → /eats (direct link)
├── More (dropdown)
│   ├── Extras → /extras
│   ├── Partners → /partners
│   ├── Creators → /creators
│   └── Help Center → /help
└── Contact → /contact (direct link)
```

**Fix Header.tsx Mega Menu**:
- The mega menu dropdowns are correctly implemented as overlays (position: absolute)
- Update all internal `href` values in `megaMenuData.ts` to use canonical routes (`/flights` not `/book-flight`)

---

### Phase 3: Update megaMenuData.ts Links

**Files to modify:** `src/components/navigation/megaMenuData.ts`

Replace all `/book-flight` references with `/flights`:
- Line 111-112: mainAction.href → `/flights`
- Lines 118-131: All href values → `/flights?...`
- Lines 137-139, 145-147: Update to `/flights?...`

Replace all `/book-hotel` references with `/hotels`:
- Line 168-169: mainAction.href → `/hotels`
- Lines 175-206: All href values → `/hotels?...`

---

### Phase 4: Clean Up Page Content

**Simplify FlightBooking.tsx:**
- This page has 100+ imports - many are unused or redundant
- Move cross-sell sections to a dedicated component
- Keep: Hero, Search Form, Results Section, FAQ, Footer
- Remove duplicate widget imports

**Ensure each page contains ONLY:**
```text
├── Page Header (title + description)
├── Search Form (single product)
├── Results Section (if search performed)
├── FAQ Section (optional)
├── Affiliate Disclosure
└── Footer
```

**Remove from travel pages:**
- Duplicate service grids
- Cross-sell content (move to `/extras` only)
- Repeated icon panels

---

### Phase 5: Fix Internal Link References

**Files to update:**
1. `src/components/seo/InternalLinkGrid.tsx`
   - Line 87: Change `/book-flight` → `/flights`
   - Line 87: Change `/book-hotel` → `/hotels`
   - Line 151: Same updates

2. `src/components/shared/FlightToHotelBridge.tsx`
   - Line 44: Change `/book-hotel` → `/hotels`
   - Line 131: Change `/book-flight` → `/flights`

3. `src/pages/TravelExtras.tsx`
   - Line 241-253: Verify links use `/flights`, `/hotels`, `/rent-car`

4. `src/pages/app/AppHome.tsx`
   - Already using correct routes ✓

5. `src/components/Footer.tsx`
   - Already using correct routes ✓

---

### Phase 6: Verify Affiliate CTA Flow

**All partner outbound clicks must:**
1. Open in new tab (`target="_blank"`)
2. Include `rel="nofollow sponsored noopener"`
3. Route through `/out` redirect system
4. Show redirect notice

**Files to verify:**
- All `*ResultCardPro.tsx` components
- All `*PartnerSelector.tsx` components
- All affiliate link generators

---

## Final Route Structure

```text
CANONICAL ROUTES
================
/                       → Home
/flights                → Flight search (primary)
/flights/results        → Flight results
/flights/details/:id    → Flight details
/hotels                 → Hotel search (primary)
/hotels/in-:city        → Hotel SEO landing
/rent-car               → Car rental (primary)
/car-rental             → Car rental landing
/car-rental/in-:location→ Car rental SEO landing
/rides                  → Ride request
/eats                   → Food ordering
/extras                 → Travel extras hub

COMPANY/SUPPORT
===============
/about                  → About ZIVO
/how-it-works           → How it works
/partners               → Partner info
/creators               → Creator program
/contact                → Contact page
/help                   → Help center

LEGAL
=====
/privacy                → Privacy policy
/terms                  → Terms of service
/affiliate-disclosure   → Affiliate disclosure

REDIRECTS (301)
===============
/book-flight           → /flights
/book-hotel            → /hotels
/travel-extras         → /extras
/zivo-rides            → /rides
/zivo-eats             → /eats
```

---

## Technical Details

### Redirect Implementation

```typescript
// In App.tsx, replace:
<Route path="/book-flight" element={<FlightLanding />} />

// With:
<Route 
  path="/book-flight" 
  element={<Navigate to="/flights" replace />} 
/>
```

For query parameter preservation, create a wrapper:

```typescript
// src/components/routing/PreserveQueryRedirect.tsx
const PreserveQueryRedirect = ({ to }: { to: string }) => {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
};
```

### Mega Menu Verification

The current `MegaMenuDropdown.tsx` correctly uses:
- `position: absolute` with `top: full` - renders as overlay ✓
- `z-50` - appears above page content ✓
- Attached to header via ref - not inserted into page body ✓

No changes needed to mega menu positioning.

---

## Files Changed Summary

| File | Change Type |
|------|-------------|
| `src/App.tsx` | Add redirects for legacy routes |
| `src/components/navigation/megaMenuData.ts` | Update all `/book-*` hrefs |
| `src/components/seo/InternalLinkGrid.tsx` | Update internal links |
| `src/components/shared/FlightToHotelBridge.tsx` | Update navigation links |
| `src/components/Footer.tsx` | Verify (already correct) |
| `src/pages/app/AppHome.tsx` | Verify (already correct) |

---

## Expected Outcomes

After implementation:
- ✅ All old routes redirect to canonical routes with query params preserved
- ✅ Navigation matches the approved site map
- ✅ Mega menu renders as overlay, not in page body
- ✅ Each page contains only its own content
- ✅ Affiliate CTAs open in new tabs with proper disclosure
- ✅ Homepage shows 6 service cards with correct links
