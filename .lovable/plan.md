

# ZIVO Travel (Flights, Hotels, Cars) - OTA Platform Build

## Executive Summary

This plan refactors the existing ZIVO platform to create a **dedicated OTA (Online Travel Agency)** experience for Flights, Hotels, and Car Rentals only. The goal is to build a clean, modern booking flow that hands off to partner checkout—no payment processing on ZIVO.

---

## Current State Analysis

The existing codebase already has robust foundations:
- **Flight Search**: Full API integration with Aviasales, results pages, filters, detail pages
- **Hotel Search**: Booking.com affiliate integration, results with filters
- **Car Rental**: Partner deep links, search forms, results pages
- **Auth System**: Supabase auth with email/password and social login
- **Tracking**: Comprehensive affiliate click logging and SubID system
- **Admin**: Settings module, click analytics, A/B testing dashboard
- **Legal**: Privacy Policy, Terms of Service, Partner Agreement pages

**Gaps to Address:**
1. No dedicated "Traveler Info" collection page before partner handoff
2. No booking return/callback handling page
3. No unified "Trips" page showing travel booking history (current is Rides-focused)
4. Missing `/cookies` standalone page
5. No `/partner-disclosure` dedicated page
6. Admin panel lacks partner checkout URL configuration
7. No database models for SearchSession, Offer, Traveler, PartnerRedirectLog

---

## Implementation Plan

### Phase 1: Database Schema Updates

Create new tables for the travel booking flow:

**New Tables:**
```text
┌─────────────────────────────────────────────────────────────────┐
│ travel_search_sessions                                          │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                   │
│ user_id (uuid, FK → auth.users, nullable for guests)           │
│ session_id (text) - anonymous session tracking                  │
│ service_type (enum: flights, hotels, cars)                      │
│ search_params (jsonb) - origin, destination, dates, etc.       │
│ created_at (timestamptz)                                        │
│ expires_at (timestamptz)                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ travel_offers                                                    │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                   │
│ search_session_id (uuid, FK → travel_search_sessions)          │
│ service_type (enum: flights, hotels, cars)                      │
│ partner_id (text) - aviasales, booking, economybookings        │
│ offer_data (jsonb) - price, provider, details                  │
│ is_selected (boolean)                                           │
│ created_at (timestamptz)                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ travel_bookings                                                  │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                   │
│ user_id (uuid, FK → auth.users, nullable)                      │
│ email (text) - for guest bookings                               │
│ offer_id (uuid, FK → travel_offers)                            │
│ service_type (enum: flights, hotels, cars)                      │
│ traveler_info (jsonb) - name, email, phone, consent            │
│ partner_booking_ref (text, nullable)                            │
│ status (enum: pending, redirected, completed, failed)          │
│ partner_redirect_url (text)                                     │
│ created_at (timestamptz)                                        │
│ updated_at (timestamptz)                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ partner_redirect_logs                                            │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                   │
│ booking_id (uuid, FK → travel_bookings)                        │
│ partner_id (text)                                               │
│ redirect_url (text)                                             │
│ redirect_mode (enum: redirect, iframe)                          │
│ ip_address (inet)                                               │
│ user_agent (text)                                               │
│ created_at (timestamptz)                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ partner_checkout_config                                          │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                   │
│ service_type (enum: flights, hotels, cars)                      │
│ partner_id (text)                                               │
│ partner_name (text)                                             │
│ checkout_url_template (text) - with placeholders                │
│ checkout_mode (enum: redirect, iframe)                          │
│ is_active (boolean)                                             │
│ priority (int) - for multi-partner ordering                     │
│ updated_by (uuid, FK → auth.users)                             │
│ updated_at (timestamptz)                                        │
└─────────────────────────────────────────────────────────────────┘
```

**RLS Policies:**
- Users can read/update their own bookings
- Guests identified by email can view their bookings
- Partner config is admin-only write, public read for active partners
- Search sessions are session-based (no auth required)

---

### Phase 2: Landing Page Enhancement

**Update `/` (Index.tsx):**

For ZIVO Travel OTA focus:
- Update headline to "Book Flights, Hotels & Cars in One Place"
- Show only Travel tabs (Flights | Hotels | Cars)
- Remove Rides, Eats, Move references from the OTA landing
- Add footer disclaimer: "ZIVO is not the merchant of record. Travel bookings are fulfilled by licensed third-party providers."

**Files to Modify:**
- `src/pages/Index.tsx` - Conditionally render OTA-focused content
- `src/components/home/ServicesGrid.tsx` - Travel-only grid option
- `src/components/home/OneAppSection.tsx` - Update messaging for travel focus

---

### Phase 3: Traveler Info Page

**New Route: `/booking/traveler-info`**

A new page that collects traveler information before partner handoff:

**Component:** `src/pages/TravelerInfoPage.tsx`

**Features:**
- Stepper showing: Search → Choose → Details → **Traveler Info** → Checkout
- Form fields: Full Name, Email, Phone
- Summary of selected offer (flight/hotel/car details, price)
- Consent checkbox: "I agree to share my information with the booking partner."
- Partner disclosure text
- "Continue to Secure Checkout" button
- Guest flow (no login required, email mandatory)
- Save to `travel_bookings` table before redirect

**Form Schema (Zod):**
```typescript
const travelerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  consentSharing: z.literal(true),
});
```

---

### Phase 4: Partner Checkout Handoff

**Enhance `/out` (OutboundRedirect.tsx):**

Add support for booking-mode redirects:
- Accept `bookingId` parameter
- Log to `partner_redirect_logs` table
- Update booking status to "redirected"
- Support future iframe checkout (check `partner_checkout_config.checkout_mode`)

**New Component:** `PartnerCheckoutIframe.tsx`
- For partners that support iframe embedding
- Sandbox with: allow-scripts, allow-same-origin, allow-forms, allow-popups
- Fallback redirect after 5s timeout (X-Frame-Options blocking)

---

### Phase 5: Booking Return Page

**New Route: `/booking/return`**

**Component:** `src/pages/BookingReturnPage.tsx`

**Features:**
- Parse callback parameters: `?bookingRef=XXX&status=success|failed`
- Update `travel_bookings.partner_booking_ref` and status
- Success state: Confirmation card with booking reference, "Add to My Trips" button
- Failure state: Error message with "Try Again" and "Contact Support" options
- Email confirmation trigger (optional, via Edge Function)

---

### Phase 6: Travel Trips Page

**Refactor `/trips` (TripHistory.tsx):**

Create a unified Trips page for travel bookings (not Rides):

**Component:** `src/pages/TravelTrips.tsx`

**Features:**
- Tabs: Upcoming | Past | All
- Query `travel_bookings` joined with `travel_offers`
- Display cards for each booking type (Flight, Hotel, Car)
- Show: Service type icon, route/destination, dates, price, booking ref, status badge
- "View Details" links to partner confirmation or details page
- Guest view: Lookup by email + booking reference

---

### Phase 7: Legal Pages

**New Pages:**

1. **`/cookies`** - Dedicated Cookie Policy page
   - Extract cookies section from Privacy Policy into standalone page
   - Cookie types, purposes, management instructions
   
2. **`/partner-disclosure`** - Partner Disclosure page
   - Explain affiliate relationship with travel partners
   - List active partners (Aviasales, Booking.com, EconomyBookings, etc.)
   - Commission disclosure
   - Link to individual partner terms

**Files:**
- `src/pages/legal/CookiesPolicy.tsx`
- `src/pages/legal/PartnerDisclosure.tsx`

---

### Phase 8: Admin Panel Enhancements

**New Admin Module:** `AdminPartnerConfigModule.tsx`

**Features:**
- List all partner checkout configurations
- Add/Edit partner: name, checkout URL template, mode (redirect/iframe), active status
- Test redirect button (opens in new tab)
- Priority ordering for multi-partner scenarios
- Audit log of changes

**Enhance Existing:**
- `AdminClicksModule.tsx` - Add travel booking conversion metrics
- `AdminSettingsModule.tsx` - Add travel-specific toggles

---

### Phase 9: Routing Updates

**Update `src/App.tsx`:**

```typescript
// New travel booking flow routes
<Route path="/booking/traveler-info" element={<TravelerInfoPage />} />
<Route path="/booking/return" element={<BookingReturnPage />} />

// Updated trips route for travel
<Route path="/trips" element={<TravelTrips />} />

// New legal pages
<Route path="/cookies" element={<CookiesPolicy />} />
<Route path="/partner-disclosure" element={<PartnerDisclosure />} />

// Admin partner config
<Route path="/admin/partners" element={<ProtectedRoute requireAdmin><AdminPartnerConfigModule /></ProtectedRoute>} />
```

---

### Phase 10: Environment Variables

**Required Variables:**
```text
# Partner Checkout URLs (fallback defaults in code)
VITE_FLIGHTS_PARTNER_URL=https://tp.media/r?marker=700031&...
VITE_HOTELS_PARTNER_URL=https://www.booking.com/...
VITE_CARS_PARTNER_URL=https://economybookings.com/...

# Enable iframe mode per partner
VITE_CHECKOUT_MODE_FLIGHTS=redirect
VITE_CHECKOUT_MODE_HOTELS=redirect
VITE_CHECKOUT_MODE_CARS=redirect
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/xxx_travel_booking_tables.sql` | Create | Database schema for travel bookings |
| `src/pages/TravelerInfoPage.tsx` | Create | Traveler info collection form |
| `src/pages/BookingReturnPage.tsx` | Create | Partner callback handler |
| `src/pages/TravelTrips.tsx` | Create | Travel booking history |
| `src/pages/legal/CookiesPolicy.tsx` | Create | Cookie policy page |
| `src/pages/legal/PartnerDisclosure.tsx` | Create | Partner disclosure page |
| `src/pages/admin/modules/AdminPartnerConfigModule.tsx` | Create | Partner URL configuration |
| `src/components/booking/TravelerInfoForm.tsx` | Create | Form component with validation |
| `src/components/booking/BookingSummaryCard.tsx` | Create | Selected offer summary |
| `src/components/booking/PartnerCheckoutIframe.tsx` | Create | Iframe checkout wrapper |
| `src/hooks/useTravelBookings.ts` | Create | Booking CRUD operations |
| `src/pages/Index.tsx` | Modify | Add OTA-focused variant |
| `src/pages/OutboundRedirect.tsx` | Modify | Support booking-mode redirects |
| `src/pages/TripHistory.tsx` | Modify | Redirect to new TravelTrips or keep for Rides |
| `src/pages/admin/AdminPanel.tsx` | Modify | Add Partners nav item |
| `src/App.tsx` | Modify | Add new routes |
| `src/integrations/supabase/types.ts` | Modify | Add generated types after migration |

---

## Testing Checklist

1. **Search Flow**: Search → Results → Select offer → Traveler Info
2. **Guest Booking**: Complete flow without login
3. **Authenticated Booking**: Complete flow with logged-in user
4. **Partner Redirect**: Click "Continue to Checkout" → lands on partner site
5. **Booking Return**: Return from partner → see confirmation
6. **Trips Page**: View past bookings, filter by type
7. **Admin Config**: Add/edit partner URLs, toggle modes
8. **Legal Pages**: Navigate to /cookies, /partner-disclosure
9. **Mobile Flow**: Responsive stepper, touch-friendly forms
10. **Error Handling**: Invalid booking refs, failed redirects

---

## Technical Notes

- **No Payment Processing**: ZIVO collects traveler info only; payments happen on partner sites
- **Mock Data Ready**: Current flight generator provides realistic mock inventory
- **Partner URL Templates**: Support placeholders like `{origin}`, `{destination}`, `{date}`
- **RLS Security**: All booking data protected by row-level security
- **Offline-Ready**: Use React Query caching for trips data

