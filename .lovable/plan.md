
# Multi-Stop Delivery — Implementation Plan

## Overview
Enable customers to add multiple delivery addresses when placing an order, allowing food to be dropped off at different locations during a single trip. This feature includes dynamic pricing based on distance and stops, and a progressive tracking UI showing route progress.

## Current State Analysis

### What Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| Single delivery address in checkout | Complete | `src/pages/EatsCheckout.tsx` |
| Saved locations system | Complete | `src/hooks/useSavedLocations.ts` |
| CartContext with deliveryAddress | Complete | `src/contexts/CartContext.tsx` |
| Batch stops system (admin) | Complete | `batch_stops` table, `useBatches.ts` |
| Order batch info hook | Complete | `src/hooks/useOrderBatchInfo.ts` |
| DeliveryMap component | Complete | `src/components/eats/DeliveryMap.tsx` |
| Order tracking page | Complete | `src/pages/track/OrderTrackingPage.tsx` |
| Haversine distance calculation | Complete | Multiple locations |
| Food order creation | Complete | `src/hooks/useEatsOrders.ts` |

### What's Missing
| Feature | Status | Description |
|---------|--------|-------------|
| Multi-stop address management in cart | Missing | Store array of delivery addresses |
| "Add another address" UI in checkout | Missing | Button and form to add stops |
| Multi-stop order summary display | Missing | Show Stop 1, Stop 2, etc. |
| Distance-based delivery fee calculation | Missing | Fee = base + per-mile + per-stop |
| Multi-stop tracking progress UI | Missing | "Delivered Stop 1 → Heading to Stop 2" |
| Multi-stop DeliveryMap support | Missing | Show multiple dropoff markers |
| Database schema for customer stops | Missing | Separate from admin batch_stops |

---

## Implementation Plan

### 1) Update CartContext for Multi-Stop Addresses

**File to Modify:** `src/contexts/CartContext.tsx`

**Purpose:** Store an array of delivery stops instead of a single address.

**New Interface:**
```text
interface DeliveryStop {
  id: string;              // UUID for UI key
  address: string;
  lat: number | null;
  lng: number | null;
  instructions?: string;
  label?: string;          // e.g., "Home", "Office"
}

interface CartContextType {
  // Existing...
  deliveryStops: DeliveryStop[];
  addDeliveryStop: (stop: Omit<DeliveryStop, "id">) => void;
  updateDeliveryStop: (id: string, updates: Partial<DeliveryStop>) => void;
  removeDeliveryStop: (id: string) => void;
  reorderDeliveryStops: (stopIds: string[]) => void;
  clearDeliveryStops: () => void;
  // Backward compatibility
  deliveryAddress: string; // First stop's address
}
```

**Storage Key:** `zivo-eats-delivery-stops`

---

### 2) Create Multi-Stop Delivery Fee Calculator

**File to Create:** `src/lib/multiStopDeliveryFee.ts`

**Purpose:** Calculate dynamic delivery fee based on distance and number of stops.

**Pricing Formula:**
```text
Base Fee: $3.99 (single stop)
Per Additional Stop: +$1.50
Per Mile (beyond first 2 mi): +$0.50/mi

Total = baseFee + (additionalStops × stopFee) + (extraMiles × perMileFee)

Example: 3 stops, 8 total miles
Base: $3.99
Extra stops: 2 × $1.50 = $3.00
Extra miles: (8 - 2) × $0.50 = $3.00
Total: $9.99
```

**Function Signature:**
```text
interface MultiStopFeeResult {
  baseFee: number;
  additionalStopFee: number;
  distanceFee: number;
  totalFee: number;
  totalDistance: number;
  breakdown: {
    label: string;
    amount: number;
  }[];
}

function calculateMultiStopDeliveryFee(
  stops: { lat: number; lng: number }[],
  restaurantLocation: { lat: number; lng: number }
): MultiStopFeeResult
```

---

### 3) Create Multi-Stop Address Manager Component

**File to Create:** `src/components/eats/MultiStopAddressManager.tsx`

**Purpose:** UI for adding, editing, and reordering delivery stops.

**Features:**
- List of current stops with drag-drop reordering
- "Add another delivery address" button
- Remove stop button (if > 1 stop)
- Stop numbering badges (1, 2, 3...)
- Instructions field per stop
- Saved address quick-select

**UI Design:**
```text
┌─────────────────────────────────────────────────┐
│ Delivery Stops                                  │
├─────────────────────────────────────────────────┤
│ ① 123 Main St, City, State           [Remove]  │
│    Instructions: Leave at door                  │
├─────────────────────────────────────────────────┤
│ ② 456 Oak Ave, City, State           [Remove]  │
│    Instructions: Ring bell                      │
├─────────────────────────────────────────────────┤
│ [+ Add another delivery address]                │
└─────────────────────────────────────────────────┘
```

---

### 4) Create Stop Address Input Sheet

**File to Create:** `src/components/eats/AddDeliveryStopSheet.tsx`

**Purpose:** Bottom sheet for entering a new delivery stop.

**Features:**
- Address autocomplete input
- Saved address quick-select
- Delivery instructions field
- Validate address before adding
- Geocode address to lat/lng

---

### 5) Update EatsCheckout for Multi-Stop

**File to Modify:** `src/pages/EatsCheckout.tsx`

**Changes:**
- Replace single address input with MultiStopAddressManager
- Update delivery fee calculation to use multi-stop calculator
- Update order summary to show numbered stops
- Update form validation for multiple addresses
- Pass stops array to order creation

**Order Summary Updates:**
```text
Delivery Stops:
  Stop 1 – 123 Main St
  Stop 2 – 456 Oak Ave

Subtotal: $45.00
Delivery Fee (2 stops, 6.2 mi): $7.49
Total: $52.49
```

---

### 6) Update CreateFoodOrderInput and Mutation

**File to Modify:** `src/hooks/useEatsOrders.ts`

**Changes:**
- Add `delivery_stops` array to CreateFoodOrderInput
- Store stops as JSONB in order record
- Calculate and store total distance
- Generate customer-side stops for tracking

**New Field:**
```text
interface DeliveryStopInput {
  address: string;
  lat: number;
  lng: number;
  instructions?: string;
  label?: string;
  stop_order: number;
}

interface CreateFoodOrderInput {
  // Existing...
  delivery_stops: DeliveryStopInput[];
  total_distance_miles: number;
  is_multi_stop: boolean;
}
```

---

### 7) Database Schema Updates

**New Column on food_orders:**
```text
delivery_stops JSONB DEFAULT NULL
is_multi_stop BOOLEAN DEFAULT FALSE
total_distance_miles NUMERIC DEFAULT NULL
current_stop_index INTEGER DEFAULT 0
```

**delivery_stops JSONB Structure:**
```json
[
  {
    "stop_order": 1,
    "address": "123 Main St",
    "lat": 40.7128,
    "lng": -74.0060,
    "instructions": "Leave at door",
    "status": "pending",
    "delivered_at": null
  },
  {
    "stop_order": 2,
    "address": "456 Oak Ave",
    "lat": 40.7200,
    "lng": -74.0100,
    "instructions": "Ring bell",
    "status": "pending",
    "delivered_at": null
  }
]
```

---

### 8) Create Multi-Stop Tracking Progress Component

**File to Create:** `src/components/eats/MultiStopTrackingProgress.tsx`

**Purpose:** Show route progress for multi-stop orders.

**States:**
| Current Stop | Display |
|--------------|---------|
| On way to 1 | "Heading to Stop 1 of 2" |
| Delivered 1 | "Delivered Stop 1 ✓ → Heading to Stop 2" |
| All done | "All 2 stops delivered ✓" |

**UI Design:**
```text
┌─────────────────────────────────────────────────┐
│ 📍 Route Progress                               │
├─────────────────────────────────────────────────┤
│  ✓ Stop 1 – 123 Main St          Delivered 2:15pm │
│  → Stop 2 – 456 Oak Ave              Arriving...   │
└─────────────────────────────────────────────────┘
```

**Features:**
- Visual timeline with stop markers
- Checkmarks for completed stops
- Delivery time for each stop
- Current stop highlighted
- ETA for next stop

---

### 9) Update DeliveryMap for Multi-Stop

**File to Modify:** `src/components/eats/DeliveryMap.tsx`

**Changes:**
- Accept array of delivery stops instead of single point
- Show numbered markers for each stop (1, 2, 3...)
- Color code: completed (green), current (orange), pending (gray)
- Draw route through all stops
- Update legend for multi-stop

**New Props:**
```text
interface DeliveryMapProps {
  // Existing...
  deliveryStops?: Array<{
    lat: number;
    lng: number;
    stopOrder: number;
    status: "pending" | "current" | "delivered";
  }>;
  isMultiStop?: boolean;
}
```

---

### 10) Update Order Detail Page for Multi-Stop

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Changes:**
- Show MultiStopTrackingProgress when multi-stop order
- Pass stops array to DeliveryMap
- Update delivery status to show current stop
- Show stop-by-stop delivery confirmation

---

### 11) Update Order Tracking Page (Public)

**File to Modify:** `src/pages/track/OrderTrackingPage.tsx`

**Changes:**
- Support multi-stop display for public tracking
- Show route progress component
- Update map with multiple markers

---

## File Summary

### New Files (5)
| File | Purpose |
|------|---------|
| `src/lib/multiStopDeliveryFee.ts` | Calculate delivery fee for multiple stops |
| `src/components/eats/MultiStopAddressManager.tsx` | Manage multiple delivery addresses |
| `src/components/eats/AddDeliveryStopSheet.tsx` | Bottom sheet for adding a stop |
| `src/components/eats/MultiStopTrackingProgress.tsx` | Route progress display |
| `src/components/eats/StopMarker.tsx` | Numbered map marker for stops |

### Modified Files (7)
| File | Changes |
|------|---------|
| `src/contexts/CartContext.tsx` | Add deliveryStops array and methods |
| `src/pages/EatsCheckout.tsx` | Multi-stop UI and fee calculation |
| `src/hooks/useEatsOrders.ts` | Handle multi-stop order creation |
| `src/components/eats/DeliveryMap.tsx` | Multi-stop markers and route |
| `src/pages/EatsOrderDetail.tsx` | Multi-stop tracking display |
| `src/pages/track/OrderTrackingPage.tsx` | Public multi-stop tracking |
| Database migration | Add new columns to food_orders |

---

## Delivery Fee Calculation Details

### Base Pricing
```text
BASE_FEE = $3.99
PER_ADDITIONAL_STOP = $1.50
FREE_MILES = 2.0
PER_MILE_RATE = $0.50
MAX_STOPS = 5
```

### Route Distance Calculation
```text
1. Start at restaurant
2. Calculate Haversine distance to Stop 1
3. Calculate distance from Stop 1 to Stop 2
4. Sum all segments for total route distance
5. Apply pricing formula
```

### Example Calculations
| Scenario | Stops | Distance | Delivery Fee |
|----------|-------|----------|--------------|
| Single stop, 1.5 mi | 1 | 1.5 mi | $3.99 |
| Single stop, 5 mi | 1 | 5 mi | $5.49 |
| Two stops, 4 mi | 2 | 4 mi | $6.49 |
| Three stops, 8 mi | 3 | 8 mi | $9.99 |

---

## Multi-Stop Order Flow

### Customer Flow
```text
1. Add items to cart
2. Go to checkout
3. Enter first delivery address (required)
4. Click "Add another delivery address"
5. Enter second address with instructions
6. Review stop order (drag to reorder)
7. See updated delivery fee
8. Place order
9. Track route progress in real-time
```

### Driver Flow
```text
1. Accept multi-stop order
2. See all stops with route
3. Navigate to Stop 1
4. Confirm delivery at Stop 1
5. Navigate to Stop 2
6. Confirm delivery at Stop 2
7. Complete order
```

---

## Tracking Status Messages

| Phase | Message |
|-------|---------|
| Picking up | "Picking up your order from {restaurant}" |
| En route to Stop 1 | "Heading to Stop 1 of {total}" |
| Arriving Stop 1 | "Arriving at Stop 1 — {address}" |
| Delivered Stop 1 | "Delivered to Stop 1 ✓ — Heading to Stop 2" |
| Arriving Stop 2 | "Arriving at Stop 2 — {address}" |
| All delivered | "All {total} stops delivered! ✓" |

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Remove only stop | Prevent (must have at least 1) |
| Max stops reached | Hide "Add another" button (max 5) |
| Same address twice | Show warning, allow if intentional |
| Invalid address | Block addition, show geocoding error |
| Stop too far (>15 mi from previous) | Show warning about extended fee |
| Order cancelled mid-delivery | Driver completes current stop, returns |

---

## Validation Rules

| Rule | Validation |
|------|------------|
| Minimum stops | 1 (required) |
| Maximum stops | 5 |
| Address format | Must geocode successfully |
| Distance limit | Each stop within 15 mi of previous |
| Total route | Under 30 mi |
| Instructions length | Max 200 characters |

---

## Summary

This implementation provides:

1. **Multi-stop address management** — Add up to 5 delivery stops per order
2. **Dynamic pricing** — Fee adjusts based on distance and number of stops
3. **Clear order summary** — Shows numbered stops with addresses
4. **Route progress tracking** — "Delivered Stop 1 → Heading to Stop 2"
5. **Multi-stop map** — Visual route with numbered markers
6. **Driver support** — Sequential stop-by-stop navigation
7. **Public tracking** — Works for guest order tracking too

The feature enables scenarios like delivering food to multiple offices, splitting an order between friends, or party deliveries at different venues.
