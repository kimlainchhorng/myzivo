

## Scheduled Booking System for ZIVO

Add the ability to schedule rides, food deliveries, and package deliveries for a future date/time, plus a dedicated "Upcoming Bookings" screen accessible from the home panel and bottom nav.

---

### Architecture Overview

Since ZIVO currently has no scheduling infrastructure, this plan creates a client-side scheduling system with localStorage persistence (matching the existing ride booking pattern in `useRideTripState.ts`). The system stores scheduled bookings locally and displays them in a new Upcoming Bookings page.

```text
+---------------------------+
|  useScheduledBookings.ts  |  (new hook - localStorage CRUD)
+---------------------------+
          |
    +-----+------+
    |             |
    v             v
ScheduledBookingsPage.tsx    AppHome.tsx
(full upcoming list)         (compact card in panel)
```

---

### What Will Be Created

**1. New Hook: `src/hooks/useScheduledBookings.ts`**

Manages scheduled bookings in localStorage with full CRUD:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique ID (crypto.randomUUID) |
| type | "ride" / "eats" / "delivery" | Service type |
| scheduledDate | string | ISO date |
| scheduledTime | string | "HH:mm" format |
| pickup | string | Pickup address |
| destination | string | Drop-off (rides/delivery) |
| status | "scheduled" / "completed" / "cancelled" | Current state |
| details | object | Service-specific metadata (ride type, restaurant, etc.) |
| createdAt | number | Timestamp |

Exports: `getScheduledBookings()`, `addScheduledBooking()`, `cancelScheduledBooking()`, `editScheduledBooking()`, `getUpcoming()` (filters future only).

**2. New Page: `src/pages/ScheduledBookingsPage.tsx`**

Full-screen upcoming bookings view with:

- Header with back button and "Scheduled Bookings" title
- Tabs: Upcoming / Past / Cancelled
- Each booking card shows:
  - Service icon (Car/Utensils/Package) with color
  - Date and time in large typography
  - Pickup and destination addresses
  - Status badge
  - Cancel and Edit buttons
- Empty state with calendar icon and "Schedule your first booking" CTA
- Verdant green theme with rounded-2xl cards
- Bottom nav included

**3. New Route**

Add `/scheduled` route in App.tsx routing config pointing to `ScheduledBookingsPage`.

**4. Home Screen Update: `src/pages/app/AppHome.tsx`**

Add a compact "Upcoming Scheduled" card in the sliding panel, positioned after the Invite Friends card and before Recently Used. Shows:

- Clock icon + "Scheduled" heading
- Next upcoming booking preview (type icon, date/time, route)
- Count badge if multiple bookings
- "View All" link to `/scheduled`
- Auth-gated (only shows when user has scheduled bookings)

**5. Schedule Button in Rides Page: `src/pages/Rides.tsx`**

Add a "Schedule for later" button in the ride request step (alongside the existing "Where to?" input area). Tapping it opens a date/time picker popover using the existing Calendar and a time selector. When confirmed, saves to `useScheduledBookings` and shows a toast confirmation.

---

### Technical Details

**New files (3):**

| File | Purpose |
|------|---------|
| `src/hooks/useScheduledBookings.ts` | LocalStorage-based scheduling CRUD hook |
| `src/pages/ScheduledBookingsPage.tsx` | Full upcoming bookings page |
| `src/components/schedule/SchedulePickerPopover.tsx` | Reusable date+time picker popover component |

**Modified files (2):**

| File | Change |
|------|--------|
| `src/pages/app/AppHome.tsx` | Add compact scheduled bookings card in panel |
| `src/App.tsx` | Add `/scheduled` route |

**Date/Time Picker Component** (`SchedulePickerPopover.tsx`):
- Uses existing `Calendar` component (from shadcn) inside a `Popover`
- Adds a time selector grid (scrollable list of 30-min slots: 12:00 AM through 11:30 PM)
- "Confirm" button returns the selected `{ date, time }` pair
- Disables past dates via the Calendar's `disabled` prop
- Adds `pointer-events-auto` class per shadcn datepicker guidelines

**Home card design:**
```text
+-------------------------------------------+
| [Clock icon] Scheduled         View All > |
| ----------------------------------------- |
| [Car icon] Ride to Airport                |
| Tomorrow, 6:30 AM                         |
| JFK Terminal 4                            |
+-------------------------------------------+
```

Styled with `rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-500/5 border border-primary/15`.

**Upcoming Bookings Page card design:**
```text
+-------------------------------------------+
| [Car]  Standard Ride           [Scheduled]|
|        Feb 15, 2026 - 6:30 AM             |
|        123 Main St -> JFK Airport         |
|                                           |
|        [Cancel]              [Edit]       |
+-------------------------------------------+
```

**Flights and Hotels Note:**
Flights and hotels already use proper calendar date pickers in their search flows (`FlightSearch.tsx` uses date selectors, `HotelSearch` uses check-in/check-out dates). No changes needed for those -- they already support selecting future dates. The scheduling system here focuses on on-demand services (rides, eats, delivery) that currently only support "now" bookings.

---

### Summary

| Item | Detail |
|------|--------|
| New files | 3 (hook, page, picker component) |
| Modified files | 2 (AppHome, App.tsx routing) |
| Storage | localStorage (matches existing ride trip pattern) |
| Services supported | Rides, Eats, Delivery |
| Flights/Hotels | Already have calendar UIs -- no changes needed |
| Design | Verdant green, rounded-2xl cards, large typography |
