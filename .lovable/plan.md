

# Maintenance Mode — Implementation Plan

## Overview
Add a maintenance mode feature that displays a clear message when ZIVO ordering is paused. When maintenance mode is active, checkout and new orders are disabled, but customers can still browse restaurants and view their past orders.

## Current State Analysis

### Existing Infrastructure
| Component | Status | Purpose |
|-----------|--------|---------|
| `service_health_status` table | Exists | Stores status per service (flights, hotels, eats, rides, etc.) |
| `useSystemStatus()` hook | Exists | Checks for degraded/paused services |
| `SystemStatusBanner` | Exists | Shows "slower than usual" message for degraded services |
| `useRestaurantAvailability()` | Exists | Checks individual restaurant pause status |

### Database Schema (service_health_status)
| Column | Type | Description |
|--------|------|-------------|
| `service_name` | text | flights, hotels, cars, rides, **eats**, auth, payments, storage |
| `status` | text | operational, degraded, outage, **maintenance** |
| `is_paused` | boolean | Manual service pause |
| `paused_reason` | text | Admin-provided reason |

### Current Services in DB
- flights, hotels, cars, rides, eats, auth, payments, storage

---

## Implementation Plan

### 1) Extend System Status Hook for Maintenance Mode

**File to Modify:** `src/hooks/useSystemStatus.ts`

**Changes:**
- Add `isMaintenanceMode` flag (when status = 'maintenance' OR is_paused = true)
- Return service-specific maintenance data
- New interface:

```text
interface SystemStatusResult {
  hasActiveIncident: boolean;
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  incidentMessage: string;
  isLoading: boolean;
  services: {
    eats: { status: string; isPaused: boolean; } | null;
    rides: { status: string; isPaused: boolean; } | null;
    travel: { status: string; isPaused: boolean; } | null;
  };
}
```

### 2) Create Maintenance Mode Screen Component

**File to Create:** `src/components/shared/MaintenanceScreen.tsx`

**Purpose:** Full-screen overlay shown when maintenance mode is active.

**Design:**
```text
┌─────────────────────────────────────────┐
│                                         │
│              🔧 (icon)                  │
│                                         │
│    ZIVO is temporarily under           │
│         maintenance.                    │
│                                         │
│     Please try again shortly.           │
│                                         │
│                                         │
│         [ Browse Restaurants ]          │
│                                         │
│         [ View Past Orders ]            │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- Full-screen centered layout
- ZIVO logo/branding
- Calm, non-alarming design (blue theme for maintenance)
- Action buttons to browse or view orders

### 3) Create Service-Specific Maintenance Hook

**File to Create:** `src/hooks/useServiceMaintenance.ts`

**Purpose:** Check if a specific service (eats, rides, travel) is in maintenance mode.

**Implementation:**
```text
export function useServiceMaintenance(serviceName: "eats" | "rides" | "flights" | "hotels") {
  const { data, isLoading } = useQuery({
    queryKey: ["service-maintenance", serviceName],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_health_status")
        .select("status, is_paused")
        .eq("service_name", serviceName)
        .single();
      
      return {
        isInMaintenance: data?.status === "maintenance" || data?.is_paused,
        isPaused: data?.is_paused,
      };
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });
  
  return {
    isInMaintenance: data?.isInMaintenance ?? false,
    isLoading,
  };
}
```

### 4) Update Checkout Pages with Maintenance Gate

**Files to Modify:**
- `src/pages/EatsCheckout.tsx`
- `src/pages/TravelCheckoutPage.tsx`

**Pattern for EatsCheckout:**
```text
function EatsCheckoutContent() {
  const { isInMaintenance, isLoading: maintenanceLoading } = useServiceMaintenance("eats");
  
  // Show maintenance screen if eats service is paused
  if (maintenanceLoading) {
    return <LoadingSpinner />;
  }
  
  if (isInMaintenance) {
    return (
      <MaintenanceScreen 
        allowBrowse 
        allowViewOrders 
        browseUrl="/eats/restaurants"
        ordersUrl="/eats/orders"
      />
    );
  }
  
  // ... existing checkout logic
}
```

### 5) Update Edge Functions with Maintenance Check

**Files to Modify:**
- `supabase/functions/create-eats-checkout/index.ts`
- `supabase/functions/create-eats-payment-intent/index.ts`
- `supabase/functions/create-ride-checkout/index.ts`
- `supabase/functions/create-ride-payment-intent/index.ts`
- `supabase/functions/create-travel-order/index.ts`

**Pattern (add at start of each function):**
```text
// Check if service is in maintenance
const { data: serviceStatus } = await supabase
  .from("service_health_status")
  .select("status, is_paused")
  .eq("service_name", "eats")  // or "rides", "hotels" etc.
  .single();

if (serviceStatus?.status === "maintenance" || serviceStatus?.is_paused) {
  return new Response(
    JSON.stringify({ 
      error: "Service temporarily unavailable",
      maintenance: true,
    }),
    { headers: corsHeaders, status: 503 }
  );
}
```

### 6) Update Restaurant Menu Page with Maintenance Banner

**File to Modify:** `src/pages/EatsRestaurantMenu.tsx`

**Changes:**
- Check if eats service is in maintenance
- Show info banner if in maintenance (but still allow browsing)
- Disable "Add to Cart" and "Proceed to Checkout" buttons

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/useServiceMaintenance.ts` | Service-specific maintenance check |
| `src/components/shared/MaintenanceScreen.tsx` | Full-screen maintenance display |

### Modified Files (8)
| File | Changes |
|------|---------|
| `src/hooks/useSystemStatus.ts` | Add `isMaintenanceMode` flag |
| `src/pages/EatsCheckout.tsx` | Gate checkout with maintenance check |
| `src/pages/TravelCheckoutPage.tsx` | Gate checkout with maintenance check |
| `src/pages/EatsRestaurantMenu.tsx` | Disable ordering buttons, show banner |
| `supabase/functions/create-eats-checkout/index.ts` | Add maintenance guard |
| `supabase/functions/create-eats-payment-intent/index.ts` | Add maintenance guard |
| `supabase/functions/create-ride-checkout/index.ts` | Add maintenance guard |
| `supabase/functions/create-ride-payment-intent/index.ts` | Add maintenance guard |

---

## Maintenance Screen Design

### Visual Layout
```text
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                        ╭─────────╮                           │
│                        │   🔧    │                           │
│                        ╰─────────╯                           │
│                                                              │
│                 ZIVO is temporarily                          │
│                   under maintenance.                         │
│                                                              │
│               Please try again shortly.                      │
│                                                              │
│                                                              │
│              ┌─────────────────────────┐                     │
│              │   Browse Restaurants    │                     │
│              └─────────────────────────┘                     │
│                                                              │
│              ┌─────────────────────────┐                     │
│              │    View Past Orders     │                     │
│              └─────────────────────────┘                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Color Scheme
| Element | Value |
|---------|-------|
| Background | `bg-background` (default) |
| Icon container | `bg-blue-500/20` |
| Icon | `text-blue-500` (Wrench icon) |
| Title | Default text |
| Subtitle | `text-muted-foreground` |
| Buttons | Outline variant |

---

## Customer Experience Flow

### Normal Operation
```text
Browse Restaurants → Add Items → Cart → Checkout → Payment → Order Placed
```

### Maintenance Mode Active
```text
Browse Restaurants → Add Items → Cart → [BLOCKED] → Maintenance Screen
                                                     ├─ Browse Restaurants (allowed)
                                                     └─ View Past Orders (allowed)
```

---

## Allowed vs Blocked Actions

| Action | Maintenance Mode | Notes |
|--------|------------------|-------|
| Browse restaurants | Allowed | Users can explore menus |
| View menu items | Allowed | Prices, descriptions visible |
| Add to cart | Blocked | Button disabled |
| Proceed to checkout | Blocked | Redirects to maintenance screen |
| Submit order | Blocked | Edge function returns 503 |
| View past orders | Allowed | Order history accessible |
| Track existing order | Allowed | Active orders still tracked |

---

## Edge Function Response Format

### Success (Normal)
```json
{
  "success": true,
  "orderId": "abc123",
  ...
}
```

### Maintenance Mode (503)
```json
{
  "error": "Service temporarily unavailable",
  "maintenance": true
}
```

**Client handling:**
```text
if (response.status === 503 && data.maintenance) {
  // Show maintenance message
  toast.error("Ordering is temporarily unavailable. Please try again shortly.");
  navigate("/eats");
}
```

---

## Admin Control

Admins trigger maintenance mode via:
1. **Recovery Dashboard** → Toggle service pause for "eats"
2. **Recovery Dashboard** → Set status to "maintenance"

No new admin UI needed — existing tools control the data.

---

## Summary

This implementation provides:

1. **Service-Specific Hook** — `useServiceMaintenance(serviceName)` for checking individual services
2. **Maintenance Screen** — Full-screen overlay with clear messaging
3. **Checkout Gating** — Block checkout pages when maintenance is active
4. **Edge Function Guards** — Server-side 503 responses for order creation
5. **Menu Page Updates** — Disable ordering buttons, show info banner
6. **Allowed Browsing** — Customers can still explore and view past orders
7. **Clear Messaging** — "ZIVO is temporarily under maintenance. Please try again shortly."

The feature gives admins control to pause ordering platform-wide while keeping the browsing experience intact for customers.

