

# Super App Home — Unified Home Screen

## Overview

Redesign the `AppHome` mobile screen to be a true super-app hub with three distinct zones: large service buttons, a personalized section, and smart quick actions.

## Current State

The existing `AppHome.tsx` has a bento grid of service cards, a "Book a Ride" live activity island, a search bar, and two quick-action buttons (Past Trips, Payment). It lacks:
- A **Delivery** service button (separate from Move/Package)
- A **Rentals** button (car rentals)
- Personalized recent activity or recommended services
- Context-aware quick actions (reorder meal, rebook ride, upcoming bookings)

## What Changes

### Single file update: `src/pages/app/AppHome.tsx`

The page structure becomes three clear zones:

```text
[Profile Bar + Notifications]

[Search Bar]

--- ZONE 1: Services Grid (6 large buttons) ---
| Ride      | Eats      |
| Delivery  | Flights   |
| Hotels    | Rentals   |

--- ZONE 2: Personalized (logged-in users) ---
  Recent Activity (last 3 items from trips/food/deliveries)
  Recommended Services (based on usage patterns)

--- ZONE 3: Quick Actions ---
  [Reorder Last Meal]  [Book Last Ride]
  [View Upcoming Bookings]

[Recommended Deals]
[Bottom Nav]
```

### Zone 1 — Large Service Buttons (6 items)

Replace the current mixed bento grid with a clean 2-column grid of equally-sized image-backed cards:

| Button | Route | Image |
|---|---|---|
| Ride | /rides | Existing rides image |
| Eats | /eats | Existing food image |
| Delivery | /move | Existing move/package image |
| Flights | /search?tab=flights | Existing flights image |
| Hotels | /search?tab=hotels | Existing hotels image |
| Rentals | /rent-car | New car rental image |

Each card is taller than current (h-28 vs h-24) for easier tapping.

### Zone 2 — Personalized Section (auth-gated)

For logged-in users, show two sub-sections:

**Recent Activity**: Fetches last 3 items across `trips`, `food_orders`, and `package_deliveries` tables, sorted by `created_at` desc. Displays as a horizontal scroll of compact cards with emoji, title, and relative time.

**Recommended Services**: Simple logic — if user has no rides, suggest "Try ZIVO Ride"; if no food orders, suggest "Order your first meal"; etc. Shows as pill badges linking to the respective service.

### Zone 3 — Quick Actions (auth-gated)

Three contextual buttons in a grid:

1. **Reorder Last Meal**: Queries `food_orders` for latest completed order. Shows restaurant name. Tapping navigates to that restaurant's menu page (`/eats/restaurant/:id`). Falls back to "Order Food" if no history.

2. **Book Last Ride**: Queries `trips` for latest completed trip. Shows pickup address. Tapping navigates to `/rides` with pickup pre-filled via query param. Falls back to "Book a Ride" if no history.

3. **View Upcoming Bookings**: Static link to `/trips`. Shows count of upcoming bookings from `trips` + `hotel_bookings` + `food_orders` where status is active/upcoming.

### Removed Elements

- The "Live Activity Island" (Book a Ride floating banner) — replaced by the Ride service card
- The Premium card — moved out of the main grid (users can access via Account)
- The Cars/Hotels bottom row — absorbed into the main 6-button grid
- Past Trips and Payment quick actions — replaced by the new contextual actions

## Technical Details

### Data fetching

All personalization queries use React Query with the existing pattern:

```text
useQuery({
  queryKey: ["home-recent", user?.id],
  queryFn: async () => {
    // Parallel fetch from trips, food_orders, package_deliveries
    // Normalize into { id, title, subtitle, emoji, timestamp }
    // Sort by timestamp desc, take top 3
  },
  enabled: !!user?.id,
  staleTime: 30_000,
})
```

Quick action queries follow the same pattern, fetching the single most recent completed item from each service.

### Upcoming bookings count

```text
useQuery({
  queryKey: ["home-upcoming-count", user?.id],
  queryFn: async () => {
    // Count trips with status in ['accepted','in_progress','scheduled']
    // + hotel_bookings with check_in_date >= today
    // + food_orders with status in ['pending','preparing','ready']
    return totalCount;
  },
  enabled: !!user?.id,
})
```

### Visual style

Maintains the existing dark zinc-950 theme, white/10 borders, backdrop-blur cards. Service cards keep the image-background style with gradient overlays. Quick action cards use the DarkCard style (zinc-900/80 bg).

## File Summary

| File | Action | What |
|---|---|---|
| `src/pages/app/AppHome.tsx` | Update | Restructure into 3 zones: services grid, personalized section, quick actions. Add data-fetching queries for recent activity, quick actions context, and upcoming count |

Single file change. No new files, hooks, or routes needed — all data fetching is inline with React Query matching the existing pattern already in `QuickActionsSection.tsx`.

