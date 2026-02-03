
# Phase 2 Completion: MoR Frontend & Admin Integration

## Overview

This phase completes the Merchant-of-Record transition by updating remaining affiliate-pattern components and connecting the UI to the real database infrastructure created in Phase 1.

---

## Current State

### Already Completed
- Database: `flight_bookings` enhanced with `pnr`, `ticketing_status`, Stripe fields
- Tables: `flight_passengers`, `flight_ticketing_logs` 
- Edge Functions: `create-flight-checkout`, `issue-flight-ticket`
- Pages: `FlightCheckout.tsx`, `FlightConfirmation.tsx`, `FlightTerms.tsx`
- Hooks: `useFlightBooking.ts` with booking queries and status helpers
- Config: `flightMoRCompliance.ts`, updated `flightCompliance.ts`
- Components: `FlightSellerDisclaimer.tsx`, updated CTAs

### Still Using Affiliate Patterns
1. **`FlightResultCard.tsx`** - Uses `trackAffiliateClick`, opens external link, shows "View Deal"
2. **`FlightDetails.tsx`** - Uses `trackAffiliateClick`, redirects externally, partner consent
3. **`FlightTravelerInfo.tsx`** - References "partner redirect", uses `logPartnerRedirect`
4. **`MyTripsDashboard.tsx`** - Uses MOCK_TRIPS data, not real `flight_bookings`
5. **`AdminFlightManagement.tsx`** - Missing `ticketing_status`, refund actions, ticketing logs

---

## Files to Modify

### 1. FlightResultCard.tsx

**Remove:**
- Import `trackAffiliateClick` and `AFFILIATE_LINKS`
- External link handling (`window.open`)

**Add:**
- Internal navigation to `/flights/details/{id}`
- Store selected flight in sessionStorage for details page
- Change CTA from "View Deal" + ExternalLink to "Select Flight"
- Remove "Opens partner site" text

### 2. FlightDetails.tsx

**Remove:**
- Import `trackAffiliateClick`, `buildAffiliateUrl` from affiliateTracking
- External redirect in `handleBookNow`
- "share your information with the booking partner" consent language

**Add:**
- Internal navigation to `/flights/traveler-info?offer={id}`
- Update consent to "I agree to the Terms and Conditions and Airline Rules"
- Use `FLIGHT_CTA_TEXT` from MoR compliance config

### 3. FlightTravelerInfo.tsx

**Remove:**
- Import `logPartnerRedirect` 
- "Redirecting to secure checkout... travel partner" toast
- "share with partner" consent language

**Add:**
- Navigation to `/flights/checkout`
- Store passengers in sessionStorage for checkout page
- Update consent to "I agree to the Terms and Conditions and Airline Rules"
- Update CTA to "Continue to Payment"

### 4. MyTripsDashboard.tsx

**Replace:**
- `MOCK_TRIPS` array with real `useFlightBookings()` query
- Map real booking data to display format

**Add:**
- `ticketing_status` display (pending, issued, failed)
- PNR and ticket number display for issued tickets
- "Request Change" and "Request Refund" buttons
- Empty state for no bookings

### 5. AdminFlightManagement.tsx

**Add New Tab: "Ticketing"**
- Query `flight_ticketing_logs` for partner API logs
- Display log entries with request/response data

**Enhance Bookings Table:**
- Add `ticketing_status` column with badges
- Add `pnr` column
- Add action: "Retry Ticketing" for failed status
- Add action: "Process Refund" for issued status
- Add passenger details view in booking modal

**New Mutations:**
- `retryTicketing` - calls issue-flight-ticket Edge Function
- `processRefund` - calls process-flight-refund Edge Function

---

## New Components

### FlightChangeRequest.tsx

A dialog component for users to request changes/cancellations:
- Booking reference display
- Reason selection (change dates, cancel, other)
- Fare rules summary (non-refundable notice if applicable)
- Submit request button
- "Contact ZIVO Support" link

---

## Technical Details

### FlightResultCard Internal Navigation

```typescript
// Replace handleBookFlight
const handleSelectFlight = () => {
  // Store flight in session for details page
  sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
  // Navigate internally
  navigate(`/flights/details/${flight.id}`);
  onSelect?.(flight);
};
```

### FlightTravelerInfo Checkout Navigation

```typescript
// Replace handleProceedToCheckout
const handleContinueToPayment = async () => {
  // Validate form
  if (!validateForm()) return;
  
  // Store passengers for checkout
  sessionStorage.setItem('flightPassengers', JSON.stringify(passengers));
  sessionStorage.setItem('flightOfferId', offer.id);
  
  // Navigate to ZIVO checkout (not partner)
  navigate(`/flights/checkout?offer=${offer.id}&passengers=${passengerCount}`);
};
```

### MyTripsDashboard Real Data

```typescript
import { useFlightBookings, getTicketingStatusInfo } from '@/hooks/useFlightBooking';

// Replace MOCK_TRIPS usage
const { data: bookings, isLoading } = useFlightBookings();

// Map to display format
const trips = bookings?.map(b => ({
  id: b.id,
  bookingRef: b.booking_reference,
  status: mapPaymentToTripStatus(b.payment_status, b.ticketing_status),
  pnr: b.pnr,
  ticketNumbers: b.ticket_numbers,
  // ... other fields
}));
```

---

## Compliance Text Updates

| Component | Old Text | New Text |
|-----------|----------|----------|
| FlightResultCard CTA | "View Deal" | "Select Flight" |
| FlightResultCard subtext | "Opens partner site" | (removed) |
| FlightDetails consent | "share with booking partner" | "agree to Terms and Airline Rules" |
| FlightTravelerInfo consent | "share with licensed booking partner" | "agree to Terms and Conditions" |
| FlightTravelerInfo CTA | "Proceed to secure payment" | "Continue to Payment" |

---

## Admin Panel Enhancements

### New Ticketing Tab

Displays `flight_ticketing_logs` with columns:
- Timestamp
- Booking Reference
- Action (create_order, issue_ticket, refund)
- Partner
- Status (success/error)
- View Details button (shows request/response JSON)

### Enhanced Booking Actions Dropdown

```typescript
<DropdownMenuItem onClick={() => handleRetryTicketing(booking.id)}>
  <RefreshCw className="h-4 w-4 mr-2" />
  Retry Ticketing
</DropdownMenuItem>
<DropdownMenuItem onClick={() => handleProcessRefund(booking.id)}>
  <DollarSign className="h-4 w-4 mr-2" />
  Process Refund
</DropdownMenuItem>
```

### Ticketing Status Badge

```typescript
const getTicketingBadge = (status: string) => {
  switch (status) {
    case 'issued':
      return <Badge className="bg-emerald-500/10 text-emerald-500">Issued</Badge>;
    case 'processing':
      return <Badge className="bg-blue-500/10 text-blue-500">Processing</Badge>;
    case 'failed':
      return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
    case 'pending':
      return <Badge className="bg-amber-500/10 text-amber-500">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
```

---

## Implementation Order

1. **FlightResultCard.tsx** - Remove affiliate, add internal navigation
2. **FlightDetails.tsx** - Remove affiliate redirect, update consent
3. **FlightTravelerInfo.tsx** - Navigate to checkout, update consent
4. **MyTripsDashboard.tsx** - Connect to real bookings data
5. **FlightChangeRequest.tsx** - New component for change/refund requests
6. **AdminFlightManagement.tsx** - Add ticketing tab and actions

---

## Summary

This phase finalizes the MoR transition by:
- Removing all affiliate tracking/redirect patterns from flight components
- Converting external links to internal navigation throughout the booking flow
- Connecting My Trips to real `flight_bookings` database table
- Adding ticketing status, PNR, and ticket number display
- Enhancing admin panel with ticketing logs and refund processing
- Updating all compliance text to MoR seller language

After completion, the complete flow will be:
**Search → Select Flight → Details → Traveler Info → ZIVO Checkout → Payment → Ticketing → Confirmation**

All in-platform. No external redirects. ZIVO as Merchant of Record.
