

# Delivery Replay -- See Where Your Order Traveled

## Overview

After an order is delivered, customers can tap "View Delivery Route" on the order detail page to see a full-screen map showing the route the driver took from restaurant to their door, with key event markers and timestamps.

## Data Source

The `driver_location_history` table already records driver GPS positions with timestamps. The `food_orders` table stores all key timestamps (`picked_up_at`, `delivered_at`) and coordinates (`pickup_lat/lng`, `delivery_lat/lng`). No new database tables are needed.

## Changes

### 1. New Hook: `src/hooks/useDeliveryReplay.ts`

Fetches the driver's location trail for a completed order:
- Query `driver_location_history` filtered by `driver_id`, between `picked_up_at` and `delivered_at` timestamps
- Returns an array of `{lat, lng, recorded_at}` points sorted chronologically
- Also returns key event markers (pickup, out-for-delivery, delivered) with timestamps from the order record

### 2. New Page: `src/pages/EatsDeliveryReplay.tsx`

Full-screen map page at `/eats/orders/:id/replay`:
- Google Map (dark mode) showing:
  - **Route polyline** connecting all recorded driver GPS points (orange line)
  - **Pickup marker** (orange dot) at restaurant location with timestamp
  - **Delivery marker** (green dot) at customer address with timestamp
  - **Key event markers** along the route for "Out for Delivery" and "Delivered"
- Header with back button and order info
- Bottom legend card showing event timestamps in a mini vertical timeline
- Loading and empty states (e.g., "No route data available for this order")

### 3. Update: `src/pages/EatsOrderDetail.tsx`

Add a "View Delivery Route" button for delivered orders, placed between the "Order Again" and "Get Help" buttons:
- Only visible when `order.status === "delivered"`
- Navigates to `/eats/orders/:id/replay`
- Styled with a Map icon and outline variant matching the existing design

### 4. Update: Route Registration

Add the new `/eats/orders/:id/replay` route to the app router.

## UI Design

The replay map will use the same dark map styles already used by `DeliveryMap.tsx`. The route line will be drawn as a Google Maps Polyline (orange, semi-transparent). Event markers will use colored circles consistent with the existing marker design language (orange for restaurant, green for delivery).

## Edge Cases

- **No location history**: If the driver had no GPS records during the delivery window, show a fallback with just the pickup and delivery markers connected by a straight dashed line, with a note "Detailed route not available"
- **Very few points**: If fewer than 3 GPS points, still draw the line but note it's approximate
- **Missing timestamps**: If `picked_up_at` or `delivered_at` is null, the button won't appear

