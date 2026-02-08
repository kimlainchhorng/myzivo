
# Analytics Dashboards Implementation Plan

## Overview
Build comprehensive analytics dashboards for Admin, Merchant, and Driver roles using existing Supabase data. Create a centralized analytics library for reusable data fetching functions with caching and performance optimization.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| Dispatch Analytics | ✅ Complete | `/dispatch/analytics` with KPIs, charts, exports |
| `useDispatchAnalytics` hook | ✅ Complete | Orders, revenue, top drivers/merchants |
| Travel Analytics | ✅ Complete | `/admin/analytics` with mock data |
| Restaurant Analytics | ⚠️ Mock data | `RestaurantAnalytics.tsx` - needs real DB queries |
| Driver Earnings hook | ✅ Partial | `useDriverEarnings.ts` - earnings by day |
| AdminHeatmapView | ✅ Complete | Mapbox heatmap with mock zones |
| Revenue Analytics lib | ✅ Complete | `src/lib/revenueAnalytics.ts` for affiliate |
| Recharts components | ✅ Ready | Line, Bar, Pie, Area charts used throughout |

### Missing
| Feature | Status |
|---------|--------|
| Admin analytics sub-pages | ❌ Orders, Revenue, Drivers, Merchants pages |
| Centralized analytics lib | ❌ `/lib/analytics.ts` with reusable functions |
| Eats-based heatmap | ❌ Real delivery location clustering |
| Real merchant analytics | ❌ Connect to food_orders by restaurant_id |
| Driver analytics page | ❌ `/driver/analytics` with earnings charts |
| Average delivery time KPI | ❌ Calculate from timestamps |
| Peak hours analysis | ❌ Hourly order aggregation |
| Query caching | ❌ React Query stale time optimization |

---

## Implementation Plan

### A) Centralized Analytics Library

Create a single source of truth for analytics data fetching with TypeScript interfaces and caching.

**File to Create:** `src/lib/analytics.ts`

```typescript
// Interfaces
export interface AnalyticsKPIs {
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  gmv: number; // Gross Merchandise Value (sum of totals)
  platformRevenue: number; // Sum of platform_fee
  avgDeliveryTime: number; // Minutes from accepted_at to delivered_at
}

export interface OrdersTrend {
  date: string;
  orders: number;
  delivered: number;
  cancelled: number;
}

export interface RevenueTrend {
  date: string;
  gmv: number;
  platformRevenue: number;
  tips: number;
}

export interface PeakHoursData {
  hour: number;
  label: string;
  orders: number;
  revenue: number;
}

export interface TopRestaurant {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  avgPrepTime: number;
  rating: number;
}

export interface TopDriver {
  id: string;
  name: string;
  deliveries: number;
  earnings: number;
  avgDeliveryTime: number;
  rating: number;
}

// Functions
export async function getKpis(dateRange: DateRange): Promise<AnalyticsKPIs>
export async function getOrdersTrend(dateRange: DateRange): Promise<OrdersTrend[]>
export async function getRevenueTrend(dateRange: DateRange): Promise<RevenueTrend[]>
export async function getPeakHours(dateRange: DateRange): Promise<PeakHoursData[]>
export async function getTopRestaurants(dateRange: DateRange, limit?: number): Promise<TopRestaurant[]>
export async function getTopDrivers(dateRange: DateRange, limit?: number): Promise<TopDriver[]>
export async function getOrdersByStatus(dateRange: DateRange): Promise<StatusBreakdown[]>
```

Key queries:
- **Average delivery time**: `AVG(delivered_at - accepted_at)` for completed orders
- **Peak hours**: Group by `EXTRACT(HOUR FROM created_at)`
- **GMV**: `SUM(total_amount)` for all orders
- **Platform revenue**: `SUM(platform_fee)` for delivered orders

### B) Admin Analytics Hub

Create the main admin analytics page with navigation to sub-pages.

**File to Create:** `src/pages/admin/analytics/AnalyticsHub.tsx`

**Route:** `/admin/analytics`

**Features:**
- KPI cards: Total Orders, Delivered, Cancelled, GMV, Platform Revenue, Avg Delivery Time
- Tab navigation to sub-sections (Orders, Revenue, Drivers, Merchants)
- Date range picker (Today, 7 days, 30 days, custom)
- Real-time refresh with React Query
- Export to CSV button

### C) Admin Analytics Sub-Pages

#### 1. Orders Analytics
**File:** `src/pages/admin/analytics/AnalyticsOrders.tsx`
**Route:** `/admin/analytics/orders`

**Charts:**
- Orders per day (line chart)
- Orders by status (pie chart)
- Orders by zone (bar chart)
- Peak hours heatmap grid

#### 2. Revenue Analytics
**File:** `src/pages/admin/analytics/AnalyticsRevenue.tsx`
**Route:** `/admin/analytics/revenue`

**Charts:**
- Revenue per day (area chart with GMV + Platform Revenue)
- Revenue by payment status (pie chart)
- Tips trend (line chart)
- Revenue by zone (bar chart)

#### 3. Drivers Analytics
**File:** `src/pages/admin/analytics/AnalyticsDrivers.tsx`
**Route:** `/admin/analytics/drivers`

**Tables/Charts:**
- Top 20 drivers by deliveries (table with ranking)
- Top 20 drivers by earnings (table)
- Driver activity heatmap (hourly)
- Average delivery time by driver (bar chart)

#### 4. Merchants Analytics
**File:** `src/pages/admin/analytics/AnalyticsMerchants.tsx`
**Route:** `/admin/analytics/merchants`

**Tables/Charts:**
- Top 20 restaurants by orders (table)
- Top 20 restaurants by revenue (table)
- Average prep time by restaurant (bar chart)
- Cancellation rate by restaurant (bar chart)

### D) Analytics Hooks

**File to Create:** `src/hooks/useAdminAnalytics.ts`

```typescript
// Main KPIs hook
export function useAdminKPIs(dateRange: DateRange) {
  return useQuery({
    queryKey: ["admin-analytics-kpis", dateRange.start, dateRange.end],
    queryFn: () => getKpis(dateRange),
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: 60000,
  });
}

// Orders trend hook
export function useOrdersTrend(dateRange: DateRange) {
  return useQuery({
    queryKey: ["admin-analytics-orders-trend", dateRange.start, dateRange.end],
    queryFn: () => getOrdersTrend(dateRange),
    staleTime: 120000, // Cache for 2 minutes
  });
}

// Revenue trend hook
export function useRevenueTrend(dateRange: DateRange)

// Peak hours hook
export function usePeakHours(dateRange: DateRange)

// Top restaurants hook
export function useTopRestaurants(dateRange: DateRange, limit = 20)

// Top drivers hook
export function useTopDrivers(dateRange: DateRange, limit = 20)
```

### E) Delivery Heatmap

Create a basic heatmap showing restaurant and delivery locations.

**File to Create:** `src/components/analytics/DeliveryHeatmap.tsx`

**Features:**
- Use Mapbox (already configured in project)
- Data source: `food_orders` with `pickup_lat/lng` and `delivery_lat/lng`
- Cluster points using Mapbox clustering or heatmap layer
- Toggle between: Pickup locations, Delivery locations, Both
- Filter by date range
- Color intensity by order density

**Data Query:**
```typescript
const { data: locations } = await supabase
  .from("food_orders")
  .select("pickup_lat, pickup_lng, delivery_lat, delivery_lng")
  .eq("status", "completed")
  .gte("created_at", startDate)
  .lte("created_at", endDate);
```

### F) Merchant Analytics (Real Data)

Update the existing `RestaurantAnalytics.tsx` to use real data.

**File to Modify:** `src/components/restaurant/RestaurantAnalytics.tsx`

**Hook to Create:** `src/hooks/useMerchantAnalytics.ts`

```typescript
export function useMerchantAnalytics(restaurantId: string | undefined) {
  // Revenue by day for the past 7 days
  const { data: revenueByDay } = useQuery({
    queryKey: ["merchant-revenue-daily", restaurantId],
    queryFn: async () => {
      const { data } = await supabase
        .from("food_orders")
        .select("total_amount, platform_fee, created_at")
        .eq("restaurant_id", restaurantId)
        .eq("status", "completed")
        .gte("created_at", sevenDaysAgo);
      // Aggregate by day
      return aggregateByDay(data);
    },
    enabled: !!restaurantId,
  });

  // Top selling items from orders.items JSONB
  const { data: topItems } = useQuery({...});

  // Orders count and average prep time
  const { data: orderStats } = useQuery({...});

  return { revenueByDay, topItems, orderStats };
}
```

**Top Selling Items Query:**
Extract from `items` JSONB column:
```sql
SELECT 
  item->>'id' as item_id,
  item->>'name' as item_name,
  COUNT(*) as order_count,
  SUM((item->>'price')::numeric * (item->>'quantity')::int) as revenue
FROM food_orders, jsonb_array_elements(items) as item
WHERE restaurant_id = ? AND status = 'completed'
GROUP BY item->>'id', item->>'name'
ORDER BY order_count DESC
LIMIT 10
```

### G) Driver Analytics Page

**File to Create:** `src/pages/driver/DriverAnalyticsPage.tsx`

**Route:** `/driver/analytics`

**Features:**
- Earnings by day chart (bar chart for last 7 days)
- Deliveries count by day (line chart)
- Average delivery duration trend
- Breakdown by service type (Eats, Rides, Move)
- Period selector: Today, This Week, This Month

**Hook to Create:** `src/hooks/useDriverAnalytics.ts`

```typescript
export function useDriverAnalytics(driverId: string | undefined) {
  // Earnings by day
  const { data: earningsByDay } = useQuery({
    queryKey: ["driver-analytics-earnings", driverId],
    queryFn: async () => {
      const { data } = await supabase
        .from("food_orders")
        .select("driver_earnings_cents, delivered_at")
        .eq("driver_id", driverId)
        .eq("status", "completed")
        .gte("delivered_at", thirtyDaysAgo);
      return aggregateByDay(data);
    },
    enabled: !!driverId,
  });

  // Deliveries count
  const { data: deliveriesCount } = useQuery({...});

  // Average delivery duration
  const { data: avgDuration } = useQuery({
    queryFn: async () => {
      const { data } = await supabase
        .from("food_orders")
        .select("accepted_at, delivered_at")
        .eq("driver_id", driverId)
        .eq("status", "completed");
      // Calculate average minutes
      return calculateAvgDuration(data);
    }
  });

  return { earningsByDay, deliveriesCount, avgDuration };
}
```

### H) Performance Optimization

#### 1. React Query Caching
Configure stale time and cache time for analytics queries:

```typescript
// In each analytics hook
const queryConfig = {
  staleTime: 60000,      // 1 minute - data considered fresh
  cacheTime: 300000,     // 5 minutes - keep in cache
  refetchInterval: 60000, // Auto-refresh every minute
  refetchOnWindowFocus: false, // Don't refetch on tab switch
};
```

#### 2. Lazy Loading Charts
Wrap chart components in `React.lazy()` for code splitting:

```typescript
const OrdersChart = lazy(() => import("./charts/OrdersChart"));
const RevenueChart = lazy(() => import("./charts/RevenueChart"));
const PeakHoursChart = lazy(() => import("./charts/PeakHoursChart"));
```

#### 3. Pagination for Tables
For top drivers/merchants tables:

```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ["top-drivers-paginated"],
  queryFn: ({ pageParam = 0 }) => fetchDriversPage(pageParam, 20),
  getNextPageParam: (lastPage, pages) => 
    lastPage.length === 20 ? pages.length * 20 : undefined,
});
```

#### 4. Database Indexes
Ensure indexes exist for common query patterns (may need migration):

```sql
-- Composite index for date range queries
CREATE INDEX IF NOT EXISTS idx_food_orders_status_created 
ON food_orders(status, created_at);

-- Index for restaurant analytics
CREATE INDEX IF NOT EXISTS idx_food_orders_restaurant_status 
ON food_orders(restaurant_id, status);

-- Index for driver analytics
CREATE INDEX IF NOT EXISTS idx_food_orders_driver_status 
ON food_orders(driver_id, status);
```

### I) Routes Configuration

**File to Modify:** `src/App.tsx`

Add routes:
```typescript
// Admin Analytics Routes
const AnalyticsHub = lazy(() => import("./pages/admin/analytics/AnalyticsHub"));
const AnalyticsOrders = lazy(() => import("./pages/admin/analytics/AnalyticsOrders"));
const AnalyticsRevenue = lazy(() => import("./pages/admin/analytics/AnalyticsRevenue"));
const AnalyticsDrivers = lazy(() => import("./pages/admin/analytics/AnalyticsDrivers"));
const AnalyticsMerchants = lazy(() => import("./pages/admin/analytics/AnalyticsMerchants"));

// Driver Analytics
const DriverAnalyticsPage = lazy(() => import("./pages/driver/DriverAnalyticsPage"));

// Routes
<Route path="/admin/analytics" element={<AdminProtectedRoute><AnalyticsHub /></AdminProtectedRoute>} />
<Route path="/admin/analytics/orders" element={<AdminProtectedRoute><AnalyticsOrders /></AdminProtectedRoute>} />
<Route path="/admin/analytics/revenue" element={<AdminProtectedRoute><AnalyticsRevenue /></AdminProtectedRoute>} />
<Route path="/admin/analytics/drivers" element={<AdminProtectedRoute><AnalyticsDrivers /></AdminProtectedRoute>} />
<Route path="/admin/analytics/merchants" element={<AdminProtectedRoute><AnalyticsMerchants /></AdminProtectedRoute>} />

<Route path="/driver/analytics" element={<DriverAnalyticsPage />} />

// Merchant analytics is already at /merchant (via RestaurantDashboard tabs)
```

---

## File Summary

### New Files (12)
| File | Purpose |
|------|---------|
| `src/lib/analytics.ts` | Centralized analytics data functions |
| `src/hooks/useAdminAnalytics.ts` | Admin analytics React Query hooks |
| `src/hooks/useMerchantAnalytics.ts` | Merchant analytics hooks |
| `src/hooks/useDriverAnalytics.ts` | Driver analytics hooks |
| `src/pages/admin/analytics/AnalyticsHub.tsx` | Main admin analytics page |
| `src/pages/admin/analytics/AnalyticsOrders.tsx` | Orders sub-page |
| `src/pages/admin/analytics/AnalyticsRevenue.tsx` | Revenue sub-page |
| `src/pages/admin/analytics/AnalyticsDrivers.tsx` | Drivers sub-page |
| `src/pages/admin/analytics/AnalyticsMerchants.tsx` | Merchants sub-page |
| `src/pages/driver/DriverAnalyticsPage.tsx` | Driver analytics page |
| `src/components/analytics/DeliveryHeatmap.tsx` | Mapbox heatmap component |
| `src/components/analytics/PeakHoursGrid.tsx` | Hourly peak visualization |

### Modified Files (3)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add analytics routes |
| `src/components/restaurant/RestaurantAnalytics.tsx` | Replace mock data with real queries |
| `src/pages/driver/DriverHomePage.tsx` | Add link to analytics page |

---

## Data Flow

```text
Supabase Tables
    ├── food_orders (primary source)
    │   ├── total_amount → GMV
    │   ├── platform_fee → Platform Revenue
    │   ├── accepted_at/delivered_at → Avg Delivery Time
    │   ├── created_at → Orders Trend, Peak Hours
    │   ├── items (JSONB) → Top Selling Items
    │   ├── pickup_lat/lng → Heatmap Pickups
    │   └── delivery_lat/lng → Heatmap Dropoffs
    │
    ├── restaurants
    │   ├── name → Restaurant names
    │   └── rating → Restaurant ratings
    │
    └── drivers
        ├── full_name → Driver names
        └── rating → Driver ratings

↓

src/lib/analytics.ts (Query Functions)
    ├── getKpis()
    ├── getOrdersTrend()
    ├── getRevenueTrend()
    ├── getPeakHours()
    ├── getTopRestaurants()
    └── getTopDrivers()

↓

React Query Hooks (with caching)
    ├── useAdminKPIs()
    ├── useOrdersTrend()
    ├── useMerchantAnalytics()
    └── useDriverAnalytics()

↓

Dashboard Components
    ├── Admin: AnalyticsHub + sub-pages
    ├── Merchant: RestaurantAnalytics (updated)
    └── Driver: DriverAnalyticsPage
```

---

## KPI Calculations

| KPI | Formula | Source |
|-----|---------|--------|
| Total Orders | `COUNT(*)` | `food_orders` |
| Delivered Orders | `COUNT(*) WHERE status = 'completed'` | `food_orders` |
| Cancelled Orders | `COUNT(*) WHERE status = 'cancelled'` | `food_orders` |
| GMV | `SUM(total_amount)` | `food_orders` |
| Platform Revenue | `SUM(platform_fee) WHERE status = 'completed'` | `food_orders` |
| Avg Delivery Time | `AVG(delivered_at - accepted_at)` | `food_orders` (completed) |
| Avg Prep Time | `AVG(ready_at - accepted_at)` | `food_orders` (completed) |
| Peak Hours | `GROUP BY HOUR(created_at)` | `food_orders` |

---

## Heatmap Implementation

Using Mapbox GL with heatmap layer:

```typescript
// Query locations
const locations = await supabase
  .from("food_orders")
  .select("pickup_lat, pickup_lng, delivery_lat, delivery_lng")
  .eq("status", "completed")
  .gte("created_at", dateRange.start);

// Transform to GeoJSON
const geoJSON = {
  type: "FeatureCollection",
  features: locations.flatMap(order => [
    // Pickup point
    order.pickup_lat && {
      type: "Feature",
      properties: { type: "pickup", weight: 1 },
      geometry: { type: "Point", coordinates: [order.pickup_lng, order.pickup_lat] }
    },
    // Delivery point
    order.delivery_lat && {
      type: "Feature",
      properties: { type: "delivery", weight: 1 },
      geometry: { type: "Point", coordinates: [order.delivery_lng, order.delivery_lat] }
    }
  ]).filter(Boolean)
};

// Add to Mapbox as heatmap layer
map.addLayer({
  id: "orders-heatmap",
  type: "heatmap",
  source: "orders-data",
  paint: {
    "heatmap-weight": 1,
    "heatmap-intensity": 1,
    "heatmap-color": [
      "interpolate", ["linear"], ["heatmap-density"],
      0, "rgba(0,0,255,0)",
      0.5, "rgba(255,255,0,0.7)",
      1, "rgba(255,0,0,0.9)"
    ],
    "heatmap-radius": 20
  }
});
```

---

## Security Considerations

1. **Admin routes protected**: All `/admin/analytics/*` routes use `AdminProtectedRoute`
2. **Restaurant data scoped**: Merchant analytics filtered by `restaurant_id` of logged-in owner
3. **Driver data scoped**: Driver analytics filtered by driver's own ID
4. **No PII exposed**: Analytics show aggregated data, not individual customer info
5. **Rate limiting**: React Query prevents excessive API calls with staleTime

---

## Summary

This implementation creates a comprehensive analytics system:

1. **Centralized library** (`/lib/analytics.ts`) with reusable query functions
2. **Admin dashboard** with hub + 4 sub-pages for orders, revenue, drivers, merchants
3. **Delivery heatmap** using Mapbox with real order locations
4. **Merchant analytics** with real revenue, top items, prep time data
5. **Driver analytics page** with earnings, deliveries, and duration tracking
6. **Performance optimizations**: Query caching, lazy loading, pagination
7. **Proper routing** integrated into existing app structure

