
# AI Insights and Demand Forecasting Implementation Plan

## Overview
Enhance the analytics system with AI-powered actionable insights including demand prediction, driver staffing recommendations, merchant promotional suggestions, and anomaly detection. This builds on the existing analytics infrastructure and demand forecasting tables.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `demand_forecasts` table | Available | Database with zone-level predictions |
| `demand_snapshots` table | Available | Historical order data by hour/zone |
| `risk_events` table | Available | Fraud/anomaly event logging |
| `fraud_signals` table | Available | Detailed signal tracking |
| `useDemandForecast` hook | Complete | Zone forecasts, at-risk zones, heatmap |
| `check-fraud-signals` edge function | Complete | Refund/cancel/velocity detection |
| `src/lib/analytics.ts` | Complete | Core analytics functions |
| `getPeakHours()` function | Complete | Hourly order aggregation |
| DispatchDemand page | Complete | `/dispatch/demand` with forecasts |

### Missing
| Feature | Status |
|---------|--------|
| Admin AI Insights page | `/admin/insights` with actionable cards |
| Insights data library | `src/lib/insights.ts` with prediction functions |
| Insights hooks | React Query hooks for insights data |
| Merchant insights section | Promo timing and demand recommendations |
| Driver best hours UI | Optimal shift suggestions |
| Anomaly detection dashboard | Risk events and fraud signal viewer |
| Declining restaurants detection | Trend analysis for merchants |

---

## Implementation Plan

### A) Insights Data Library

Create a new library for AI-powered insights that uses historical data to generate predictions.

**File to Create:** `src/lib/insights.ts`

```typescript
// Interfaces
export interface DemandForecast {
  peakHours: { start: string; end: string; expectedOrders: number }[];
  suggestedDrivers: number;
  confidence: number;
  trend: "increasing" | "stable" | "decreasing";
  basedOnDays: number;
}

export interface ZoneDemandGap {
  zoneCode: string;
  expectedOrders: number;
  driversOnline: number;
  driversNeeded: number;
  shortage: number;
  urgency: "critical" | "warning" | "ok";
}

export interface DecliningMerchant {
  restaurantId: string;
  restaurantName: string;
  currentWeekOrders: number;
  previousWeekOrders: number;
  changePercent: number;
  avgRating: number;
}

export interface AnomalySignal {
  id: string;
  userId: string | null;
  driverId: string | null;
  eventType: string;
  severity: number;
  score: number;
  details: Record<string, any>;
  createdAt: string;
  isResolved: boolean;
}

export interface MerchantInsight {
  bestPromoTimes: { day: string; hour: number; expectedLift: number }[];
  lowDemandHours: { hour: number; avgOrders: number }[];
  topItems: { id: string; name: string; orders: number; revenue: number }[];
  recommendations: string[];
}

export interface DriverInsight {
  bestHours: { hour: number; avgEarnings: number; avgDeliveries: number }[];
  hotZones: { zoneCode: string; expectedOrders: number; competition: "low" | "medium" | "high" }[];
  optimalShift: { start: number; end: number; expectedEarnings: number };
}

// Functions
export async function getDemandForecast(): Promise<DemandForecast>
export async function getZoneDemandGaps(): Promise<ZoneDemandGap[]>
export async function getDecliningMerchants(limit?: number): Promise<DecliningMerchant[]>
export async function getAnomalySignals(limit?: number): Promise<AnomalySignal[]>
export async function getMerchantInsights(restaurantId: string): Promise<MerchantInsight>
export async function getDriverInsights(driverId: string): Promise<DriverInsight>
```

**Key Algorithms:**

1. **Peak Hours Prediction (Moving Average)**
   - Query last 7-14 days of orders grouped by hour
   - Calculate weighted average (recent days weighted higher)
   - Identify hours with > 1.5x average as peak hours
   - Calculate suggested drivers: `peakOrders / avgDeliveriesPerDriver`

2. **Zone Demand Gaps**
   - Query `demand_forecasts` for next 2-3 hours
   - Compare `predicted_drivers_needed` vs `current_drivers_online`
   - Calculate shortage and urgency level

3. **Declining Merchants**
   - Compare current week orders vs previous week
   - Flag restaurants with > 20% decline
   - Include rating trend

4. **Anomaly Detection**
   - Query `risk_events` with severity >= 2
   - Include unresolved events from last 7 days
   - Aggregate by user/driver

### B) Insights Hooks

**File to Create:** `src/hooks/useInsights.ts`

```typescript
// Hooks with caching
export function useDemandForecast()
export function useZoneDemandGaps()
export function useDecliningMerchants(limit?: number)
export function useAnomalySignals(limit?: number)
export function useMerchantInsights(restaurantId: string | undefined)
export function useDriverInsights(driverId: string | undefined)
```

### C) Admin AI Insights Page

**File to Create:** `src/pages/admin/AdminInsightsPage.tsx`

**Route:** `/admin/insights`

**Layout:**

```text
+----------------------------------------------------------+
|  AI Insights                          [Last 7 days ▼]     |
+----------------------------------------------------------+
|                                                           |
|  +------------------+  +------------------+               |
|  | PREDICTED PEAK   |  | DRIVER SHORTAGE  |               |
|  | 6pm - 8pm        |  | 3 zones at risk  |               |
|  | ~45 orders       |  | Need 12 drivers  |               |
|  | Suggest: 12 drv  |  | [View Zones]     |               |
|  +------------------+  +------------------+               |
|                                                           |
|  +------------------+  +------------------+               |
|  | DECLINING MERCH  |  | ANOMALY ALERTS   |               |
|  | 2 restaurants    |  | 5 unresolved     |               |
|  | >20% drop        |  | 2 critical       |               |
|  | [View List]      |  | [View Signals]   |               |
|  +------------------+  +------------------+               |
|                                                           |
|  24-Hour Demand Forecast Chart                            |
|  [AreaChart showing predicted orders by hour]             |
|                                                           |
|  Anomaly Timeline                                         |
|  [Timeline of recent risk events with severity badges]    |
|                                                           |
+----------------------------------------------------------+
```

**Features:**
- KPI cards with AI-generated insights
- 24-hour demand forecast visualization
- Zone shortage map/list with driver recommendations
- Declining merchants table with week-over-week comparison
- Anomaly signals timeline with severity indicators
- Explanatory text: "Based on last 30 days of orders..."

### D) Zone Demand Gaps Panel

**File to Create:** `src/components/insights/ZoneDemandPanel.tsx`

- List zones with driver shortage
- Color-coded urgency (critical/warning/ok)
- Show: zone code, expected orders, drivers online/needed
- Link to dispatch reposition page

### E) Declining Merchants Table

**File to Create:** `src/components/insights/DecliningMerchantsTable.tsx`

- Table with: Restaurant name, This Week, Last Week, Change %, Rating
- Sortable columns
- Link to merchant analytics
- Suggest outreach actions

### F) Anomaly Signals Panel

**File to Create:** `src/components/insights/AnomalySignalsPanel.tsx`

- Timeline view of recent risk events
- Filter by: type, severity, resolved status
- Details: user/driver ID, event type, score, timestamp
- Actions: Mark as resolved, View profile, Block user

### G) Enhanced Merchant Analytics

**File to Modify:** `src/pages/merchant/MerchantDashboard.tsx` or create new section

**Add Insights Card:**
- "Best Time to Run Promotions" - based on low-demand hours
- "Top Selling Items" - already exists, enhance with trends
- "Low Demand Hours" - suggest promotional opportunities
- "Recommendations" - AI-generated text suggestions

**UI:**
```text
+------------------------------------------+
| AI Insights                               |
+------------------------------------------+
| Best Time for Promotions                  |
| Tuesday 2pm-4pm: Expected 15% lift        |
| Wednesday 3pm-5pm: Expected 12% lift      |
+------------------------------------------+
| Low Demand Hours                          |
| 2pm-4pm: Only 3 orders avg                |
| Consider running a 20% off promo          |
+------------------------------------------+
```

### H) Enhanced Driver Analytics

**File to Modify:** `src/pages/driver/DriverAnalyticsPage.tsx`

**Add Best Hours Section:**
- "Best Hours to Go Online" - when earnings are highest
- "Hot Zones" - areas with high demand, low competition
- "Optimal Shift" - suggested start/end time for max earnings
- Hour-by-hour earnings heatmap

**UI:**
```text
+------------------------------------------+
| Suggested Best Hours                      |
+------------------------------------------+
| 11am - 1pm: $18/hr avg                    |
| 6pm - 9pm: $22/hr avg  [Peak]             |
+------------------------------------------+
| Hot Zones Now                             |
| Downtown: 15 orders expected, low comp    |
| University: 12 orders expected, med comp  |
+------------------------------------------+
```

### I) Anomaly Detection Enhancement

The existing `check-fraud-signals` edge function already handles:
- High refund rate (>=5 in 30 days)
- High cancellation rate (>=3 in 7 days)
- Wrong PIN attempts
- Order velocity spikes (>=10 in 1 hour)

**Enhancements to add:**
1. Query `risk_events` for admin dashboard display
2. Add severity-based filtering
3. Create resolution workflow

**File to Modify:** `src/lib/insights.ts`

```typescript
export async function getAnomalySignals(limit: number = 50) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data } = await supabase
    .from("risk_events")
    .select("*")
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);

  return data?.map(event => ({
    id: event.id,
    userId: event.user_id,
    driverId: event.driver_id,
    eventType: event.event_type,
    severity: event.severity,
    score: event.score,
    details: event.details,
    createdAt: event.created_at,
    isResolved: event.is_resolved,
  }));
}
```

### J) Routes Configuration

**File to Modify:** `src/App.tsx`

```typescript
const AdminInsightsPage = lazy(() => import("./pages/admin/AdminInsightsPage"));

// Route
<Route path="/admin/insights" element={<ProtectedRoute requireAdmin><AdminInsightsPage /></ProtectedRoute>} />
```

**Add Link to Analytics Hub:**

**File to Modify:** `src/pages/admin/analytics/AnalyticsHub.tsx`

Add navigation card for AI Insights page.

---

## File Summary

### New Files (6)
| File | Purpose |
|------|---------|
| `src/lib/insights.ts` | AI insights data functions |
| `src/hooks/useInsights.ts` | React Query hooks for insights |
| `src/pages/admin/AdminInsightsPage.tsx` | Main AI insights dashboard |
| `src/components/insights/ZoneDemandPanel.tsx` | Zone shortage display |
| `src/components/insights/DecliningMerchantsTable.tsx` | Merchant trend table |
| `src/components/insights/AnomalySignalsPanel.tsx` | Risk event timeline |

### Modified Files (3)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/admin/insights` route |
| `src/pages/admin/analytics/AnalyticsHub.tsx` | Add AI Insights nav card |
| `src/pages/driver/DriverAnalyticsPage.tsx` | Add best hours and hot zones section |

---

## Prediction Algorithm Details

### Peak Hours Prediction (MVP)

```typescript
async function predictPeakHours(): Promise<PeakHourPrediction[]> {
  // Get last 7 days of orders grouped by hour
  const { data } = await supabase
    .from("food_orders")
    .select("created_at")
    .gte("created_at", sevenDaysAgo);

  // Count orders per hour
  const hourCounts = new Array(24).fill(0);
  const hourDays = new Array(24).fill(0);

  data?.forEach(order => {
    const hour = new Date(order.created_at).getHours();
    hourCounts[hour]++;
    // Track unique days for averaging
  });

  // Calculate average per hour
  const avgByHour = hourCounts.map((count, hour) => ({
    hour,
    avgOrders: count / 7, // Divide by days
  }));

  // Find peak hours (> 1.5x overall average)
  const overallAvg = avgByHour.reduce((s, h) => s + h.avgOrders, 0) / 24;
  const peaks = avgByHour.filter(h => h.avgOrders > overallAvg * 1.5);

  // Group consecutive hours into ranges
  const ranges = groupConsecutiveHours(peaks);

  // Calculate suggested drivers
  const avgDeliveriesPerDriverPerHour = 3; // Configurable
  const suggestedDrivers = Math.ceil(
    Math.max(...peaks.map(p => p.avgOrders)) / avgDeliveriesPerDriverPerHour
  );

  return {
    peakHours: ranges,
    suggestedDrivers,
    confidence: 0.85, // Based on data quality
    trend: calculateTrend(data),
    basedOnDays: 7,
  };
}
```

### Merchant Low-Demand Detection

```typescript
async function getMerchantLowDemandHours(restaurantId: string) {
  // Get orders by hour for this restaurant
  const { data } = await supabase
    .from("food_orders")
    .select("created_at")
    .eq("restaurant_id", restaurantId)
    .gte("created_at", thirtyDaysAgo);

  // Calculate average orders per hour
  const hourCounts = new Array(24).fill(0);
  data?.forEach(order => {
    const hour = new Date(order.created_at).getHours();
    hourCounts[hour]++;
  });

  const avgByHour = hourCounts.map((count, hour) => ({
    hour,
    avgOrders: count / 30,
  }));

  // Find low-demand hours (< 0.5x average, during business hours)
  const overallAvg = avgByHour
    .filter(h => h.hour >= 10 && h.hour <= 22) // Business hours
    .reduce((s, h) => s + h.avgOrders, 0) / 12;

  return avgByHour
    .filter(h => h.hour >= 10 && h.hour <= 22 && h.avgOrders < overallAvg * 0.5)
    .map(h => ({
      hour: h.hour,
      avgOrders: Math.round(h.avgOrders * 10) / 10,
      suggestion: `Run a promo at ${formatHour(h.hour)} to boost orders`,
    }));
}
```

---

## UI Design Patterns

### Insight Cards

Each insight card follows this pattern:
- Icon + Title
- Key metric (large, prominent)
- Supporting text (smaller, muted)
- Action button or link
- Explanatory footer: "Based on last X days..."

### Color Coding

| Level | Color | Use |
|-------|-------|-----|
| Critical | Red | Shortage >50%, severity 4-5 |
| Warning | Amber | Shortage 20-50%, severity 2-3 |
| Good | Green | No issues, positive trends |
| Neutral | Gray | Informational |

### Dark Theme Consistency

All components follow the existing dark dashboard style:
- `bg-zinc-950` / `bg-zinc-900/80` backgrounds
- `border-white/10` borders
- `text-white/60` for muted text
- Gradient accents for emphasis

---

## Data Flow

```text
Supabase Tables
    ├── food_orders → Peak hours, merchant trends
    ├── demand_forecasts → Zone predictions
    ├── demand_snapshots → Historical patterns
    ├── risk_events → Anomaly signals
    ├── drivers → Online status, ratings
    └── restaurants → Merchant details

↓

src/lib/insights.ts (Prediction Functions)
    ├── getDemandForecast() → 7-day moving average
    ├── getZoneDemandGaps() → Forecast vs reality
    ├── getDecliningMerchants() → Week-over-week comparison
    ├── getAnomalySignals() → Risk event aggregation
    ├── getMerchantInsights() → Promo timing
    └── getDriverInsights() → Optimal shift

↓

React Query Hooks (with 2-minute caching)
    ├── useDemandForecast()
    ├── useZoneDemandGaps()
    ├── useMerchantInsights()
    └── useDriverInsights()

↓

UI Components
    ├── AdminInsightsPage → Full dashboard
    ├── ZoneDemandPanel → Shortage alerts
    ├── DecliningMerchantsTable → Trend analysis
    ├── AnomalySignalsPanel → Risk timeline
    ├── DriverAnalyticsPage → Best hours section
    └── MerchantDashboard → Promo suggestions
```

---

## Summary

This implementation adds:

1. **Insights Library** (`/lib/insights.ts`) with prediction algorithms for demand, gaps, and anomalies
2. **Admin AI Dashboard** at `/admin/insights` with actionable insight cards
3. **Demand Forecasting** using 7-day moving average to predict peak hours and driver needs
4. **Zone Shortage Detection** comparing forecasts to actual driver availability
5. **Merchant Recommendations** for optimal promo timing based on low-demand hours
6. **Driver Best Hours** showing when to go online for maximum earnings
7. **Anomaly Detection UI** displaying risk events with severity filtering
8. **Declining Merchants** week-over-week comparison for proactive outreach

All insights include explanatory text ("Based on last 30 days...") and follow the existing dark dashboard styling.
