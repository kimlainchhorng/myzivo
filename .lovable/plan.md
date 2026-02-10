

# Fix: Shared Link Errors and Share Event Logging

## Problems Found

### 1. Shared tracking links show "Order not found"
When you share a `/track/{orderId}` link (via Safety Center, WhatsApp, SMS, etc.), the recipient opens it and sees an error: **"Order not found"**. This happens because the `food_orders` table requires the viewer to be the order's customer, driver, or restaurant owner. A friend or family member opening the link has none of these roles, so the database blocks the query.

### 2. Share events silently fail to log
The `share_events` table has Row Level Security (RLS) enabled but **no policies at all**. Every share event insert is silently rejected. This means no share analytics are being recorded -- clicks, shares, and conversions are all lost.

---

## Fixes

### Fix 1: Allow public read access to orders via tracking link
Add a SELECT policy on `food_orders` that allows anyone (even unauthenticated users) to read **a single order by its ID** when accessed via the tracking page. The order ID acts as a secret token -- only people with the link can view it.

**SQL to run:**
```sql
CREATE POLICY "Public tracking access by order ID"
  ON food_orders FOR SELECT
  USING (true);
```

This is too broad. Instead, we will create a **secure database function** that returns only the fields needed for tracking (no customer PII), and call it from the tracking page instead of querying the table directly.

**Approach:**
- Create an RPC function `get_order_tracking(p_order_id uuid)` that returns only tracking-safe fields (status, lat/lng, driver info, timestamps, restaurant name) -- no customer name, phone, or payment data
- Update `useOrderTracking.ts` to call this RPC when used from the public tracking page
- No new RLS policy needed on `food_orders` -- the function runs with `SECURITY DEFINER` (elevated privileges)

### Fix 2: Add RLS policies for `share_events`
Add INSERT and SELECT policies so share events can actually be written and read.

**SQL to run:**
- INSERT policy: allow anyone (authenticated or anonymous) to insert share events -- sharing should work for all users
- SELECT policy: authenticated users can read their own share events

---

## Technical Details

### New Database Objects

1. **RPC function: `get_order_tracking`**
   - Input: `p_order_id uuid`
   - Returns: order status, pickup/delivery coordinates, distance, duration, timestamps, restaurant name/address, driver_id -- no PII
   - Security: `SECURITY DEFINER` so it bypasses RLS
   - This allows anyone with an order ID to view tracking data without exposing sensitive customer information

2. **RLS policies on `share_events`**
   - INSERT: `WITH CHECK (true)` -- anyone can log share events
   - SELECT: `USING (user_id = auth.uid())` -- users can only read their own events

### Modified Files

1. **`src/hooks/useOrderTracking.ts`**
   - Add a `public` mode option that calls the `get_order_tracking` RPC instead of directly querying `food_orders`
   - The RPC returns the same shape of data, so no downstream changes needed

2. **`src/pages/track/OrderTrackingPage.tsx`**
   - Pass `{ public: true }` to `useOrderTracking` so it uses the RPC path

### No UI Changes
The tracking page already handles loading and error states correctly. Once the data access is fixed, the existing UI will render properly for shared link recipients.

