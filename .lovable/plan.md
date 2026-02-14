

# Fix: RequestRidePage Stripe Initialization Bug

## Problem Found

`src/pages/app/RequestRidePage.tsx` (line 17) loads Stripe using:
```
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");
```

`VITE_*` environment variables are **not supported** in Lovable. This means `stripePromise` resolves with an empty key, causing **all payment authorization to silently fail** in the ride request flow.

The project already has a proper Stripe singleton at `src/lib/stripe.ts` that uses the hardcoded publishable key. `RequestServicePage.tsx` correctly imports from it, but `RequestRidePage.tsx` does not.

## Everything Else: Verified Working

- Phone verification gate (`usePhoneVerificationGate`): correctly wired in both `RequestRidePage` and `RequestServicePage`
- Verify phone page (`/verify-phone`): complete two-step OTP flow with error handling
- Device integrity check (`useDeviceIntegrityCheck`): fires on AppHome mount, calls all three RPCs
- Receipt page (`/receipt/:jobId`): route registered, component fetches from `trip_receipts` + items
- Upfront pricing pipeline in `RequestServicePage`: draft job, trip-estimate, zone/surge, apply pricing, confirm, dispatch

## Fix (1 file, 2 lines)

| File | Change |
|------|--------|
| `src/pages/app/RequestRidePage.tsx` | Replace `loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)` with import from `src/lib/stripe.ts` |

Specifically:
- Remove the `loadStripe` import and `VITE_` line
- Import `getStripe` from `@/lib/stripe`
- Use `getStripe()` where `stripePromise` is referenced

This is a small but critical fix -- without it, the ride request payment step produces a blank/broken Stripe Elements form.

