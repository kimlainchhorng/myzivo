
# ZIVO Production + Scale Readiness Implementation

## Overview

This plan prepares ZIVO for production deployment with real users, affiliate approvals, payment processing, support workflows, SEO traffic, and mobile apps. The implementation builds on ZIVO's substantial existing infrastructure while adding missing components for production readiness.

## Current State Assessment

### Already Implemented (Existing)

| Feature | Status | Location |
|---------|--------|----------|
| **User Authentication** | Complete | `AuthContext.tsx`, `Login.tsx`, `Signup.tsx` |
| **Social Login (Google/Apple/Facebook)** | Complete | OAuth in AuthContext with `signInWithProvider` |
| **User Profile** | Complete | `Profile.tsx` with avatar, name, phone, status |
| **Customer Dashboard** | Complete | `CustomerDashboard.tsx` with tabs for all services |
| **Checkout Flow (Flights)** | Complete | `FlightTravelerInfo.tsx` → `FlightCheckout.tsx` → `FlightConfirmation.tsx` |
| **Price Breakdown** | Complete | `FlightPriceBreakdown.tsx` component |
| **Help Center** | Complete | `HelpCenter.tsx` with FAQs, contact, ticket system |
| **SEO City Pages** | Partial | `FlightCityPage.tsx` at `/flights/cities/:citySlug` |
| **Analytics Tracking** | Complete | `useEventTracking.ts`, `analytics_events` table |
| **Security Pages** | Complete | `Security.tsx`, `SecurityIncident.tsx` |
| **Error Handling (No Results)** | Complete | Empty states in result pages |
| **Mobile-First Design** | Complete | Bottom nav, touch targets, app-style cards |
| **Travelers Table** | Partial | Basic `travelers` table exists but not user-linked |

### Missing/Needs Enhancement

| Feature | Status | Required |
|---------|--------|----------|
| **Saved Travelers System** | Missing | User-linked persistent profiles |
| **Saved Payment Methods UI** | Missing | Stripe stored cards display |
| **User Email Preferences** | Missing | Marketing opt-in/out settings |
| **Price Changed Warning** | Missing | Real-time price validation |
| **Partner Unavailable Fallback** | Missing | Graceful degradation |
| **SEO Destination Pages** | Partial | Need `/flights/to/:city` routes |
| **Analytics Admin Dashboard** | Partial | Need consolidated view |
| **Session Timeout Handling** | Missing | Auth expiry detection |

---

## Implementation Phases

### Phase 1: Saved Travelers System

Create a persistent traveler profiles system linked to user accounts for auto-fill during checkout.

**Database Migration:**
```text
saved_travelers
- id: uuid (PK)
- user_id: uuid (FK → auth.users, ON DELETE CASCADE)
- traveler_type: text ('adult' | 'child' | 'infant')
- title: text
- given_name: text
- family_name: text
- born_on: date
- gender: text
- email: text
- phone_number: text
- passport_number: text (encrypted)
- passport_expiry: date
- passport_country: text
- nationality: text
- known_traveler_number: text
- is_primary: boolean (default false)
- created_at, updated_at
- UNIQUE(user_id, given_name, family_name, born_on)
```

RLS Policies:
- Users can only view/edit their own travelers
- Insert requires authentication

**New Files:**
- `src/hooks/useSavedTravelers.ts` - CRUD operations for saved travelers
- `src/components/travel/SavedTravelersManager.tsx` - UI for managing travelers
- `src/components/travel/TravelerAutoFill.tsx` - Dropdown for selecting saved travelers

**Integration Points:**
- Add to `FlightTravelerInfo.tsx` - Auto-fill from saved travelers
- Add to `Profile.tsx` - Quick Links section for "Saved Travelers"

### Phase 2: User Dashboard Enhancements

**2A: Saved Payment Methods Display**

The platform uses Stripe for payments. We'll add a component to display saved cards.

**New Files:**
- `src/components/payment/SavedPaymentMethods.tsx` - Lists user's Stripe saved cards
- `src/hooks/usePaymentMethods.ts` - Fetches saved payment methods via edge function

**Edge Function:** `get-payment-methods`
- Calls Stripe Customer API to list payment methods
- Returns masked card info (last 4, brand, expiry)

**2B: Email Preferences**

**Database Migration:**
```text
user_email_preferences
- id: uuid
- user_id: uuid (unique)
- marketing_emails: boolean (default true)
- price_alerts: boolean (default true)
- booking_updates: boolean (default true)
- newsletter: boolean (default true)
- updated_at
```

**New Files:**
- `src/hooks/useEmailPreferences.ts`
- `src/components/settings/EmailPreferences.tsx`

**Integration:**
- Add to Profile page in Settings quick link
- Use in email sending edge functions

### Phase 3: Checkout UX Improvements

**3A: Price Changed Warning**

Add real-time price validation before payment.

**New Component:** `src/components/checkout/PriceChangedWarning.tsx`
- Shows when offer price differs from stored price
- Options: Continue at new price / Cancel

**Integration:**
- Add to `FlightCheckout.tsx` before payment button
- Fetch fresh offer price on checkout load
- Compare with session-stored price

**3B: Billing Address Collection**

**New Component:** `src/components/checkout/BillingAddressForm.tsx`
- Country, State, City, ZIP, Address line
- Pass to Stripe checkout session

**3C: Apple Pay / Google Pay Placeholders**

Update `FlightPaymentModal.tsx`:
- Already has placeholders for Apple Pay, Google Pay, PayPal
- Add "Coming Soon" tooltip on disabled buttons

### Phase 4: Error Handling & Edge Cases

**4A: Partner Unavailable Fallback**

**New Component:** `src/components/shared/PartnerUnavailable.tsx`
- Friendly message when API fails
- Retry button
- Alternative suggestions

**Integration:**
- Wrap flight/hotel/car results with error boundary
- Show fallback on API errors

**4B: Session Timeout Handling**

**New Hook:** `src/hooks/useSessionTimeout.ts`
- Monitor session expiry
- Show warning modal 5 minutes before expiry
- Auto-redirect to login on expiry

**New Component:** `src/components/auth/SessionTimeoutWarning.tsx`
- Modal warning about session expiry
- "Stay signed in" button to refresh session

### Phase 5: SEO & Growth Foundation

**5A: Indexable Destination Pages**

Create route pattern `/flights/to/:city` for organic SEO.

**New Routes in App.tsx:**
```tsx
<Route path="/flights/to/:citySlug" element={<FlightToCity />} />
<Route path="/flights/:origin-to-:destination" element={<FlightRoutePage />} />
```

**New Pages:**
- `src/pages/seo/FlightToCity.tsx` - Flights TO a city
- `src/pages/seo/FlightRoutePage.tsx` - Specific route (e.g., /flights/new-york-to-london)

**SEO Metadata:**
- Dynamic title: "Flights to {City} from ${price} | ZIVO"
- Structured data (FlightSearch schema)
- Canonical URLs

**5B: Schema-Ready Metadata**

**New Component:** `src/components/seo/TravelServiceSchema.tsx`
- Generates JSON-LD for travel services
- Supports flights, hotels, cars

### Phase 6: Admin Analytics Dashboard

**6A: Consolidated Analytics View**

**New Page:** `src/pages/admin/AnalyticsDashboard.tsx`

Route: `/admin/analytics`

Metrics Display:
- Total searches (by service)
- Total clicks (outbound partner clicks)
- Bookings count
- Conversion rates (search → click → book)
- Revenue tracking

Data Sources:
- `analytics_events` table (already tracking)
- `outbound_click_log` table
- `travel_orders` table

**6B: Conversion Tracking Placeholders**

Update `src/components/analytics/ConversionPixel.tsx`:
- Google Analytics 4 event structure
- Facebook Pixel event structure
- Ready for user to add their tracking IDs

### Phase 7: Customer Support Enhancement

**7A: Support Page Updates**

Update `HelpCenter.tsx`:
- Add "How Booking Works" section
- Add "Baggage Rules" section
- Enhance contact options with response time notice

**New FAQ Sections:**
- How booking works (step-by-step)
- Changes & cancellations
- Baggage rules by airline

**7B: Partner Support Routing**

Add clear messaging:
```text
"Booking issues (refunds, changes, cancellations):
Contact your travel partner directly using the details in your confirmation email.

Technical issues (website, app, account):
Contact ZIVO Support at support@hizivo.com"
```

### Phase 8: Mobile App Readiness

**8A: Verify Mobile-First Components**

Audit all new components for:
- Touch targets ≥ 44px
- Bottom navigation compatibility
- Safe area insets
- App-style cards and spacing

**8B: PWA Optimization**

Already has `vite-plugin-pwa`. Verify:
- Service worker caching strategies
- Offline fallback pages
- Install prompt on mobile

### Phase 9: Business & Partner Pages

**9A: Partner with ZIVO Page**

**New Page:** `src/pages/business/PartnerWithZivo.tsx`

Route: `/partner-with-zivo`

Content:
- For airlines, hotels, car rental companies
- For affiliate marketers
- Contact form for partnership inquiries

**9B: Update Existing Legal Pages**

Already have most pages. Verify copy includes:
- Partner Disclosure: "ZIVO acts as a booking facilitator and sub-agent"
- Seller of Travel: CA/FL registration status
- Affiliate Disclosure: Commission disclosure

---

## File Changes Summary

### New Files to Create

| File | Description |
|------|-------------|
| `supabase/migrations/xxx_saved_travelers.sql` | Saved travelers table + email preferences |
| `src/types/travelers.ts` | TypeScript types for travelers |
| `src/hooks/useSavedTravelers.ts` | CRUD hook for saved travelers |
| `src/hooks/usePaymentMethods.ts` | Fetch Stripe payment methods |
| `src/hooks/useEmailPreferences.ts` | User email preferences |
| `src/hooks/useSessionTimeout.ts` | Session expiry monitoring |
| `src/components/travel/SavedTravelersManager.tsx` | Manage saved travelers UI |
| `src/components/travel/TravelerAutoFill.tsx` | Auto-fill dropdown |
| `src/components/payment/SavedPaymentMethods.tsx` | Display saved cards |
| `src/components/settings/EmailPreferences.tsx` | Email preference toggles |
| `src/components/checkout/PriceChangedWarning.tsx` | Price validation warning |
| `src/components/checkout/BillingAddressForm.tsx` | Billing address collection |
| `src/components/shared/PartnerUnavailable.tsx` | API error fallback |
| `src/components/auth/SessionTimeoutWarning.tsx` | Session expiry modal |
| `src/pages/seo/FlightToCity.tsx` | SEO city landing page |
| `src/pages/seo/FlightRoutePage.tsx` | SEO route page |
| `src/pages/admin/AnalyticsDashboard.tsx` | Consolidated analytics |
| `src/pages/business/PartnerWithZivo.tsx` | Partnership page |
| `supabase/functions/get-payment-methods/index.ts` | Stripe payment methods API |

### Files to Update

| File | Changes |
|------|---------|
| `src/pages/FlightTravelerInfo.tsx` | Add saved travelers auto-fill |
| `src/pages/FlightCheckout.tsx` | Add price validation, billing address |
| `src/pages/Profile.tsx` | Add saved travelers quick link |
| `src/pages/HelpCenter.tsx` | Add new FAQ sections |
| `src/App.tsx` | Add new routes |
| `src/components/Header.tsx` | Session timeout listener |

---

## Database Schema Changes

### New Tables

**saved_travelers**
- Stores user's frequently used traveler profiles
- Encrypted passport data
- Primary traveler flag for quick selection

**user_email_preferences**
- Marketing communication preferences
- Price alert preferences
- Booking update preferences

### RLS Policies

All new tables will have:
- Users can only access their own data
- Insert/Update requires authentication
- No public access

---

## Technical Considerations

### Security
- Passport numbers stored encrypted using Supabase Vault
- Stripe payment method IDs only (no raw card data)
- Session timeout forces re-authentication

### Performance
- Lazy load new components
- Cache saved travelers in React Query
- Prefetch email preferences on profile load

### Compliance
- Clear consent for data storage
- Delete travelers on account deletion (cascade)
- Email preferences honor GDPR/CCPA

---

## Success Criteria

After implementation:
- Users can save and reuse traveler profiles
- Users can view saved payment methods
- Users control email preferences
- Price changes are detected before payment
- SEO pages rank for destination searches
- Admin has visibility into conversion metrics
- Support flow clearly routes to partners
- Mobile experience is production-ready
