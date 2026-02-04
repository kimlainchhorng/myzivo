/**
 * ANALYTICS & KPIs CONFIGURATION
 * Core metrics, benchmarks, and tracking configuration
 */

// ============================================
// CORE FUNNEL STAGES
// ============================================

export interface FunnelStage {
  id: string;
  name: string;
  eventName: string;
  description: string;
  order: number;
}

export const CORE_FUNNEL: FunnelStage[] = [
  { id: "visitors", name: "Visitors", eventName: "page_view", description: "Unique site visitors", order: 1 },
  { id: "searches", name: "Searches", eventName: "search_started", description: "Initiated a search", order: 2 },
  { id: "results_viewed", name: "Results Viewed", eventName: "results_loaded", description: "Saw search results", order: 3 },
  { id: "affiliate_clicks", name: "Affiliate Clicks", eventName: "affiliate_click", description: "Clicked to partner site", order: 4 },
  { id: "bookings", name: "Bookings", eventName: "booking_confirmed", description: "Completed a booking", order: 5 },
  { id: "revenue", name: "Revenue", eventName: "revenue_recorded", description: "Revenue generated", order: 6 },
];

// ============================================
// CONVERSION RATE BENCHMARKS
// ============================================

export interface ConversionBenchmark {
  metric: string;
  from: string;
  to: string;
  healthyMin: number;
  healthyMax: number;
  unit: "percent";
  importance: "critical" | "high" | "medium";
}

export const CONVERSION_BENCHMARKS: ConversionBenchmark[] = [
  { 
    metric: "visitor_to_search", 
    from: "Visitors", 
    to: "Searches", 
    healthyMin: 30, 
    healthyMax: 50, 
    unit: "percent",
    importance: "critical",
  },
  { 
    metric: "search_to_click", 
    from: "Searches", 
    to: "Affiliate Clicks", 
    healthyMin: 10, 
    healthyMax: 25, 
    unit: "percent",
    importance: "critical",
  },
  { 
    metric: "click_to_booking", 
    from: "Affiliate Clicks", 
    to: "Bookings", 
    healthyMin: 1, 
    healthyMax: 5, 
    unit: "percent",
    importance: "high",
  },
  { 
    metric: "search_to_booking", 
    from: "Searches", 
    to: "Bookings", 
    healthyMin: 0.1, 
    healthyMax: 2, 
    unit: "percent",
    importance: "medium",
  },
];

// ============================================
// REVENUE METRICS
// ============================================

export interface RevenueMetric {
  id: string;
  name: string;
  description: string;
  calculationType: "sum" | "average" | "count";
}

export const REVENUE_METRICS: RevenueMetric[] = [
  { id: "revenue_per_booking", name: "Revenue per Booking", description: "Average commission per booking", calculationType: "average" },
  { id: "revenue_per_user", name: "Revenue per User (RPU)", description: "Total revenue / unique users", calculationType: "average" },
  { id: "daily_revenue", name: "Daily Revenue", description: "Total revenue for the day", calculationType: "sum" },
  { id: "revenue_flights", name: "Flight Revenue", description: "Commission from flight bookings", calculationType: "sum" },
  { id: "revenue_hotels", name: "Hotel Revenue", description: "Commission from hotel bookings", calculationType: "sum" },
  { id: "revenue_cars", name: "Car Revenue", description: "Commission from car rentals", calculationType: "sum" },
  { id: "revenue_addons", name: "Add-on Revenue", description: "Revenue from extras and add-ons", calculationType: "sum" },
];

// ============================================
// TRAFFIC QUALITY INDICATORS
// ============================================

export interface TrafficQualityIndicator {
  id: string;
  name: string;
  warningThreshold: number;
  criticalThreshold: number;
  direction: "above" | "below";
  description: string;
}

export const TRAFFIC_QUALITY_INDICATORS: TrafficQualityIndicator[] = [
  { 
    id: "bounce_rate", 
    name: "Bounce Rate", 
    warningThreshold: 60, 
    criticalThreshold: 80, 
    direction: "above",
    description: "Users leaving without interaction",
  },
  { 
    id: "zero_click_rate", 
    name: "Zero-Click Rate", 
    warningThreshold: 40, 
    criticalThreshold: 60, 
    direction: "above",
    description: "Searches with no affiliate clicks",
  },
  { 
    id: "suspicious_patterns", 
    name: "Suspicious Patterns", 
    warningThreshold: 5, 
    criticalThreshold: 10, 
    direction: "above",
    description: "Potential bot or fraud signals",
  },
  { 
    id: "avg_session_duration", 
    name: "Avg Session Duration", 
    warningThreshold: 60, 
    criticalThreshold: 30, 
    direction: "below",
    description: "Time spent on site (seconds)",
  },
];

// ============================================
// TRAFFIC SOURCES
// ============================================

export const TRAFFIC_SOURCES = [
  { id: "seo", name: "SEO / Organic", color: "#22c55e" },
  { id: "paid", name: "Paid Ads", color: "#3b82f6" },
  { id: "social", name: "Social Media", color: "#ec4899" },
  { id: "direct", name: "Direct", color: "#8b5cf6" },
  { id: "email", name: "Email", color: "#f59e0b" },
  { id: "referral", name: "Referral", color: "#14b8a6" },
];

// ============================================
// PRODUCT CATEGORIES
// ============================================

export const PRODUCT_CATEGORIES = [
  { id: "flights", name: "Flights", color: "#0ea5e9", icon: "Plane" },
  { id: "hotels", name: "Hotels", color: "#f59e0b", icon: "Hotel" },
  { id: "cars", name: "Car Rentals", color: "#8b5cf6", icon: "Car" },
  { id: "activities", name: "Activities", color: "#22c55e", icon: "MapPin" },
  { id: "addons", name: "Add-ons", color: "#ec4899", icon: "Package" },
];

// ============================================
// AFFILIATE HEALTH METRICS
// ============================================

export interface AffiliateHealthMetric {
  id: string;
  name: string;
  description: string;
  alertThreshold: number;
  direction: "ratio" | "difference";
}

export const AFFILIATE_HEALTH_METRICS: AffiliateHealthMetric[] = [
  { 
    id: "click_to_conversion_gap", 
    name: "Click-to-Conversion Gap", 
    description: "Difference between tracked clicks and confirmed conversions",
    alertThreshold: 90, // Alert if gap > 90%
    direction: "ratio",
  },
  { 
    id: "commission_confirmation_rate", 
    name: "Commission Confirmation Rate", 
    description: "Percentage of bookings with confirmed commission",
    alertThreshold: 70, // Alert if < 70%
    direction: "ratio",
  },
  { 
    id: "partner_response_time", 
    name: "Partner Response Time", 
    description: "Average time for partner API responses",
    alertThreshold: 3000, // Alert if > 3s
    direction: "difference",
  },
];

// ============================================
// ERROR METRICS TO TRACK
// ============================================

export const ERROR_METRICS = [
  { id: "search_errors", name: "Search Errors", priority: "critical" },
  { id: "no_result_searches", name: "No-Result Searches", priority: "high" },
  { id: "provider_timeouts", name: "Provider Timeouts", priority: "critical" },
  { id: "broken_redirects", name: "Broken Redirects", priority: "critical" },
  { id: "checkout_failures", name: "Checkout Failures", priority: "high" },
  { id: "payment_errors", name: "Payment Errors", priority: "critical" },
];

// ============================================
// DAILY DASHBOARD CONFIG
// ============================================

export interface DailyDashboardMetric {
  id: string;
  name: string;
  shortName: string;
  format: "number" | "currency" | "percent";
  showTrend: boolean;
  primary: boolean;
}

export const DAILY_DASHBOARD_METRICS: DailyDashboardMetric[] = [
  { id: "visitors", name: "Visitors", shortName: "Visitors", format: "number", showTrend: true, primary: true },
  { id: "searches", name: "Searches", shortName: "Searches", format: "number", showTrend: true, primary: true },
  { id: "clicks", name: "Affiliate Clicks", shortName: "Clicks", format: "number", showTrend: true, primary: true },
  { id: "bookings", name: "Bookings", shortName: "Bookings", format: "number", showTrend: true, primary: true },
  { id: "revenue", name: "Revenue", shortName: "Revenue", format: "currency", showTrend: true, primary: true },
  { id: "top_route", name: "Top Route", shortName: "Top Route", format: "number", showTrend: false, primary: false },
  { id: "ctr", name: "Click-Through Rate", shortName: "CTR", format: "percent", showTrend: true, primary: false },
  { id: "conversion_rate", name: "Conversion Rate", shortName: "CVR", format: "percent", showTrend: true, primary: false },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getConversionHealth(rate: number, benchmark: ConversionBenchmark): "healthy" | "warning" | "critical" {
  if (rate >= benchmark.healthyMin && rate <= benchmark.healthyMax) return "healthy";
  if (rate < benchmark.healthyMin * 0.5 || rate > benchmark.healthyMax * 1.5) return "critical";
  return "warning";
}

export function getTrafficQualityHealth(
  value: number, 
  indicator: TrafficQualityIndicator
): "healthy" | "warning" | "critical" {
  if (indicator.direction === "above") {
    if (value >= indicator.criticalThreshold) return "critical";
    if (value >= indicator.warningThreshold) return "warning";
    return "healthy";
  } else {
    if (value <= indicator.criticalThreshold) return "critical";
    if (value <= indicator.warningThreshold) return "warning";
    return "healthy";
  }
}

export function formatMetricValue(value: number, format: DailyDashboardMetric["format"]): string {
  switch (format) {
    case "currency":
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    case "percent":
      return `${value.toFixed(1)}%`;
    default:
      return value.toLocaleString();
  }
}

export function getTrendIcon(current: number, previous: number): "up" | "down" | "flat" {
  const change = ((current - previous) / previous) * 100;
  if (change > 2) return "up";
  if (change < -2) return "down";
  return "flat";
}

export function getTrendClass(trend: "up" | "down" | "flat", isPositiveGood: boolean = true): string {
  if (trend === "flat") return "text-muted-foreground";
  const isGood = (trend === "up" && isPositiveGood) || (trend === "down" && !isPositiveGood);
  return isGood ? "text-emerald-500" : "text-red-500";
}
