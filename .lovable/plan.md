

# Unified Order and Trip Timeline

## Current State

The codebase has **separate** timeline implementations for different services:
- **Eats orders**: `StatusTimeline.tsx` -- detailed vertical timeline with driver substeps, prep progress, batch delivery info
- **Rides**: `TripTracker.tsx` -- inline status steps (emoji-based) embedded in the map view
- **Activity feeds**: `ActivityTimeline.tsx` -- reusable feed-style component for recent events
- **Generic tracker**: `StatusTracker` UI component (horizontal/vertical step indicators)
- **Real-time**: Full Supabase Realtime subscriptions for trips, orders, and driver location
- **Audit trail**: `order_events` table logs every status change for food orders

What's **missing** is a single, unified timeline component that:
- Works for both rides AND food orders with a consistent visual style
- Adapts its steps based on service type (ride vs delivery)
- Shows real-time ETA alongside each step
- Can be rendered from the `order_events` audit trail for historical views
- Provides role-aware views (customer, driver, restaurant) from the same component

## What Will Be Built

### 1. Unified Timeline Component

Create `src/components/shared/UnifiedOrderTimeline.tsx`:
- A single vertical timeline component accepting a `serviceType` prop ("ride" | "eats")
- Renders the correct step sequence per service type:
  - **Rides**: Requested, Driver Assigned, Driver En Route, Driver Arrived, Pickup, Trip In Progress, Completed
  - **Eats**: Order Placed, Confirmed, Preparing, Driver Assigned, Driver En Route, Picked Up, Out for Delivery, Delivered
- Each step shows: status icon, label, timestamp (when completed), and ETA (when current/upcoming)
- Visual states: completed (green check), current (animated pulse), pending (muted), delayed (amber warning)
- Accepts a `viewerRole` prop ("customer" | "driver" | "restaurant") to customize labels
  - Customer sees "Driver arriving" / Driver sees "Heading to pickup" / Restaurant sees "Driver approaching"
- Uses framer-motion for smooth step transitions

### 2. Timeline Data Hook

Create `src/hooks/useUnifiedTimeline.ts`:
- Accepts either a `tripId` (rides) or `orderId` (eats)
- For **eats**: queries `food_orders` for current status + timestamps, queries `order_events` for full event history
- For **rides**: queries `trips` table for status + timestamps
- Subscribes to Supabase Realtime for live updates (reuses existing channel patterns from `useTripRealtime` and `useCrossAppRealtime`)
- Computes ETA for current step using existing ETA fields (`eta_pickup`, `eta_dropoff`)
- Returns normalized timeline steps with completion timestamps, current step index, and delay status

### 3. Integration Points

**Customer ride view** -- Update `src/components/rider/TripTracker.tsx`:
- Replace the inline emoji-based status steps with `UnifiedOrderTimeline` (serviceType="ride", viewerRole="customer")

**Customer order detail** -- Update `src/pages/EatsOrderDetail.tsx`:
- Replace `StatusTimeline` import with `UnifiedOrderTimeline` (serviceType="eats", viewerRole="customer")
- Pass existing timestamps and dispatch phase data through

**Driver ride view** -- Update `src/pages/driver/DriverTripsPage.tsx`:
- Add `UnifiedOrderTimeline` to active trip card (serviceType="ride", viewerRole="driver")

**Driver eats view** -- Where driver views active delivery, add timeline (serviceType="eats", viewerRole="driver")

**Restaurant view** -- Update restaurant order detail to use `UnifiedOrderTimeline` (serviceType="eats", viewerRole="restaurant")

### 4. Notification Sync

Update `src/hooks/useUnifiedTimeline.ts` to emit timeline change events that the existing notification center can consume:
- When a step completes, dispatch to the notification store (reuses existing `RealtimeSyncContext` patterns)
- No new notification infrastructure needed -- just connect timeline state changes to the existing notification triggers

## Files to Create

| File | Description |
|------|-------------|
| `src/components/shared/UnifiedOrderTimeline.tsx` | Unified vertical timeline component with role-aware labels, ETA display, delay indicators |
| `src/hooks/useUnifiedTimeline.ts` | Data hook: fetches status, subscribes to realtime, computes ETA, returns normalized steps |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/rider/TripTracker.tsx` | Replace inline status steps with UnifiedOrderTimeline |
| `src/pages/EatsOrderDetail.tsx` | Swap StatusTimeline for UnifiedOrderTimeline |
| `src/pages/driver/DriverTripsPage.tsx` | Add UnifiedOrderTimeline to active trip detail |

## Technical Notes

- The component reuses existing color tokens from the verdant theme (`--rides`, `--eats`, emerald/amber for status states)
- ETA integration pulls from existing `eta_pickup`/`eta_dropoff` fields on trips and food_orders tables
- Realtime subscriptions follow the same channel pattern used in `RealtimeSyncContext` to avoid duplicate connections
- The `order_events` table is already populated by all status mutations, so historical timelines work immediately
- No database migrations needed -- all required tables and columns already exist
- The existing `StatusTimeline` and `StatusTracker` components remain available for any pages not yet migrated

