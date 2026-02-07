

# ZIVO Admin Dashboard - Rides Operations

## Summary

Add a focused admin dashboard module for managing ZIVO Ride operations (rides, drivers, payouts, commissions) to the existing project. The module uses the same Supabase backend and leverages existing hooks and components where possible.

---

## Current State

| Component | Status |
|-----------|--------|
| Admin authentication | Exists (`AdminLogin.tsx`, `useAdminRole`) |
| Admin route protection | Exists (`AdminProtectedRoute`, `ProtectedRoute requireAdmin`) |
| Admin stats hook | Exists (`useAdminStats.ts`) |
| Realtime rides stats | Exists (`useRealtimeRidesStats.ts`) |
| Driver detail page | Exists (`/admin/drivers/:id`) |
| Commissions page | Exists (`/admin/commissions`) |
| Payouts table | Already exists in database with full schema |
| Rides dashboard | Exists as component (`AdminRidesDashboard.tsx`) |

---

## Implementation Approach

Since most infrastructure exists, focus on creating dedicated pages that consolidate and enhance ride operations functionality:

1. **New Rides Hub Page** (`/admin/rides`) - Full ride management with table, filters, drawer
2. **New Drivers Hub Page** (`/admin/drivers`) - Driver list with online status, earnings summary
3. **New Payouts Hub Page** (`/admin/payouts`) - Payout management with balance calculation
4. **New Setup Page** (`/admin/setup`) - Environment check and SQL reference
5. **Update Dashboard** - Enhance KPIs with 7-day metrics and driver earnings breakdown

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/admin/rides/RidesHubPage.tsx` | Create | Full ride management page with table, filters, detail drawer |
| `src/pages/admin/rides/RideDetailDrawer.tsx` | Create | Slide-over drawer for ride details and actions |
| `src/pages/admin/drivers/DriversHubPage.tsx` | Create | Driver list with earnings summary |
| `src/pages/admin/payouts/PayoutsHubPage.tsx` | Create | Payout management with balance calc |
| `src/pages/admin/SetupPage.tsx` | Create | Environment variables and SQL reference |
| `src/hooks/useRideManagement.ts` | Create | Hook for ride CRUD operations with realtime |
| `src/hooks/useDriverPayouts.ts` | Create | Hook for driver payout calculations |
| `src/App.tsx` | Modify | Add new admin routes |
| `src/components/admin/MissionControlSidebar.tsx` | Modify | Add Rides section if not present |

---

## Technical Details

### 1. RidesHubPage (`/admin/rides`)

Features:
- Table showing all rides with sortable columns
- Filters: status (all, requested, accepted, in_progress, completed, cancelled), date range, ride_type
- Search by pickup/dropoff address
- Detail drawer on row click
- Actions: assign driver, cancel ride, mark completed
- Realtime updates via Supabase subscriptions

```typescript
// Key state and filtering
const [statusFilter, setStatusFilter] = useState<string>("all");
const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
const [selectedRide, setSelectedRide] = useState<Trip | null>(null);

// Realtime subscription
useEffect(() => {
  const channel = supabase
    .channel("admin-rides")
    .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, 
      () => refetch()
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}, []);
```

### 2. RideDetailDrawer

Slide-over component with:
- Ride info (pickup, dropoff, fare, status)
- Driver assignment dropdown (list of online drivers)
- Action buttons: Cancel, Mark Completed, Assign Driver
- Trip timeline (created → accepted → started → completed)

```typescript
interface RideDetailDrawerProps {
  ride: Trip | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (tripId: string, updates: Partial<Trip>) => Promise<void>;
}

// Assign driver action
const handleAssignDriver = async (driverId: string) => {
  await supabase
    .from("trips")
    .update({ driver_id: driverId, status: "accepted" })
    .eq("id", ride.id);
  toast.success("Driver assigned");
};
```

### 3. DriversHubPage (`/admin/drivers`)

Features:
- Table with all drivers
- Online status indicator with last update time
- Link to existing detail page (`/admin/drivers/:id`)
- Summary stats: total earnings, platform commission, pending payout

```typescript
// Fetch drivers with stats
const { data: drivers } = useQuery({
  queryKey: ["admin-drivers-list"],
  queryFn: async () => {
    const { data } = await supabase
      .from("drivers")
      .select("id, full_name, phone, is_online, updated_at, rating, total_trips, vehicle_model, vehicle_plate")
      .order("updated_at", { ascending: false });
    return data;
  },
});
```

### 4. PayoutsHubPage (`/admin/payouts`)

Features:
- List all payouts with status filter
- Create new payout for a driver
- Mark payout as paid/failed
- Balance calculation: (85% of completed rides) - (sum of paid payouts)

```typescript
// Balance calculation query
const calculateDriverBalance = async (driverId: string) => {
  // Get total earnings from completed rides (85% driver share)
  const { data: trips } = await supabase
    .from("trips")
    .select("fare_amount")
    .eq("driver_id", driverId)
    .eq("status", "completed")
    .eq("payment_status", "paid");
  
  const totalEarnings = trips?.reduce((sum, t) => sum + (t.fare_amount || 0), 0) || 0;
  const driverShare = totalEarnings * 0.85;
  
  // Get paid payouts
  const { data: payouts } = await supabase
    .from("payouts")
    .select("amount")
    .eq("driver_id", driverId)
    .eq("status", "paid");
  
  const totalPaid = payouts?.reduce((sum, p) => sum + p.amount, 0) || 0;
  
  return {
    totalEarnings,
    driverShare,
    totalPaid,
    balance: driverShare - totalPaid,
  };
};
```

### 5. SetupPage (`/admin/setup`)

Features:
- Display required environment variables
- Check if Supabase is connected
- Show SQL for payouts table (for reference)

```typescript
const ENV_VARS = [
  { key: "VITE_SUPABASE_URL", description: "Supabase project URL" },
  { key: "VITE_SUPABASE_ANON_KEY", description: "Supabase anonymous key" },
];

// Check connection
const checkConnection = async () => {
  const { error } = await supabase.from("drivers").select("id").limit(1);
  return !error;
};
```

### 6. Route Updates in App.tsx

```typescript
// New imports
const RidesHubPage = lazy(() => import("./pages/admin/rides/RidesHubPage"));
const DriversHubPage = lazy(() => import("./pages/admin/drivers/DriversHubPage"));
const PayoutsHubPage = lazy(() => import("./pages/admin/payouts/PayoutsHubPage"));
const SetupPage = lazy(() => import("./pages/admin/SetupPage"));

// Routes to add
<Route path="/admin/rides" element={<ProtectedRoute requireAdmin><RidesHubPage /></ProtectedRoute>} />
<Route path="/admin/drivers" element={<ProtectedRoute requireAdmin><DriversHubPage /></ProtectedRoute>} />
<Route path="/admin/payouts" element={<ProtectedRoute requireAdmin><PayoutsHubPage /></ProtectedRoute>} />
<Route path="/admin/setup" element={<ProtectedRoute requireAdmin><SetupPage /></ProtectedRoute>} />
```

---

## Admin Email Authorization

The existing system uses `useAdminRole` hook which checks the `user_roles` table. The request mentions an `ADMIN_EMAILS` constant - this can be added as an additional check:

```typescript
// src/config/adminConfig.ts
export const ADMIN_EMAILS = [
  "admin@zivo.com",
  "ops@zivo.com",
  // Add authorized admin emails here
];

// Enhanced check in AdminProtectedRoute or AdminLogin
const isAuthorizedAdmin = ADMIN_EMAILS.includes(user.email || "") || hasAnyAdminRole;
```

---

## Dashboard KPI Enhancements

Update the existing dashboard with:
- Rides today (existing)
- Active rides (existing)
- Completed rides (7 days) - NEW
- Online drivers (existing)
- Gross revenue (7 days) - NEW
- Platform commission (15%) - ENHANCED
- Driver earnings (85%) - NEW

```typescript
// Enhanced stats hook
const { data: weeklyStats } = useQuery({
  queryKey: ["admin-weekly-stats"],
  queryFn: async () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: trips } = await supabase
      .from("trips")
      .select("fare_amount, status, payment_status")
      .gte("created_at", weekAgo.toISOString())
      .eq("status", "completed");
    
    const grossRevenue = trips?.reduce((sum, t) => sum + (t.fare_amount || 0), 0) || 0;
    
    return {
      completedLast7Days: trips?.length || 0,
      grossRevenue,
      platformCommission: grossRevenue * 0.15,
      driverEarnings: grossRevenue * 0.85,
    };
  },
});
```

---

## UI Components Used

All from existing shadcn/ui library:
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `Badge`, `Button`, `Input`, `Label`
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`
- `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` (for drawer)
- `Skeleton` for loading states
- `toast` from sonner for notifications

---

## Database Notes

The `payouts` table already exists with this schema:
- `id` (uuid, PK)
- `driver_id` (uuid, FK to drivers)
- `restaurant_id` (uuid, optional)
- `amount` (numeric)
- `currency` (text, default 'USD')
- `status` (text, default 'pending')
- `payout_method` (text)
- `reference_id` (text)
- `notes` (text)
- `processed_by` (uuid)
- `processed_at` (timestamptz)
- `created_at`, `updated_at`

No database migration needed - table already exists.

---

## Responsive Design

All pages will be responsive (desktop + mobile):
- Desktop: Full table view with sidebar
- Mobile: Card-based view with collapsible filters
- Use existing Tailwind responsive classes (`md:`, `lg:`)

---

## Empty and Loading States

Each page includes:
- Loading skeleton while data fetches
- Empty state with icon and message when no data
- Error boundary with retry button

---

## No Changes To

- Authentication system (uses existing)
- Database schema (payouts table exists)
- Supabase client configuration (uses existing)
- Existing driver detail page (linked from new pages)
- Existing commission settings (linked from dashboard)

