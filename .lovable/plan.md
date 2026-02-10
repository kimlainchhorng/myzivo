

## Phase 3: Eats Stripe Checkout + Flight Landing Polish

### 1. Wire Eats Checkout to Stripe Payment

**Problem**: The Eats checkout (`EatsCheckout.tsx`) currently creates orders directly with `createOrder.mutateAsync()` without processing card payments through Stripe. When users select "Pay with Card", no actual payment is collected.

**Solution**: Integrate the existing `StripePaymentSheet` component and `useEatsPayment` hook into the checkout flow:

- When `paymentType === "card"`, call `useEatsPayment().createPaymentIntent()` before creating the order
- Open the `StripePaymentSheet` dialog with the returned `clientSecret`
- On successful Stripe payment, call `confirmPaymentSuccess()` to mark the order as paid
- Cash and wallet-only orders continue to work as they do today

**Files to modify**:
- `src/pages/EatsCheckout.tsx` -- Import `StripePaymentSheet` and `useEatsPayment`, add payment flow before order creation for card payments

### 2. Add Airline Partners Section to Flight Landing Pages

**Problem**: The `FlightLanding.tsx` page (SEO landing pages for routes like `/flights/new-york-to-london`) does not show the airline partners grid, while `FlightBooking.tsx` does.

**Solution**: Add the `FlightAirlinePartners` component to the Flight Landing page between the "How Booking Works" and "How It Works" sections for trust and conversion.

**Files to modify**:
- `src/pages/FlightLanding.tsx` -- Import and add `FlightAirlinePartners`

### 3. Add Airline Logos to Flight Search Page

**Problem**: `FlightSearch.tsx` imports `AirlineLogosCarousel` but could benefit from the fuller `FlightAirlinePartners` grid for social proof.

**Solution**: Add the `FlightAirlinePartners` section to `FlightSearch.tsx` for consistency across all flight pages.

**Files to modify**:
- `src/pages/FlightSearch.tsx` -- Import and add `FlightAirlinePartners`

---

### Technical Details

**Eats Stripe flow**:

```text
User selects "Card" --> Submits form
  --> createPaymentIntent() (edge function)
  --> Open StripePaymentSheet with clientSecret
  --> User completes Stripe payment
  --> confirmPaymentSuccess(orderId)
  --> Clear cart, navigate to order confirmation
```

**Edge function**: `create-eats-payment-intent` already exists and is deployed. The `StripePaymentSheet` component and `useEatsPayment` hook are both already built -- they just need to be wired into the checkout page.

**Flight pages**: Simple component additions using the existing `FlightAirlinePartners` component, no new code needed.

