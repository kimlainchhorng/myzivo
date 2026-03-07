

# Ride Hub: Complete Booking Flow Upgrade

## Current State
- `RideBookingHome.tsx` has 3 steps (home → search → vehicle/confirm) but uses **hardcoded autocomplete results** instead of real Google Places
- The "confirm" step just shows a toast and resets — no Supabase ride request creation, no driver matching, no live tracking, no payment
- Existing components already built: `RideBookingConfirmation` (animated confirming→assigning→assigned flow), `RideDriverMatch` (radar search + driver card), `DriverEnRouteTracker` (live tracking UI), `RideMap` (Google Maps with route), `AddressAutocomplete` (real Google Places via edge functions)
- `ride_requests` table exists in Supabase with all needed columns (user_id, pickup/dropoff addresses/coords, ride_type, status, quoted_total, assigned_driver_id, stripe fields, etc.)
- Edge functions `maps-autocomplete` and `maps-place-details` are deployed and working

## Plan

### 1. Search Screen — Real Google Places Autocomplete
**File: `src/components/rides/RideBookingHome.tsx`**

- Replace the hardcoded `autocompleteResults` array and simple `<Input>` fields with the existing `AddressAutocomplete` component from `@/components/shared/AddressAutocomplete`
- Store structured pickup/dropoff data: `{ address, lat, lng }` instead of plain strings
- Keep saved places (Home/Work) and recent destinations sections below the inputs
- When both pickup and dropoff have coordinates, show "Choose a ride" button

### 2. Vehicle Selection — Rename to ZIVO Branding + Show ETA/Price
**File: `src/components/rides/RideBookingHome.tsx`**

- Rename vehicles: "Zivo Economy", "Zivo Comfort", "Zivo Luxury"
- Update vehicle cards to show: ETA in minutes (e.g., "4 min"), estimated price, capacity
- Pass real pickup/dropoff coords to `RideMap` for route display
- Keep existing `VehicleRow` component structure

### 3. Pickup Confirmation Screen (New Step)
**File: `src/components/rides/RideBookingHome.tsx`**

- Add new view step `"pickup-confirm"` between vehicle and confirm
- Show map with pickup pin and route to destination
- Display editable pickup address using `AddressAutocomplete`
- "Confirm Pickup" button proceeds to ride request

### 4. Request Ride — Supabase Integration
**File: `src/components/rides/RideBookingHome.tsx`**

- On "Request Ride" button press, insert into `ride_requests` table:
  - `user_id` from auth context
  - `pickup_address`, `pickup_lat`, `pickup_lng`
  - `dropoff_address`, `dropoff_lat`, `dropoff_lng`
  - `ride_type` (economy/comfort/luxury)
  - `quoted_total` (price estimate)
  - `status: 'searching'`
  - `customer_name`, `customer_phone` from user profile
- Transition to "matching" view step

### 5. Driver Matching Screen
**File: `src/components/rides/RideBookingHome.tsx`**

- Add `"matching"` view step that renders the existing `RideDriverMatch` component
- After simulated match (existing animation), update `ride_requests` status to `driver_assigned`
- Show driver info card (name, photo, vehicle, plate, ETA)
- Transition to "tracking" step

### 6. Live Map Tracking
**File: `src/components/rides/RideBookingHome.tsx`**

- Add `"tracking"` view step that renders the existing `DriverEnRouteTracker` component
- Pass ride request ID, driver info, pickup/dropoff addresses
- Show Google Map with driver moving toward pickup using `RideMap` with `driverCoords`

### 7. Trip Complete / Payment
**File: `src/components/rides/RideBookingHome.tsx`**

- Add `"complete"` view step after trip ends
- Show fare summary with breakdown
- Payment options: card on file (existing Stripe integration), Apple Pay, Google Pay, Cash
- "Pay" button updates `ride_requests.payment_status` to `paid`
- Reset to home after payment

### View Step Flow
```text
home → search → vehicle → pickup-confirm → matching → tracking → complete → home
```

### Files Modified
- `src/components/rides/RideBookingHome.tsx` — main changes (replace search inputs, add new view steps, Supabase insert, wire existing components)

### No Database Changes Needed
The `ride_requests` table already has all required columns.

### Technical Notes
- `AddressAutocomplete` calls `maps-autocomplete` and `maps-place-details` edge functions (already deployed)
- `RideDriverMatch` and `DriverEnRouteTracker` are existing components that will be embedded as view steps
- Payment uses existing Stripe setup; Apple/Google Pay shown as UI options (Stripe handles via Payment Request API)
- All driver data is simulated (mock) since there's no real driver fleet — matches production lockdown policy by showing empty states with TODO markers for real matching

