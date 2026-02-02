
# Next Update: Customer-Facing Eats & Rides Flow Completion + Admin Test Data Tools

## Overview

This update focuses on completing the customer-facing flows for Rides and Eats services, plus adding test data creation tools across admin modules to facilitate end-to-end testing with the external Rork driver app.

---

## Current State Analysis

### Completed Features
- **RiderApp.tsx**: Full customer booking flow with location search, fare estimation, vehicle selection, trip creation, and live tracking
- **EatsCheckout.tsx**: Complete checkout flow with contact info, delivery details, and order submission
- **Admin Modules**: AdminRidesModule, AdminEatsModule, AdminMoveModule with status management and driver assignment

### Gaps Identified

| Area | Issue |
|------|-------|
| **Admin Eats** | No "Create Test Order" button for testing driver app integration |
| **Admin Rides** | No "Create Test Trip" button for testing driver assignment |
| **Admin Move** | Has test delivery button (added in last update) |
| **RiderApp** | Trips table uses `trips` but admin uses `ride_requests` - two separate tables causing data disconnect |
| **EatsRestaurants/Menu** | Uses mock data instead of real database restaurants |
| **Driver Notifications** | When admin assigns driver, no push notification is sent |

---

## Phase 1: Unify Rides Data Flow

### Problem
The `RiderApp.tsx` creates entries in the `trips` table, but `AdminRidesModule.tsx` reads from `ride_requests` table. These are separate tables with no connection.

### Solution
Modify AdminRidesModule to also show trips from the `trips` table, or create a unified view. For MVP, we'll add a "Live Trips" tab to AdminRidesModule.

**AdminRidesModule.tsx Updates:**
- Add tabs: "Ride Requests" | "Live Trips"
- "Ride Requests" shows manual form submissions
- "Live Trips" shows trips created from RiderApp (from `trips` table)
- Both tabs support status updates and driver assignment

---

## Phase 2: Admin Test Data Creation Tools

### 2.1 Add "Create Test Trip" to AdminRidesModule

Button that creates a test trip in the `trips` table:
```text
- rider_id: Admin's user ID (or placeholder)
- pickup: "123 Main St, New York, NY"
- dropoff: "456 Broadway, New York, NY"
- fare_amount: $25.00
- distance_km: 5.2
- duration_minutes: 18
- status: "requested"
```

This trip will appear in the driver app's job queue.

### 2.2 Add "Create Test Order" to AdminEatsModule

Button that creates a test food order:
```text
- restaurant_id: First active restaurant or placeholder
- items: [{ name: "Test Burger", quantity: 1, price: 12.99 }]
- delivery_address: "789 Park Ave, New York, NY"
- total_amount: $16.98
- status: "pending"
```

### 2.3 Verify AdminMoveModule Test Button

Confirm the "Create Test Delivery" button added previously is functional.

---

## Phase 3: Driver Notification on Assignment

### Problem
When an admin assigns a driver to a ride/order, the driver app doesn't receive a notification.

### Solution
After driver assignment, call the existing `send-driver-notification` edge function.

**Files to Update:**
- `useRideRequests.ts` - Add notification call after assignment
- `useEatsOrders.ts` - Add notification call after assignment

---

## Phase 4: Connect Restaurant Menu to Database

### Problem
`EatsRestaurants.tsx` and `EatsRestaurantMenu.tsx` use hardcoded mock data instead of the `restaurants` and `menu_items` tables.

### Solution
Connect these pages to the database using existing hooks:
- Replace mock `featuredRestaurants` in FoodOrdering with `useRestaurants()` 
- Replace mock `menuItems` with `useMenuItems(restaurantId)`
- Keep current UI structure, just swap data source

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/admin/modules/AdminRidesModule.tsx` | **Update** | Add "Live Trips" tab + "Create Test Trip" button |
| `src/pages/admin/modules/AdminEatsModule.tsx` | **Update** | Add "Create Test Order" button |
| `src/hooks/useRideRequests.ts` | **Update** | Add test trip creation + notification trigger |
| `src/hooks/useEatsOrders.ts` | **Update** | Add notification trigger on driver assignment |
| `src/pages/EatsRestaurants.tsx` | **Update** | Connect to database instead of mock data |
| `src/pages/EatsRestaurantMenu.tsx` | **Update** | Connect to database menu items |
| `src/hooks/useTrips.ts` | **Update** | Add admin query hook for trips table |

---

## Technical Notes

### Test Data Creation Pattern

Each test data button follows this pattern:
1. Generate realistic sample data with current timestamp
2. Insert into appropriate table with correct foreign keys
3. Show success toast with created ID
4. Invalidate queries to refresh the table
5. (Optional) Trigger driver notification

### Trips Table Integration for Admin

The trips table needs these admin operations:
- Query all trips (not filtered by rider_id)
- Update status
- Assign driver_id

---

## Testing Plan

After implementation:
1. **Create Test Trip** → Verify appears in admin "Live Trips" → Check if Rork driver app shows job
2. **Create Test Order** → Verify appears in admin Eats → Assign driver → Check Rork app
3. **Create Test Delivery** → Same flow for Move service
4. **Assign Driver** → Verify push notification is sent (check edge function logs)
5. **Restaurant Data** → Verify EatsRestaurants page shows database restaurants

---

## Integration with Rork Driver App

All test data created through admin will appear in the shared Supabase database. The Rork driver app at `zivo-driver-app.rork.app` reads from the same database, so:

| Admin Action | Driver App Effect |
|--------------|-------------------|
| Create test trip (status: requested) | Appears in driver's available jobs |
| Create test order (status: pending) | Appears when restaurant marks ready |
| Assign driver | Driver receives push notification |
| Update status | Real-time sync to driver app |

This enables full end-to-end testing of the driver flows.
