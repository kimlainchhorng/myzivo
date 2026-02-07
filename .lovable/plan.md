

# ZIVO Dispatch / Admin Panel Implementation Plan

## Overview

Build a comprehensive Dispatch/Admin web panel for managing drivers and food orders in real-time. This panel will reuse the existing Supabase database schema and integrate with the Driver and Merchant apps.

---

## Current State Analysis

| Component | Status |
|-----------|--------|
| Supabase Auth | ✅ Already implemented |
| Admin role system | ✅ `user_roles` table with `app_role` enum (`admin`, `super_admin`, `operations`, `finance`, `support`) |
| Admin login | ✅ `/admin/login` exists |
| `AdminProtectedRoute` | ✅ Role-based route protection ready |
| `food_orders` table | ✅ Full schema with driver assignment, status tracking |
| `drivers` table | ✅ With `is_online`, `current_lat/lng`, `status`, etc. |
| `driver_earnings` table | ✅ Tracks earnings per trip/order |
| `restaurants` table | ✅ Available for merchant data |
| Realtime components | ✅ `ActivityStream`, `LiveMapOverview` exist as patterns |

---

## Architecture

The dispatch panel will be added under `/dispatch` routes using the existing `AdminProtectedRoute` wrapper to gate by admin roles.

```text
/dispatch                    → Overview Dashboard
/dispatch/orders             → Kanban Board (drag & drop)
/dispatch/orders/:id         → Order Detail Page
/dispatch/drivers            → Live Driver Management
/dispatch/merchants          → Merchant List
/dispatch/payouts            → Driver Earnings & CSV Export
/dispatch/settings           → Placeholder
```

---

## New Files to Create

### Pages (6 files)

| File Path | Description |
|-----------|-------------|
| `src/pages/dispatch/DispatchLayout.tsx` | Shared layout with sidebar navigation |
| `src/pages/dispatch/DispatchDashboard.tsx` | KPIs + Attention panel + Quick actions |
| `src/pages/dispatch/DispatchOrdersKanban.tsx` | Drag-drop kanban board |
| `src/pages/dispatch/DispatchOrderDetail.tsx` | Full order info + events timeline |
| `src/pages/dispatch/DispatchDrivers.tsx` | Live driver list with controls |
| `src/pages/dispatch/DispatchMerchants.tsx` | Merchant list with stats |
| `src/pages/dispatch/DispatchPayouts.tsx` | Earnings table with CSV export |
| `src/pages/dispatch/DispatchSettings.tsx` | Placeholder settings page |

### Components (7 files)

| File Path | Description |
|-----------|-------------|
| `src/components/dispatch/DispatchSidebar.tsx` | Navigation sidebar for dispatch routes |
| `src/components/dispatch/KanbanColumn.tsx` | Individual kanban column |
| `src/components/dispatch/OrderCard.tsx` | Draggable order card |
| `src/components/dispatch/AssignDriverModal.tsx` | Modal to assign driver to order |
| `src/components/dispatch/OrderEventsTimeline.tsx` | Timeline of order status changes |
| `src/components/dispatch/DriverDetailDrawer.tsx` | Slide-over with driver info + earnings |
| `src/components/dispatch/RealtimeOrderToasts.tsx` | Toast notifications for realtime events |

### Hooks (4 files)

| File Path | Description |
|-----------|-------------|
| `src/hooks/useDispatchOrders.ts` | Fetch orders with realtime subscription |
| `src/hooks/useDispatchDrivers.ts` | Fetch drivers with online status + realtime |
| `src/hooks/useDispatchStats.ts` | KPI calculations for dashboard |
| `src/hooks/useOrderMutations.ts` | Assign, unassign, update status mutations |

---

## Route Registration (App.tsx)

Add new routes wrapped with `AdminProtectedRoute`:

```tsx
// Dispatch Admin Panel
<Route path="/dispatch" element={<AdminProtectedRoute allowedRoles={["admin", "operations"]}><DispatchLayout /></AdminProtectedRoute>}>
  <Route index element={<DispatchDashboard />} />
  <Route path="orders" element={<DispatchOrdersKanban />} />
  <Route path="orders/:id" element={<DispatchOrderDetail />} />
  <Route path="drivers" element={<DispatchDrivers />} />
  <Route path="merchants" element={<DispatchMerchants />} />
  <Route path="payouts" element={<DispatchPayouts />} />
  <Route path="settings" element={<DispatchSettings />} />
</Route>
```

---

## Feature Implementation Details

### 1. Dashboard (`/dispatch`)

**KPI Cards:**
- New orders (status = `pending`, today)
- Assigned orders (status = `confirmed`, today)
- Picked up (status = `in_progress`, today)
- Delivered (status = `completed`, today)
- Online drivers (drivers with `is_online = true`)

**Attention Panel:**
- Orders unassigned > 5 minutes (query `created_at < now() - 5min AND driver_id IS NULL AND status = 'pending'`)
- Online drivers with no active order (LEFT JOIN food_orders)

**Quick Actions:**
- "Auto-assign all new orders" button → loops unassigned orders, calls `find_nearest_drivers` function
- "Create test order" button (dev/admin only) → uses existing `useCreateTestFoodOrder`

### 2. Orders Kanban (`/dispatch/orders`)

**Columns:**
| Column | Filter |
|--------|--------|
| New | `status = 'pending' AND driver_id IS NULL` |
| Assigned | `status = 'confirmed' AND driver_id IS NOT NULL` |
| Picked Up | `status = 'in_progress'` |
| Delivered | `status = 'completed'` |
| Cancelled | `status = 'cancelled'` |

**Drag & Drop Logic:**
- **New → Assigned**: Open `AssignDriverModal` first, then update `driver_id` + `status`
- **Assigned → Picked Up**: Confirm dialog, update status to `in_progress`, set `picked_up_at`
- **Picked Up → Delivered**: Confirm dialog, update status to `completed`, set `delivered_at`, idempotent insert to `driver_earnings`
- Backwards moves restricted or require confirmation

**Card Content:**
- Order ID (short 8 chars)
- Restaurant name (from join)
- Pickup address (restaurant address)
- Dropoff address (`delivery_address`)
- Driver payout (`driver_payout_cents`)
- Created time
- Assigned driver name

**Filters & Search:**
- By merchant (dropdown)
- By driver (dropdown)
- By status (tabs or dropdown)
- By date range (date picker)
- Text search on order ID

### 3. Assign Driver Modal

**UI:**
- List drivers with `is_online = true` first
- Show: name, vehicle type, last active time, current order (if any)
- "Assign" button per driver

**On Assign:**
1. `UPDATE food_orders SET driver_id = :id, status = 'confirmed', assigned_at = now()`
2. Insert event to `order_events` (new table or use existing pattern):
   - `type = 'status_change'`
   - `reason = 'dispatch_assign'`
   - `metadata = { admin_id, driver_id }`

**Unassign:**
- Set `driver_id = NULL`
- Revert status to `pending` (unless already picked up)
- Insert event with `reason = 'dispatch_unassign'`

### 4. Order Detail (`/dispatch/orders/:id`)

**Sections:**
- Full order info card (customer, restaurant, items, totals)
- Status control (dropdown or buttons to force-change status)
- Assignment panel (current driver + "Change Driver" button)
- Events timeline (from order_events or derived from timestamp columns)
- Add note form (creates order_event with `type = 'note'`)

### 5. Live Drivers (`/dispatch/drivers`)

**Table Columns:**
| Column | Source |
|--------|--------|
| Name | `full_name` |
| Status | `is_online` badge |
| Last Active | `updated_at` or `last_active_at` |
| Vehicle | `vehicle_type` |
| Active Order | JOIN to food_orders where status IN (confirmed, in_progress) |

**Actions:**
- Toggle online/offline (admin override: `UPDATE drivers SET is_online = :bool`)
- "Assign to order" quick action (dropdown of pending orders)
- Click row → open `DriverDetailDrawer`

**Driver Detail Drawer:**
- Profile info
- Recent completed orders (last 10)
- Earnings summary (today/week/month from `driver_earnings`)

### 6. Merchants (`/dispatch/merchants`)

**Table:**
- Restaurant name
- Orders today count
- Active orders count (pending + confirmed + in_progress)
- Average prep time

**Click Row:**
- Filter orders kanban by this merchant

### 7. Payouts (`/dispatch/payouts`)

**Data Source:** `driver_earnings` table

**Filters:**
- By driver (dropdown)
- Date range (start/end date pickers)

**Summary Cards:**
- Total today
- Total this week
- Total this month

**Table Columns:**
| Column | Source |
|--------|--------|
| Date | `created_at` |
| Driver | JOIN drivers.full_name |
| Type | `earning_type` |
| Base | `base_amount` |
| Tip | `tip_amount` |
| Platform Fee | `platform_fee` |
| Net | `net_amount` |

**CSV Export:**
- Client-side CSV generation using `Blob` (pattern exists in `AdminEatsModule`)
- Filename: `dispatch-payouts-{date}.csv`

### 8. Realtime Subscriptions

**Orders Channel:**
```ts
supabase
  .channel('dispatch-orders')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'food_orders' 
  }, handleOrderChange)
  .subscribe()
```

**Drivers Channel:**
```ts
supabase
  .channel('dispatch-drivers')
  .on('postgres_changes', { 
    event: 'UPDATE', 
    schema: 'public', 
    table: 'drivers' 
  }, handleDriverChange)
  .subscribe()
```

**Toast Notifications:**
- New order created → "🆕 New order from {restaurant}"
- Order assigned → "✓ Order assigned to {driver}"
- Order picked up → "📦 Order picked up"
- Order delivered → "✅ Order delivered"
- Driver online → "🟢 {driver} is now online"
- Driver offline → "⚪ {driver} went offline"

### 9. Data Integrity: Idempotent Earnings Insert

When marking order as delivered, check before insert:

```ts
const { data: existing } = await supabase
  .from('driver_earnings')
  .select('id')
  .eq('trip_id', orderId)
  .single();

if (!existing) {
  await supabase.from('driver_earnings').insert({
    driver_id: order.driver_id,
    trip_id: orderId,
    base_amount: order.driver_payout_cents / 100,
    net_amount: order.driver_payout_cents / 100,
    earning_type: 'delivery',
    // ... other fields
  });
}
```

---

## Database Considerations

### Existing Tables Used
- `food_orders` - Order data with status, driver assignment
- `drivers` - Driver profiles with online status
- `restaurants` - Merchant data
- `driver_earnings` - Payout records
- `user_roles` - Admin role checking

### Optional: Order Events Table

If order events tracking is needed beyond timestamp columns, we could create an `order_events` table:

```sql
CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES food_orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'status_change', 'note', 'assignment'
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  admin_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

However, for MVP we can derive timeline from existing timestamp columns (`created_at`, `assigned_at`, `picked_up_at`, `delivered_at`, `cancelled_at`).

---

## RLS Policies

Admins need read/write access to dispatch tables. The existing `is_admin(user_id)` and `has_role(user_id, 'admin')` functions should be used:

```sql
-- Example policy for admin order access
CREATE POLICY "Admins can manage orders" ON food_orders
FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operations'));
```

Existing RLS for merchants/drivers remains intact (they only see their own data).

---

## UI/UX Notes

- Use existing `shadcn/ui` components for consistency
- Dark theme compatible (follows existing Tailwind patterns)
- Mobile responsive sidebar collapses to hamburger menu
- Kanban uses drag-drop library (we can use `@dnd-kit/core` or simple state-based approach)
- Real-time updates animate in with subtle fade/highlight

---

## File Summary

| Category | Count |
|----------|-------|
| Page Components | 8 |
| UI Components | 7 |
| Custom Hooks | 4 |
| Route Changes | 1 (App.tsx) |
| Database Migrations | 0-1 (optional order_events) |

**Total: ~20 new files**

---

## Implementation Order

1. **Hooks & Data Layer**
   - `useDispatchOrders`, `useDispatchDrivers`, `useDispatchStats`, `useOrderMutations`

2. **Layout & Navigation**
   - `DispatchLayout`, `DispatchSidebar`

3. **Dashboard**
   - `DispatchDashboard` with KPIs and attention panel

4. **Kanban & Order Management**
   - `KanbanColumn`, `OrderCard`, `DispatchOrdersKanban`
   - `AssignDriverModal`

5. **Order Detail**
   - `DispatchOrderDetail`, `OrderEventsTimeline`

6. **Driver Management**
   - `DispatchDrivers`, `DriverDetailDrawer`

7. **Supporting Pages**
   - `DispatchMerchants`, `DispatchPayouts`, `DispatchSettings`

8. **Realtime**
   - Add subscriptions to hooks, `RealtimeOrderToasts`

9. **Route Registration**
   - Update `App.tsx` with new routes

