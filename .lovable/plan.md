

## Plan: Ride Lifecycle Notifications, Driver Navigation Line, and Percentage-Based Tips

### What the user wants

1. **Ride lifecycle notifications** — Toast/bell notifications at each stage: driver arriving in 5 min, driver arrived, pickup confirmed, dropoff complete
2. **Driver navigation line on map** — A polyline from driver's current position to the pickup (during en-route) and to the destination (during trip-in-progress)
3. **Percentage-based tips** — Change tip buttons from $1/$2/$5 to 5%, 10%, 20%, 50% + Custom

---

### Changes

#### 1. Add ride lifecycle notifications (RideBookingHome.tsx)

In each auto-advance `useEffect`, fire a toast notification:

- **searching → driver-assigned**: `toast("Driver Found!", { description: "Your driver is on the way. Arriving in ~5 minutes." })`
- **driver-assigned → driver-en-route**: `toast("Driver En Route", { description: "Your driver is heading to your pickup." })`
- **driver-en-route → trip-in-progress** (when `progress >= 1`): `toast("Driver Arrived!", { description: "Your driver has arrived at the pickup point." })`
- **trip-in-progress → trip-complete**: `toast("Trip Complete!", { description: "You've arrived at your destination." })`

Also add a notification when driver ETA hits 0 during en-route countdown.

#### 2. Draw navigation polyline from driver to pickup/destination (RideMap.tsx)

Add a new prop `driverNavigationTarget` (or reuse existing coordinates) to draw a dashed polyline from `driverCoords` to the target point:

- Create a new `useEffect` that watches `driverCoords` and draws/updates a dashed polyline from the driver's position to `pickupCoords` (or `dropoffCoords` depending on trip phase)
- Use a distinct style: dashed green line (`strokeOpacity: 0.6`, `strokeWeight: 3`, dashed pattern) so it's visually different from the main route
- Store in a new ref `driverNavLineRef` and clean up properly

In **RideBookingHome.tsx**, pass `driverCoords` during both `driver-en-route` and `trip-in-progress` phases (already done), and add a new prop to RideMap to indicate the navigation target.

#### 3. Change tip buttons to percentage-based (RideBookingHome.tsx)

Replace the current tip section (lines 2543-2568):

```
Current: $1, $2, $5, Custom
New: 5%, 10%, 20%, 50%, Custom
```

- Calculate tip as percentage of `currentPrice` (e.g., 5% of $1.75 = $0.09)
- Display the percentage on the button and show calculated dollar amount
- Custom opens an input for a dollar amount
- Update `tip` state to store the calculated dollar value

---

### Files to modify

| File | Change |
|------|--------|
| `src/components/rides/RideBookingHome.tsx` | Add toast notifications at each state transition; change tip buttons to 5%/10%/20%/50%/Custom with percentage calculation; add custom tip input state |
| `src/components/maps/RideMap.tsx` | Add `driverNavigationTarget` prop; draw dashed polyline from driver to target; update on driver position changes |

