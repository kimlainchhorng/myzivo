

# Comprehensive ZIVO Platform Update Plan

## Executive Summary

This is a large-scale update covering **6 service verticals**, **legal pages**, and **UX/UI design improvements** across the entire platform. The plan identifies what to keep, what to remove, what to fix, and what to add.

---

## PART 1: What to REMOVE (Dead Code / Unnecessary Pages)

These pages and components add bloat, confuse navigation, and serve no production purpose:

### Pages to Delete
| Page | Reason |
|------|--------|
| `RidesComingSoon.tsx` | Rides is already live with full booking flow |
| `EatsComingSoon.tsx` | Eats is already live with restaurant discovery |
| `FoodOrdering.tsx` | Duplicate of Eats flow |
| `RiderApp.tsx` | Marketing placeholder, not needed |
| `EcosystemMap.tsx` | Internal diagram, not customer-facing |
| `StrategicRoadmap.tsx` | Internal planning, not customer-facing |
| `StrategicPartnerships.tsx` | Internal, not customer-facing |
| `InvestorRelations.tsx` | Placeholder, no real data |
| `FinancialTransparency.tsx` | Internal reporting page |
| `HowZivoMakesMoney.tsx` | Internal business model explanation |
| `TrackingTest.tsx` | Developer test page |
| `Creators.tsx` | No creator program exists |
| `Events.tsx` | No events system exists |

### Legal Pages to Consolidate (78 pages is excessive)
Keep these **core legal pages** (already well-written):
- Terms of Service (`/terms`)
- Privacy Policy (`/privacy`)
- Cookie Policy (`/cookies`)
- Partner Disclosure (`/partner-disclosure`)
- Refund Policy (`/refunds`)
- Cancellation Policy
- Seller of Travel
- Renter Terms / Owner Terms

Remove or merge **~50+ redundant legal micro-pages** like:
- `AIBiasPolicy`, `AIDisclosure` -- merge into Privacy
- `AccountSecurityPolicy` -- merge into Privacy
- `DataBreachPolicy`, `DataResidency`, `DataPolicies` -- merge into Privacy
- `EmergencyShutdown`, `GovernmentOrders`, `RegulatorCommunications` -- internal ops, not customer-facing
- `ComplianceOperations`, `ComplianceRecords`, `FinancialRecords` -- internal
- `BrandPolicy`, `ContentPolicy` -- internal guidelines
- `CorporateProtection`, `EnforcementRights`, `LegalProcess` -- legal team internal
- `WhistleblowerPolicy`, `EthicsPolicy` -- HR/internal

### Edge Functions to Review
Keep all payment/booking functions. Flag these for removal if unused:
- `campaign-scheduler` / `execute-campaign` / `push-campaign-scheduler` (no marketing system wired)
- `track-ad-event` (ads system is placeholder)
- `process-abandoned-searches` (no automated pipeline)

---

## PART 2: What to FIX per Vertical

### A. RIDES
**Status**: Functional booking flow with map, pricing, and Stripe checkout

**Fixes needed:**
1. **Stripe live key** -- still using test key (blocked on user input)
2. **SavedAddressSelector DOM hack** -- uses `document.getElementById` instead of react-hook-form `setValue`
3. **Add ride confirmation page** -- after payment success, show a proper confirmation with trip details, driver ETA, and a map
4. **Add ride receipt/history images** -- ride history cards need vehicle type thumbnails (currently empty `image: ""`)
5. **Bottom sheet polish** -- improve drag handle visibility and snap points on smaller devices

### B. EATS
**Status**: Full restaurant discovery, cart, checkout flow (order request mode)

**Fixes needed:**
1. **Wire Stripe payment** -- checkout currently submits orders without payment processing; connect `create-eats-payment-intent` edge function
2. **Fix address selector** -- same DOM manipulation bug as Rides
3. **Add restaurant hero images** -- restaurant cards use small 300x300 Unsplash thumbnails; upgrade to 800x600 quality images with proper `srcset`
4. **Order tracking map** -- delivery tracking page needs real map integration (currently shows status text only)
5. **Menu item photos** -- menu items lack photos; add placeholder food photography per cuisine category

### C. DELIVERY (Move)
**Status**: Marketing-only page redirecting to zivodriver.com

**Fixes needed:**
1. **Remove fake booking UI** -- ensure no buttons suggest you can book on hizovo.com
2. **Update redirect URL** -- `ZIVO_DRIVER_URL` points to `zivo-driver-app.rork.app`, should point to actual domain
3. **Add real service photos** -- replace generic stock with delivery/logistics-specific images
4. **Simplify page** -- reduce from 290 lines of marketing fluff to a clean "Coming to your city" page with email signup

### D. FLIGHTS
**Status**: Well-built search with Duffel API integration, proper disclaimers

**Fixes needed:**
1. **Flight results images** -- add airline logo images next to results (currently text-only airline names)
2. **Destination cards** -- already using local destination photos (good), but some cards link to non-functional city pages
3. **Checkout flow** -- verify Duffel checkout redirect works end-to-end with live credentials
4. **Add flight status tracking** -- `FlightLive.tsx` exists but needs real-time data connection
5. **Mobile search UX** -- flight search form needs date picker improvements for mobile (calendar overlap issues)

### E. HOTELS
**Status**: Search with Hotelbeds/RateHawk API integration, landing page with city photos

**Fixes needed:**
1. **Hotel result cards need photos** -- search results should show hotel property images from API response
2. **Hotel detail page images** -- add photo gallery/carousel for hotel rooms
3. **Add hotel type category images** -- already have assets (`hotel-luxury.jpg`, `hotel-boutique.jpg`, etc.) but not used in filters
4. **Review page** -- hotel review cards need star rating visuals and guest photo placeholders
5. **Booking confirmation** -- add hotel confirmation card with check-in/out details and map

### F. CAR RENTALS
**Status**: Search with landing page, vehicle type gallery, proper compliance

**Fixes needed:**
1. **Vehicle gallery** -- already have 60+ car model images in assets (excellent); ensure they display in search results
2. **Car detail page** -- `CarDetailPage.tsx` needs photo carousel using existing car assets
3. **Checkout flow** -- verify `CarCheckoutPage.tsx` connects to Stripe properly
4. **Add "popular cars" section** -- showcase the premium car images (Porsche, Tesla, BMW) on landing page
5. **Filter by vehicle type** -- add visual category filters using existing car type images (SUV, Electric, Luxury, etc.)

---

## PART 3: LEGAL & POLICY Updates

### Core Pages (Keep and Polish)
1. **Terms of Service** (`/terms`) -- Currently good. Add CCPA/GDPR specific sections, add arbitration clause
2. **Privacy Policy** (`/privacy`) -- Currently good. Add data retention periods, add CCPA "Do Not Sell" link
3. **Cookie Policy** (`/cookies`) -- Has interactive toggles (excellent). Add Google Analytics / Stripe cookie specifics
4. **Partner Disclosure** (`/partner-disclosure`) -- Good. Ensure it covers all verticals (Rides, Eats, Move)
5. **Refund Policy** -- Add per-service refund timelines (Flights vs Hotels vs Rides vs Eats)

### New Pages Needed
1. **Accessibility Statement** (`/accessibility`) -- Required for US compliance; simple WCAG 2.1 AA commitment
2. **Do Not Sell My Info** (`/do-not-sell`) -- CCPA requirement for California users

### Footer Legal Links
Update footer to show only the 6-8 core legal pages instead of linking to 78+ pages.

---

## PART 4: UX/UI & DESIGN Updates

### A. More Photography / Visual Richness

1. **Homepage Hero** -- Already uses premium local asset (`hero-homepage-premium.jpg`) -- good
2. **Service Cards** -- Use the existing `service-*.jpg` assets more prominently across the app
3. **Destination Grid** -- 24 destination photos already exist as local assets -- ensure all are displayed in a visual discovery section
4. **Hotel Type Cards** -- Use existing `hotel-luxury.jpg`, `hotel-boutique.jpg`, `hotel-spa.jpg`, etc. in category filters
5. **Car Model Gallery** -- 60+ car images exist but many pages show text-only; wire them into results and detail pages
6. **Flight Cabin Class** -- Use `cabin-business.jpg`, `cabin-first.jpg`, etc. in cabin class selector
7. **Lifestyle Sections** -- Use `lifestyle-business.jpg`, `lifestyle-family.jpg`, `lifestyle-solo.jpg` for personalized travel suggestions

### B. Mobile UX Improvements

1. **Bottom Sheet Polish** -- Rides bottom sheet needs better drag handle and smoother snap animations
2. **Eats Discovery** -- Restaurant grid needs larger food photography (hero image per restaurant)
3. **Search Tab** -- Unified search needs visual category icons (plane, hotel, car) instead of text tabs
4. **Trip Cards** -- My Trips view needs destination photos on booking cards
5. **Checkout** -- All checkout flows need consistent "Secure Vault" styling with trust badges

### C. Desktop UX Improvements

1. **Hotel Landing** -- Add immersive photo grid (Airbnb-style) for popular destinations
2. **Car Rental Landing** -- Add vehicle showcase carousel using existing car assets
3. **Flight Landing** -- Add "Popular Routes" with destination photography
4. **Homepage** -- Add visual travel inspiration section with destination photos

---

## PART 5: Implementation Priority

### Phase 1 (This Update -- Immediate)
1. Delete 13+ unnecessary pages listed above
2. Clean up Footer links (remove internal/dev page links)
3. Fix SavedAddressSelector DOM hack in Eats checkout (use `setValue`)
4. Add vehicle/ride type images to Rides (fix empty `image: ""` fields)
5. Wire existing car/hotel/cabin assets into their respective pages
6. Update Move page redirect URL and simplify
7. Consolidate legal footer to core 6-8 pages

### Phase 2 (Follow-up)
1. Wire Eats Stripe payment flow
2. Add hotel photo gallery from API
3. Flight results airline logos
4. Mobile search form improvements
5. Add Accessibility Statement and Do Not Sell pages
6. Remove 50+ redundant legal micro-pages

### Phase 3 (Polish)
1. Rides confirmation page with map
2. Eats delivery tracking map
3. Desktop photo-rich redesign for hotel/car landing pages
4. Trip cards with destination photos

---

## Technical Details

### Files to Delete (~13 pages)
```text
src/pages/RidesComingSoon.tsx
src/pages/EatsComingSoon.tsx
src/pages/FoodOrdering.tsx
src/pages/RiderApp.tsx
src/pages/EcosystemMap.tsx
src/pages/StrategicRoadmap.tsx
src/pages/StrategicPartnerships.tsx
src/pages/InvestorRelations.tsx
src/pages/FinancialTransparency.tsx
src/pages/HowZivoMakesMoney.tsx
src/pages/TrackingTest.tsx
src/pages/Creators.tsx
src/pages/Events.tsx
```

### Files to Edit
- `src/components/Footer.tsx` -- Simplify legal links section
- `src/pages/EatsCheckout.tsx` -- Fix SavedAddressSelector to use `setValue`
- `src/pages/Rides.tsx` -- Add vehicle images to ride options
- `src/pages/Move.tsx` -- Simplify to "Coming Soon" with signup
- `src/pages/HotelLanding.tsx` -- Add hotel type images from assets
- `src/pages/CarRentalLanding.tsx` -- Add car showcase carousel
- `src/pages/FlightSearch.tsx` -- Add cabin class images
- `src/config/restaurantPhotos.ts` -- Upgrade to higher-resolution images
- `src/App.tsx` -- Remove routes for deleted pages

### Assets Already Available (no new uploads needed)
- 24 destination photos (dest-*.jpg)
- 60+ car model photos (car-*.jpg)
- 8 hotel type photos (hotel-*.jpg)
- 4 cabin class photos (cabin-*.jpg)
- 4 lifestyle photos (lifestyle-*.jpg)
- 7 service hero photos (hero-*.jpg + service-*.jpg)
- 8 extras photos (extras-*.jpg)

### Stripe Live Key
Still waiting for user to paste `pk_live_...` key. This blocks all payment flows across Rides, Eats, and Travel.

