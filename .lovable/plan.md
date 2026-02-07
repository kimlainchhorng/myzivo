
# Analytics & Reporting Dashboard Implementation Plan

## Overview

Build a comprehensive Analytics & Reporting Dashboard for the Dispatch/Admin panel that provides clear visibility into business performance including revenue, order volume, driver metrics, and platform profitability.

---

## Current State Analysis

| Component | Status |
|-----------|--------|
| `useAnalytics.ts` | Exists with basic stats hooks for trips |
| `useDispatchStats.ts` | Exists with daily order counts by status |
| `DispatchPayouts.tsx` | Has CSV export pattern |
| `food_orders` table | Has `total_amount`, `driver_payout_cents`, `platform_fee`, `status`, timestamps |
| `driver_earnings` table | Has `base_amount`, `tip_amount`, `net_amount`, `platform_fee` |
| `restaurants` table | Available for merchant stats |
| Recharts | Already used extensively in admin components |
| Date filters | Pattern exists in `AdminDriverEarnings.tsx` |

---

## Architecture

The analytics dashboard will be added as a new route under `/dispatch/analytics` using the existing dispatch layout.

```text
/dispatch/analytics            Analytics Dashboard
  ├── KPI Cards (real-time)
  ├── Charts Section
  │   ├── Orders per Day (line chart)
  │   ├── Revenue per Day (bar chart)
  │   └── Delivered vs Cancelled (pie chart)
  ├── Top Lists
  │   ├── Top 10 Drivers
  │   └── Top 10 Merchants
  └── Export Controls
```

---

## Database Considerations

### Option A: Views (Recommended for Performance)

Create database views for aggregated analytics. However, since Supabase handles simple aggregations efficiently and the data volume is manageable, we'll use client-side aggregation initially with the option to add views later if needed.

### Tables Used

| Table | Fields Used |
|-------|------------|
| `food_orders` | `status`, `total_amount`, `driver_payout_cents`, `platform_fee`, `payment_status`, `created_at`, `delivered_at`, `cancelled_at`, `restaurant_id`, `driver_id` |
| `driver_earnings` | `driver_id`, `base_amount`, `tip_amount`, `net_amount`, `created_at` |
| `drivers` | `id`, `full_name`, `is_online`, `status` |
| `restaurants` | `id`, `name`, `owner_id` |

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useDispatchAnalytics.ts` | Create | Analytics data hooks with date filtering |
| `src/pages/dispatch/DispatchAnalytics.tsx` | Create | Main analytics dashboard page |
| `src/components/dispatch/AnalyticsKPICards.tsx` | Create | KPI cards with real-time counters |
| `src/components/dispatch/AnalyticsCharts.tsx` | Create | Orders, revenue, and status charts |
| `src/components/dispatch/AnalyticsTopLists.tsx` | Create | Top drivers and merchants tables |
| `src/components/dispatch/AnalyticsFilters.tsx` | Create | Date range filter component |
| `src/components/dispatch/AnalyticsExport.tsx` | Create | CSV export buttons and logic |
| `src/components/dispatch/DispatchSidebar.tsx` | Modify | Add Analytics nav item |
| `src/pages/dispatch/DispatchOrderDetail.tsx` | Modify | Add profit breakdown section |
| `src/App.tsx` | Modify | Add /dispatch/analytics route |

---

## Implementation Details

### 1. useDispatchAnalytics Hook

**File: `src/hooks/useDispatchAnalytics.ts`**

```typescript
// Types
interface DateRange {
  start: Date;
  end: Date;
}

interface AnalyticsKPIs {
  ordersToday: number;
  revenueToday: number;
  profitToday: number;
  driversOnline: number;
  avgOrderValue: number;
  completionRate: number;
}

interface DailyMetrics {
  date: string;
  orders: number;
  revenue: number;
  profit: number;
  delivered: number;
  cancelled: number;
}

interface DriverStats {
  driverId: string;
  driverName: string;
  totalOrders: number;
  totalEarnings: number;
  avgRating?: number;
}

interface MerchantStats {
  merchantId: string;
  merchantName: string;
  totalOrders: number;
  totalRevenue: number;
}
```

**Hooks to export:**

| Hook | Description |
|------|-------------|
| `useAnalyticsKPIs(dateRange)` | Real-time KPIs with auto-refresh |
| `useDailyMetrics(dateRange)` | Daily aggregated metrics for charts |
| `useTopDrivers(dateRange, limit)` | Top drivers by earnings |
| `useTopMerchants(dateRange, limit)` | Top merchants by revenue |
| `useOrderStatusBreakdown(dateRange)` | Delivered vs cancelled counts |

### 2. DispatchAnalytics Page

**File: `src/pages/dispatch/DispatchAnalytics.tsx`**

Layout:
1. Page header with title and date filter
2. KPI cards row (4-6 cards)
3. Charts section (2 columns: line/bar + pie)
4. Top lists section (2 columns: drivers + merchants)
5. Export controls footer

### 3. AnalyticsKPICards Component

**KPI Cards:**

| Card | Value Source | Icon |
|------|--------------|------|
| Orders Today | Count of orders created today | Package |
| Revenue Today | Sum of `total_amount` where delivered | DollarSign |
| Profit Today | Sum of `platform_fee` where delivered | TrendingUp |
| Drivers Online | Count of online verified drivers | Users |
| Avg Order Value | Revenue / Delivered orders | Calculator |
| Completion Rate | Delivered / (Delivered + Cancelled) | CheckCircle |

**Real-time updates:**
- Supabase subscription on `food_orders` inserts/updates
- Subscription on `drivers` is_online changes
- Auto-refresh every 30 seconds

### 4. AnalyticsCharts Component

**Charts:**

| Chart Type | Data | Libraries |
|------------|------|-----------|
| Orders Line Chart | Daily order count for date range | Recharts LineChart |
| Revenue Bar Chart | Daily revenue for date range | Recharts BarChart |
| Status Pie Chart | Delivered vs Cancelled | Recharts PieChart |

**Styling:**
- Use existing color scheme: `hsl(var(--primary))`, `hsl(var(--chart-2))`, etc.
- Dark mode compatible with `ResponsiveContainer`
- Tooltips with formatted currency values

### 5. AnalyticsTopLists Component

**Top Drivers Table:**

| Column | Source |
|--------|--------|
| Rank | Index |
| Driver Name | `drivers.full_name` |
| Orders | Count of delivered orders |
| Earnings | Sum of `driver_earnings.net_amount` |

**Top Merchants Table:**

| Column | Source |
|--------|--------|
| Rank | Index |
| Restaurant Name | `restaurants.name` |
| Orders | Count of delivered orders |
| Revenue | Sum of `food_orders.total_amount` |

### 6. AnalyticsFilters Component

**Preset Options:**
- Today
- Last 7 Days
- Last 30 Days
- This Month
- Custom Range (date pickers)

**Implementation:**
- Use existing `Select` component for presets
- `Popover` with `Calendar` for custom range
- Store selection in URL query params for sharability

### 7. AnalyticsExport Component

**Export Options:**

| Export | Data | Filename |
|--------|------|----------|
| Orders Report | All orders in range with details | `orders-{start}-{end}.csv` |
| Revenue Summary | Daily revenue breakdown | `revenue-{start}-{end}.csv` |
| Driver Earnings | Driver payouts summary | `driver-earnings-{start}-{end}.csv` |
| Merchant Revenue | Merchant revenue summary | `merchant-revenue-{start}-{end}.csv` |

**CSV Generation:**
- Client-side using Blob API (pattern from DispatchPayouts)
- Include headers and formatted data
- Automatic download trigger

### 8. Order Detail Profit Breakdown

**Update: `src/pages/dispatch/DispatchOrderDetail.tsx`**

Add new Card section:

```text
┌─────────────────────────────────────┐
│ Profit Breakdown                    │
├─────────────────────────────────────┤
│ Customer Paid     │  $25.99         │
│ Subtotal          │  $18.00         │
│ Delivery Fee      │  $4.99          │
│ Tax               │  $1.50          │
│ Tip               │  $1.50          │
├─────────────────────────────────────┤
│ Driver Payout     │  -$8.50         │
│ Platform Fee      │  $3.60          │
├─────────────────────────────────────┤
│ Payment Status    │  ✓ Paid         │
└─────────────────────────────────────┘
```

### 9. Sidebar Navigation Update

**Update: `src/components/dispatch/DispatchSidebar.tsx`**

Add new nav item:

```typescript
{
  label: "Analytics",
  path: "/dispatch/analytics",
  icon: BarChart3,
}
```

Position between "Payouts" and "Settings".

### 10. Route Registration

**Update: `src/App.tsx`**

Add lazy load and route:

```typescript
const DispatchAnalytics = lazy(() => import("./pages/dispatch/DispatchAnalytics"));

// In routes
<Route path="analytics" element={<DispatchAnalytics />} />
```

---

## Real-time Subscriptions

**Orders Channel:**
```typescript
supabase
  .channel('analytics-orders')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'food_orders'
  }, handleOrderChange)
  .subscribe()
```

**Drivers Channel:**
```typescript
supabase
  .channel('analytics-drivers')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'drivers',
    filter: 'is_online=eq.true'
  }, handleDriverChange)
  .subscribe()
```

---

## Security

All analytics routes are already protected by `ProtectedRoute requireAdmin` wrapper in the dispatch layout. No additional RLS changes needed since admin users have access to all tables via existing policies.

---

## Query Performance Considerations

| Query | Optimization |
|-------|-------------|
| KPIs | Use `count` with `head: true` for counts |
| Daily metrics | Fetch raw data, aggregate client-side |
| Top lists | Limit to 10, sort by aggregate |
| Date filtering | Use indexed `created_at` field |

For larger datasets, we can later add database views:

```sql
-- Optional future optimization
CREATE VIEW analytics_daily_orders AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'completed') as delivered,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
  SUM(total_amount) FILTER (WHERE status = 'completed') as revenue,
  SUM(platform_fee) FILTER (WHERE status = 'completed') as profit
FROM food_orders
GROUP BY DATE(created_at);
```

---

## Component Styling

Following existing patterns:

- Cards with `CardHeader`, `CardContent`, `CardTitle`
- Responsive grid layouts: `grid-cols-2 md:grid-cols-4 lg:grid-cols-6`
- Chart heights: `h-80` for main charts
- Table styling from existing `Table` components
- Loading states with `Loader2` spinner
- Color scheme consistent with existing admin components

---

## Implementation Order

1. **Hook: useDispatchAnalytics** - Core data fetching with date filters
2. **Page: DispatchAnalytics** - Main page layout and structure
3. **Component: AnalyticsFilters** - Date range selection
4. **Component: AnalyticsKPICards** - KPI display with real-time
5. **Component: AnalyticsCharts** - Recharts visualizations
6. **Component: AnalyticsTopLists** - Top drivers/merchants tables
7. **Component: AnalyticsExport** - CSV export functionality
8. **Update: DispatchSidebar** - Add Analytics nav link
9. **Update: DispatchOrderDetail** - Add profit breakdown
10. **Update: App.tsx** - Register new route

---

## File Count Summary

| Category | Count |
|----------|-------|
| New Hooks | 1 |
| New Pages | 1 |
| New Components | 5 |
| Modified Files | 3 |
| **Total** | **10 files** |
