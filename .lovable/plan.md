

# Add Real-Time Activity Feed and Status Updates

## Current State

The project already has strong real-time foundations:

- **Customer trips**: `TripTracker` with live map, status steps, ETA, driver location
- **Customer orders**: `useOrderTracking` with realtime Supabase subscriptions + driver polling
- **Notifications**: `NotificationCenter` popover with trip/order/delivery categories
- **Toasts**: `RealtimeOrderToasts` for dispatch events, `useCrossAppRealtime` for customer/driver/restaurant order updates
- **Driver feed**: `useDriverActivityFeed` for historical activity (completed trips, earnings, payouts)
- **Ride notifications**: `useRideStatusNotifications` with status banners and sounds
- **Admin**: `ActivityStream` for live admin event monitoring

## What's Missing

1. **Customer Activity Timeline** -- No unified timeline showing live events from ALL active services (rides + eats + deliveries) in one scrollable feed
2. **Restaurant Live Feed** -- Restaurant dashboard has stats but no live event timeline (order received, driver arriving, pickup completed)
3. **Driver Live Feed** -- Driver has historical activity but no real-time timeline of current-session events with animations
4. **Unified Activity Feed Component** -- No reusable timeline component that works across all three roles

## Plan

### 1. Create Reusable Activity Timeline Component

New file: `src/components/shared/ActivityTimeline.tsx`

A reusable, animated timeline component that renders a vertical list of status events with:
- Time column (left) showing relative time ("Just now", "2 min ago")
- Status icon (colored circle with Lucide icon, matching service type)
- Title and subtitle text
- Animated entry (slide-in + fade-in for new items)
- Verdant theme, rounded cards, `card-interactive` hover effect
- Scrollable with `ScrollArea` component
- Empty state with illustration

Props: `items: TimelineItem[]` where each item has `id`, `icon`, `iconColor`, `title`, `subtitle`, `timestamp`, `status` (active/completed/pending).

### 2. Customer Activity Feed Section (AppHome.tsx)

Add a "Recent Activity" section to the home screen (after Quick Actions, before Popular Near You) showing:
- Active trip status updates (from `useRiderTripRealtime` subscription data)
- Active food order updates (from `useCustomerOrdersRealtime`)
- Recent completed items from notifications

This section only appears when the user has active or recent (last 2 hours) orders/trips. Uses the new `ActivityTimeline` component.

New hook: `src/hooks/useCustomerActivityFeed.ts`
- Queries active trips + active food_orders for the current user
- Subscribes to realtime changes on both tables
- Merges events into a unified sorted timeline
- Returns `{ items: TimelineItem[], hasActiveItems: boolean }`

### 3. Restaurant Live Feed

New file: `src/components/restaurant/RestaurantActivityFeed.tsx`

Add a "Live Orders" timeline tab/section to the restaurant dashboard showing:
- "New order received" (on INSERT to food_orders)
- "Driver assigned" (on driver_id change)
- "Driver arriving" (on status change to ready_for_pickup with driver)
- "Order picked up" (on status change to out_for_delivery)
- "Order delivered" (on status change to delivered)

Uses Supabase realtime subscription filtered by `restaurant_id`. Rendered using the shared `ActivityTimeline` component. Added as a new tab or section in `RestaurantDashboard.tsx`.

### 4. Driver Session Feed

New file: `src/components/driver/DriverSessionFeed.tsx`

Real-time feed for the driver's current session showing:
- "New ride request" / "New delivery request" 
- "Pickup ready" notifications
- "Trip started" / "Trip completed"
- Earnings credited

Uses existing `useDriverActivityFeed` for historical data + adds a realtime subscription layer for live events during the current session. Session events stored in component state (not DB) and cleared on app restart.

### 5. Push Notification Enhancement

The push notification infrastructure already exists (`useWebPush`, `usePushNotifications`, service worker). The realtime hooks already trigger toasts. No new push notification code is needed -- the existing `RealtimeSyncContext` handles cross-role notifications. The new feeds simply provide a visual timeline alongside the existing toast/push system.

## Files Changed

| File | Change |
|------|--------|
| `src/components/shared/ActivityTimeline.tsx` | New reusable timeline component |
| `src/hooks/useCustomerActivityFeed.ts` | New hook: unified customer activity from trips + orders |
| `src/pages/app/AppHome.tsx` | Add "Recent Activity" section using customer feed |
| `src/components/restaurant/RestaurantActivityFeed.tsx` | New live order timeline for restaurant dashboard |
| `src/pages/RestaurantDashboard.tsx` | Add activity feed tab |
| `src/components/driver/DriverSessionFeed.tsx` | New session-based live feed for drivers |

## Technical Details

- All realtime subscriptions use Supabase `postgres_changes` (consistent with existing patterns)
- Timeline items animate in using CSS `animate-in slide-in-from-left` (no heavy framer-motion)
- Each feed limits to 50 most recent events to prevent memory bloat
- Customer feed auto-hides when no active items exist
- All components use the design system: `rounded-2xl`, `border-border/50`, `shadow-sm`, Verdant accents, `text-caption` for timestamps
- No new dependencies required

