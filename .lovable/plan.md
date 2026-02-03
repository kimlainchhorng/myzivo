
# Hotelbeds API Integration Plan

## Overview

Transform ZIVO Hotels from an affiliate redirect model to a direct booking experience using the Hotelbeds API. Users will search for hotels, view real availability and prices, select rooms, and complete bookings entirely within ZIVO.

## Current State

- **Frontend**: Existing hotel search form, results page, and filters (mock data + affiliate redirect to Booking.com)
- **Backend**: TripAdvisor Content API edge function for hotel discovery (no booking capability)
- **Architecture**: Hotels use indicative pricing with partner redirect; ZIVO is NOT the Merchant of Record

## Target State

- **Frontend**: Real-time hotel search, details, room selection, and checkout flow
- **Backend**: Hotelbeds API integration for availability, pricing, and booking
- **Architecture**: ZIVO displays live Hotelbeds data; booking completed via Hotelbeds (TEST first, then LIVE)

---

## Phase 1: Backend Infrastructure

### 1.1 Add Secrets (Manual Step Required)

Add these secrets to Supabase Edge Functions:
- `HOTELBEDS_API_KEY` - Your Hotelbeds API key
- `HOTELBEDS_SECRET` - Your Hotelbeds secret
- `HOTELBEDS_BASE_URL` - Set to `https://api.test.hotelbeds.com` (TEST) or `https://api.hotelbeds.com` (LIVE)

### 1.2 Create Edge Function: `hotelbeds-api`

A unified edge function handling all Hotelbeds API operations:

```text
supabase/functions/hotelbeds-api/index.ts
```

**Key Features**:
- Secure SHA256 signature generation: `SHA256(apiKey + secret + unixTimestampSeconds)`
- Rate limiting with 429/403 error handling
- Request routing based on `action` parameter:
  - `status` - GET /hotel-api/1.0/status (health check)
  - `hotels` - POST /hotel-api/1.0/hotels (availability search)
  - `checkrates` - POST /hotel-api/1.0/checkrates (price verification)
  - `bookings` - POST /hotel-api/1.0/bookings (confirm booking)

**Authentication Implementation**:
```
Headers:
  Api-key: {HOTELBEDS_API_KEY}
  X-Signature: SHA256_HEX(apiKey + secret + Math.floor(Date.now()/1000))
  Accept: application/json
  Content-Type: application/json
```

**Security**:
- Secrets never exposed to frontend
- No secret logging
- Server-side signature generation only
- Rate limiting per IP/user

---

## Phase 2: Frontend Architecture

### 2.1 New Hook: `useHotelbedsSearch`

```text
src/hooks/useHotelbedsSearch.ts
```

**Features**:
- Search availability with destination/dates/guests
- Transform Hotelbeds response to ZIVO format
- Handle loading, error, and empty states
- Support filters (price, stars, board type, refundable)

**Data Flow**:
```
User Search → useHotelbedsSearch → hotelbeds-api Edge Function → Hotelbeds API
     ↓
   Results ← Transform Response ← API Response
```

### 2.2 New Hook: `useHotelbedsBooking`

```text
src/hooks/useHotelbedsBooking.ts
```

**Features**:
- Check rates (if `rateType === "recheck"`)
- Create booking with holder + pax details
- Handle booking confirmation and errors

---

## Phase 3: UI Pages

### 3.1 Update `/hotels` (Search Page)

Modify `src/pages/HotelsPage.tsx`:
- Keep existing search form (destination, dates, guests, rooms)
- Replace mock data hook with `useHotelbedsSearch`
- Add loading spinner and no-results state
- Remove affiliate redirect messaging (now booking directly)

### 3.2 Update `/hotels/results` (Results Page)

Modify `src/pages/HotelResultsPage.tsx`:
- Display real Hotelbeds hotel data
- Show: image, name, rating, neighborhood, nightly price, total, cancellation badge
- Filter support: price range, stars, board type, refundable
- "View Details" button navigates to `/hotels/:hotelCode`

### 3.3 New Page: `/hotels/:hotelCode` (Hotel Details)

```text
src/pages/HotelDetailPage.tsx
```

**Sections**:
- Hero with hotel images (carousel)
- Hotel description and facilities
- Room options with rates, board types, cancellation policies
- "Select Room" button navigates to checkout with selected rate

### 3.4 New Page: `/hotels/checkout` (Checkout)

```text
src/pages/HotelCheckoutPage.tsx
```

**Flow**:
1. Display booking summary (hotel, room, dates, price)
2. Guest details form:
   - Holder: name, surname, email, phone
   - Paxes: name, surname, type (adult/child)
3. If `rateType === "recheck"`, call `/api/hotelbeds/checkrates` before confirm
4. Display updated price if changed
5. "Confirm Booking" button calls `/api/hotelbeds/bookings`
6. On success, navigate to confirmation page

### 3.5 New Page: `/hotels/confirmation/:reference` (Confirmation)

```text
src/pages/HotelConfirmationPage.tsx
```

**Display**:
- Booking reference
- Hotel and room details
- Check-in/out dates
- Guest names
- Total price paid
- Support contact info

---

## Phase 4: Components

### 4.1 New Components

```text
src/components/hotels/
├── HotelbedsResultCard.tsx    # Hotel card with real data
├── HotelRoomCard.tsx          # Room option with rate
├── HotelImageGallery.tsx      # Image carousel
├── HotelFacilities.tsx        # Amenities display
├── HotelGuestForm.tsx         # Booking form
├── HotelPriceSummary.tsx      # Price breakdown
└── HotelConfirmationCard.tsx  # Booking confirmation
```

### 4.2 Update Filters

Modify `src/components/hotels/HotelFilters.tsx`:
- Add "Board Type" filter (Room Only, Breakfast, Half Board, Full Board, All Inclusive)
- Add "Refundable Only" toggle
- Keep existing: price range, star rating, amenities

---

## Phase 5: Data Types

### 5.1 TypeScript Interfaces

```text
src/types/hotelbeds.ts
```

Key types:
- `HotelbedsHotel` - Hotel from availability response
- `HotelbedsRoom` - Room with rates
- `HotelbedsRate` - Rate details (price, board, cancellation)
- `HotelbedsBookingRequest` - Booking payload
- `HotelbedsBookingResponse` - Confirmation response
- `HotelbedsGuest` - Holder/pax details

---

## Phase 6: Routing Updates

Update `src/App.tsx`:
```
/hotels                    → HotelsPage (search + results)
/hotels/results            → HotelResultsPage (results with filters)
/hotels/:hotelCode         → HotelDetailPage (new)
/hotels/checkout           → HotelCheckoutPage (new)
/hotels/confirmation/:ref  → HotelConfirmationPage (new)
```

---

## Phase 7: Error Handling

### API Errors

| Error | User Message |
|-------|-------------|
| 403 Forbidden | "Authentication failed. Please try again." |
| 429 Rate Limit | "Too many requests. Please wait a moment." |
| Network Error | "Connection failed. Check your internet." |
| Price Changed | "Price has changed. Please review and confirm." |
| No Availability | "This room is no longer available." |

### Signature Failures

If signature fails due to time drift:
- Log error to admin monitoring
- Retry with fresh timestamp
- Alert if persistent failure

---

## Phase 8: Database Schema (Optional)

Add `hotelbeds_bookings` table for tracking:
```sql
CREATE TABLE hotelbeds_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  reference TEXT NOT NULL,
  hotel_code TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed',
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Implementation Order

1. **Backend First**: Create `hotelbeds-api` edge function with all endpoints
2. **Test Backend**: Verify status, search, checkrates, bookings work with Hotelbeds TEST
3. **Hooks**: Build `useHotelbedsSearch` and `useHotelbedsBooking`
4. **Results Page**: Connect real data to existing UI
5. **Detail Page**: Build new hotel detail page
6. **Checkout Flow**: Build checkout and confirmation pages
7. **End-to-End Test**: Complete booking in TEST environment
8. **Production Switch**: Change `HOTELBEDS_BASE_URL` to live URL

---

## Technical Details

### Hotelbeds API Authentication

```typescript
function generateSignature(): string {
  const apiKey = Deno.env.get('HOTELBEDS_API_KEY')!;
  const secret = Deno.env.get('HOTELBEDS_SECRET')!;
  const timestamp = Math.floor(Date.now() / 1000);
  const data = `${apiKey}${secret}${timestamp}`;
  
  // SHA256 hex digest
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

### Availability Search Request

```typescript
// POST /hotel-api/1.0/hotels
{
  "stay": {
    "checkIn": "2026-03-01",
    "checkOut": "2026-03-05"
  },
  "occupancies": [
    { "rooms": 1, "adults": 2, "children": 0 }
  ],
  "destination": {
    "code": "NYC"
  }
}
```

### Booking Request

```typescript
// POST /hotel-api/1.0/bookings
{
  "holder": {
    "name": "John",
    "surname": "Doe"
  },
  "rooms": [
    {
      "rateKey": "selected_rate_key",
      "paxes": [
        { "roomId": 1, "type": "AD", "name": "John", "surname": "Doe" }
      ]
    }
  ],
  "clientReference": "ZIVO-123456"
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/hotelbeds-api/index.ts` | Edge function for all Hotelbeds API calls |
| `src/types/hotelbeds.ts` | TypeScript interfaces |
| `src/hooks/useHotelbedsSearch.ts` | Search availability hook |
| `src/hooks/useHotelbedsBooking.ts` | Booking flow hook |
| `src/pages/HotelDetailPage.tsx` | Hotel details page |
| `src/pages/HotelCheckoutPage.tsx` | Checkout page |
| `src/pages/HotelConfirmationPage.tsx` | Confirmation page |
| `src/components/hotels/HotelbedsResultCard.tsx` | Result card component |
| `src/components/hotels/HotelRoomCard.tsx` | Room selection component |
| `src/components/hotels/HotelGuestForm.tsx` | Guest form component |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/HotelsPage.tsx` | Replace mock hook with Hotelbeds |
| `src/pages/HotelResultsPage.tsx` | Display real hotel data |
| `src/components/hotels/HotelFilters.tsx` | Add board type, refundable filters |
| `src/App.tsx` | Add new hotel routes |
| `supabase/config.toml` | Add hotelbeds-api function config |

---

## Success Criteria

- Status endpoint returns healthy response from Hotelbeds TEST
- Availability search returns real hotel data
- Hotel details page displays rooms with rates
- Checkout flow completes booking successfully
- Confirmation shows booking reference
- No API secrets exposed in frontend
- Error handling covers all edge cases
