/**
 * AI Insights Data Library
 * Prediction algorithms and insights generation
 */

import { supabase } from "@/integrations/supabase/client";

// ============= Interfaces =============

export interface DemandForecast {
  peakHours: { start: string; end: string; expectedOrders: number }[];
  suggestedDrivers: number;
  confidence: number;
  trend: "increasing" | "stable" | "decreasing";
  basedOnDays: number;
  hourlyForecast: { hour: number; expectedOrders: number }[];
}

export interface ZoneDemandGap {
  zoneId: string;
  zoneName: string;
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
  avgRating: number | null;
}

export interface AnomalySignal {
  id: string;
  userId: string | null;
  driverId: string | null;
  eventType: string;
  severity: number;
  score: number;
  details: Record<string, unknown>;
  createdAt: string;
  isResolved: boolean;
}

export interface MerchantInsight {
  bestPromoTimes: { day: string; hour: number; expectedLift: number }[];
  lowDemandHours: { hour: number; avgOrders: number; suggestion: string }[];
  topItems: { id: string; name: string; orders: number; revenue: number }[];
  recommendations: string[];
}

export interface DriverInsight {
  bestHours: { hour: number; avgEarnings: number; avgDeliveries: number; label: string }[];
  hotZones: { zoneId: string; zoneName: string; expectedOrders: number; competition: "low" | "medium" | "high" }[];
  optimalShift: { start: number; end: number; expectedEarnings: number };
}

// ============= Helper Functions =============

function formatHour(hour: number): string {
  const ampm = hour >= 12 ? "pm" : "am";
  const h = hour % 12 || 12;
  return `${h}${ampm}`;
}

function groupConsecutiveHours(
  peaks: { hour: number; avgOrders: number }[]
): { start: string; end: string; expectedOrders: number }[] {
  if (peaks.length === 0) return [];

  const sorted = [...peaks].sort((a, b) => a.hour - b.hour);
  const ranges: { start: string; end: string; expectedOrders: number }[] = [];
  let rangeStart = sorted[0].hour;
  let rangeEnd = sorted[0].hour;
  let totalOrders = sorted[0].avgOrders;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].hour === rangeEnd + 1) {
      rangeEnd = sorted[i].hour;
      totalOrders += sorted[i].avgOrders;
    } else {
      ranges.push({
        start: formatHour(rangeStart),
        end: formatHour(rangeEnd + 1),
        expectedOrders: Math.round(totalOrders),
      });
      rangeStart = sorted[i].hour;
      rangeEnd = sorted[i].hour;
      totalOrders = sorted[i].avgOrders;
    }
  }

  ranges.push({
    start: formatHour(rangeStart),
    end: formatHour(rangeEnd + 1),
    expectedOrders: Math.round(totalOrders),
  });

  return ranges;
}

// ============= Data Functions =============

/**
 * Get demand forecast for the next 24 hours based on historical data
 */
export async function getDemandForecast(days: number = 7): Promise<DemandForecast> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: orders } = await supabase
    .from("food_orders")
    .select("created_at")
    .gte("created_at", startDate.toISOString());

  // Count orders per hour
  const hourCounts = new Array(24).fill(0);
  const daySet = new Set<string>();

  orders?.forEach((order) => {
    const date = new Date(order.created_at);
    const hour = date.getHours();
    hourCounts[hour]++;
    daySet.add(date.toISOString().split("T")[0]);
  });

  const numDays = Math.max(daySet.size, 1);

  // Calculate average per hour
  const avgByHour = hourCounts.map((count, hour) => ({
    hour,
    avgOrders: count / numDays,
  }));

  // Create hourly forecast
  const hourlyForecast = avgByHour.map((h) => ({
    hour: h.hour,
    expectedOrders: Math.round(h.avgOrders),
  }));

  // Find peak hours (> 1.5x overall average)
  const overallAvg = avgByHour.reduce((s, h) => s + h.avgOrders, 0) / 24;
  const peaks = avgByHour.filter((h) => h.avgOrders > overallAvg * 1.5);

  // Group consecutive hours into ranges
  const peakHours = groupConsecutiveHours(peaks);

  // Calculate suggested drivers (avg 3 deliveries per driver per hour)
  const avgDeliveriesPerDriverPerHour = 3;
  const maxPeakOrders = peaks.length > 0 ? Math.max(...peaks.map((p) => p.avgOrders)) : 0;
  const suggestedDrivers = Math.ceil(maxPeakOrders / avgDeliveriesPerDriverPerHour);

  // Calculate trend by comparing recent days to older days
  const midpoint = Math.floor(days / 2);
  const recentDays = orders?.filter((o) => {
    const d = new Date(o.created_at);
    const daysAgo = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= midpoint;
  }).length || 0;

  const olderDays = orders?.filter((o) => {
    const d = new Date(o.created_at);
    const daysAgo = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo > midpoint;
  }).length || 0;

  let trend: "increasing" | "stable" | "decreasing" = "stable";
  if (recentDays > olderDays * 1.1) trend = "increasing";
  else if (recentDays < olderDays * 0.9) trend = "decreasing";

  return {
    peakHours,
    suggestedDrivers,
    confidence: numDays >= 7 ? 0.85 : 0.6,
    trend,
    basedOnDays: numDays,
    hourlyForecast,
  };
}

/**
 * Get zones with driver shortage
 */
export async function getZoneDemandGaps(): Promise<ZoneDemandGap[]> {
  // Get regions with their stats
  const { data: regions } = await supabase
    .from("regions")
    .select("id, name, city")
    .eq("is_active", true);

  if (!regions) return [];

  const gaps: ZoneDemandGap[] = [];

  for (const region of regions) {
    // Get online drivers count
    const { count: driversOnline } = await supabase
      .from("drivers")
      .select("id", { count: "exact", head: true })
      .eq("region_id", region.id)
      .eq("is_online", true);

    // Get expected orders (from demand_forecasts or estimate using zone_code)
    const { data: forecast } = await supabase
      .from("demand_forecasts")
      .select("predicted_orders, predicted_drivers_needed")
      .eq("zone_code", region.id)
      .gte("forecast_for", new Date().toISOString())
      .order("forecast_for", { ascending: true })
      .limit(3);

    const expectedOrders = forecast?.reduce((sum, f) => sum + (f.predicted_orders || 0), 0) || 0;
    const driversNeeded = Math.ceil(expectedOrders / 3);
    const shortage = Math.max(0, driversNeeded - (driversOnline || 0));

    let urgency: "critical" | "warning" | "ok" = "ok";
    if (driversOnline === 0 && expectedOrders > 0) urgency = "critical";
    else if (shortage > driversNeeded * 0.5) urgency = "critical";
    else if (shortage > 0) urgency = "warning";

    if (urgency !== "ok") {
      gaps.push({
        zoneId: region.id,
        zoneName: `${region.name}, ${region.city}`,
        expectedOrders,
        driversOnline: driversOnline || 0,
        driversNeeded,
        shortage,
        urgency,
      });
    }
  }

  return gaps.sort((a, b) => {
    const urgencyOrder = { critical: 0, warning: 1, ok: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
}

/**
 * Get merchants with declining orders
 */
export async function getDecliningMerchants(limit: number = 10): Promise<DecliningMerchant[]> {
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Get all active restaurants
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, rating")
    .eq("status", "active");

  if (!restaurants || restaurants.length === 0) return [];

  const results: DecliningMerchant[] = [];

  for (const restaurant of restaurants) {
    // Current week orders
    const { count: currentWeekOrders } = await supabase
      .from("food_orders")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id)
      .gte("created_at", oneWeekAgo.toISOString());

    // Previous week orders
    const { count: previousWeekOrders } = await supabase
      .from("food_orders")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id)
      .gte("created_at", twoWeeksAgo.toISOString())
      .lt("created_at", oneWeekAgo.toISOString());

    const current = currentWeekOrders || 0;
    const previous = previousWeekOrders || 0;

    if (previous > 0) {
      const changePercent = ((current - previous) / previous) * 100;

      if (changePercent < -20) {
        results.push({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          currentWeekOrders: current,
          previousWeekOrders: previous,
          changePercent: Math.round(changePercent),
          avgRating: restaurant.rating,
        });
      }
    }
  }

  return results
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, limit);
}

/**
 * Get anomaly signals from risk events
 */
export async function getAnomalySignals(limit: number = 50): Promise<AnomalySignal[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data } = await supabase
    .from("risk_events")
    .select("*")
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);

  return (
    data?.map((event) => ({
      id: event.id,
      userId: event.user_id,
      driverId: event.driver_id,
      eventType: event.event_type,
      severity: event.severity,
      score: event.score || 0,
      details: (event.details as Record<string, unknown>) || {},
      createdAt: event.created_at,
      isResolved: event.is_resolved || false,
    })) || []
  );
}

/**
 * Get insights for a specific merchant
 */
export async function getMerchantInsights(restaurantId: string): Promise<MerchantInsight> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get orders for this restaurant
  const { data: orders } = await supabase
    .from("food_orders")
    .select("created_at, total_amount, items")
    .eq("restaurant_id", restaurantId)
    .eq("status", "completed")
    .gte("created_at", thirtyDaysAgo.toISOString());

  // Calculate orders per hour
  const hourCounts = new Array(24).fill(0);
  const dayHourCounts: { [day: number]: number[] } = {};

  for (let d = 0; d < 7; d++) {
    dayHourCounts[d] = new Array(24).fill(0);
  }

  orders?.forEach((order) => {
    const date = new Date(order.created_at);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    hourCounts[hour]++;
    dayHourCounts[dayOfWeek][hour]++;
  });

  // Find low-demand hours (business hours 10am-10pm)
  const businessHours = hourCounts.slice(10, 22);
  const avgOrders = businessHours.reduce((s, c) => s + c, 0) / 12;

  const lowDemandHours: MerchantInsight["lowDemandHours"] = [];
  for (let hour = 10; hour < 22; hour++) {
    if (hourCounts[hour] < avgOrders * 0.5) {
      lowDemandHours.push({
        hour,
        avgOrders: Math.round((hourCounts[hour] / 30) * 10) / 10,
        suggestion: `Consider a promo at ${formatHour(hour)} to boost orders`,
      });
    }
  }

  // Best promo times - find lowest demand hours by day
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const bestPromoTimes: MerchantInsight["bestPromoTimes"] = [];

  for (let d = 0; d < 7; d++) {
    const dayHours = dayHourCounts[d].slice(10, 22);
    const minIndex = dayHours.indexOf(Math.min(...dayHours));
    if (dayHours[minIndex] < avgOrders * 0.3) {
      bestPromoTimes.push({
        day: days[d],
        hour: 10 + minIndex,
        expectedLift: 15 + Math.floor(Math.random() * 10),
      });
    }
  }

  // Top items - extract from JSONB
  const itemCounts: { [key: string]: { name: string; orders: number; revenue: number } } = {};

  orders?.forEach((order) => {
    const items = order.items as Array<{ id?: string; name?: string; price?: number; quantity?: number }> | null;
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const id = item.id || item.name || "unknown";
        if (!itemCounts[id]) {
          itemCounts[id] = { name: item.name || id, orders: 0, revenue: 0 };
        }
        itemCounts[id].orders += item.quantity || 1;
        itemCounts[id].revenue += (item.price || 0) * (item.quantity || 1);
      });
    }
  });

  const topItems = Object.entries(itemCounts)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 10);

  // Generate recommendations
  const recommendations: string[] = [];
  if (lowDemandHours.length > 0) {
    recommendations.push(`Run flash sales during ${lowDemandHours.map((h) => formatHour(h.hour)).join(", ")}`);
  }
  if (topItems.length > 0) {
    recommendations.push(`Feature "${topItems[0].name}" prominently - it's your bestseller`);
  }
  if (bestPromoTimes.length > 0) {
    recommendations.push(`${bestPromoTimes[0].day}s see lower traffic - ideal for promotions`);
  }

  return {
    bestPromoTimes: bestPromoTimes.slice(0, 3),
    lowDemandHours: lowDemandHours.slice(0, 5),
    topItems,
    recommendations,
  };
}

/**
 * Get insights for a specific driver
 */
export async function getDriverInsights(driverId: string): Promise<DriverInsight> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get completed orders for this driver
  const { data: orders } = await supabase
    .from("food_orders")
    .select("delivered_at, driver_earnings_cents")
    .eq("driver_id", driverId)
    .eq("status", "completed")
    .gte("delivered_at", thirtyDaysAgo.toISOString());

  // Calculate earnings by hour
  const hourStats: { [hour: number]: { earnings: number; count: number } } = {};
  for (let h = 0; h < 24; h++) {
    hourStats[h] = { earnings: 0, count: 0 };
  }

  orders?.forEach((order) => {
    if (order.delivered_at) {
      const hour = new Date(order.delivered_at).getHours();
      hourStats[hour].earnings += (order.driver_earnings_cents || 0) / 100;
      hourStats[hour].count++;
    }
  });

  // Best hours (sorted by avg earnings)
  const bestHours = Object.entries(hourStats)
    .map(([h, stats]) => ({
      hour: parseInt(h),
      avgEarnings: stats.count > 0 ? stats.earnings / stats.count : 0,
      avgDeliveries: stats.count / 30,
      label: formatHour(parseInt(h)),
    }))
    .filter((h) => h.avgDeliveries > 0)
    .sort((a, b) => b.avgEarnings - a.avgEarnings)
    .slice(0, 6);

  // Get hot zones from demand forecasts
  const { data: forecasts } = await supabase
    .from("demand_forecasts")
    .select("zone_code, predicted_orders, predicted_drivers_needed")
    .gte("forecast_for", new Date().toISOString())
    .order("predicted_orders", { ascending: false })
    .limit(10);

  const { data: regions } = await supabase.from("regions").select("id, name, city");
  const regionMap = new Map(regions?.map((r) => [r.id, `${r.name}, ${r.city}`]) || []);

  const hotZones: DriverInsight["hotZones"] = [];

  for (const f of forecasts || []) {
    // Get current driver count in zone
    const { count: driversOnline } = await supabase
      .from("drivers")
      .select("id", { count: "exact", head: true })
      .eq("region_id", f.zone_code)
      .eq("is_online", true);

    const ratio = (driversOnline || 0) / (f.predicted_drivers_needed || 1);
    let competition: "low" | "medium" | "high" = "medium";
    if (ratio < 0.5) competition = "low";
    else if (ratio > 1.5) competition = "high";

    if (competition !== "high") {
      hotZones.push({
        zoneId: f.zone_code,
        zoneName: regionMap.get(f.zone_code) || f.zone_code,
        expectedOrders: f.predicted_orders || 0,
        competition,
      });
    }
  }

  // Calculate optimal shift
  const sortedHours = Object.entries(hourStats)
    .map(([h, stats]) => ({ hour: parseInt(h), total: stats.earnings }))
    .sort((a, b) => b.total - a.total);

  const topHours = sortedHours.slice(0, 4).map((h) => h.hour);
  const start = Math.min(...topHours);
  const end = Math.max(...topHours) + 1;
  const expectedEarnings = topHours.reduce((sum, h) => sum + hourStats[h].earnings / 30, 0);

  return {
    bestHours,
    hotZones: hotZones.slice(0, 5),
    optimalShift: { start, end, expectedEarnings: Math.round(expectedEarnings) },
  };
}

/**
 * Get summary stats for admin insights dashboard
 */
export async function getInsightsSummary() {
  const [forecast, gaps, declining, anomalies] = await Promise.all([
    getDemandForecast(7),
    getZoneDemandGaps(),
    getDecliningMerchants(10),
    getAnomalySignals(50),
  ]);

  const criticalZones = gaps.filter((g) => g.urgency === "critical").length;
  const warningZones = gaps.filter((g) => g.urgency === "warning").length;
  const unresolvedAnomalies = anomalies.filter((a) => !a.isResolved).length;
  const criticalAnomalies = anomalies.filter((a) => a.severity >= 4 && !a.isResolved).length;

  return {
    forecast,
    gaps,
    declining,
    anomalies,
    summary: {
      peakHoursCount: forecast.peakHours.length,
      suggestedDrivers: forecast.suggestedDrivers,
      criticalZones,
      warningZones,
      decliningMerchants: declining.length,
      unresolvedAnomalies,
      criticalAnomalies,
      trend: forecast.trend,
    },
  };
}
