/**
 * Optimization Metrics Hook (Admin)
 * Fetches aggregated optimization metrics for dashboard
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OptimizationMetric, SegmentType, MetricName } from "@/types/personalization";
import { subDays, format } from "date-fns";

const QUERY_KEY = "optimization-metrics";

interface MetricsSummary {
  conversion_rate: number;
  repeat_rate: number;
  abandonment_rate: number;
  revenue_per_user: number;
  total_bookings: number;
  total_revenue: number;
}

interface SegmentBreakdown {
  segment_value: string;
  conversion_rate: number;
  booking_count: number;
  revenue: number;
}

export function useOptimizationMetrics(days: number = 7) {
  const periodStart = format(subDays(new Date(), days), "yyyy-MM-dd");
  const periodEnd = format(new Date(), "yyyy-MM-dd");

  // Fetch raw metrics
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: [QUERY_KEY, periodStart, periodEnd],
    queryFn: async (): Promise<OptimizationMetric[]> => {
      const { data, error } = await supabase
        .from("optimization_metrics")
        .select("*")
        .gte("period_start", periodStart)
        .lte("period_end", periodEnd);

      if (error) {
        console.error("Error fetching optimization metrics:", error);
        return [];
      }

      return data as OptimizationMetric[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate summary from analytics_events directly
  const { data: eventsSummary, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["optimization-events-summary", periodStart, periodEnd],
    queryFn: async (): Promise<MetricsSummary> => {
      // Get booking events
      const { data: bookings, error: bookingsError } = await supabase
        .from("analytics_events")
        .select("id, value, user_id")
        .eq("event_name", "booking_confirmed")
        .gte("created_at", periodStart);

      // Get checkout started events
      const { data: checkouts, error: checkoutsError } = await supabase
        .from("analytics_events")
        .select("id")
        .eq("event_name", "checkout_started")
        .gte("created_at", periodStart);

      // Get unique users
      const { data: sessions, error: sessionsError } = await supabase
        .from("analytics_events")
        .select("session_id")
        .gte("created_at", periodStart);

      if (bookingsError || checkoutsError || sessionsError) {
        console.error("Error fetching events:", bookingsError || checkoutsError || sessionsError);
        return {
          conversion_rate: 0,
          repeat_rate: 0,
          abandonment_rate: 0,
          revenue_per_user: 0,
          total_bookings: 0,
          total_revenue: 0,
        };
      }

      const totalBookings = bookings?.length || 0;
      const totalCheckouts = checkouts?.length || 0;
      const totalRevenue = bookings?.reduce((sum, b) => sum + (b.value || 0), 0) || 0;
      const uniqueSessions = new Set(sessions?.map((s) => s.session_id)).size;

      // Calculate repeat bookings (users with more than 1 booking)
      const userBookings = new Map<string, number>();
      bookings?.forEach((b) => {
        if (b.user_id) {
          userBookings.set(b.user_id, (userBookings.get(b.user_id) || 0) + 1);
        }
      });
      const repeatUsers = Array.from(userBookings.values()).filter((count) => count > 1).length;
      const uniqueBookingUsers = userBookings.size;

      return {
        conversion_rate: totalCheckouts > 0 ? (totalBookings / totalCheckouts) * 100 : 0,
        repeat_rate: uniqueBookingUsers > 0 ? (repeatUsers / uniqueBookingUsers) * 100 : 0,
        abandonment_rate: totalCheckouts > 0 ? ((totalCheckouts - totalBookings) / totalCheckouts) * 100 : 0,
        revenue_per_user: uniqueSessions > 0 ? totalRevenue / uniqueSessions : 0,
        total_bookings: totalBookings,
        total_revenue: totalRevenue,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Get segment breakdown
  const getSegmentBreakdown = async (
    segmentType: SegmentType
  ): Promise<SegmentBreakdown[]> => {
    // Map segment type to analytics field
    const fieldMap: Record<SegmentType, string> = {
      user_type: "is_new_user",
      device_type: "device_type",
      traffic_source: "traffic_source",
      service_type: "meta->product_type",
      geo: "country",
    };

    const field = fieldMap[segmentType];

    const { data: events, error } = await supabase
      .from("analytics_events")
      .select("*")
      .in("event_name", ["checkout_started", "booking_confirmed"])
      .gte("created_at", periodStart);

    if (error || !events) {
      console.error("Error fetching segment data:", error);
      return [];
    }

    // Group by segment value
    const segments = new Map<string, { checkouts: number; bookings: number; revenue: number }>();

    events.forEach((event) => {
      let segmentValue: string;

      switch (segmentType) {
        case "user_type":
          segmentValue = event.is_new_user ? "new" : "returning";
          break;
        case "device_type":
          segmentValue = event.device_type || "unknown";
          break;
        case "traffic_source":
          segmentValue = event.traffic_source || "direct";
          break;
        case "service_type":
          segmentValue = (event.meta as any)?.product_type || "unknown";
          break;
        case "geo":
          segmentValue = event.country || "unknown";
          break;
        default:
          segmentValue = "unknown";
      }

      if (!segments.has(segmentValue)) {
        segments.set(segmentValue, { checkouts: 0, bookings: 0, revenue: 0 });
      }

      const segment = segments.get(segmentValue)!;
      if (event.event_name === "checkout_started") {
        segment.checkouts++;
      } else if (event.event_name === "booking_confirmed") {
        segment.bookings++;
        segment.revenue += event.value || 0;
      }
    });

    return Array.from(segments.entries()).map(([value, data]) => ({
      segment_value: value,
      conversion_rate: data.checkouts > 0 ? (data.bookings / data.checkouts) * 100 : 0,
      booking_count: data.bookings,
      revenue: data.revenue,
    }));
  };

  return {
    metrics,
    summary: eventsSummary || {
      conversion_rate: 0,
      repeat_rate: 0,
      abandonment_rate: 0,
      revenue_per_user: 0,
      total_bookings: 0,
      total_revenue: 0,
    },
    isLoading: isLoading || isLoadingEvents,
    getSegmentBreakdown,
    periodStart,
    periodEnd,
  };
}
