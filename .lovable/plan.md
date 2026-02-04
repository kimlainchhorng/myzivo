
# ZIVO Mobile App Structure: iOS & Android Enhancement Plan

## Executive Summary

This plan restructures ZIVO's mobile app experience to match top travel apps (Booking, Expedia, Skyscanner) with a clean 5-tab navigation: **Home | Search | Trips | Alerts | Account**. The current architecture has a solid foundation with existing components (`ZivoSuperAppNav`, `MyTripsPage`, `PriceAlertsDashboard`, `Profile`), but requires restructuring navigation and creating dedicated mobile-first screens.

---

## Current State vs. Target State

| Aspect | Current | Target |
|--------|---------|--------|
| Bottom nav tabs | Home, Travel, Rides, Eats, More | Home, Search, Trips, Alerts, Account |
| Search experience | Split across multiple pages | Unified Search tab with Flights/Hotels/Cars tabs |
| Trips view | `/my-trips` with service filters | Dedicated Trips tab with Upcoming/Past sections |
| Price alerts | Buried in Profile page | Dedicated Alerts tab with notification management |
| Account | Full Profile page with many sections | Streamlined Account tab with quick links |
| Home screen | Multi-service grid | Travel-focused with search box, deals, trending |

---

## Implementation Phases

### Phase 1: Create New Mobile Navigation

**File:** `src/components/app/ZivoMobileNav.tsx` (NEW)

New travel-focused 5-tab navigation:

| Tab | Icon | Path | Description |
|-----|------|------|-------------|
| Home | `Home` | `/` | Main discovery screen |
| Search | `Search` | `/search` | Unified search with tabs |
| Trips | `Briefcase` | `/trips` | Upcoming & past bookings |
| Alerts | `Bell` | `/alerts` | Price drop notifications |
| Account | `User` | `/account` | Profile & settings |

**Design Notes:**
- 64px height with safe area inset
- 48px touch targets
- Active state: filled icon + pill background + bold label
- Inactive: outlined icon + muted label

---

### Phase 2: Create Mobile Home Screen

**File:** `src/pages/mobile/MobileHome.tsx` (NEW)

Content sections:

```text
┌────────────────────────────────────────┐
│ Good morning, John 👋                   │
│ Where to today?                        │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │ 🔍 Flight Search Box               │ │
│ │ From    │    To                    │ │
│ │ Dates   │    Passengers            │ │
│ │ [Search Flights]                   │ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│ [✈️ Flights] [🏨 Hotels] [🚗 Cars]     │
│ Quick tabs - highlight Flights         │
├────────────────────────────────────────┤
│ 🔥 Best Deals Today                    │
│ [Deal 1] [Deal 2] [Deal 3] →          │
├────────────────────────────────────────┤
│ 🌎 Trending Destinations               │
│ [City 1] [City 2] [City 3] →          │
├────────────────────────────────────────┤
│ 🕐 Recently Searched (if logged in)   │
│ [Route 1] [Route 2] →                  │
├────────────────────────────────────────┤
│ 🛡️ Compare prices from trusted        │
│    travel partners.                    │
└────────────────────────────────────────┘
```

**Features:**
- Integrated `FlightSearchFormPro` in compact mode
- Quick service tabs (Flights highlighted by default)
- Horizontal scroll carousels for deals/destinations
- Recently searched routes (persisted in localStorage/Supabase)
- Trust strip with partner logos

---

### Phase 3: Create Unified Search Screen

**File:** `src/pages/mobile/MobileSearch.tsx` (NEW)

Full-screen search experience with sub-tabs:

```text
┌────────────────────────────────────────┐
│ ← Search                               │
├────────────────────────────────────────┤
│ [✈️ Flights] [🏨 Hotels] [🚗 Cars]     │
│ (Tabs with colored underline)          │
├────────────────────────────────────────┤
│                                        │
│ FLIGHTS TAB:                           │
│ ┌──────────────────────────────────┐  │
│ │ From: ____________________       │  │
│ │ To:   ____________________       │  │
│ │ Departure: _______ Return: _____ │  │
│ │ Passengers: 1 Adult, Economy     │  │
│ └──────────────────────────────────┘  │
│                                        │
│ [🔍 Search Flights]                    │
│                                        │
├────────────────────────────────────────┤
│ Popular Routes                         │
│ NYC → LA  ·  $99                       │
│ CHI → MIA ·  $129                      │
└────────────────────────────────────────┘
```

**Components:**
- Reuses existing `FlightSearchFormPro`, `HotelSearchFormPro`, `CarSearchFormPro`
- Full-screen overlays for location/date pickers
- Skeleton loaders during search
- Redirects to results pages on submit

---

### Phase 4: Enhance Search Results (Mobile)

**Updates to:** `src/pages/FlightResults.tsx`

Mobile-specific enhancements:

```text
┌────────────────────────────────────────┐
│ JFK → LAX · Feb 15 · 1 Adult           │
│ [Edit Search]                          │
├────────────────────────────────────────┤
│ Sort: Cheapest ▼                       │
│ [Filters] (badge with count)           │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │ [Delta Logo]                       │ │
│ │ 06:30 ────✈️──── 09:45            │ │
│ │ JFK           LAX                  │ │
│ │ 5h 30m · Nonstop                   │ │
│ │                                    │ │
│ │ ⭐ Best Deal         [$199] →     │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ [United Logo]                      │ │
│ │ 08:15 ────✈️──── 11:30            │ │
│ │ JFK           LAX                  │ │
│ │ 5h 15m · Nonstop                   │ │
│ │                        [$215] →   │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
│ [Filter]  [Sort]                       │
└────────────────────────────────────────┘
```

**Key Features:**
- Airline logo from CDN (already implemented)
- Departure/arrival times prominently displayed
- Stops and duration visible
- "Best deal" badge for cheapest option
- Bottom sheet for filters and sort (existing `FlightMobileResultsBar`)

---

### Phase 5: Create Flight Details Screen (Mobile)

**Updates to:** `src/pages/FlightDetails.tsx`

Mobile-optimized layout:

```text
┌────────────────────────────────────────┐
│ ← Flight Details                       │
├────────────────────────────────────────┤
│ [Delta Logo]                           │
│ Delta Air Lines · DL 123               │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ ITINERARY                          │ │
│ │                                    │ │
│ │ 06:30 ──────────────────── 09:45  │ │
│ │ JFK                        LAX    │ │
│ │ New York                   Los Angeles │
│ │                                    │ │
│ │ 5h 30m · Nonstop · Economy        │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 🧳 Baggage                         │ │
│ │ Carry-on: 1 × 7kg                  │ │
│ │ Checked:  1 × 23kg                 │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 📋 Fare Rules                      │ │
│ │ ✗ Non-refundable                   │ │
│ │ ✓ Changes allowed ($75 fee)        │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 🎫 Providers                       │ │
│ │ ┌──────────────────────────────┐  │ │
│ │ │ Booking.com          $199 ✓ │  │ │
│ │ └──────────────────────────────┘  │ │
│ │ ┌──────────────────────────────┐  │ │
│ │ │ Expedia              $205   │  │ │
│ │ └──────────────────────────────┘  │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
│ $199                                   │
│ [Continue to Secure Booking →]         │
└────────────────────────────────────────┘
```

**Features:**
- Full itinerary timeline
- Baggage and fare rules sections
- Provider comparison (if multi-provider)
- Sticky CTA at bottom

---

### Phase 6: Create Trips Screen

**File:** `src/pages/mobile/MobileTrips.tsx` (NEW)

Dedicated trips management:

```text
┌────────────────────────────────────────┐
│ My Trips                               │
├────────────────────────────────────────┤
│ [Upcoming] [Past]                      │
│ (Toggle tabs)                          │
├────────────────────────────────────────┤
│ UPCOMING                               │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ ✈️ New York → Los Angeles          │ │
│ │ Feb 15, 2026 · 10:30 AM            │ │
│ │ Delta DL 123                       │ │
│ │                                    │ │
│ │ Booking: ABC123XYZ                 │ │
│ │ Status: ✅ Confirmed               │ │
│ │                                    │ │
│ │ [Manage Booking →]                 │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 🏨 Marriott Downtown Miami         │ │
│ │ Feb 15-18, 2026                    │ │
│ │                                    │ │
│ │ Booking: HTL987654                 │ │
│ │ Status: ✅ Confirmed               │ │
│ │                                    │ │
│ │ [Manage Booking →]                 │ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│ PAST (when tab selected)              │
│ [Past trip cards with "Rebook" CTA]   │
└────────────────────────────────────────┘
```

**Features:**
- Upcoming/Past toggle
- Booking reference and ticket status
- "Manage booking" links to partner or internal page
- Pull-to-refresh

---

### Phase 7: Create Alerts Screen

**File:** `src/pages/mobile/MobileAlerts.tsx` (NEW)

Price alerts management:

```text
┌────────────────────────────────────────┐
│ Price Alerts 🔔                        │
├────────────────────────────────────────┤
│ [Active] [History]                     │
│ (Toggle tabs)                          │
├────────────────────────────────────────┤
│ ACTIVE ALERTS (3)                      │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 🔔 JFK → LAX                       │ │
│ │ Any dates in February              │ │
│ │ Target: $150 or less               │ │
│ │ Current: $199                      │ │
│ │                                    │ │
│ │ [Remove] [View Prices]             │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 🔔 NYC → MIA                       │ │
│ │ Mar 1-7, 2026                      │ │
│ │ Target: $100 or less               │ │
│ │ Current: $129                      │ │
│ │ 📉 Dropped $20 since yesterday!    │ │
│ │                                    │ │
│ │ [Remove] [Book Now!]               │ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│ [+ Track New Route]                    │
└────────────────────────────────────────┘

HISTORY TAB:
│ 📩 Price dropped to $89! (2 days ago) │
│ 📩 Alert expired (1 week ago)         │
```

**Features:**
- Active alerts with current price vs. target
- Price drop indicators
- Alert history (triggered/expired)
- "Track new route" CTA opens modal
- Integrates with existing `usePriceAlerts` hook

---

### Phase 8: Create Account Screen

**File:** `src/pages/mobile/MobileAccount.tsx` (NEW)

Streamlined account section:

```text
┌────────────────────────────────────────┐
│ Account                                │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │ [Avatar] John Doe                  │ │
│ │          john@email.com            │ │
│ │          ⭐ Gold Member            │ │
│ │ [Edit Profile →]                   │ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│ 👤 Saved Travelers              →     │
│ 📧 Email Preferences            →     │
│ 🔔 Notification Settings        →     │
│ 💳 Payment Methods              →     │
│ 🎁 ZIVO Rewards                 →     │
├────────────────────────────────────────┤
│ 📞 Support & Help               →     │
│ 📜 Terms of Service             →     │
│ 🔒 Privacy Policy               →     │
│ 📋 Partner Disclosure           →     │
├────────────────────────────────────────┤
│ [Log Out]                             │
└────────────────────────────────────────┘
```

**Features:**
- Profile summary card with avatar
- Quick links to settings sections
- Legal pages (Terms, Privacy, Partner Disclosure)
- Log out button

---

### Phase 9: Checkout & Confirmation (Mobile)

**Updates to:** Existing checkout pages

Mobile-optimized checkout flow:

```text
CHECKOUT SCREEN:
┌────────────────────────────────────────┐
│ 🔒 Secure Checkout                     │
│ You're being redirected to complete    │
│ your booking securely with our partner.│
├────────────────────────────────────────┤
│ [Loading spinner]                      │
│ Connecting to partner...               │
├────────────────────────────────────────┤
│ 🛡️ Secure payments                     │
│ ✅ Licensed providers                  │
│ 💰 No hidden fees                      │
└────────────────────────────────────────┘

CONFIRMATION SCREEN:
┌────────────────────────────────────────┐
│            ✅                          │
│ Thank You for Your Booking ✈️          │
│                                        │
│ Your booking request has been received.│
│ A confirmation email will be sent      │
│ once your ticket is issued.            │
├────────────────────────────────────────┤
│ Booking: ABC123XYZ                     │
│ Status:  Confirmed                     │
├────────────────────────────────────────┤
│ [View Booking]                         │
│ [Contact Support]                      │
│ [Back to Home]                         │
└────────────────────────────────────────┘
```

---

### Phase 10: Push Notifications Configuration

**File:** `src/config/pushNotifications.ts` (NEW)

Notification configuration:

```typescript
export const PUSH_NOTIFICATION_TYPES = {
  PRICE_DROP: {
    title: "Price Drop Alert! 📉",
    body: "Prices for {route} dropped to ${price}!",
  },
  BOOKING_CONFIRMED: {
    title: "Booking Confirmed ✅",
    body: "Your {service} booking is confirmed.",
  },
  TRIP_REMINDER: {
    title: "Trip Reminder 🗓️",
    body: "Your flight to {destination} departs in 24 hours.",
  },
};

export const NOTIFICATION_PREFERENCES = {
  priceAlerts: true,
  bookingConfirmations: true,
  tripReminders: true,
  marketing: false, // Default off
};
```

**Note:** Actual push notification implementation requires Capacitor or PWA service worker setup.

---

## File Summary

### New Files to Create

| File | Description |
|------|-------------|
| `src/components/app/ZivoMobileNav.tsx` | New 5-tab navigation (Home, Search, Trips, Alerts, Account) |
| `src/pages/mobile/MobileHome.tsx` | Travel-focused home with search box and deals |
| `src/pages/mobile/MobileSearch.tsx` | Unified search with Flights/Hotels/Cars tabs |
| `src/pages/mobile/MobileTrips.tsx` | Upcoming & past bookings management |
| `src/pages/mobile/MobileAlerts.tsx` | Price alerts dashboard |
| `src/pages/mobile/MobileAccount.tsx` | Streamlined account settings |
| `src/pages/mobile/index.ts` | Barrel export for mobile pages |
| `src/config/pushNotifications.ts` | Push notification templates |

### Files to Update

| File | Changes |
|------|---------|
| `src/App.tsx` | Add routes for new mobile pages |
| `src/components/app/ZivoSuperAppLayout.tsx` | Add option for new nav variant |
| `src/pages/FlightResults.tsx` | Mobile-specific result card enhancements |
| `src/pages/FlightDetails.tsx` | Mobile layout optimization |

---

## Technical Considerations

### Design Rules (from spec)

| Rule | Implementation |
|------|----------------|
| Touch-friendly buttons | 48px+ min height, 44px+ touch targets |
| Clear typography | 16px base, bold headings, muted secondary |
| Fast loading | Skeleton loaders on all async content |
| Skeleton loaders | Existing `ResultCardSkeleton` reused |
| One-hand usability | Important actions in bottom 60% of screen |

### Performance

- Code-split mobile pages using lazy loading
- Use existing hooks (`useDuffelFlightSearch`, `useUnifiedTrips`, `usePriceAlerts`)
- Leverage React Query caching for search results
- Skeleton loaders while data fetches

### Navigation Detection

Auto-detect mobile context using existing `useIsMobile()` hook and route accordingly.

---

## Summary

This plan transforms ZIVO into a professional travel app experience matching Booking, Expedia, and Skyscanner. The new 5-tab navigation (Home | Search | Trips | Alerts | Account) provides a cleaner user journey focused on the core travel booking workflow. All new components build on existing infrastructure (search forms, trips hooks, price alerts, profile) while optimizing the mobile experience with proper touch targets, skeleton loaders, and one-hand usability.
