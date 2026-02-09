
# Scheduled Orders for Eats

## Overview
Enable customers to choose a future delivery time when placing food orders. The system will add a delivery time selector to checkout, allowing "Deliver ASAP" or "Schedule for Later" with date/time picking. Scheduled orders will be clearly labeled in the order history.

---

## Current State Analysis

### Already Complete
| Feature | Status | Location |
|---------|--------|----------|
| `is_scheduled` column | Complete | `food_orders` table (boolean) |
| `pickup_window_start` column | Complete | `food_orders` table (timestamp) |
| `pickup_window_end` column | Complete | `food_orders` table (timestamp) |
| `deliver_by` column | Complete | `food_orders` table (timestamp) |
| `sla_deliver_by` column | Complete | `food_orders` table (timestamp) |
| `preferred_time` in CreateFoodOrderInput | Complete | "asap" or "scheduled" enum |
| `scheduled_time` in CreateFoodOrderInput | Complete | Optional string |
| `opening_hours` on restaurants | Complete | JSON field with hours |
| `MobileDatePickerSheet` component | Complete | Date picker bottom sheet |
| `EatsCart.tsx` checkout page | Complete | Main checkout UI |
| `EatsOrders.tsx` orders list | Complete | Order history |
| `EatsOrderDetail.tsx` order detail | Complete | Single order view |

### Missing
| Feature | Status |
|---------|--------|
| Delivery time selector UI in EatsCart | Need to create |
| Time picker component for mobile | Need to create |
| Validate time against restaurant hours | Need to add |
| Store scheduled fields on order creation | Need to update mutation |
| "Scheduled Order" badge on orders page | Need to add |
| Show scheduled time in order summary | Need to add |
| Show scheduled time on order detail | Need to add |

---

## Implementation Plan

### 1) Create Mobile Time Picker Sheet Component

**File to Create:** `src/components/eats/DeliveryTimeSheet.tsx`

**Purpose:** Bottom sheet for selecting delivery timing (ASAP or scheduled).

**UI:**
```text
+------------------------------------------+
|        When would you like it?           |
+------------------------------------------+
|                                          |
|  [🕐]  Deliver ASAP         ○            |
|        Usually 30-45 min                 |
|                                          |
|  [📅]  Schedule for Later   ○            |
|        Choose a specific time            |
|                                          |
+------------------------------------------+
|  (If "Schedule" selected:)               |
|                                          |
|  Select Date                             |
|  [Today ▼] [Tomorrow] [Tue, Feb 11]      |
|                                          |
|  Select Time                             |
|  [11:30 AM] [12:00 PM] [12:30 PM] ...    |
|                                          |
+------------------------------------------+
|                                          |
|  [     Confirm Delivery Time     ]       |
|                                          |
+------------------------------------------+
```

**Features:**
- Toggle between ASAP and Scheduled
- Date selector (Today + next 6 days)
- Time slot grid (30-minute intervals)
- Only show future times for today
- Respect restaurant opening hours when available
- Orange accent color to match Eats theme

### 2) Create Delivery Time Selector Button Component

**File to Create:** `src/components/eats/DeliveryTimeSelector.tsx`

**Purpose:** Compact button that shows current selection and opens the sheet.

**UI (ASAP selected):**
```text
+------------------------------------------+
| [🕐]  Deliver ASAP                    ▼  |
|       30-45 min                          |
+------------------------------------------+
```

**UI (Scheduled selected):**
```text
+------------------------------------------+
| [📅]  Scheduled Delivery              ▼  |
|       Today at 6:30 PM                   |
+------------------------------------------+
```

### 3) Add Delivery Time Selection to EatsCart

**File to Modify:** `src/pages/EatsCart.tsx`

**Changes:**
- Add state for delivery timing
- Insert DeliveryTimeSelector below address selector
- Pass scheduled info to order creation
- Update order summary to show scheduled time

```typescript
// Add state
const [deliveryMode, setDeliveryMode] = useState<"asap" | "scheduled">("asap");
const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
const [scheduledTime, setScheduledTime] = useState<string | null>(null);

// In handlePlaceOrder, add to createOrder.mutateAsync:
is_scheduled: deliveryMode === "scheduled",
deliver_by: scheduledDate && scheduledTime 
  ? new Date(`${format(scheduledDate, "yyyy-MM-dd")}T${scheduledTime}`).toISOString()
  : null,
pickup_window_start: scheduledDate && scheduledTime
  ? new Date(`${format(scheduledDate, "yyyy-MM-dd")}T${scheduledTime}`).toISOString()
  : null,
```

**UI Placement:** After Address Selector, before Cart Items

### 4) Update Order Creation Mutation

**File to Modify:** `src/hooks/useEatsOrders.ts`

**Changes:**
- Add scheduling fields to CreateFoodOrderInput interface
- Include fields in insert statement

```typescript
// Add to CreateFoodOrderInput interface:
is_scheduled?: boolean;
deliver_by?: string | null;
pickup_window_start?: string | null;
pickup_window_end?: string | null;

// Add to insert object:
is_scheduled: input.is_scheduled || false,
deliver_by: input.deliver_by || null,
pickup_window_start: input.pickup_window_start || null,
pickup_window_end: input.pickup_window_end || null,
```

### 5) Add Scheduled Badge to Orders List

**File to Modify:** `src/pages/EatsOrders.tsx`

**Changes:**
- Check `is_scheduled` and `deliver_by` on each order
- Show "Scheduled" badge with time

```typescript
// In order card, after status badge:
{order.is_scheduled && order.deliver_by && (
  <Badge className="bg-violet-500/20 text-violet-400 text-xs font-semibold border-0">
    <CalendarClock className="w-3 h-3 mr-1" />
    {format(new Date(order.deliver_by), "MMM d, h:mm a")}
  </Badge>
)}
```

### 6) Show Scheduled Time in Order Summary (Cart)

**File to Modify:** `src/pages/EatsCart.tsx`

**Changes:**
- Add delivery time line in Order Summary section

```typescript
// After subtotal, add:
<div className="flex justify-between text-sm">
  <span className="text-zinc-400">Delivery Time</span>
  <span className={deliveryMode === "scheduled" ? "text-violet-400" : ""}>
    {deliveryMode === "asap" 
      ? "ASAP (30-45 min)" 
      : scheduledDate && scheduledTime
        ? format(new Date(`${format(scheduledDate, "yyyy-MM-dd")}T${scheduledTime}`), "MMM d 'at' h:mm a")
        : "Select time"
    }
  </span>
</div>
```

### 7) Show Scheduled Time on Order Detail

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Changes:**
- Add scheduled banner for scheduled orders
- Show delivery time target

```typescript
// After status banner, add for scheduled orders:
{order.is_scheduled && order.deliver_by && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-4"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
        <CalendarClock className="w-5 h-5 text-violet-400" />
      </div>
      <div>
        <p className="font-bold text-violet-400 text-sm">Scheduled Delivery</p>
        <p className="text-sm text-zinc-400">
          {format(new Date(order.deliver_by), "EEEE, MMMM d 'at' h:mm a")}
        </p>
      </div>
    </div>
  </motion.div>
)}
```

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/components/eats/DeliveryTimeSheet.tsx` | Bottom sheet with ASAP/schedule options and time picker |
| `src/components/eats/DeliveryTimeSelector.tsx` | Compact button showing current selection |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/pages/EatsCart.tsx` | Add time selector, pass scheduling fields to order |
| `src/hooks/useEatsOrders.ts` | Add scheduling fields to input interface and insert |
| `src/pages/EatsOrders.tsx` | Show "Scheduled" badge on order cards |
| `src/pages/EatsOrderDetail.tsx` | Show scheduled delivery banner |

---

## UI Component Details

### DeliveryTimeSheet (Bottom Sheet)
- Height: 70vh
- Sections: Mode toggle, Date selector, Time grid
- Date pills: Horizontally scrollable (Today + 6 days)
- Time slots: 30-minute intervals in grid (3 columns)
- Disabled times: Past times, outside restaurant hours
- Accent color: Violet for scheduled, Orange for ASAP

### DeliveryTimeSelector (Button)
- Full-width card style (matches other checkout sections)
- Left icon: Clock (ASAP) or Calendar (Scheduled)
- Right chevron indicator
- Tap opens DeliveryTimeSheet

### Scheduled Badge (Orders List)
- Violet color scheme (differentiates from status badges)
- CalendarClock icon
- Format: "Feb 9, 6:30 PM"
- Appears next to status badge

---

## Time Slot Generation Logic

```typescript
function generateTimeSlots(
  date: Date, 
  restaurantHours?: { open: string; close: string }
): string[] {
  const slots: string[] = [];
  const now = new Date();
  const isToday = isSameDay(date, now);
  
  // Default hours: 10:00 AM - 10:00 PM
  const openHour = restaurantHours?.open 
    ? parseInt(restaurantHours.open.split(':')[0]) 
    : 10;
  const closeHour = restaurantHours?.close 
    ? parseInt(restaurantHours.close.split(':')[0]) 
    : 22;
  
  // Generate 30-minute slots
  for (let hour = openHour; hour < closeHour; hour++) {
    for (let minute of [0, 30]) {
      const slotTime = setMinutes(setHours(date, hour), minute);
      
      // Skip past times for today (plus 1 hour buffer)
      if (isToday && slotTime <= addHours(now, 1)) continue;
      
      slots.push(format(slotTime, 'h:mm a'));
    }
  }
  
  return slots;
}
```

---

## Data Flow

```text
Customer opens EatsCart
        ↓
Sees DeliveryTimeSelector (default: ASAP)
        ↓
Taps selector → Opens DeliveryTimeSheet
        ↓
Chooses "Schedule for Later"
        ↓
Selects date (Today, Tomorrow, etc.)
        ↓
Selects time slot (12:30 PM)
        ↓
Confirms → Sheet closes
        ↓
DeliveryTimeSelector shows: "Today at 12:30 PM"
        ↓
Order summary shows delivery time
        ↓
Customer places order
        ↓
Order saved with:
├── is_scheduled: true
├── deliver_by: "2026-02-09T12:30:00Z"
└── pickup_window_start: "2026-02-09T12:00:00Z"
        ↓
EatsOrders shows badge: "📅 Feb 9, 12:30 PM"
        ↓
EatsOrderDetail shows scheduled banner
        ↓
Restaurant sees scheduled time in their dashboard
```

---

## Summary

This implementation enables scheduled orders by:

1. **Time Selector** - DeliveryTimeSheet with ASAP/Schedule toggle and time picker
2. **Checkout Integration** - DeliveryTimeSelector in EatsCart between address and items
3. **Order Summary** - Shows delivery time (ASAP or scheduled time)
4. **Order Creation** - Stores `is_scheduled`, `deliver_by`, `pickup_window_start`
5. **Orders List** - Violet "Scheduled" badge with date/time
6. **Order Detail** - Purple banner showing scheduled delivery time

Leverages existing database columns (`is_scheduled`, `deliver_by`, `pickup_window_start`) and matches the Eats design aesthetic with violet accent for scheduled orders.
