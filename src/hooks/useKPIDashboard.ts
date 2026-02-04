/**
 * KPI Dashboard Hook
 * Fetches comprehensive analytics for the data-driven dashboard
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, startOfDay, endOfDay } from "date-fns";
import {
  CONVERSION_BENCHMARKS,
  TRAFFIC_SOURCES,
  PRODUCT_CATEGORIES,
  getConversionHealth,
  type ConversionBenchmark,
} from "@/config/analyticsKPIs";

interface DateRange {
  start: Date;
  end: Date;
}

export interface DailyMetrics {
  visitors: number;
  searches: number;
  clicks: number;
  bookings: number;
  revenue: number;
  topRoute: string;
}

export interface ConversionRates {
  visitorToSearch: number;
  searchToClick: number;
  clickToBooking: number;
  searchToBooking: number;
}

export interface TrafficBySource {
  source: string;
  visitors: number;
  searches: number;
  clicks: number;
  bookings: number;
  revenue: number;
  bounceRate: number;
}

export interface RoutePerformance {
  route: string;
  searches: number;
  clicks: number;
  bookings: number;
  revenue: number;
  conversionRate: number;
}

export interface PriceAlertStats {
  created: number;
  clickRate: number;
  bookingRate: number;
}

export interface DeviceBreakdown {
  device: string;
  visitors: number;
  searches: number;
  conversionRate: number;
  revenuePerUser: number;
  bounceRate: number;
}

export interface ErrorMetrics {
  searchErrors: number;
  noResultSearches: number;
  providerTimeouts: number;
  brokenRedirects: number;
}

export interface AffiliateHealth {
  clicksRecorded: number;
  conversionsRecorded: number;
  commissionConfirmed: number;
  discrepancy: number;
}

export function useKPIDashboard(dateRange: DateRange) {
  const startDate = dateRange.start.toISOString();
  const endDate = dateRange.end.toISOString();

  // Daily metrics (primary KPIs)
  const { data: dailyMetrics, isLoading: dailyLoading } = useQuery({
    queryKey: ["kpi-daily-metrics", startDate, endDate],
    queryFn: async (): Promise<DailyMetrics> => {
      const { data: events } = await supabase
        .from("analytics_events")
        .select("event_name, session_id, value, meta")
        .gte("created_at", startDate)
        .lte("created_at", endDate) as any;

      const eventList = events || [];
      const uniqueSessions = new Set(eventList.map((e: any) => e.session_id));
      
      const searches = eventList.filter((e: any) => 
        e.event_name === "search_started" || e.event_name?.startsWith("search_")
      ).length;
      
      const clicks = eventList.filter((e: any) => 
        e.event_name === "affiliate_click" || e.event_name === "partner_redirect"
      ).length;
      
      const bookings = eventList.filter((e: any) => 
        e.event_name === "booking_confirmed"
      ).length;
      
      const revenue = eventList
        .filter((e: any) => e.event_name === "booking_confirmed")
        .reduce((sum: number, e: any) => sum + (e.value || 0), 0);

      // Find top route
      const routeCounts: Record<string, number> = {};
      eventList
        .filter((e: any) => e.event_name === "search_started")
        .forEach((e: any) => {
          const meta = e.meta as any;
          if (meta?.origin && meta?.destination) {
            const route = `${meta.origin} → ${meta.destination}`;
            routeCounts[route] = (routeCounts[route] || 0) + 1;
          }
        });
      
      const topRoute = Object.entries(routeCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

      return {
        visitors: uniqueSessions.size,
        searches,
        clicks,
        bookings,
        revenue,
        topRoute,
      };
    },
    staleTime: 60000,
  });

  // Conversion rates
  const { data: conversionRates, isLoading: conversionLoading } = useQuery({
    queryKey: ["kpi-conversion-rates", startDate, endDate],
    queryFn: async (): Promise<ConversionRates> => {
      const { data: events } = await supabase
        .from("analytics_events")
        .select("event_name, session_id")
        .gte("created_at", startDate)
        .lte("created_at", endDate) as any;

      const eventList = events || [];
      const visitors = new Set(eventList.map((e: any) => e.session_id)).size;
      const searches = eventList.filter((e: any) => e.event_name === "search_started").length;
      const clicks = eventList.filter((e: any) => e.event_name === "affiliate_click").length;
      const bookings = eventList.filter((e: any) => e.event_name === "booking_confirmed").length;

      return {
        visitorToSearch: visitors > 0 ? (searches / visitors) * 100 : 0,
        searchToClick: searches > 0 ? (clicks / searches) * 100 : 0,
        clickToBooking: clicks > 0 ? (bookings / clicks) * 100 : 0,
        searchToBooking: searches > 0 ? (bookings / searches) * 100 : 0,
      };
    },
    staleTime: 60000,
  });

  // Traffic by source
  const { data: trafficBySource, isLoading: trafficLoading } = useQuery({
    queryKey: ["kpi-traffic-source", startDate, endDate],
    queryFn: async (): Promise<TrafficBySource[]> => {
      const { data: events } = await supabase
        .from("analytics_events")
        .select("event_name, traffic_source, session_id, value")
        .gte("created_at", startDate)
        .lte("created_at", endDate) as any;

      const eventList = events || [];
      
      // Group by traffic source
      const sourceMap: Record<string, TrafficBySource> = {};
      TRAFFIC_SOURCES.forEach(({ id }) => {
        sourceMap[id] = {
          source: id,
          visitors: 0,
          searches: 0,
          clicks: 0,
          bookings: 0,
          revenue: 0,
          bounceRate: 0,
        };
      });
      sourceMap["other"] = { source: "other", visitors: 0, searches: 0, clicks: 0, bookings: 0, revenue: 0, bounceRate: 0 };

      const sessionSources: Record<string, string> = {};
      const sessionEvents: Record<string, string[]> = {};

      eventList.forEach((e: any) => {
        const source = e.traffic_source || "other";
        const mappedSource = TRAFFIC_SOURCES.find(s => source.includes(s.id))?.id || "other";
        
        sessionSources[e.session_id] = mappedSource;
        if (!sessionEvents[e.session_id]) sessionEvents[e.session_id] = [];
        sessionEvents[e.session_id].push(e.event_name);

        const data = sourceMap[mappedSource] || sourceMap["other"];
        
        if (e.event_name === "search_started") data.searches++;
        if (e.event_name === "affiliate_click") data.clicks++;
        if (e.event_name === "booking_confirmed") {
          data.bookings++;
          data.revenue += e.value || 0;
        }
      });

      // Count unique visitors per source
      Object.entries(sessionSources).forEach(([sessionId, source]) => {
        const data = sourceMap[source] || sourceMap["other"];
        data.visitors++;
        
        // Check for bounce (single page view, no interaction)
        const events = sessionEvents[sessionId] || [];
        if (events.length === 1 && events[0] === "page_view") {
          data.bounceRate++;
        }
      });

      // Calculate bounce rate percentage
      return Object.values(sourceMap)
        .filter(s => s.visitors > 0)
        .map(s => ({
          ...s,
          bounceRate: s.visitors > 0 ? (s.bounceRate / s.visitors) * 100 : 0,
        }))
        .sort((a, b) => b.visitors - a.visitors);
    },
    staleTime: 60000,
  });

  // Top routes performance
  const { data: topRoutes, isLoading: routesLoading } = useQuery({
    queryKey: ["kpi-top-routes", startDate, endDate],
    queryFn: async (): Promise<RoutePerformance[]> => {
      const { data: events } = await supabase
        .from("analytics_events")
        .select("event_name, meta, value")
        .gte("created_at", startDate)
        .lte("created_at", endDate) as any;

      const eventList = events || [];
      const routeMap: Record<string, RoutePerformance> = {};

      eventList.forEach((e: any) => {
        const meta = e.meta as any;
        if (!meta?.origin || !meta?.destination) return;
        
        const route = `${meta.origin} → ${meta.destination}`;
        if (!routeMap[route]) {
          routeMap[route] = { route, searches: 0, clicks: 0, bookings: 0, revenue: 0, conversionRate: 0 };
        }
        
        if (e.event_name === "search_started") routeMap[route].searches++;
        if (e.event_name === "affiliate_click") routeMap[route].clicks++;
        if (e.event_name === "booking_confirmed") {
          routeMap[route].bookings++;
          routeMap[route].revenue += e.value || 0;
        }
      });

      return Object.values(routeMap)
        .map(r => ({
          ...r,
          conversionRate: r.searches > 0 ? (r.bookings / r.searches) * 100 : 0,
        }))
        .sort((a, b) => b.searches - a.searches)
        .slice(0, 10);
    },
    staleTime: 60000,
  });

  // Price alert stats
  const { data: priceAlertStats, isLoading: alertsLoading } = useQuery({
    queryKey: ["kpi-price-alerts", startDate, endDate],
    queryFn: async (): Promise<PriceAlertStats> => {
      const { data: events } = await supabase
        .from("analytics_events")
        .select("event_name")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .in("event_name", ["price_alert_created", "price_alert_clicked", "price_alert_booking"]) as any;

      const eventList = events || [];
      const created = eventList.filter((e: any) => e.event_name === "price_alert_created").length;
      const clicked = eventList.filter((e: any) => e.event_name === "price_alert_clicked").length;
      const booked = eventList.filter((e: any) => e.event_name === "price_alert_booking").length;

      return {
        created,
        clickRate: created > 0 ? (clicked / created) * 100 : 0,
        bookingRate: created > 0 ? (booked / created) * 100 : 0,
      };
    },
    staleTime: 60000,
  });

  // Device breakdown
  const { data: deviceBreakdown, isLoading: deviceLoading } = useQuery({
    queryKey: ["kpi-device-breakdown", startDate, endDate],
    queryFn: async (): Promise<DeviceBreakdown[]> => {
      const { data: events } = await supabase
        .from("analytics_events")
        .select("event_name, device_type, session_id, value")
        .gte("created_at", startDate)
        .lte("created_at", endDate) as any;

      const eventList = events || [];
      const deviceMap: Record<string, { 
        visitors: Set<string>; 
        searches: number; 
        bookings: number; 
        revenue: number;
        bounces: number;
      }> = {};

      eventList.forEach((e: any) => {
        const device = e.device_type || "unknown";
        if (!deviceMap[device]) {
          deviceMap[device] = { visitors: new Set(), searches: 0, bookings: 0, revenue: 0, bounces: 0 };
        }
        
        deviceMap[device].visitors.add(e.session_id);
        if (e.event_name === "search_started") deviceMap[device].searches++;
        if (e.event_name === "booking_confirmed") {
          deviceMap[device].bookings++;
          deviceMap[device].revenue += e.value || 0;
        }
      });

      return Object.entries(deviceMap).map(([device, data]) => ({
        device,
        visitors: data.visitors.size,
        searches: data.searches,
        conversionRate: data.searches > 0 ? (data.bookings / data.searches) * 100 : 0,
        revenuePerUser: data.visitors.size > 0 ? data.revenue / data.visitors.size : 0,
        bounceRate: 0, // Would need more detailed tracking
      }));
    },
    staleTime: 60000,
  });

  // Error metrics
  const { data: errorMetrics, isLoading: errorLoading } = useQuery({
    queryKey: ["kpi-error-metrics", startDate, endDate],
    queryFn: async (): Promise<ErrorMetrics> => {
      const { data: metrics } = await supabase
        .from("performance_metrics")
        .select("metric_type, success, error_code")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .eq("success", false) as any;

      const metricList = metrics || [];
      
      return {
        searchErrors: metricList.filter((m: any) => m.metric_type === "search_time" && !m.success).length,
        noResultSearches: metricList.filter((m: any) => m.error_code === "no_results").length,
        providerTimeouts: metricList.filter((m: any) => m.error_code === "timeout").length,
        brokenRedirects: metricList.filter((m: any) => m.error_code === "redirect_failed").length,
      };
    },
    staleTime: 60000,
  });

  // Affiliate health
  const { data: affiliateHealth, isLoading: affiliateLoading } = useQuery({
    queryKey: ["kpi-affiliate-health", startDate, endDate],
    queryFn: async (): Promise<AffiliateHealth> => {
      const { data: clicks } = await supabase
        .from("affiliate_click_logs")
        .select("id")
        .gte("created_at", startDate)
        .lte("created_at", endDate) as any;

      const { data: bookings } = await supabase
        .from("analytics_events")
        .select("id, value")
        .eq("event_name", "booking_confirmed")
        .gte("created_at", startDate)
        .lte("created_at", endDate) as any;

      const clickCount = clicks?.length || 0;
      const bookingCount = bookings?.length || 0;
      const commissionValue = bookings?.reduce((sum: number, b: any) => sum + (b.value || 0), 0) || 0;

      return {
        clicksRecorded: clickCount,
        conversionsRecorded: bookingCount,
        commissionConfirmed: commissionValue,
        discrepancy: clickCount > 0 ? ((clickCount - bookingCount) / clickCount) * 100 : 0,
      };
    },
    staleTime: 60000,
  });

  // Revenue by category
  const { data: revenueByCategory, isLoading: revenueCategoryLoading } = useQuery({
    queryKey: ["kpi-revenue-category", startDate, endDate],
    queryFn: async () => {
      const { data: events } = await supabase
        .from("analytics_events")
        .select("event_name, meta, value")
        .eq("event_name", "booking_confirmed")
        .gte("created_at", startDate)
        .lte("created_at", endDate) as any;

      const eventList = events || [];
      const categories: Record<string, { bookings: number; revenue: number }> = {};
      
      PRODUCT_CATEGORIES.forEach(({ id }) => {
        categories[id] = { bookings: 0, revenue: 0 };
      });

      eventList.forEach((e: any) => {
        const meta = e.meta as any;
        const category = meta?.product_type || "flights";
        if (categories[category]) {
          categories[category].bookings++;
          categories[category].revenue += e.value || 0;
        }
      });

      return Object.entries(categories).map(([id, data]) => ({
        category: id,
        ...data,
      }));
    },
    staleTime: 60000,
  });

  return {
    dailyMetrics,
    conversionRates,
    trafficBySource,
    topRoutes,
    priceAlertStats,
    deviceBreakdown,
    errorMetrics,
    affiliateHealth,
    revenueByCategory,
    isLoading: dailyLoading || conversionLoading || trafficLoading || routesLoading || 
               alertsLoading || deviceLoading || errorLoading || affiliateLoading || revenueCategoryLoading,
  };
}

// Comparison with previous period
export function usePeriodComparison(currentRange: DateRange) {
  const daysDiff = Math.ceil((currentRange.end.getTime() - currentRange.start.getTime()) / (1000 * 60 * 60 * 24));
  
  const previousRange = {
    start: subDays(currentRange.start, daysDiff),
    end: subDays(currentRange.end, daysDiff),
  };

  const current = useKPIDashboard(currentRange);
  const previous = useKPIDashboard(previousRange);

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    current,
    previous,
    changes: current.dailyMetrics && previous.dailyMetrics ? {
      visitors: calculateChange(current.dailyMetrics.visitors, previous.dailyMetrics.visitors),
      searches: calculateChange(current.dailyMetrics.searches, previous.dailyMetrics.searches),
      clicks: calculateChange(current.dailyMetrics.clicks, previous.dailyMetrics.clicks),
      bookings: calculateChange(current.dailyMetrics.bookings, previous.dailyMetrics.bookings),
      revenue: calculateChange(current.dailyMetrics.revenue, previous.dailyMetrics.revenue),
    } : null,
    isLoading: current.isLoading || previous.isLoading,
  };
}
