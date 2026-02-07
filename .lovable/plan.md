

# ZIVO Admin Panel Enhancements

## Summary

Enhance the existing admin panel at `/admin` with improved realtime dashboard statistics, better rides management, driver detail pages, and streamlined payouts workflow. All changes build on top of existing infrastructure.

---

## Current State Analysis

| Feature | Current Status | Gap |
|---------|----------------|-----|
| Dashboard stats | Uses `useAdminStats` - shows counts only | Missing: rides today, realtime subscription, revenue with 15% commission |
| Rides table | `AdminRidesManagement` has ride requests + live rides | Actions exist but could be more prominent |
| Driver details | No individual driver page | Missing: total rides, earnings, commission generated |
| Payouts | `AdminPayouts` has full table + Mark Paid | Works but needs refinement |

---

## Implementation Plan

### 1. Enhanced Dashboard Stats Component

Create a new `AdminRidesDashboard.tsx` component that shows:

| Stat | Description | Source |
|------|-------------|--------|
| Total Rides Today | Count of trips created today | `trips` where `created_at >= today` |
| Active Rides | In-progress rides | `trips` where status in (requested, accepted, en_route, arrived, in_progress) |
| Completed Rides | Completed today | `trips` where status = completed AND `completed_at >= today` |
| Online Drivers | Currently available | `drivers` where `is_online = true` |
| Total Revenue | Sum of fare_amount today | `trips` where payment_status = paid |
| Platform Commission (15%) | Revenue * 0.15 | Calculated |

**Realtime:** Subscribe to `trips` and `drivers` tables for live updates.

### 2. Improved Rides Management Table

Enhance the existing rides table in `AdminRidesManagement.tsx`:

**Visible columns:**
- Pickup (pickup_address)
- Destination (dropoff_address) 
- Ride Type (vehicle_type or fare tier)
- Price (fare_amount)
- Status (with color badges)
- Driver (linked to driver detail)

**Row Actions (visible on each row):**
- Assign Driver (dropdown of available drivers)
- Cancel Ride (with confirmation)
- Mark Completed (for in_progress rides)

**Implementation:**
- Use existing `useAdminTrips` hook
- Add inline action buttons
- Driver assignment uses `useOnlineDrivers` for available list

### 3. Driver Detail Page

Create new route `/admin/drivers/:id` with:

**Driver Info Card:**
- Name, rating, car model, plate, online status
- Last location update timestamp

**Stats Grid:**
| Stat | Query |
|------|-------|
| Total Rides | COUNT from trips where driver_id = X |
| Total Earnings | SUM(fare_amount) from trips where driver_id = X AND payment_status = 'paid' |
| Platform Commission | Total Earnings * 0.15 |
| Completion Rate | Completed / (Completed + Cancelled) |

**Recent Trips Table:**
- Last 20 trips for this driver
- Status, fare, date

**Files to create:**
- `src/pages/admin/drivers/DriverDetail.tsx`
- `src/hooks/useDriverStats.ts` (or extend existing hooks)

### 4. Payouts Workflow Improvements

Enhance `AdminPayouts.tsx`:

**Current:** Has Mark Paid functionality
**Additions:**
- More prominent "Mark Paid" button
- Batch selection improvements
- Add filtering by date range
- Show driver name prominently
- Add payout amount formatting

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/admin/AdminRidesDashboard.tsx` | Create | New realtime stats dashboard component |
| `src/hooks/useRealtimeRidesStats.ts` | Create | Realtime subscription for rides stats |
| `src/components/admin/AdminRidesManagement.tsx` | Modify | Add inline actions, improve table |
| `src/pages/admin/drivers/DriverDetail.tsx` | Create | Individual driver stats page |
| `src/hooks/useDriverDetailStats.ts` | Create | Fetch driver-specific stats |
| `src/App.tsx` | Modify | Add route for `/admin/drivers/:id` |
| `src/components/admin/AdminPayouts.tsx` | Modify | Improve Mark Paid workflow |
| `src/layouts/AdminLayout.tsx` | Modify | Update nav if needed |

---

## Technical Details

### Realtime Stats Hook

```typescript
// src/hooks/useRealtimeRidesStats.ts
export function useRealtimeRidesStats() {
  const [stats, setStats] = useState({
    totalRidesToday: 0,
    activeRides: 0,
    completedRides: 0,
    onlineDrivers: 0,
    totalRevenue: 0,
    platformCommission: 0, // 15%
  });

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Subscribe to trips changes
    const tripsChannel = supabase
      .channel("realtime-trips")
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "trips" 
      }, () => fetchStats())
      .subscribe();

    // Subscribe to drivers changes
    const driversChannel = supabase
      .channel("realtime-drivers")
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "drivers",
        filter: "is_online=eq.true"
      }, () => fetchStats())
      .subscribe();

    return () => {
      supabase.removeChannel(tripsChannel);
      supabase.removeChannel(driversChannel);
    };
  }, []);

  async function fetchStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const [trips, drivers] = await Promise.all([
      supabase.from("trips").select("*")
        .gte("created_at", todayISO),
      supabase.from("drivers").select("*", { count: "exact", head: true })
        .eq("is_online", true),
    ]);

    const todayTrips = trips.data || [];
    const activeStatuses = ["requested", "accepted", "en_route", "arrived", "in_progress"];
    
    const totalRevenue = todayTrips
      .filter(t => t.payment_status === "paid")
      .reduce((sum, t) => sum + (t.fare_amount || 0), 0);

    setStats({
      totalRidesToday: todayTrips.length,
      activeRides: todayTrips.filter(t => activeStatuses.includes(t.status)).length,
      completedRides: todayTrips.filter(t => t.status === "completed").length,
      onlineDrivers: drivers.count || 0,
      totalRevenue,
      platformCommission: totalRevenue * 0.15,
    });
  }

  return stats;
}
```

### Driver Detail Page Structure

```text
/admin/drivers/:id

+--------------------------------------------------+
| ← Back to Drivers                                |
+--------------------------------------------------+
| [Avatar] John Smith         ★ 4.8                |
| Toyota Camry · ABC 1234                          |
| 🟢 Online · Last update: 2 min ago               |
+--------------------------------------------------+
| +----------+ +----------+ +----------+ +--------+|
| |   156    | |  $4,520  | |   $678   | |  94%   ||
| |Total Rides| |Earnings | |Commission| |Complete||
| +----------+ +----------+ +----------+ +--------+|
+--------------------------------------------------+
| Recent Trips                                     |
| +----------------------------------------------+ |
| | Date       | Pickup   | Dropoff | Fare | Sts | |
| |------------|----------|---------|------|-----| |
| | Feb 7 9:30 | 123 Main | 456 Oak | $24  |  ✓  | |
| | Feb 7 8:15 | ...      | ...     | $18  |  ✓  | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

### Rides Table Actions

Each row in the rides table will have an actions dropdown:

```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {ride.status === "requested" && !ride.driver_id && (
      <DropdownMenuItem onClick={() => openAssignDialog(ride)}>
        <UserPlus className="mr-2 h-4 w-4" />
        Assign Driver
      </DropdownMenuItem>
    )}
    {ride.status !== "completed" && ride.status !== "cancelled" && (
      <DropdownMenuItem onClick={() => cancelRide(ride.id)}>
        <XCircle className="mr-2 h-4 w-4 text-red-500" />
        Cancel Ride
      </DropdownMenuItem>
    )}
    {ride.status === "in_progress" && (
      <DropdownMenuItem onClick={() => completeRide(ride.id)}>
        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
        Mark Completed
      </DropdownMenuItem>
    )}
  </DropdownMenuContent>
</DropdownMenu>
```

### Driver Assignment Dialog

When "Assign Driver" is clicked:
1. Fetch online drivers using `useOnlineDrivers`
2. Show dialog with driver list
3. On selection, update trip with `driver_id` and set status to "accepted"

---

## Routes Structure

```text
/admin                    → AdminDashboard (existing) + new stats component
/admin/rides              → Enhanced AdminRidesManagement
/admin/drivers            → Driver list (existing)
/admin/drivers/:id        → NEW: DriverDetail page
/admin/payouts            → Enhanced AdminPayouts
```

---

## UI/UX Consistency

- Use existing Card, Badge, Button, Table components from shadcn/ui
- Match glassmorphic style: `bg-card/50 backdrop-blur-xl`
- Use status badges with consistent colors (emerald for active, amber for pending, etc.)
- Keep animations: `animate-in fade-in slide-in-from-bottom-4`

---

## Realtime Updates

| Table | Events | Action |
|-------|--------|--------|
| trips | INSERT, UPDATE, DELETE | Refresh dashboard stats |
| drivers | UPDATE (is_online, current_lat/lng) | Refresh online count, map |

Using Supabase Realtime channels for live updates without polling.

---

## No Changes To

- Rider app routes/components
- Driver app routes/components  
- Database schema (existing tables sufficient)
- Authentication flow

