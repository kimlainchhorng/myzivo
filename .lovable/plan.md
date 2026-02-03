
# Flights Analytics, Revenue Tracking & Funnel Visibility

## Summary

This plan implements OTA-grade analytics for ZIVO Flights, providing complete visibility into the booking funnel, revenue metrics, failure detection, and exportable reports. The system leverages existing infrastructure (`flight_funnel_events`, `flight_search_logs`, `flight_bookings`) and adds a dedicated analytics dashboard with real-time KPIs, charts, and admin alerts.

---

## Current State Analysis

| Component | Status | Details |
|-----------|--------|---------|
| **flight_search_logs table** | ✅ Exists | Tracks search queries, offers count, errors, response times |
| **flight_bookings table** | ✅ Exists | Full booking data with payment/ticketing status, revenue fields |
| **flight_funnel_events table** | ✅ Exists | Schema defined but not actively used - needs implementation |
| **flight_admin_alerts table** | ✅ Exists | Used by FlightStatusPage for critical alerts |
| **useFlightSearchLogs hook** | ✅ Exists | Basic search log queries |
| **FlightStatusPage** | ✅ Exists | Basic 24h stats, but limited analytics |
| **FlightDebugPage** | ✅ Exists | Search log viewer, no funnel analytics |
| **Revenue tracking** | ⚠️ Partial | `total_amount`, `taxes_fees`, `zivo_markup` columns exist but no dashboard |
| **Funnel event tracking** | ❌ Missing | Table exists, no client-side tracking implementation |
| **Dedicated analytics dashboard** | ❌ Missing | Need `/admin/flights/analytics` page |
| **Export functionality** | ❌ Missing | No booking/revenue CSV export |

---

## Implementation Plan

### Phase 1: Funnel Event Tracking Hook

**Goal:** Create client-side tracking that logs user journey through the flight booking funnel.

**File:** `src/hooks/useFlightFunnel.ts` (NEW)

Create a tracking hook that records events to `flight_funnel_events`:

```typescript
interface FunnelEvent {
  event_type: 
    | 'search_started'
    | 'results_loaded'
    | 'offer_selected'
    | 'checkout_started'
    | 'payment_success'
    | 'ticket_issued'
    | 'booking_failed';
  origin?: string;
  destination?: string;
  departure_date?: string;
  return_date?: string;
  passengers?: number;
  cabin_class?: string;
  offer_id?: string;
  offers_count?: number;
  amount?: number;
  currency?: string;
  booking_id?: string;
  error_type?: string;
  error_message?: string;
}
```

Key functions:
- `trackFunnelEvent(event)` - Log event to database
- `getSessionId()` - Get/create session ID for attribution
- `getDeviceType()` - Detect mobile/desktop/tablet

---

### Phase 2: Integrate Tracking Into Booking Flow

**Goal:** Add tracking calls at each step of the flight booking journey.

**Files to modify:**

| File | Event | Trigger |
|------|-------|---------|
| `src/pages/FlightSearch.tsx` | `search_started` | Form submission |
| `src/pages/FlightResults.tsx` | `results_loaded` | Results received from API |
| `src/pages/FlightResults.tsx` | `offer_selected` | User clicks on flight offer |
| `src/pages/FlightCheckout.tsx` | `checkout_started` | Checkout page loaded |
| `supabase/functions/stripe-webhook` | `payment_success` | Payment confirmed |
| `supabase/functions/issue-flight-ticket` | `ticket_issued` | Ticket successfully issued |
| `supabase/functions/issue-flight-ticket` | `booking_failed` | Ticketing error |

---

### Phase 3: Flight Analytics Hook

**Goal:** Query aggregated analytics data for the admin dashboard.

**File:** `src/hooks/useFlightAnalytics.ts` (NEW)

```typescript
interface FlightAnalytics {
  // KPIs
  searchesToday: number;
  searchesWeek: number;
  searchesMonth: number;
  resultsShown: number;
  bookingsCompleted: number;
  searchToResultsRate: number;
  resultsToBookingRate: number;
  overallConversionRate: number;
  
  // Revenue
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  avgBookingValue: number;
  totalTaxesFees: number;
  totalZivoMargin: number;
  
  // Failures
  zeroResultsCount: number;
  paymentFailures: number;
  ticketingFailures: number;
  autoRefundsTriggered: number;
  
  // Top routes
  topSearchedRoutes: { origin: string; destination: string; count: number }[];
  topBookedRoutes: { origin: string; destination: string; revenue: number }[];
  zeroResultsRoutes: { origin: string; destination: string; count: number }[];
}
```

Hooks to create:
- `useFlightKPIs(timeRange)` - Real-time KPIs
- `useFlightRevenue(timeRange)` - Revenue metrics
- `useFlightFunnelStats(timeRange)` - Funnel conversion data
- `useFlightFailures(timeRange)` - Failure visibility
- `useTopRoutes(timeRange)` - Route analytics
- `useFlightChartData(timeRange)` - Time-series for charts

---

### Phase 4: Admin Analytics Dashboard

**Goal:** Create dedicated analytics page at `/admin/flights/analytics`.

**File:** `src/pages/admin/FlightAnalyticsPage.tsx` (NEW)

**Layout:**

```text
┌─────────────────────────────────────────────────────────────────┐
│  Flight Analytics Dashboard                    [Time Range ▼]   │
├─────────────────────────────────────────────────────────────────┤
│                         KPI CARDS                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Searches │ │ Bookings │ │ Revenue  │ │ Avg Val  │ │Conv %  │ │
│  │  Today   │ │ Today    │ │  Today   │ │          │ │        │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    FUNNEL VISUALIZATION                         │
│  Searches (100%) → Results (80%) → Checkout (15%) → Booked (5%) │
├─────────────────────────────────────────────────────────────────┤
│  CHARTS TAB                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐       │
│  │  Revenue Over Time      │  │  Searches vs Bookings   │       │
│  │  (Line Chart)           │  │  (Bar Chart)            │       │
│  └─────────────────────────┘  └─────────────────────────┘       │
├─────────────────────────────────────────────────────────────────┤
│  ROUTES TAB                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐       │
│  │  Top Searched Routes    │  │  Routes with 0 Results  │       │
│  │  (Table)                │  │  (Alert Table)          │       │
│  └─────────────────────────┘  └─────────────────────────┘       │
├─────────────────────────────────────────────────────────────────┤
│  FAILURES TAB                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Payment Failures  │  Ticketing Failures  │  Auto-Refunds│    │
│  │  Table with booking references and error messages       │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                    [Export Bookings CSV]  [Export Revenue CSV]  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Phase 5: Failure Detection & Admin Alerts

**Goal:** Proactive alerting when failure rates spike.

**File:** `src/hooks/useFlightHealthAlerts.ts` (NEW)

Create alert rules:
- "High no-results rate" - >30% zero-result searches in 1 hour
- "Payment failures detected" - >3 payment failures in 15 minutes
- "Duffel order failures" - >2 ticketing failures in 15 minutes
- "API response degradation" - avg response >5s

**File:** `src/components/admin/FlightAlertBanner.tsx` (NEW)

Display critical alerts at top of analytics dashboard with severity badges.

---

### Phase 6: User Behavior Insights

**Goal:** Track anonymized behavior patterns.

**Metrics to track (aggregated, no PII):**

| Metric | Calculation |
|--------|-------------|
| Search abandonment rate | Searches - Results viewed / Searches |
| Checkout abandonment rate | Checkout started - Bookings / Checkout started |
| Average time to book | Avg(booking_created_at - search_started_at) |
| Most searched dates | Group by departure_date, count |
| Popular cabin classes | Group by cabin_class, count |

Store aggregated stats in new table `flight_behavior_stats` or calculate on-the-fly.

---

### Phase 7: CSV Export Functionality

**Goal:** Support audit-ready exports for accounting and Seller of Travel compliance.

**File:** `src/lib/flightExports.ts` (NEW)

Export functions:
- `exportBookingsCSV(filters)` - All bookings with passenger count (no PII)
- `exportRevenueReportCSV(dateRange)` - Revenue breakdown by day
- `exportFailedTransactionsCSV(dateRange)` - Failed payments/ticketing for reconciliation

**Privacy rules:**
- Never export passenger names, emails, passport numbers
- Export only: booking_reference, route, dates, amounts, status
- Include summary totals for accounting

---

### Phase 8: Route Registration & Navigation

**File:** `src/App.tsx` (MODIFY)

Add route:
```typescript
<Route path="/admin/flights/analytics" element={<FlightAnalyticsPage />} />
```

**File:** `src/pages/admin/FlightStatusPage.tsx` (MODIFY)

Add navigation link to analytics dashboard in the header buttons.

**File:** `src/pages/admin/TravelAdminDashboard.tsx` (MODIFY)

Add analytics quick link card.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useFlightFunnel.ts` | CREATE | Funnel event tracking hook |
| `src/hooks/useFlightAnalytics.ts` | CREATE | Analytics data fetching hooks |
| `src/hooks/useFlightHealthAlerts.ts` | CREATE | Failure detection & alert rules |
| `src/lib/flightExports.ts` | CREATE | CSV export utilities |
| `src/pages/admin/FlightAnalyticsPage.tsx` | CREATE | Main analytics dashboard |
| `src/components/admin/FlightFunnelChart.tsx` | CREATE | Funnel visualization component |
| `src/components/admin/FlightRevenueChart.tsx` | CREATE | Revenue over time chart |
| `src/components/admin/FlightTopRoutes.tsx` | CREATE | Top routes tables |
| `src/components/admin/FlightFailuresTable.tsx` | CREATE | Failure visibility table |
| `src/components/admin/FlightAlertBanner.tsx` | CREATE | Critical alert display |
| `src/pages/FlightSearch.tsx` | MODIFY | Add search_started tracking |
| `src/pages/FlightResults.tsx` | MODIFY | Add results_loaded, offer_selected tracking |
| `src/pages/FlightCheckout.tsx` | MODIFY | Add checkout_started tracking |
| `supabase/functions/stripe-webhook/index.ts` | MODIFY | Add payment_success event |
| `supabase/functions/issue-flight-ticket/index.ts` | MODIFY | Add ticket_issued/booking_failed events |
| `src/App.tsx` | MODIFY | Add analytics route |
| `src/pages/admin/FlightStatusPage.tsx` | MODIFY | Add nav link to analytics |
| `src/pages/admin/TravelAdminDashboard.tsx` | MODIFY | Add analytics quick link |

---

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `flight_funnel_events` | Store funnel tracking events (exists) |
| `flight_search_logs` | Search query logs (exists) |
| `flight_bookings` | Booking data & revenue (exists) |
| `flight_admin_alerts` | Critical alerts (exists) |

---

## KPI Definitions

| KPI | Formula |
|-----|---------|
| Searches Today | COUNT(flight_search_logs WHERE created_at >= today) |
| Results Shown | COUNT(flight_funnel_events WHERE event_type = 'results_loaded') |
| Bookings Completed | COUNT(flight_bookings WHERE ticketing_status = 'issued') |
| Conversion Rate | Bookings / Searches × 100 |
| Revenue Today | SUM(flight_bookings.total_amount WHERE created_at >= today) |
| Avg Booking Value | SUM(total_amount) / COUNT(bookings) |
| Zero-Result Rate | Zero-result searches / Total searches × 100 |
| Payment Failure Rate | Failed payments / Total checkout attempts × 100 |
| Ticketing Failure Rate | Failed ticketing / Successful payments × 100 |

---

## Privacy & Security

- **No PII in analytics**: Passenger names, emails, passports never exposed
- **Admin-only access**: All analytics pages require admin role check
- **Read-only dashboard**: No mutations from analytics UI
- **Anonymized exports**: CSV exports contain booking IDs and amounts only
- **Session tracking**: Use anonymous session IDs, not user IDs for guests

---

## Alert Thresholds

| Alert | Condition | Severity |
|-------|-----------|----------|
| High no-results rate | >30% in 1 hour | Warning |
| Payment failures | >3 in 15 minutes | Critical |
| Ticketing failures | >2 in 15 minutes | Critical |
| API degradation | Avg response >5000ms | Warning |
| Auto-pause triggered | check-flight-health triggered | Critical |

---

## Technical Notes

1. **Time range selector**: Support Today, 7 Days, 30 Days, Custom
2. **Real-time updates**: Use TanStack Query with 30s stale time
3. **Chart library**: Recharts (already installed)
4. **Lazy loading**: Split analytics page into chunks
5. **Error boundaries**: Wrap each chart in error boundary
6. **Empty states**: Show helpful messages when no data

---

## Testing Checklist

1. **Funnel Tracking**
   - [ ] search_started fires on form submit
   - [ ] results_loaded fires when offers return
   - [ ] offer_selected fires on flight click
   - [ ] checkout_started fires on checkout page load
   - [ ] Events appear in flight_funnel_events table

2. **Analytics Dashboard**
   - [ ] KPIs show accurate counts
   - [ ] Revenue calculations match booking totals
   - [ ] Charts render with real data
   - [ ] Time range filter works
   - [ ] Admin-only access enforced

3. **Failure Detection**
   - [ ] Zero-result routes displayed correctly
   - [ ] Payment failures show booking references
   - [ ] Ticketing failures link to incident log
   - [ ] Alert thresholds trigger correctly

4. **Exports**
   - [ ] Bookings CSV downloads
   - [ ] Revenue report includes correct totals
   - [ ] No PII in exported files
