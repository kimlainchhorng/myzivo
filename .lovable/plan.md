

# Flight Booking Feature — Implementation Plan

## Current State

The backend infrastructure is **already built**:
- **Edge Functions**: `duffel-flights` (search, get offers, create order) and `create-flight-checkout` (Stripe checkout) exist and are fully functional
- **Database**: `flight_bookings`, `flight_passengers`, `flight_search_cache`, `flight_search_logs` tables exist with RLS
- **Secrets**: `DUFFEL_API_KEY`, `DUFFEL_ENV`, `STRIPE_SECRET_KEY` are configured
- **Stripe Webhook**: Already handles flight payment events and triggers ticketing
- **Routes**: All flight routes exist in App.tsx (`/flights`, `/flights/results`, `/flights/traveler-info`, `/flights/checkout`, `/flights/confirmation/:bookingId`)

The **problem**: All flight page components (`FlightSearch`, `FlightResults`, `FlightTravelerInfo`, `FlightCheckout`, `FlightConfirmation`) are **stubs** that just `<Navigate to="/flights" />`, and `FlightLanding` shows a "Coming Soon" page.

## What Needs to Be Built

Replace the stub pages with real, functional UI components. No backend or database changes needed.

---

### Step 1: Flight Search Page (`/flights`)

Replace `FlightLanding.tsx` with a full search form:
- From/To airport inputs (IATA code with city name autocomplete)
- Departure date picker, optional return date
- Passenger count selector (adults, children, infants)
- Cabin class dropdown (economy, premium_economy, business, first)
- One-way / Round-trip toggle
- Search button that navigates to `/flights/results` with query params
- Mobile-first layout matching ZIVO brand (green primary, clean cards)

### Step 2: Flight Results Page (`/flights/results`)

Replace `FlightResults.tsx` stub:
- Read search params from URL
- Call `supabase.functions.invoke('duffel-flights', { body: { action: 'createOfferRequest', ... } })`
- Display results as cards showing: airline, times, duration, stops, price
- Sort by price/duration
- Loading skeleton, empty state, error state
- "Select" button stores offer in sessionStorage and navigates to `/flights/traveler-info`

### Step 3: Passenger Details Page (`/flights/traveler-info`)

Replace `FlightTravelerInfo.tsx` stub:
- Form for each passenger: title, first name, last name, DOB, gender, email, phone
- Pre-fill from user profile if logged in
- Form validation (names, email format, DOB range)
- Continue button navigates to `/flights/checkout`
- Store passenger data in sessionStorage

### Step 4: Checkout Page (`/flights/checkout`)

Replace `FlightCheckout.tsx` stub:
- Show booking summary (flight details, passenger names, price breakdown)
- "Pay Now" button calls `supabase.functions.invoke('create-flight-checkout', { body: { ... } })`
- Redirects to Stripe Checkout URL
- Require auth (redirect to login if not authenticated)

### Step 5: Confirmation Page (`/flights/confirmation/:bookingId`)

Replace `FlightConfirmation.tsx` stub:
- Fetch booking from `flight_bookings` table by ID
- Show booking reference, airline, route, passenger name, amount paid, ticketing status
- Poll for ticketing status updates (already supported in `useFlightBooking` hook)
- "View My Trips" button

### Step 6: Navigation Update

The "Search" tab in `ZivoMobileNav` already points to `/flights`. No navigation changes needed.

---

## Technical Details

- **State management**: sessionStorage for cross-page flow (selected offer, passenger data)
- **API calls**: All via `supabase.functions.invoke('duffel-flights', ...)` — keys stay server-side
- **Existing hooks**: `useFlightBooking`, `useCreateFlightCheckout` already handle checkout and booking queries
- **Duffel mode**: `DUFFEL_ENV` secret is set — the edge function uses it to determine sandbox vs live
- **No new edge functions or DB migrations needed**
- **5 page components** to build/replace, plus shared sub-components (airport input, flight card, passenger form)

