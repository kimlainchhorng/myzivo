

# ZIVO Full App Audit & Fix Plan

## Audit Summary

After scanning the entire codebase, database, edge functions, and runtime logs, here are the findings organized by severity.

---

## CRITICAL Issues (Must Fix)

### 1. Stripe Test Key in Production
The file `src/lib/stripe.ts` uses a **test publishable key** (`pk_test_...`) while `src/config/environment.ts` declares the app is in **production/live mode**. This means:
- All Stripe payment forms (Rides checkout, Eats checkout, Flight checkout) are loading Stripe in test mode
- Real credit cards will fail or produce test-mode charges
- **Fix**: Replace with the live publishable key (`pk_live_...`)

### 2. 644 Tables But Most Have No Grants
Almost all 644 tables in the database have RLS enabled but **no table-level GRANT** to `anon` or `authenticated` roles. This means:
- Direct queries from the frontend silently return empty results
- The `security_events` table is actively throwing "permission denied" errors in production logs
- Many features that write/read data may appear to work in admin views (service role) but fail silently for regular users
- **Fix**: Run a migration that grants appropriate SELECT/INSERT/UPDATE permissions on tables that need client access. Tables that should only be accessed via SECURITY DEFINER RPCs can stay without grants.

### 3. 74 Tables with RLS Enabled but No Policies
These tables have RLS turned on but zero policies, meaning **all access is blocked** -- even with grants. This affects data for admin, analytics, automation, and operational features.
- **Fix**: Add appropriate RLS policies (owner-based, role-based, or service-role-only depending on the table).

---

## HIGH Issues

### 4. 21 "Always True" RLS Policies on INSERT/UPDATE/DELETE
The linter found 21 WARN-level issues where policies use `WITH CHECK (true)` or `USING (true)` on write operations. While some are intentional (like `share_events` INSERT for public tracking), others may allow any authenticated user to modify data they shouldn't.
- **Fix**: Audit each policy and tighten to owner-based checks where appropriate.

### 5. 10 Functions Missing `search_path`
Database functions without an explicit `search_path` can be exploited if a malicious user creates objects in their own schema.
- **Fix**: Add `SET search_path = public` to all SECURITY DEFINER functions.

### 6. "schema net does not exist" Errors
Production DB logs show repeated `schema "net" does not exist` errors. This happens when code tries to use `net.http_*` functions (Supabase HTTP extension) but the `net` extension isn't enabled.
- **Fix**: Either enable the `pg_net` extension or remove calls to `net.*` functions.

---

## MEDIUM Issues

### 7. Legacy Affiliate Code Still Present
130 files still reference affiliate/Travelpayouts patterns despite ZIVO being locked to OTA-only mode. Components like `AdminAffiliateAnalytics`, `useAffiliateAttribution`, `affiliateTracking`, and `TrackingTest` page still exist.
- **Fix**: These are low-risk (the booking flow is locked) but should be cleaned up to reduce confusion and bundle size.

### 8. TODO Items in Checkout
- `EatsCheckout.tsx` line 200: `isFirstOrder: true` is hardcoded -- should check user's actual order history for fraud assessment accuracy
- `TravelTrips.tsx` line 206: Guest booking lookup is a no-op `console.log`
- **Fix**: Wire `isFirstOrder` to a real order count query; implement or remove guest lookup.

### 9. Stripe API Version Inconsistency
Edge functions use mixed Stripe API versions:
- Some use `"2023-10-16"` (old)
- Others use `"2025-08-27.basil"` (current)
- **Fix**: Standardize all to `"2025-08-27.basil"` for consistency.

---

## Payment Flow Audit

| Flow | Status | Issue |
|------|--------|-------|
| Flights (Duffel + Stripe) | Blocked by test key | Test `pk_test_` key prevents live charges |
| Rides (Stripe Elements) | Blocked by test key | Same -- `RideEmbeddedCheckout` uses `getStripe()` |
| Eats (Stripe Payment Sheet) | Blocked by test key | Same -- `StripePaymentSheet` uses `getStripe()` |
| Travel Orders (Stripe Checkout) | Blocked by test key | `create-travel-checkout` edge function uses server-side key (OK), but client-side `getStripe()` still test |
| Membership (Stripe Checkout) | Blocked by test key | Client redirect works, but confirmation page may fail |
| P2P Car Rental (Stripe Connect) | Edge functions use server key (OK) | Client-side test key issue |

All payment flows converge on `src/lib/stripe.ts` -- fixing the single publishable key fixes all flows.

---

## Implementation Plan

### Step 1: Fix Stripe Live Key
Update `src/lib/stripe.ts` to use the live publishable key. This is a single-line change that unblocks all payment flows.

### Step 2: Fix security_events Grants
Add `GRANT SELECT, INSERT ON security_events TO authenticated` so the existing RLS policies can actually work.

### Step 3: Fix Missing search_path on Functions
Update the 10 flagged SECURITY DEFINER functions to include `SET search_path = public`.

### Step 4: Standardize Stripe API Version
Update `verify-gift-card-purchase` and `process-travel-cancellation` edge functions from `"2023-10-16"` to `"2025-08-27.basil"`.

### Step 5: Fix EatsCheckout isFirstOrder
Replace `isFirstOrder: true` with a real check using a food_orders count query for the current user.

### Step 6: Remove Dead Guest Lookup
Replace the `console.log` in TravelTrips guest lookup with a toast explaining the feature isn't available yet, or implement it.

---

## What's Working Well (No Changes Needed)
- Routing: All 200+ routes in App.tsx are properly lazy-loaded with Suspense
- Auth flow: Login, Signup, OAuth callback, setup gate all connected
- Order tracking: Public RPC (`get_order_tracking`) is correctly wired for shared links
- Share events: RLS policies were added in the last update
- Multi-stop rides: Waypoints properly passed to route calculation
- ETA accuracy: Live driver density correctly feeds into queue-aware ETA
- Batch delivery awareness: `GroupedDeliveryBanner` integrated into tracking page
- Real-time subscriptions: Order status changes trigger proper refetch
- Edge functions: All 90+ functions are deployed and returning 200s (no recent 4xx/5xx errors in logs)
- PWA: Service worker, install prompt, and update prompt are properly configured

