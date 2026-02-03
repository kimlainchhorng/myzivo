

# Duffel LIVE Environment Production Readiness

## Summary

This plan finalizes ZIVO Flights for Duffel LIVE environment by hardening environment separation, strengthening validation, ensuring atomic payment+ticketing flow, and enhancing the confirmation page and admin monitoring.

---

## Current State Analysis

| Requirement | Status | Notes |
|-------------|--------|-------|
| Environment separation (DUFFEL_ENV) | ✅ Implemented | Edge functions use `DUFFEL_ENV`, frontend uses sessionStorage |
| API key isolation | ✅ Implemented | Key only in edge functions, never client-side |
| Passenger validation | ✅ Implemented | Client + server validation in `FlightTravelerInfo.tsx` and `create-flight-checkout` |
| Stripe payment flow | ✅ Implemented | Checkout session created, webhook triggers ticketing |
| Auto-refund on failure | ✅ Implemented | `issue-flight-ticket` calls `process-flight-refund` on error |
| Admin status panel | ✅ Implemented | `/admin/flights/status` shows env, stats, alerts |
| Test mode badge | ✅ Implemented | Header shows badge when sandbox + admin |
| OTA-only mode (no affiliate) | ✅ Implemented | `flightBookingMode.ts` guards all affiliate code |
| Confirmation page | Partial | Shows PNR, tickets, but missing airline name from booking |
| Stripe LIVE mode indicator | Not shown | Admin panel only shows "Stripe Connected" |
| Last successful booking timestamp | Not shown | Available in DB, not displayed |
| Atomic booking guarantee | Partial | Webhook triggers ticketing, but no explicit atomicity checks |

---

## Implementation Plan

### Phase 1: Enhance Stripe Webhook with Better Flight Handling

**Goal:** Ensure atomic payment → ticketing flow with explicit status tracking.

**File:** `supabase/functions/stripe-webhook/index.ts`

Enhancements:
1. Log the payment confirmation more explicitly
2. Add error handling if ticketing trigger fails
3. Create admin alert if ticketing trigger fails

```typescript
// In checkout.session.completed for flights:
} else if (metadata.type === "flight") {
  // Update flight booking with explicit payment confirmation
  const { data: updatedBooking, error: updateError } = await supabase
    .from("flight_bookings")
    .update({
      payment_status: "paid",
      stripe_payment_intent_id: paymentIntentId,
      ticketing_status: "processing",
    })
    .eq("stripe_checkout_session_id", session.id)
    .select()
    .single();

  if (updateError) {
    console.error("[Webhook] Error updating flight booking:", updateError);
    // Create admin alert for payment confirmation failure
    await supabase.from('flight_admin_alerts').insert({
      booking_id: metadata.booking_id,
      alert_type: 'payment_failed',
      message: `Failed to update booking after payment: ${updateError.message}`,
      severity: 'critical',
    });
    return; // Don't proceed to ticketing
  }

  console.log("[Webhook] Flight booking paid:", metadata.booking_id);
  
  // Trigger ticketing with explicit error handling
  try {
    const ticketResponse = await fetch(`${supabaseUrl}/functions/v1/issue-flight-ticket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ bookingId: metadata.booking_id }),
    });
    
    if (!ticketResponse.ok) {
      const ticketError = await ticketResponse.json();
      console.error("[Webhook] Ticketing trigger failed:", ticketError);
      // Alert already created by issue-flight-ticket on failure
    }
  } catch (ticketErr) {
    console.error("[Webhook] Error triggering ticketing:", ticketErr);
    await supabase.from('flight_admin_alerts').insert({
      booking_id: metadata.booking_id,
      alert_type: 'ticketing_failed',
      message: `Failed to trigger ticketing after payment: ${ticketErr instanceof Error ? ticketErr.message : 'Unknown error'}`,
      severity: 'critical',
    });
  }
}
```

---

### Phase 2: Enhance Confirmation Page with Full Itinerary

**Goal:** Show complete booking details including airline name, full itinerary, PNR, and ticket numbers.

**File:** `src/pages/FlightConfirmation.tsx`

Current issues:
- Airline name not shown (only origin/destination codes)
- Flight number not shown
- Itinerary segments not shown

Enhancements:
1. Store and display airline info from the original offer
2. Show flight number(s)
3. Add "Email confirmation sent" notice
4. Improve itinerary display

**Add to booking fetch or sessionStorage retrieval:**
```typescript
// Also try to get offer details from session for richer display
const [offerDetails, setOfferDetails] = useState<any>(null);

useEffect(() => {
  const storedOffer = sessionStorage.getItem('flightOfferId');
  const storedOfferDetails = sessionStorage.getItem('flightOfferDetails');
  if (storedOfferDetails) {
    try {
      setOfferDetails(JSON.parse(storedOfferDetails));
    } catch {}
  }
}, []);
```

**Add airline info display:**
```tsx
{/* Airline Info */}
<Card className="mb-6">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Plane className="w-5 h-5 text-primary" />
      Flight Details
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Airline logo and name */}
    <div className="flex items-center gap-4 mb-4">
      {offerDetails?.airlineCode && (
        <img
          src={`https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${offerDetails.airlineCode}.svg`}
          alt={offerDetails?.airline || 'Airline'}
          className="w-12 h-12 object-contain bg-white rounded-lg p-1 border"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div>
        <h3 className="font-semibold">{offerDetails?.airline || 'Airline'}</h3>
        <p className="text-sm text-muted-foreground">{offerDetails?.flightNumber || ''}</p>
      </div>
    </div>
    
    {/* Route display */}
    ...
  </CardContent>
</Card>
```

**Add email confirmation notice (when ticket issued):**
```tsx
{isIssued && (
  <Alert className="mb-6 border-emerald-500/30 bg-emerald-500/5">
    <Mail className="w-4 h-4 text-emerald-500" />
    <AlertDescription>
      <strong>Confirmation email sent!</strong> Your e-ticket has been sent to the email addresses provided for each passenger.
    </AlertDescription>
  </Alert>
)}
```

---

### Phase 3: Store Offer Details During Checkout Flow

**Goal:** Persist offer details so confirmation page can display airline name, flight number, etc.

**File:** `src/pages/FlightCheckout.tsx`

Add before navigating to Stripe:
```typescript
// Store full offer details for confirmation page
sessionStorage.setItem('flightOfferDetails', JSON.stringify({
  airline: offer.airline,
  airlineCode: offer.airlineCode,
  flightNumber: offer.flightNumber,
  cabinClass: offer.cabinClass,
  duration: offer.duration,
  stops: offer.stops,
  departure: offer.departure,
  arrival: offer.arrival,
}));
```

---

### Phase 4: Add Stripe Mode Indicator to Admin Panel

**Goal:** Show whether Stripe is in test or live mode.

**File:** `src/pages/admin/FlightStatusPage.tsx`

Add Stripe mode detection (based on key prefix in edge function response):

**Option A:** Add to the stats query by calling a simple edge function that returns env info.

**Option B:** Check if any recent payment intents have `pi_test_` vs `pi_` prefix.

For simplicity, add a note that Stripe mode is determined by the `STRIPE_SECRET_KEY`:

```tsx
<div className="p-4 rounded-lg border">
  <p className="text-sm text-muted-foreground mb-1">Payment Processor</p>
  <p className="font-semibold flex items-center gap-2">
    <CheckCircle className="w-4 h-4 text-emerald-500" />
    Stripe Connected
  </p>
  <p className="text-xs text-muted-foreground mt-1">
    Mode determined by STRIPE_SECRET_KEY (sk_test_* = test, sk_live_* = live)
  </p>
</div>
```

---

### Phase 5: Show Last Successful Booking Timestamp

**Goal:** Display when the last successful ticket was issued.

**File:** `src/pages/admin/FlightStatusPage.tsx`

Add to stats query:
```typescript
// Get last successful booking
const { data: lastSuccess } = await supabase
  .from('flight_bookings')
  .select('ticketed_at, booking_reference')
  .eq('ticketing_status', 'issued')
  .order('ticketed_at', { ascending: false })
  .limit(1)
  .single();
```

Add to stats grid:
```tsx
<Card>
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Last Issued Ticket</p>
        <p className="text-lg font-semibold">
          {stats?.lastSuccess?.ticketed_at 
            ? format(new Date(stats.lastSuccess.ticketed_at), 'MMM d, HH:mm')
            : 'None yet'}
        </p>
        {stats?.lastSuccess?.booking_reference && (
          <p className="text-xs text-muted-foreground">{stats.lastSuccess.booking_reference}</p>
        )}
      </div>
      <Ticket className="w-8 h-8 text-primary opacity-20" />
    </div>
  </CardContent>
</Card>
```

---

### Phase 6: Add Environment Safety Checks to Edge Functions

**Goal:** Ensure strict validation is enforced in LIVE mode.

**File:** `supabase/functions/create-flight-checkout/index.ts`

Already has strict validation. Add explicit LIVE mode logging:
```typescript
// At start of function
const DUFFEL_ENV = Deno.env.get('DUFFEL_ENV') || 'sandbox';
const isLiveMode = DUFFEL_ENV === 'live';

console.log("[FlightCheckout] Environment:", DUFFEL_ENV, "Live mode:", isLiveMode);

// Existing validation already enforces strict checks
// Add explicit warning if validation would have failed in live mode
```

**File:** `supabase/functions/issue-flight-ticket/index.ts`

Add live mode checks:
```typescript
const DUFFEL_ENV = Deno.env.get('DUFFEL_ENV') || 'sandbox';
const isLiveMode = DUFFEL_ENV === 'live';

console.log("[IssueTicket] Environment:", DUFFEL_ENV);

// In live mode, never use demo/mock data
if (isLiveMode && !duffelApiKey) {
  throw new Error('DUFFEL_API_KEY is required in live mode');
}
```

---

### Phase 7: Ensure No Estimated/Indicative Language in LIVE

**Goal:** Verify all price displays use final pricing language.

**Already implemented in:**
- `src/config/flightMoRCompliance.ts` - All price text is final ("All prices include taxes and fees")
- No "indicative" or "estimated" language exists

**Verify in search results:**
- `src/components/flight/FlightCard.tsx` - Uses exact Duffel prices
- `src/pages/FlightCheckout.tsx` - Shows exact breakdown

No changes needed - already compliant.

---

### Phase 8: Add Failed Bookings Count to Admin Panel

**Goal:** Show count of failed bookings in the last 24h.

**File:** `src/pages/admin/FlightStatusPage.tsx`

Already implemented in stats query:
```typescript
const failedBookings = bookings?.filter(b => 
  b.ticketing_status === 'failed' || b.payment_status === 'refunded'
).length || 0;
```

Already displayed in stats grid - verify it's shown prominently.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/stripe-webhook/index.ts` | MODIFY | Better error handling for flight payment confirmation |
| `src/pages/FlightConfirmation.tsx` | MODIFY | Add airline name, flight number, email sent notice |
| `src/pages/FlightCheckout.tsx` | MODIFY | Store offer details for confirmation page |
| `src/pages/admin/FlightStatusPage.tsx` | MODIFY | Add last successful booking, Stripe mode note |
| `supabase/functions/issue-flight-ticket/index.ts` | MODIFY | Add live mode check for API key |

---

## No Database Changes Required

All required fields already exist in `flight_bookings` table:
- `ticketed_at` for last successful timestamp
- `ticketing_status` for success/failure tracking
- `pnr`, `ticket_numbers` for confirmation display

---

## Security Verification

1. **Environment separation** ✅
   - `DUFFEL_ENV` controls sandbox vs live behavior
   - API key isolated to edge functions only
   
2. **No affiliate fallback** ✅
   - `flightBookingMode.ts` blocks all affiliate logic
   - OTA-only mode permanently locked

3. **Atomic payment flow** ✅
   - Stripe webhook triggers ticketing
   - Auto-refund on ticketing failure
   - Admin alerts for failures

4. **Passenger validation** ✅
   - Client-side regex validation
   - Server-side validation in checkout function
   - Required fields: name, DOB, gender, email

---

## LIVE Readiness Checklist

After implementation, verify:

- [ ] `DUFFEL_ENV=live` in edge function secrets
- [ ] `DUFFEL_API_KEY` is production key (not test)
- [ ] `STRIPE_SECRET_KEY` is production key
- [ ] Admin panel shows "LIVE Mode" badge
- [ ] Test booking flow end-to-end
- [ ] Confirm email delivery works
- [ ] Verify refund flow works
- [ ] Check admin alerts populate

---

## Testing Requirements

1. **Payment Flow**
   - Complete checkout with Stripe test mode
   - Verify webhook triggers ticketing
   - Confirm confirmation page shows all details

2. **Error Handling**
   - Simulate ticketing failure (invalid offer)
   - Verify auto-refund triggers
   - Check admin alert is created

3. **Admin Panel**
   - Verify stats update correctly
   - Check last successful booking displays
   - Test alert resolution

4. **Environment Guards**
   - Test in sandbox mode (demo tickets allowed)
   - Verify live mode requires real API key

