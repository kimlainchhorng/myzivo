
# Next Update: P2P Car Rental Admin Test Data Tools + Owner Onboarding Polish

## Overview

The P2P car rental marketplace infrastructure is complete but has **zero data** for testing. This update adds admin tools to create test owners, vehicles, and bookings - enabling full end-to-end testing of the renter and owner flows.

---

## Current State Analysis

### Database Status
| Table | Count | Status |
|-------|-------|--------|
| `car_owner_profiles` | 0 | Empty |
| `p2p_vehicles` | 0 | Empty |
| `p2p_bookings` | 0 | Empty |
| `p2p_reviews` | 0 | Empty |

### Existing Pages (Ready but Untestable)
- `/list-your-car` - Marketing landing page
- `/owner/apply` - Multi-step owner onboarding wizard
- `/owner/dashboard` - Owner management dashboard
- `/owner/cars/new` - Add vehicle form
- `/p2p/search` - Vehicle search page
- `/p2p/vehicle/:id` - Vehicle detail page
- Admin modules exist but can't test without data

---

## Phase 1: Admin Test Data Creation Tools

### 1.1 Add "Create Test Owner" Button to AdminP2POwnersModule

Creates a sample verified car owner:
```text
Profile data:
- full_name: "Demo Owner"
- email: "demo.owner@test.zivo.com"
- phone: "+1 (555) 000-1234"
- status: "verified"
- city: "Los Angeles"
- state: "CA"
- documents_verified: true
```

### 1.2 Add "Create Test Vehicle" Button to AdminP2PVehiclesModule

Creates sample rental vehicles:
```text
Vehicle 1:
- make: "Tesla", model: "Model 3", year: 2023
- category: "electric"
- daily_rate: $85
- location: Los Angeles, CA
- instant_book: true
- approval_status: "approved"
- images: [placeholder URLs]

Vehicle 2:
- make: "Toyota", model: "Camry", year: 2022
- category: "midsize"
- daily_rate: $55
- location: Los Angeles, CA
- approval_status: "approved"
```

### 1.3 Add "Create Test Booking" Button to AdminP2PBookingsModule

Creates sample P2P bookings:
```text
Booking:
- vehicle_id: First available vehicle
- renter_id: Current admin user
- pickup_date: Tomorrow
- return_date: 3 days later
- total_amount: Calculated from daily rate
- status: "pending" or "confirmed"
```

---

## Phase 2: New Hooks for Admin P2P Operations

### 2.1 Create `useAdminP2PTestData.ts`

New hook with mutations for test data creation:

| Function | Description |
|----------|-------------|
| `useCreateTestOwner()` | Creates verified owner profile |
| `useCreateTestVehicle()` | Creates approved vehicle with images |
| `useCreateTestBooking()` | Creates sample booking |
| `useCreateTestReview()` | Creates sample vehicle review |

---

## Phase 3: Admin Module Updates

### 3.1 AdminP2POwnersModule.tsx
- Add "Create Test Owner" button in header
- Success toast shows created owner ID
- Auto-refresh owner list after creation

### 3.2 AdminP2PVehiclesModule.tsx  
- Add "Create Test Vehicle" button
- Requires at least one owner to exist
- Creates vehicle with sample images

### 3.3 AdminP2PBookingsModule.tsx
- Add "Create Test Booking" button
- Requires at least one vehicle to exist
- Sets up pending booking for testing approval flow

---

## Phase 4: Sample Data Configuration

### Test Vehicle Pool
| Make | Model | Year | Category | Daily Rate |
|------|-------|------|----------|------------|
| Tesla | Model 3 | 2023 | Electric | $85 |
| Toyota | Camry | 2022 | Midsize | $55 |
| Honda | CR-V | 2023 | SUV | $65 |
| BMW | 3 Series | 2022 | Luxury | $110 |
| Ford | Mustang | 2023 | Sports | $95 |
| Chevrolet | Suburban | 2021 | Full Size | $85 |

### Test Locations
- Los Angeles, CA
- Miami, FL  
- New York, NY
- Austin, TX
- Denver, CO

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useAdminP2PTestData.ts` | **Create** | New hook with test data mutations |
| `src/pages/admin/modules/AdminP2POwnersModule.tsx` | **Update** | Add "Create Test Owner" button |
| `src/pages/admin/modules/AdminP2PVehiclesModule.tsx` | **Update** | Add "Create Test Vehicle" button |
| `src/pages/admin/modules/AdminP2PBookingsModule.tsx` | **Update** | Add "Create Test Booking" button |

---

## Technical Notes

### Test Data Pattern
Each test button follows this flow:
1. Check prerequisites (e.g., owner exists for vehicles)
2. Generate realistic sample data
3. Insert with correct status (verified/approved)
4. Show success toast with ID
5. Invalidate queries to refresh tables

### Image Placeholders
Test vehicles use placeholder image URLs from Unsplash:
```text
https://images.unsplash.com/photo-[id]?w=800&q=80
```

### Foreign Key Handling
- Vehicles require `owner_id` → Create owner first
- Bookings require `vehicle_id` + `renter_id` → Use first available

---

## Testing Flow After Implementation

1. **Admin creates test owner** → Appears in P2P Owners list
2. **Admin creates test vehicle** → Appears in P2P Vehicles list
3. **Admin creates test booking** → Appears in P2P Bookings list
4. **Test renter flow** → Browse `/p2p/search`, view vehicle, book
5. **Test owner flow** → `/owner/dashboard` shows bookings
6. **Test approval flow** → Admin approves/rejects bookings

---

## Integration with Existing Features

All P2P test data connects to existing infrastructure:

| Admin Tool | User-Facing Effect |
|------------|-------------------|
| Create Test Vehicle | Appears on `/p2p/search` for renters |
| Create Test Booking | Shows in owner's booking queue |
| Approve Vehicle | Makes vehicle live for booking |
| Confirm Booking | Triggers renter confirmation flow |

This enables full marketplace testing without manual data entry.
