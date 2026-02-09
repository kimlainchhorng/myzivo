
# Spending Summary & Receipts — Implementation Plan

## Overview
Add a customer spending history page at `/account/spending` that shows monthly spending stats and enables receipt downloads for all order types (Eats, Rides, Travel).

---

## Current State Analysis

### Existing Infrastructure
| Component | Status | Purpose |
|-----------|--------|---------|
| `useMyEatsOrders` hook | Exists | Fetches customer's food orders |
| `useRiderTripHistory` hook | Exists | Fetches customer's ride history |
| `useMyOrders` hook | Exists | Fetches customer's travel orders |
| `OrderReceipt` component | Exists | Eats receipt with print support |
| `TripReceiptModal` component | Exists | Rides receipt modal with download button |
| `/account/wallet` page | Exists | Similar UI pattern for account section |

### Data Sources for Spending
| Service | Table | Amount Field | Status Filter |
|---------|-------|--------------|---------------|
| Eats | `food_orders` | `total_amount` | `delivered` |
| Rides | `trips` | `fare_amount` | `completed` |
| Travel | `travel_orders` | `total` | `confirmed`, `completed` |

---

## Implementation Plan

### 1) Create Spending Stats Hook

**File to Create:** `src/hooks/useSpendingStats.ts`

**Purpose:** Aggregate spending data across all services for the current user.

**Data Returned:**
```text
interface SpendingStats {
  thisMonth: {
    total: number;
    orderCount: number;
    averageOrder: number;
    byService: {
      eats: number;
      rides: number;
      travel: number;
    };
  };
  allTime: {
    total: number;
    orderCount: number;
  };
  recentOrders: UnifiedOrder[];
  isLoading: boolean;
}
```

**Queries:**
- Food orders: `food_orders` where `customer_id = user.id` and `status = 'delivered'`
- Rides: `trips` where `rider_id = user.id` and `status = 'completed'`
- Travel: `travel_orders` where `user_id = user.id` and `status in ('confirmed', 'completed')`

### 2) Create Unified Order Type

**File to Update:** `src/hooks/useSpendingStats.ts` (same file)

**Purpose:** Normalize different order types into a single interface for display.

```text
interface UnifiedOrder {
  id: string;
  type: 'eats' | 'rides' | 'travel';
  title: string;        // Restaurant name / "Ride to X" / Hotel name
  amount: number;
  date: string;
  status: string;
  receiptUrl?: string;  // Deep link to receipt page
  meta: {
    orderId: string;
    serviceSpecificData: any;
  };
}
```

### 3) Create Spending Summary Page

**File to Create:** `src/pages/account/SpendingPage.tsx`

**Design:**
```text
┌────────────────────────────────────────────────────────────┐
│  ←  Spending History                                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  February 2026                                       │  │
│  │                                                      │  │
│  │  $1,247.50           12           $103.96           │  │
│  │  Total Spent       Orders     Avg. Order            │  │
│  │                                                      │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                │  │
│  │  │ Eats    │ │ Rides   │ │ Travel  │                │  │
│  │  │ $342.50 │ │ $155.00 │ │ $750.00 │                │  │
│  │  └─────────┘ └─────────┘ └─────────┘                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Recent Orders                                             │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🍔 Burger Palace              $32.50   Feb 8        │  │
│  │    Delivered                           [Receipt]    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🚗 Ride to SFO Airport        $45.00   Feb 7        │  │
│  │    Completed                           [Receipt]    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🏨 Le Grand Hotel (Paris)    $750.00   Feb 5        │  │
│  │    Confirmed                           [Receipt]    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Features:**
- Monthly summary card with total spent, order count, average
- Breakdown by service (Eats, Rides, Travel) with visual indicators
- List of recent orders with receipt download buttons
- Filter by service type (All / Eats / Rides / Travel tabs)

### 4) Add Route to App.tsx

**File to Modify:** `src/App.tsx`

**Changes:**
- Import `SpendingPage` lazy component
- Add route `/account/spending` with `ProtectedRoute` wrapper

```text
const SpendingPage = lazy(() => import("./pages/account/SpendingPage"));

// In routes:
<Route path="/account/spending" element={<ProtectedRoute><SpendingPage /></ProtectedRoute>} />
```

### 5) Add Quick Link to Profile Page

**File to Modify:** `src/pages/Profile.tsx`

**Changes:**
- Add "Spending History" to the quick links array

```text
{ icon: TrendingUp, label: "Spending", href: "/account/spending", description: "View spending history" },
```

### 6) Create Receipt Download Utilities

**File to Create:** `src/lib/receiptUtils.ts`

**Purpose:** Generate downloadable PDF receipts for all order types.

**Functions:**
```text
// Generate receipt HTML for print/download
export function generateEatsReceiptHTML(order: EatsOrder): string;
export function generateRideReceiptHTML(trip: Trip): string;
export function generateTravelReceiptHTML(order: TravelOrder): string;

// Trigger download via print dialog
export function downloadReceipt(html: string, filename: string): void;
```

**Pattern (using window.print() approach like existing itinerary export):**
```text
function downloadReceipt(html: string, filename: string) {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}
```

### 7) Create Order Receipt Card Component

**File to Create:** `src/components/account/OrderReceiptCard.tsx`

**Purpose:** Reusable card component for displaying a single order with receipt download.

**Props:**
```text
interface OrderReceiptCardProps {
  order: UnifiedOrder;
  onDownloadReceipt: () => void;
}
```

**Design:**
- Service icon (fork for Eats, car for Rides, hotel for Travel)
- Title and date
- Amount with status badge
- Download/View Receipt button

---

## File Summary

### New Files (4)
| File | Purpose |
|------|---------|
| `src/hooks/useSpendingStats.ts` | Aggregate spending data across services |
| `src/pages/account/SpendingPage.tsx` | Main spending summary page |
| `src/lib/receiptUtils.ts` | PDF/print receipt generation |
| `src/components/account/OrderReceiptCard.tsx` | Reusable order card component |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add route for `/account/spending` |
| `src/pages/Profile.tsx` | Add quick link to spending page |

---

## Data Flow

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        Spending Summary Flow                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  SpendingPage                                                           │
│     │                                                                   │
│     └─> useSpendingStats()                                              │
│            │                                                            │
│            ├─> Query food_orders (Eats)                                 │
│            ├─> Query trips (Rides)                                      │
│            └─> Query travel_orders (Travel)                             │
│                      │                                                  │
│                      └─> Aggregate into UnifiedOrder[]                  │
│                                │                                        │
│                                └─> Calculate:                           │
│                                    • Total spent this month             │
│                                    • Order count                        │
│                                    • Average order value                │
│                                    • Breakdown by service               │
│                                                                         │
│  User clicks "Receipt" button                                           │
│     │                                                                   │
│     └─> generateReceipt(order)                                          │
│            │                                                            │
│            └─> Opens print dialog with formatted receipt                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Monthly Stats Calculation

```text
// Get current month boundaries
const now = new Date();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

// Filter orders by date
const thisMonthOrders = allOrders.filter(order => {
  const orderDate = new Date(order.date);
  return orderDate >= monthStart && orderDate <= monthEnd;
});

// Calculate stats
const total = thisMonthOrders.reduce((sum, o) => sum + o.amount, 0);
const count = thisMonthOrders.length;
const average = count > 0 ? total / count : 0;
```

---

## Receipt Generation Pattern

Following the existing pattern from `useItineraryExport.ts`:

```text
// Generate styled HTML receipt
const receiptHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Receipt - ${order.id}</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 40px; }
      .header { text-align: center; margin-bottom: 30px; }
      .logo { font-size: 24px; font-weight: bold; }
      .order-id { color: #666; font-size: 14px; }
      .items { margin: 20px 0; }
      .item { display: flex; justify-content: space-between; padding: 10px 0; }
      .total { font-size: 24px; font-weight: bold; text-align: right; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">ZIVO</div>
      <div class="order-id">Order #${order.id.slice(0, 8).toUpperCase()}</div>
    </div>
    <!-- Order details... -->
  </body>
  </html>
`;
```

---

## Service Icons and Colors

| Service | Icon | Color | Gradient |
|---------|------|-------|----------|
| Eats | `UtensilsCrossed` | Orange | `from-orange-500/20` |
| Rides | `Car` | Primary | `from-primary/20` |
| Travel | `Plane` / `Hotel` | Violet | `from-violet-500/20` |

---

## Filter Tabs Design

```text
┌──────────────────────────────────────────────────────────────┐
│  [ All ]  [ Eats ]  [ Rides ]  [ Travel ]                    │
└──────────────────────────────────────────────────────────────┘
```

Using the existing `Tabs` component from `@/components/ui/tabs`.

---

## Empty States

| Scenario | Message |
|----------|---------|
| No orders ever | "No spending history yet. Start exploring ZIVO!" |
| No orders this month | "No orders this month. Your spending will appear here." |
| Filtered with no results | "No {service} orders found." |

---

## Accessibility

- Semantic headings for screen readers
- ARIA labels on receipt download buttons
- Keyboard navigation for filter tabs
- Color contrast compliance for spending amounts

---

## Summary

This implementation provides:

1. **Spending Hook** — `useSpendingStats()` aggregates data from Eats, Rides, and Travel
2. **Spending Page** — `/account/spending` with monthly summary and order list
3. **Receipt Downloads** — Print-friendly receipts for all order types
4. **Order Cards** — Unified display for orders across services
5. **Quick Access** — Link from Profile page to spending history
6. **Filters** — Tab-based filtering by service type

The feature gives customers full visibility into their spending across all ZIVO services with easy receipt access for expense tracking.
