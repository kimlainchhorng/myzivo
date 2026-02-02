

# Next Update: Complete Driver App Job Flows & Enhanced Admin Payouts

## Overview

This update completes the pending integration work for the Driver App and Admin Dashboard:

1. **Driver Active Job Data Fetching** - Replace placeholder panels with real data integration for Eats and Move deliveries
2. **Admin P2P Payouts Module Enhancement** - Add execute payout and hold/release controls using Stripe Connect
3. **Admin Move Module** - Create complete admin interface for package deliveries (Move service)

---

## Current State Analysis

The following items have placeholder implementations that need completing:

**DriverApp.tsx (lines 300-362):**
- Eats delivery panel shows "loading..." (line 324)
- Move delivery panel shows "loading..." (line 356)
- Both have TODO comments indicating data fetching is needed

**AdminP2PPayoutsModule.tsx:**
- Has "Process All Pending" button that creates payout records
- Missing "Execute Payout" button that actually transfers via Stripe
- Missing "Hold Payout" and "Release Hold" controls
- Hooks exist (`useExecuteP2PPayout`, `useHoldP2PPayout`) but aren't used in the UI

**Admin Panel:**
- Missing AdminMoveModule for managing package_deliveries table

---

## Phase 1: Driver Active Job Data Hooks

### 1.1 Add Active Eats Order Hook

Add to `src/hooks/useDriverApp.ts`:

```text
useDriverActiveEatsOrder(driverId: string | undefined)
- Query food_orders table
- Filter: driver_id = driverId
- Filter: status NOT IN ('completed', 'cancelled')
- Include: restaurant join for restaurant details
- Transform to EatsOrder interface shape
```

### 1.2 Add Active Package Delivery Hook

Add to `src/hooks/useDriverApp.ts`:

```text
useDriverActivePackageDelivery(driverId: string | undefined)
- Query package_deliveries table
- Filter: driver_id = driverId
- Filter: status IN ('accepted', 'at_pickup', 'picked_up', 'at_dropoff')
- Transform to PackageDelivery interface shape
```

---

## Phase 2: Driver App Panel Integration

### 2.1 Update DriverApp.tsx

Replace the placeholder panels with real data integration:

**For Eats (lines 300-330):**
```text
1. Add useDriverActiveEatsOrder hook call
2. Transform data to EatsOrder interface
3. Map internal status to EatsDeliveryStatus
4. Render EatsDeliveryPanel with real data
5. Handle status changes through driverState
```

**For Move (lines 332-362):**
```text
1. Add useDriverActivePackageDelivery hook call
2. Transform data to PackageDelivery interface
3. Map internal status to MoveDeliveryStatus
4. Render MoveDeliveryPanel with real data
5. Handle status changes through driverState
```

### 2.2 Status Synchronization

Ensure that when driver updates status in panels:
- Database is updated
- `driverState.activeJob` is synced
- Query cache is invalidated
- Panel reflects correct progress

---

## Phase 3: Admin P2P Payouts Enhancement

### 3.1 Add Execute/Hold Controls to AdminP2PPayoutsModule

Import and use the existing hooks:
```text
import { useExecuteP2PPayout, useHoldP2PPayout, useReleaseP2PPayoutHold } from "@/hooks/useStripeConnect";
```

Add new UI elements:

| Button | Visibility | Action |
|--------|------------|--------|
| Execute Payout | status = pending, not held | Calls execute-p2p-payout edge function |
| Hold Payout | status = pending, not held | Opens dialog for hold reason |
| Release Hold | is_held = true | Clears hold status |
| Force Execute | is_held = true (admin override) | Executes despite hold |

### 3.2 Enhanced Payout Detail Dialog

Update the dialog to show:
- Stripe account status of owner
- Hold status with reason if held
- Held by (admin who placed hold)
- Active disputes on related bookings
- Execute button with confirmation

### 3.3 Add Hold Status Column

Show in table:
- Hold badge if `is_held = true`
- Held reason tooltip on hover
- Different styling for held payouts

---

## Phase 4: Admin Move Module

### 4.1 Create AdminMoveModule.tsx

Full admin interface for package_deliveries table:

**Stats Cards:**
- Total deliveries
- Pending pickup
- In transit
- Completed today
- Total revenue

**Actions Bar:**
- Search by customer name, address, ID
- Filter by status (requested, accepted, in_transit, delivered)
- Filter by delivery speed (standard, express, same_day)
- Date range filter
- Create Test Delivery button

**Table Columns:**
| Column | Content |
|--------|---------|
| Package | ID + size + weight |
| Customer | Name + phone |
| Route | Pickup → Dropoff addresses |
| Driver | Assigned driver or "Unassigned" |
| Speed | Standard/Express/Same-day badge |
| Status | Status badge with color |
| Payout | Estimated/actual payout |
| Created | Timestamp |
| Actions | View/Assign/Cancel dropdown |

**Detail Dialog:**
- Full package info
- Pickup/delivery photos if available
- Signature image if captured
- Timeline of status changes
- Driver assignment control

### 4.2 Add to Admin Panel Navigation

Add "Move Deliveries" nav item with Package icon to AdminPanel.tsx

---

## Phase 5: Test Job Creation Tools

### 5.1 Add Create Test Delivery to AdminMoveModule

Button that creates a test package_delivery record:
- Status: requested
- Pickup/dropoff: Sample addresses
- Package: Medium size, 5 lbs
- Estimated payout: $15-25

### 5.2 Verify Admin Eats Module Has Test Order

Check if AdminEatsModule has test order creation (add if missing)

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useDriverApp.ts` | **Update** | Add useDriverActiveEatsOrder, useDriverActivePackageDelivery |
| `src/pages/DriverApp.tsx` | **Update** | Replace placeholders with real panel integration |
| `src/pages/admin/modules/AdminP2PPayoutsModule.tsx` | **Update** | Add execute/hold controls, enhanced dialog |
| `src/pages/admin/modules/AdminMoveModule.tsx` | **Create** | Full admin interface for package deliveries |
| `src/pages/admin/AdminPanel.tsx` | **Update** | Add Move nav item and module case |

---

## Technical Notes

### EatsOrder Interface Mapping

```text
food_orders table → EatsOrder interface:
- id → id
- restaurant.name → restaurantName
- restaurant.address → restaurantAddress
- restaurant.lat → restaurantLat
- restaurant.lng → restaurantLng
- customer_name → customerName
- customer_phone → customerPhone
- delivery_address → deliveryAddress
- delivery_lat → deliveryLat
- delivery_lng → deliveryLng
- delivery_fee → deliveryFee
- items (JSON) → items (string[])
```

### PackageDelivery Interface Mapping

```text
package_deliveries table → PackageDelivery interface:
- id → id
- customer_name → customerName
- customer_phone → customerPhone
- pickup_address → pickupAddress
- pickup_lat → pickupLat
- pickup_lng → pickupLng
- dropoff_address → dropoffAddress
- dropoff_lat → dropoffLat
- dropoff_lng → dropoffLng
- package_size → packageSize
- package_weight → packageWeight
- package_contents → packageContents
- estimated_payout → estimatedPayout
- delivery_speed → deliverySpeed
```

---

## Testing Plan

1. **Eats Flow**: Create test food order → Accept as driver → Verify panel loads with restaurant/customer data → Complete delivery with photo
2. **Move Flow**: Create test package → Accept as driver → Verify panel loads → Complete with photo + signature
3. **Execute Payout**: Create completed booking → Process payout record → Execute via Stripe → Verify transfer created
4. **Hold/Release**: Place payout on hold → Verify blocked → Release → Verify can execute
5. **Admin Move**: Create, view, filter, search package deliveries → Assign driver → View proof photos

