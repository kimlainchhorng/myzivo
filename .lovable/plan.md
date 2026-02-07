

# Rider Trip History Page

## Summary

Create a dedicated ride history page at `/rides/history` that shows past rides with pickup, destination, price, date, and status. Add a "Past Trips" quick-access button on the mobile home screen.

---

## Current State

| Component | Status |
|-----------|--------|
| `useRiderTripHistory` hook | Already exists - fetches trips where `rider_id = user.id` and status is `completed` or `cancelled` |
| `TripHistory` page | Exists at `/trips` - full-featured history page with stats, tabs, receipts |
| `/rides/history` route | Does not exist |
| "Past Trips" button on home | Does not exist |

---

## Implementation Approach

### Option A: Reuse Existing Page (Recommended)

Since `TripHistory.tsx` already provides a complete ride history experience:
1. Add an alias route `/rides/history` pointing to the existing `TripHistory` component
2. Add "Past Trips" button to `AppHome.tsx`

### Option B: Create New Simplified Page

Create a new lightweight page with just the essential trip list (no stats, no tabs).

---

## Recommended: Option A

This avoids code duplication since `TripHistory` already:
- Fetches trips for the current user via `useRiderTripHistory`
- Shows pickup/dropoff addresses
- Displays price and date
- Shows completed/cancelled status with tabs
- Includes receipt viewing and "Book Again" functionality

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/App.tsx` | Modify | Add `/rides/history` route pointing to `TripHistory` |
| `src/pages/app/AppHome.tsx` | Modify | Add "Past Trips" quick-access button |

---

## Technical Details

### Route Addition (App.tsx)

Add new route near existing ride routes:

```typescript
{/* ZIVO Ride - Premium Rider Flow */}
<Route path="/ride" element={<RidePage />} />
<Route path="/ride/confirm" element={<RideConfirmPage />} />
<Route path="/ride/searching" element={<RideSearchingPage />} />
<Route path="/ride/driver" element={<RideDriverPage />} />
<Route path="/ride/trip" element={<RideTripPage />} />
<Route path="/rides/history" element={<SetupRequiredRoute><TripHistory /></SetupRequiredRoute>} />
```

### Home Screen Button (AppHome.tsx)

Add a "Past Trips" button in the bottom action row, using the existing dark card style:

```typescript
// In the bottom row grid, add a Past Trips card
<DarkCard
  title="Past Trips"
  subtitle="Ride History"
  icon={Clock}
  onNavigate={() => navigate("/rides/history")}
  className="col-span-2 h-20"
/>
```

Alternative placement as a quick action row below the bento grid:

```typescript
{/* Quick Actions Row */}
<div className="flex items-center gap-2 mt-4">
  <motion.button
    onClick={() => navigate("/rides/history")}
    whileTap={{ scale: 0.97 }}
    className="flex-1 bg-zinc-900/80 border border-white/10 rounded-2xl p-3 flex items-center gap-3 touch-manipulation"
  >
    <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
      <Clock className="w-4 h-4 text-primary" />
    </div>
    <div className="text-left">
      <div className="text-sm font-semibold">Past Trips</div>
      <div className="text-[10px] text-zinc-400">View ride history</div>
    </div>
    <ChevronRight className="w-4 h-4 text-zinc-400 ml-auto" />
  </motion.button>
</div>
```

---

## What Riders Will See

### Trip History Page (`/rides/history`)

The existing `TripHistory` component displays:

1. **Stats Summary**: Trip count, total spent, miles traveled
2. **Tab Navigation**: Completed / Cancelled trips
3. **Trip Cards** with:
   - Date and time
   - Price (prominently displayed)
   - Rating (if rated)
   - Pickup address
   - Dropoff address
   - Distance and duration
   - Driver name
   - "Receipt" button (completed trips)
   - "Book Again" button

4. **Empty State**: Friendly prompt to book first ride

### Home Screen

New "Past Trips" button provides quick access from the main app screen.

---

## Data Flow

```text
User taps "Past Trips"
        |
        v
Navigate to /rides/history
        |
        v
TripHistory component renders
        |
        v
useAuth() gets current user.id
        |
        v
useRiderTripHistory(user.id) fetches from Supabase:
SELECT * FROM trips
WHERE rider_id = user.id
  AND status IN ('completed', 'cancelled')
ORDER BY created_at DESC
LIMIT 50
        |
        v
Display trip list with all details
```

---

## UI Consistency

- Uses existing `TripHistory` page design
- Button styling matches `AppHome` bento grid aesthetic
- Dark glassmorphic cards
- Premium gradient accents
- Touch-optimized with `active:scale-*` feedback

---

## No Changes To

- `useRiderTripHistory` hook (already fetches correct data)
- `TripHistory` component internals
- Database schema
- RLS policies (already allow users to read their own trips)

