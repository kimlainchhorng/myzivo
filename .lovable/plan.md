
# Restaurant Availability Status — Implementation Plan

## Overview
Add a comprehensive restaurant availability status system showing Open, Busy, or Temporarily Unavailable states with appropriate messaging and ordering behavior.

---

## Current State Analysis

### Database Fields Available (already in `restaurants` table)
| Field | Type | Purpose |
|-------|------|---------|
| `is_open` | boolean | Whether restaurant is currently accepting orders |
| `busy_mode` | boolean | Whether restaurant is in busy mode |
| `busy_prep_time_bonus_minutes` | number | Extra minutes added during busy periods |
| `pause_new_orders` | boolean | Temporarily disable new orders |
| `avg_prep_time` | number | Normal preparation time |
| `closed_reason` | string | Optional reason for closure |

### Frontend Interface (needs updating)
Current `Restaurant` interface in `useEatsOrders.ts`:
```typescript
interface Restaurant {
  id: string;
  name: string;
  is_open: boolean | null;
  status: string | null;
  avg_prep_time: number | null;
  // Missing: busy_mode, pause_new_orders, busy_prep_time_bonus_minutes
}
```

### Current UI Behavior
- Shows "Open" badge if `is_open === true`
- Shows "Closed" badge if `is_open === false`
- No busy state messaging
- No ordering restriction for unavailable restaurants

---

## Implementation Plan

### 1) Update Restaurant Interface

**File to Modify:** `src/hooks/useEatsOrders.ts`

**Changes:**
Add new fields to the `Restaurant` interface to capture availability status:

```typescript
export interface Restaurant {
  // ... existing fields
  busy_mode: boolean | null;
  busy_prep_time_bonus_minutes: number | null;
  pause_new_orders: boolean | null;
  closed_reason: string | null;
}
```

### 2) Create RestaurantAvailabilityBadge Component

**File to Create:** `src/components/eats/RestaurantAvailabilityBadge.tsx`

**Purpose:** Unified badge component showing restaurant status with consistent styling.

**States:**
| Status | Condition | Badge Color | Icon |
|--------|-----------|-------------|------|
| Open | `is_open && !busy_mode && !pause_new_orders` | Emerald/green | Checkmark |
| Busy | `is_open && busy_mode && !pause_new_orders` | Amber/orange | Clock |
| Temporarily Unavailable | `pause_new_orders || !is_open` | Red | AlertCircle |

**Styling:**
```text
+----------------------------------+
| [🟢 Open]                        | Emerald badge
+----------------------------------+
| [⏱ Busy — longer wait]          | Amber badge + tooltip
+----------------------------------+
| [⚠ Temporarily unavailable]     | Red badge
+----------------------------------+
```

### 3) Create BusyRestaurantBanner Component

**File to Create:** `src/components/eats/BusyRestaurantBanner.tsx`

**Purpose:** Contextual banner on restaurant menu page when busy.

**UI Design:**
```text
+----------------------------------------------------------+
| [⏱]  High demand — longer preparation times              |
|      Expected wait: 45-55 min (15 min longer than usual) |
+----------------------------------------------------------+
```

**Features:**
- Show when `busy_mode === true`
- Calculate extended prep time using `avg_prep_time + busy_prep_time_bonus_minutes`
- Dismissible per-session
- Amber/orange theme matching other Eats warnings

### 4) Create UnavailableBanner Component

**File to Create:** `src/components/eats/UnavailableBanner.tsx`

**Purpose:** Banner on restaurant page when temporarily unavailable.

**UI Design:**
```text
+----------------------------------------------------------+
| [⚠]  This restaurant is temporarily unavailable          |
|      You can browse the menu, but ordering is paused.    |
|      [reason if provided]                                |
+----------------------------------------------------------+
```

**Features:**
- Show when `pause_new_orders === true` or `is_open === false`
- Red/destructive theme
- Non-dismissible (ordering actually blocked)

### 5) Create useRestaurantAvailability Hook

**File to Create:** `src/hooks/useRestaurantAvailability.ts`

**Purpose:** Derive availability status and messaging from restaurant data.

```typescript
interface RestaurantAvailability {
  status: "open" | "busy" | "unavailable";
  canOrder: boolean;
  statusMessage: string;
  detailMessage: string | null;
  adjustedPrepTime: number | null;
  prepTimeBonus: number | null;
}
```

**Logic:**
```typescript
function getRestaurantAvailability(restaurant: Restaurant): RestaurantAvailability {
  // Unavailable: explicitly paused or closed
  if (restaurant.pause_new_orders || restaurant.is_open === false) {
    return {
      status: "unavailable",
      canOrder: false,
      statusMessage: "Temporarily unavailable",
      detailMessage: restaurant.closed_reason || "Ordering is currently paused.",
      adjustedPrepTime: null,
      prepTimeBonus: null,
    };
  }
  
  // Busy: open but in busy mode
  if (restaurant.busy_mode) {
    const bonus = restaurant.busy_prep_time_bonus_minutes || 15;
    const base = restaurant.avg_prep_time || 25;
    return {
      status: "busy",
      canOrder: true,
      statusMessage: "Busy",
      detailMessage: "High demand — longer preparation times.",
      adjustedPrepTime: base + bonus,
      prepTimeBonus: bonus,
    };
  }
  
  // Normal open state
  return {
    status: "open",
    canOrder: true,
    statusMessage: "Open",
    detailMessage: null,
    adjustedPrepTime: restaurant.avg_prep_time,
    prepTimeBonus: null,
  };
}
```

### 6) Update EatsRestaurants Page (Restaurant List)

**File to Modify:** `src/pages/EatsRestaurants.tsx`

**Changes:**
1. Import `RestaurantAvailabilityBadge`
2. Replace simple Open/Closed badge with new unified badge
3. Show prep time adjustment for busy restaurants

**Badge Location:**
```text
+------------------------------------------+
| [Image]                                  |
|                          [🟡 Busy]       |  <-- Top right corner
+------------------------------------------+
| Restaurant Name                          |
| Italian • ⭐ 4.8 • 🕐 35-45 min          |  <-- Prep time adjusted
+------------------------------------------+
```

### 7) Update MobileEatsPremium Component

**File to Modify:** `src/components/eats/MobileEatsPremium.tsx`

**Changes:**
1. Import and use `RestaurantAvailabilityBadge`
2. Replace current Open/Closed badge (lines 253-264)
3. Adjust displayed prep time when busy

**Current Code (to replace):**
```typescript
{restaurant.is_open !== null && (
  <div className="absolute top-6 left-6">
    <div className={`... ${restaurant.is_open ? "emerald" : "red"}`}>
      {restaurant.is_open ? "Open Now" : "Closed"}
    </div>
  </div>
)}
```

**New Code:**
```typescript
<div className="absolute top-6 left-6">
  <RestaurantAvailabilityBadge restaurant={restaurant} />
</div>
```

### 8) Update EatsRestaurantMenu Page

**File to Modify:** `src/pages/EatsRestaurantMenu.tsx`

**Changes:**
1. Import `useRestaurantAvailability`, `BusyRestaurantBanner`, `UnavailableBanner`
2. Show appropriate banner based on availability status
3. Disable "Add to Cart" buttons when `canOrder === false`
4. Update prep time display to use adjusted time

**Banner Placement (after header, before menu):**
```typescript
{/* Availability Banners */}
{availability.status === "busy" && (
  <BusyRestaurantBanner
    restaurant={restaurant}
    adjustedPrepTime={availability.adjustedPrepTime}
    bonusMinutes={availability.prepTimeBonus}
  />
)}
{availability.status === "unavailable" && (
  <UnavailableBanner
    message={availability.detailMessage}
  />
)}
```

**Add Button Disable Logic (in MenuItemCard):**
```typescript
<Button
  disabled={!canOrder}  // New prop passed down
  onClick={handleAdd}
>
  {canOrder ? "Add" : "Unavailable"}
</Button>
```

### 9) Update Checkout Page

**File to Modify:** `src/pages/EatsCheckout.tsx`

**Changes:**
Add validation to prevent checkout for unavailable restaurants:

```typescript
// Fetch restaurant to check availability
const { data: restaurant } = useRestaurant(restaurantId);
const availability = useRestaurantAvailability(restaurant);

// Block checkout if unavailable
if (!availability.canOrder) {
  return (
    <div className="...">
      <AlertCircle />
      <h1>Restaurant Unavailable</h1>
      <p>This restaurant is temporarily not accepting orders.</p>
      <Button onClick={() => navigate("/eats/restaurants")}>
        Browse Other Restaurants
      </Button>
    </div>
  );
}
```

---

## File Summary

### New Files (4)
| File | Purpose |
|------|---------|
| `src/components/eats/RestaurantAvailabilityBadge.tsx` | Unified status badge (Open/Busy/Unavailable) |
| `src/components/eats/BusyRestaurantBanner.tsx` | Banner for busy restaurants with prep time info |
| `src/components/eats/UnavailableBanner.tsx` | Banner for temporarily unavailable restaurants |
| `src/hooks/useRestaurantAvailability.ts` | Hook to derive availability status and messaging |

### Modified Files (5)
| File | Changes |
|------|---------|
| `src/hooks/useEatsOrders.ts` | Add `busy_mode`, `pause_new_orders`, `busy_prep_time_bonus_minutes`, `closed_reason` to Restaurant interface |
| `src/pages/EatsRestaurants.tsx` | Use new availability badge component |
| `src/components/eats/MobileEatsPremium.tsx` | Replace Open/Closed badge with availability badge |
| `src/pages/EatsRestaurantMenu.tsx` | Add banners, disable ordering when unavailable |
| `src/pages/EatsCheckout.tsx` | Block checkout for unavailable restaurants |

---

## UI Components

### RestaurantAvailabilityBadge
```text
Open:        [✓ Open]           bg-emerald-500/20 text-emerald-400
Busy:        [⏱ Busy]           bg-amber-500/20 text-amber-400
Unavailable: [⚠ Unavailable]    bg-red-500/20 text-red-400
```

### BusyRestaurantBanner
```text
+----------------------------------------------------------+
| [⏱]  High demand — longer preparation times          [X] |
|      Expected wait: 45-55 min (~15 min longer)           |
+----------------------------------------------------------+
Background: bg-amber-500/10 border-amber-500/30
```

### UnavailableBanner
```text
+----------------------------------------------------------+
| [⚠]  This restaurant is temporarily unavailable          |
|      You can browse the menu, but ordering is paused.    |
+----------------------------------------------------------+
Background: bg-red-500/10 border-red-500/30
```

---

## Status Logic Flow

```text
Restaurant Data
      ↓
pause_new_orders === true?
      ├── YES → Status: "unavailable", canOrder: false
      └── NO ↓
is_open === false?
      ├── YES → Status: "unavailable", canOrder: false
      └── NO ↓
busy_mode === true?
      ├── YES → Status: "busy", canOrder: true, adjust prep time
      └── NO → Status: "open", canOrder: true
```

---

## Data Requirements

The database already has these fields — just need to include them in frontend queries:
- `busy_mode`: boolean (set by merchant when overwhelmed)
- `busy_prep_time_bonus_minutes`: number (extra minutes during busy)
- `pause_new_orders`: boolean (merchant can pause without closing)
- `closed_reason`: string (optional explanation)

---

## Summary

This implementation provides:

1. **Three clear status states**: Open, Busy, Temporarily Unavailable
2. **Consistent badge component**: Used across restaurant lists and menu pages
3. **Busy messaging**: "High demand — longer preparation times" with adjusted ETA
4. **Unavailable behavior**: Menu browsing allowed, ordering disabled
5. **Checkout protection**: Prevents orders to unavailable restaurants

The customer message for busy status:
> **"High demand — longer preparation times."**

This matches the user's exact requirement while leveraging existing database fields.
