

# Multi-Stop Delivery Awareness + Ride Multi-Stop Enhancement

## Overview
Three areas of work: (A) surface batch delivery awareness on the public tracking page, (B) ensure ETA dynamically updates as batch stops complete, and (C) enhance multi-stop rides with reordering and price recalculation.

---

## Part A: Delivery Tracking -- Batch Awareness on Public Tracking Page

The `EatsOrderDetail.tsx` page already has full batch integration (GroupedDeliveryBanner, MultiStopTrackingProgress, batch-aware ETA via useOrderBatchInfo). However, the public `OrderTrackingPage.tsx` (/track/:orderId) has **none of this**. Customers following a tracking link see no indication their driver is completing other stops.

### Changes to `src/pages/track/OrderTrackingPage.tsx`
- Import and call `useOrderBatchInfo(orderId, order?.batch_id)` -- requires fetching `batch_id` from the order query
- Add `batch_id` to the `food_orders` select query
- Show `GroupedDeliveryBanner` when the order is batched and there are stops before the customer
- Show `MultiStopTrackingProgress` when the order is part of a multi-stop batch
- Pass `batchInfo.customerStopEta` into the ETA calculation so ETA reflects stop position

---

## Part B: Dynamic ETA Updates as Stops Complete

The `useOrderBatchInfo` hook already subscribes to real-time changes on `batch_stops` and `delivery_batches` tables, refetching batch position data when stops are completed. This means `stopsBeforeCustomer` and `customerStopEta` auto-update.

The gap is in `OrderTrackingPage.tsx` -- the ETA calculation effect only uses `order.estimated_delivery_at` and `order.duration_minutes`. It ignores batch stop ETA entirely.

### Changes to `src/pages/track/OrderTrackingPage.tsx`
- Update the ETA calculation `useEffect` to prefer `batchInfo.customerStopEta` when the order is batched
- When stops complete, the real-time subscription triggers `useOrderBatchInfo` to refetch, which updates `customerStopEta`, which recalculates displayed ETA -- fully dynamic with no additional work

---

## Part C: Ride Multi-Stop Enhancement

Currently Rides.tsx supports adding 1 intermediate stop, but:
- The stop is not included in the route/distance calculation -- `useServerRoute` only uses pickup and dropoff
- No drag-to-reorder UI exists
- Price does not update when a stop is added

### Changes to `src/pages/Rides.tsx`
- Increase max stops from 1 to 3 (configurable)
- When stops are present, build a waypoints array and pass it to `useServerRoute` so the route, distance, and duration include all stops -- this automatically recalculates price since `quoteRidePrice` uses `estimatedDistance` and `estimatedDuration`
- Add simple reorder controls (move up / move down buttons) on each stop row
- Show updated distance/duration/price after adding or reordering stops

### Changes to `src/hooks/useServerRoute.ts` (if needed)
- Accept optional `waypoints` parameter (array of lat/lng)
- Include waypoints in the Google Directions API request so the returned distance and duration reflect the full multi-stop route

---

## Technical Details

### Modified Files

1. **`src/pages/track/OrderTrackingPage.tsx`**
   - Add `batch_id` to food_orders select query
   - Import and use `useOrderBatchInfo`
   - Import and render `GroupedDeliveryBanner` and `MultiStopTrackingProgress`
   - Update ETA effect to use `batchInfo.customerStopEta` when available

2. **`src/pages/Rides.tsx`**
   - Increase max stops to 3
   - Pass stops as waypoints to route calculation
   - Add move-up/move-down reorder buttons for stops
   - Price auto-updates via existing `quoteRidePrice` since it depends on `estimatedDistance`/`estimatedDuration`

3. **`src/hooks/useServerRoute.ts`**
   - Add optional `waypoints: {lat: number, lng: number}[]` parameter
   - Include waypoints in the directions request

### No New Files or Database Changes
All components (`GroupedDeliveryBanner`, `MultiStopTrackingProgress`, `useOrderBatchInfo`) already exist and are production-ready. The ride multi-stop enhancement uses existing pricing and routing infrastructure.

