

# Driver Activity Feed

## Overview

Create a new `/driver/activity` page that shows a chronological timeline of all driver earnings and financial activity. This gives drivers a single place to see their completed work and money flow.

## Data Sources

The timeline will pull from existing database tables:

| Source Table | Event Type | What it Shows |
|---|---|---|
| `trips` (completed) | Delivery completed | Ride fare earned |
| `food_orders` (completed) | Delivery completed | Eats delivery fee earned |
| `package_deliveries` (delivered) | Delivery completed | Package payout earned |
| `driver_earnings` | Wallet credit | Earnings credited to wallet |
| `payouts` | Payout issued | Money sent to driver |
| `driver_incentives` | Incentive/bonus | Active bonus periods and amounts |

## New Files

### 1. Hook: `src/hooks/useDriverActivityFeed.ts`

Fetches the last 30 days of activity from multiple tables, normalizes into a unified timeline format, and sorts by date descending. Each item has:
- `type`: "delivery" | "bonus" | "wallet_credit" | "payout" | "incentive"
- `title`: e.g., "Ride Completed", "Payout Issued"
- `description`: address or details
- `amount`: dollar value
- `timestamp`: ISO date
- `icon`: which icon to render
- `status`: for payouts (pending/paid)

### 2. Page: `src/pages/driver/DriverActivityPage.tsx`

Full-page timeline with:
- Header with back button and title "Activity"
- Filter tabs: All | Deliveries | Earnings | Payouts
- Scrollable timeline with date group headers (Today, Yesterday, Earlier)
- Each item shows: colored icon, title, description, amount, and relative time
- Empty state for new drivers
- Follows existing driver app dark theme (zinc-950 background, white/10 borders)

### 3. Route and Navigation

- Register `/driver/activity` route in `App.tsx`
- Add "Activity" quick-link on `DriverHomePage.tsx` alongside the existing Analytics link

## Visual Design

Matches the existing driver app style (dark zinc-950 theme):

```text
[Back]  Activity                    [Filter: All v]
─────────────────────────────────────────────────
  TODAY
  
  [green dot] Ride Completed              +$12.50
              123 Main St -> 456 Oak Ave
              2:30 PM
  
  [blue dot]  Eats Delivery               +$8.75
              Pizza Palace -> 789 Elm St
              1:15 PM

  YESTERDAY
  
  [purple dot] Payout Issued             -$45.00
               Bank transfer - Paid
               4:00 PM
  
  [amber dot]  Bonus Earned               +$5.00
               Peak hour bonus
               12:00 PM
```

## File Changes Summary

| File | Action |
|---|---|
| `src/hooks/useDriverActivityFeed.ts` | Create - unified activity feed hook |
| `src/pages/driver/DriverActivityPage.tsx` | Create - timeline page |
| `src/App.tsx` | Update - add `/driver/activity` route |
| `src/pages/driver/DriverHomePage.tsx` | Update - add Activity nav link |

## Technical Details

### Activity item interface

```text
ActivityItem {
  id: string
  type: "delivery" | "bonus" | "wallet_credit" | "payout" | "incentive"
  title: string
  description: string
  amount: number
  timestamp: string
  iconColor: string  // green, blue, purple, amber
  status?: string    // for payouts: pending/paid/failed
}
```

### Query strategy

The hook runs parallel queries to all source tables filtered by `driver_id` and last 30 days, merges results into a single sorted array, and groups by date for display. Uses React Query with 30-second refresh interval matching the existing earnings hook pattern.

### Filter logic

- **All**: Show everything
- **Deliveries**: type = "delivery" (trips, food orders, packages)
- **Earnings**: type = "wallet_credit" or "bonus" (driver_earnings, incentives)
- **Payouts**: type = "payout" (payouts table)
