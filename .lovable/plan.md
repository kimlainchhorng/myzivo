

# ZIVO Full Hotelbeds Integration Plan
## Hotels + Activities + Transfers - Complete API Integration

---

## Executive Summary

Transform ZIVO from an affiliate-redirect travel platform to a **full-service booking platform** using Hotelbeds APIs for Hotels, Activities, and Transfers. Users will search, view real prices, and complete bookings entirely within ZIVO without external redirects.

---

## Current State Analysis

### Hotels
- **Current**: Displays indicative (mock) prices and redirects users to Booking.com affiliate
- **Components**: `HotelsPage.tsx`, `HotelResultCard.tsx`, `HotelFilters.tsx`
- **Hook**: `useRealHotelSearch` generates fake hotel data
- **Backend**: TripAdvisor Content API for discovery (no booking)

### Activities  
- **Current**: Affiliate redirects to Tiqets, WeGoTrip, TicketNetwork
- **Page**: `ThingsToDo.tsx` with hardcoded experiences
- **No real search** - just static content with partner links

### Transfers
- **Current**: Affiliate redirects to KiwiTaxi, GetTransfer, Intui.travel
- **Component**: `AirportTransfersSection.tsx` 
- **No search** - displays partner cards with external links

---

## Target Architecture

```text
+------------------+     +----------------------+     +------------------+
|   ZIVO Frontend  | --> | Supabase Edge Fns    | --> | Hotelbeds APIs   |
+------------------+     +----------------------+     +------------------+
     |                          |                           |
     | Search/Book              | Secure Auth               | Hotels API
     | Requests                 | Rate Limiting             | Activities API
     |                          | Error Handling            | Transfers API
     v                          v                           v
+------------------+     +----------------------+     +------------------+
| React Pages      |     | hotelbeds-hotels     |     | /hotel-api/1.0   |
| - Search Forms   |     | hotelbeds-activities |     | /activity-api/1.0|
| - Results Lists  |     | hotelbeds-transfers  |     | /transfer-api/1.0|
| - Checkout Flows |     +----------------------+     +------------------+
+------------------+
```

---

## Phase 1: Secrets Configuration

### Required Environment Variables

**Hotels API**:
- `HOTELBEDS_HOTEL_API_KEY`
- `HOTELBEDS_HOTEL_SECRET`

**Activities API**:
- `HOTELBEDS_ACTIVITY_API_KEY`
- `HOTELBEDS_ACTIVITY_SECRET`

**Transfers API**:
- `HOTELBEDS_TRANSFER_API_KEY`
- `HOTELBEDS_TRANSFER_SECRET`

**Shared**:
- `HOTELBEDS_BASE_URL` = `https://api.test.hotelbeds.com` (TEST environment)

All secrets are stored in Supabase Edge Function secrets - never exposed to frontend.

---

## Phase 2: Edge Functions

### 2.1 Hotels Edge Function: `hotelbeds-hotels`

**File**: `supabase/functions/hotelbeds-hotels/index.ts`

**Actions**:
| Action | Method | Hotelbeds Endpoint | Purpose |
|--------|--------|-------------------|---------|
| `status` | GET | `/hotel-api/1.0/status` | Health check |
| `search` | POST | `/hotel-api/1.0/hotels` | Availability search |
| `checkrates` | POST | `/hotel-api/1.0/checkrates` | Price verification |
| `book` | POST | `/hotel-api/1.0/bookings` | Create booking |

**Authentication** (applies to all):
```text
Headers:
  Api-key: {HOTELBEDS_HOTEL_API_KEY}
  X-Signature: SHA256_HEX(apiKey + secret + unixTimestampSeconds)
  Accept: application/json
  Content-Type: application/json
```

### 2.2 Activities Edge Function: `hotelbeds-activities`

**File**: `supabase/functions/hotelbeds-activities/index.ts`

**Actions**:
| Action | Method | Hotelbeds Endpoint | Purpose |
|--------|--------|-------------------|---------|
| `status` | GET | `/activity-api/1.0/status` | Health check |
| `search` | POST | `/activity-api/1.0/activities/availability` | Search activities |
| `details` | GET | `/activity-api/1.0/activities/{code}` | Activity details |
| `book` | POST | `/activity-api/1.0/bookings` | Create booking |

### 2.3 Transfers Edge Function: `hotelbeds-transfers`

**File**: `supabase/functions/hotelbeds-transfers/index.ts`

**Actions**:
| Action | Method | Hotelbeds Endpoint | Purpose |
|--------|--------|-------------------|---------|
| `status` | GET | `/transfer-api/1.0/status` | Health check |
| `availability` | POST | `/transfer-api/1.0/availability` | Search transfers |
| `book` | POST | `/transfer-api/1.0/bookings` | Create booking |

---

## Phase 3: TypeScript Types

**File**: `src/types/hotelbeds.ts`

```text
Types to define:
- HotelbedsHotel, HotelbedsRoom, HotelbedsRate
- HotelbedsActivity, ActivityModality, ActivityRate
- HotelbedsTransfer, TransferVehicle, TransferRate
- SearchRequest/Response types for each service
- BookingRequest/Response types for each service
- Common types: HotelbedsError, GuestInfo, PaymentInfo
```

---

## Phase 4: Frontend Hooks

### 4.1 Hotels Hooks

**File**: `src/hooks/useHotelbedsSearch.ts`
- `searchHotels(params)` - Search availability
- Transform Hotelbeds response to ZIVO format
- Handle loading, error, empty states

**File**: `src/hooks/useHotelbedsBooking.ts`
- `checkRates(rateKey)` - Verify current price
- `createBooking(params)` - Submit booking
- Handle rate changes and booking confirmation

### 4.2 Activities Hooks

**File**: `src/hooks/useHotelbedsActivities.ts`
- `searchActivities(destination, date)` - Search by location/date
- `getActivityDetails(code)` - Get full details
- `bookActivity(params)` - Create booking

### 4.3 Transfers Hooks

**File**: `src/hooks/useHotelbedsTransfers.ts`
- `searchTransfers(pickup, dropoff, date)` - Search availability
- `bookTransfer(params)` - Create booking

---

## Phase 5: UI Pages

### 5.1 Hotels Module

| Route | Page | Purpose |
|-------|------|---------|
| `/hotels` | `HotelsPage.tsx` (update) | Search form + results |
| `/hotels/:hotelCode` | `HotelDetailPage.tsx` (new) | Hotel details + room selection |
| `/hotels/checkout` | `HotelCheckoutPage.tsx` (new) | Guest form + booking |
| `/hotels/confirmation/:ref` | `HotelConfirmationPage.tsx` (new) | Booking confirmation |

### 5.2 Activities Module

| Route | Page | Purpose |
|-------|------|---------|
| `/activities` | `ActivitiesPage.tsx` (update) | Search + browse |
| `/activities/results` | `ActivityResultsPage.tsx` (new) | Search results |
| `/activities/:code` | `ActivityDetailPage.tsx` (new) | Activity details |
| `/activities/checkout` | `ActivityCheckoutPage.tsx` (new) | Booking form |
| `/activities/confirmation/:ref` | `ActivityConfirmationPage.tsx` (new) | Confirmation |

### 5.3 Transfers Module

| Route | Page | Purpose |
|-------|------|---------|
| `/transfers` | `TransfersPage.tsx` (new) | Search form |
| `/transfers/results` | `TransferResultsPage.tsx` (new) | Vehicle options |
| `/transfers/checkout` | `TransferCheckoutPage.tsx` (new) | Passenger details |
| `/transfers/confirmation/:ref` | `TransferConfirmationPage.tsx` (new) | Confirmation |

---

## Phase 6: Components

### Hotels Components
```text
src/components/hotels/
├── HotelbedsResultCard.tsx     # Real hotel card
├── HotelRoomCard.tsx           # Room option with rate
├── HotelImageGallery.tsx       # Photo carousel  
├── HotelFacilities.tsx         # Amenities list
├── HotelGuestForm.tsx          # Booking form
├── HotelPriceSummary.tsx       # Price breakdown
└── HotelConfirmationCard.tsx   # Booking success
```

### Activities Components
```text
src/components/activities/
├── ActivityResultCard.tsx      # Activity card
├── ActivityModalityCard.tsx    # Tour option/timing
├── ActivityDetailHero.tsx      # Hero with images
├── ActivityBookingForm.tsx     # Participant details
└── ActivityConfirmation.tsx    # Booking success
```

### Transfers Components
```text
src/components/transfers/
├── TransferSearchForm.tsx      # Pickup/dropoff form
├── TransferVehicleCard.tsx     # Vehicle option card
├── TransferRouteDisplay.tsx    # Route visualization
├── TransferPassengerForm.tsx   # Passenger details
└── TransferConfirmation.tsx    # Booking success
```

---

## Phase 7: Database Schema

### Hotels Bookings Table
```text
hotelbeds_hotel_bookings
- id (UUID)
- user_id (UUID, optional)
- reference (TEXT) - Hotelbeds booking reference
- hotel_code (TEXT)
- hotel_name (TEXT)
- check_in (DATE)
- check_out (DATE)
- room_code (TEXT)
- rate_key (TEXT)
- holder_name (TEXT)
- holder_email (TEXT)
- total_amount (DECIMAL)
- currency (TEXT)
- status (TEXT) - confirmed, cancelled, pending
- raw_response (JSONB)
- created_at (TIMESTAMPTZ)
```

### Activities Bookings Table
```text
hotelbeds_activity_bookings
- id (UUID)
- user_id (UUID, optional)
- reference (TEXT)
- activity_code (TEXT)
- activity_name (TEXT)
- activity_date (DATE)
- modality_code (TEXT)
- holder_name (TEXT)
- holder_email (TEXT)
- participants (JSONB)
- total_amount (DECIMAL)
- currency (TEXT)
- status (TEXT)
- raw_response (JSONB)
- created_at (TIMESTAMPTZ)
```

### Transfers Bookings Table
```text
hotelbeds_transfer_bookings
- id (UUID)
- user_id (UUID, optional)
- reference (TEXT)
- transfer_type (TEXT) - airport, hotel, etc.
- pickup_location (TEXT)
- dropoff_location (TEXT)
- transfer_date (DATE)
- transfer_time (TIME)
- vehicle_type (TEXT)
- passengers (INTEGER)
- holder_name (TEXT)
- holder_email (TEXT)
- total_amount (DECIMAL)
- currency (TEXT)
- status (TEXT)
- raw_response (JSONB)
- created_at (TIMESTAMPTZ)
```

---

## Phase 8: Error Handling

### API Error Mapping

| HTTP Status | Error Type | User Message |
|-------------|------------|--------------|
| 400 | Bad Request | "Please check your search details" |
| 401/403 | Auth Failed | "Authentication error. Please try again." |
| 404 | Not Found | "This option is no longer available" |
| 429 | Rate Limited | "Too many requests. Please wait a moment." |
| 500+ | Server Error | "Service temporarily unavailable" |

### Price Change Handling
- If `checkrates` returns different price, show comparison
- User must confirm new price before booking
- Log price discrepancies for monitoring

### Signature Time Drift
- Edge function uses server time (Deno.now())
- No time drift issues expected
- Log and alert if signature failures occur

---

## Phase 9: Cross-Sell Integration

### Hotel Checkout Upsells
- After hotel selection, suggest:
  - Airport transfer to hotel
  - Activities at destination
- Use destination + dates context

### Activity Cross-Sell
- After hotel booking confirmation:
  - "Add things to do in [City]"
  - Pre-filtered by booking dates

### Transfer Integration
- Offer during hotel checkout
- "Add airport pickup for your arrival"
- Pre-populated with hotel address

---

## Implementation Order

### Week 1: Backend Foundation
1. Add all Hotelbeds secrets to Supabase
2. Create `hotelbeds-hotels` edge function
3. Create `hotelbeds-activities` edge function
4. Create `hotelbeds-transfers` edge function
5. Test each endpoint with TEST environment

### Week 2: Hotels Flow
1. Create TypeScript types for Hotels
2. Build `useHotelbedsSearch` hook
3. Update `HotelsPage.tsx` with real search
4. Create `HotelDetailPage.tsx`
5. Create `HotelCheckoutPage.tsx`
6. Create `HotelConfirmationPage.tsx`
7. Add database table + RLS policies

### Week 3: Activities Flow
1. Add Activities types
2. Build `useHotelbedsActivities` hook
3. Create/update Activities pages
4. Build booking flow components
5. Add database table + RLS

### Week 4: Transfers Flow
1. Add Transfers types
2. Build `useHotelbedsTransfers` hook
3. Create Transfers pages
4. Build booking flow
5. Add database table + RLS

### Week 5: Integration & Polish
1. Cross-sell integration
2. Error handling refinement
3. End-to-end testing in TEST
4. Performance optimization
5. Switch to LIVE environment

---

## Files Summary

### To Create

| Category | Files |
|----------|-------|
| Edge Functions | `supabase/functions/hotelbeds-hotels/index.ts`, `supabase/functions/hotelbeds-activities/index.ts`, `supabase/functions/hotelbeds-transfers/index.ts` |
| Types | `src/types/hotelbeds.ts` |
| Hooks | `src/hooks/useHotelbedsSearch.ts`, `src/hooks/useHotelbedsBooking.ts`, `src/hooks/useHotelbedsActivities.ts`, `src/hooks/useHotelbedsTransfers.ts` |
| Hotel Pages | `src/pages/HotelDetailPage.tsx`, `src/pages/HotelCheckoutPage.tsx`, `src/pages/HotelConfirmationPage.tsx` |
| Activity Pages | `src/pages/ActivityResultsPage.tsx`, `src/pages/ActivityDetailPage.tsx`, `src/pages/ActivityCheckoutPage.tsx`, `src/pages/ActivityConfirmationPage.tsx` |
| Transfer Pages | `src/pages/TransfersPage.tsx`, `src/pages/TransferResultsPage.tsx`, `src/pages/TransferCheckoutPage.tsx`, `src/pages/TransferConfirmationPage.tsx` |
| Components | ~15 new components across hotels, activities, transfers |

### To Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add new routes for all three modules |
| `src/pages/HotelsPage.tsx` | Replace mock hook with Hotelbeds API |
| `src/pages/ThingsToDo.tsx` | Replace affiliate cards with real search |
| `src/components/travel-extras/AirportTransfersSection.tsx` | Link to new transfers flow |
| `src/components/hotels/HotelFilters.tsx` | Add board type, refundable filters |
| `supabase/config.toml` | Add three new function configurations |

---

## Security Checklist

- [ ] All API keys stored in Supabase secrets only
- [ ] No secrets logged in edge functions
- [ ] Signature generated server-side only
- [ ] Rate limiting applied to all endpoints
- [ ] Input validation on all requests
- [ ] RLS policies on all booking tables
- [ ] Error messages don't leak internal details
- [ ] CORS headers properly configured

---

## Success Criteria

- [ ] Hotels: Search returns real availability from Hotelbeds TEST
- [ ] Hotels: Booking flow completes successfully
- [ ] Activities: Search returns real activities
- [ ] Activities: Booking creates valid reservation
- [ ] Transfers: Availability returns vehicle options
- [ ] Transfers: Booking creates confirmed transfer
- [ ] All booking references stored in database
- [ ] No external redirects for booking completion
- [ ] Error states handled gracefully
- [ ] Mobile-responsive UI throughout

