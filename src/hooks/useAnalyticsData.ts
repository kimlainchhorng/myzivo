/**
 * Analytics Data Hook
 * Fetches analytics data for admin dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, format } from 'date-fns';

export interface AnalyticsStats {
  totalVisitors: number;
  totalSearches: number;
  totalCheckouts: number;
  totalBookings: number;
  conversionRate: number;
  avgOrderValue: number;
  totalRevenue: number;
}

export interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropoff: number;
}

export interface TimeSeriesPoint {
  date: string;
  searches: number;
  checkouts: number;
  bookings: number;
  revenue: number;
}

export interface ProductBreakdown {
  product: string;
  searches: number;
  bookings: number;
  revenue: number;
  conversionRate: number;
}

export function useAnalyticsData(dateRange: { start: Date; end: Date }) {
  // Fetch overall statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics-stats', dateRange.start, dateRange.end],
    queryFn: async (): Promise<AnalyticsStats> => {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      // Fetch all events in range
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('event_name, value, session_id')
        .gte('created_at', startDate)
        .lte('created_at', endDate) as any;

      if (error) throw error;

      const eventList = events || [];
      const uniqueSessions = new Set(eventList.map((e: any) => e.session_id));
      
      const searches = eventList.filter((e: any) => 
        e.event_name?.startsWith('search_')).length;
      const checkouts = eventList.filter((e: any) => 
        e.event_name === 'checkout_started').length;
      const bookings = eventList.filter((e: any) => 
        e.event_name === 'booking_confirmed').length;
      const revenue = eventList
        .filter((e: any) => e.event_name === 'booking_confirmed')
        .reduce((sum: number, e: any) => sum + (e.value || 0), 0);

      return {
        totalVisitors: uniqueSessions.size,
        totalSearches: searches,
        totalCheckouts: checkouts,
        totalBookings: bookings,
        conversionRate: searches > 0 ? (bookings / searches) * 100 : 0,
        avgOrderValue: bookings > 0 ? revenue / bookings : 0,
        totalRevenue: revenue,
      };
    },
    staleTime: 60000,
  });

  // Fetch funnel data
  const { data: funnelData, isLoading: funnelLoading } = useQuery({
    queryKey: ['analytics-funnel', dateRange.start, dateRange.end],
    queryFn: async () => {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      // Fetch funnel definitions
      const { data: funnels } = await supabase
        .from('analytics_funnels')
        .select('*')
        .eq('is_active', true) as any;

      // Fetch events for funnel analysis
      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_name, session_id, meta')
        .gte('created_at', startDate)
        .lte('created_at', endDate) as any;

      const eventList = events || [];
      const funnelList = funnels || [];

      // Calculate funnel metrics for each product type
      return funnelList.map((funnel: any) => {
        const steps = JSON.parse(funnel.steps) as string[];
        const productEvents = eventList.filter((e: any) => {
          const meta = e.meta as any;
          return meta?.product_type === funnel.product_type || 
                 steps.includes(e.event_name);
        });

        const stepCounts = steps.map((stepName, index) => {
          const count = productEvents.filter((e: any) => e.event_name === stepName).length;
          const prevCount = index === 0 ? count : 
            productEvents.filter((e: any) => e.event_name === steps[index - 1]).length;
          
          return {
            name: stepName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            count,
            percentage: index === 0 ? 100 : (prevCount > 0 ? (count / prevCount) * 100 : 0),
            dropoff: index === 0 ? 0 : Math.max(0, prevCount - count),
          };
        });

        return {
          name: funnel.name,
          productType: funnel.product_type,
          steps: stepCounts,
        };
      });
    },
    staleTime: 60000,
  });

  // Fetch time series data
  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery({
    queryKey: ['analytics-timeseries', dateRange.start, dateRange.end],
    queryFn: async (): Promise<TimeSeriesPoint[]> => {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_name, value, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true }) as any;

      const eventList = events || [];

      // Group by date
      const dateMap = new Map<string, TimeSeriesPoint>();
      
      eventList.forEach((event: any) => {
        const date = format(new Date(event.created_at), 'MMM dd');
        
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, searches: 0, checkouts: 0, bookings: 0, revenue: 0 });
        }
        
        const point = dateMap.get(date)!;
        
        if (event.event_name?.startsWith('search_')) {
          point.searches++;
        } else if (event.event_name === 'checkout_started') {
          point.checkouts++;
        } else if (event.event_name === 'booking_confirmed') {
          point.bookings++;
          point.revenue += event.value || 0;
        }
      });

      return Array.from(dateMap.values());
    },
    staleTime: 60000,
  });

  // Fetch product breakdown
  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['analytics-products', dateRange.start, dateRange.end],
    queryFn: async (): Promise<ProductBreakdown[]> => {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_name, value, meta')
        .gte('created_at', startDate)
        .lte('created_at', endDate) as any;

      const eventList = events || [];
      const products = ['hotel', 'activity', 'transfer', 'flight'];

      return products.map(product => {
        const productEvents = eventList.filter((e: any) => {
          const meta = e.meta as any;
          return meta?.product_type === product;
        });

        const searches = productEvents.filter((e: any) => 
          e.event_name?.startsWith('search_')).length;
        const bookings = productEvents.filter((e: any) => 
          e.event_name === 'booking_confirmed').length;
        const revenue = productEvents
          .filter((e: any) => e.event_name === 'booking_confirmed')
          .reduce((sum: number, e: any) => sum + (e.value || 0), 0);

        return {
          product: product.charAt(0).toUpperCase() + product.slice(1),
          searches,
          bookings,
          revenue,
          conversionRate: searches > 0 ? (bookings / searches) * 100 : 0,
        };
      });
    },
    staleTime: 60000,
  });

  // Fetch device/segment breakdown
  const { data: segmentData, isLoading: segmentLoading } = useQuery({
    queryKey: ['analytics-segments', dateRange.start, dateRange.end],
    queryFn: async () => {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      const { data: events } = await supabase
        .from('analytics_events')
        .select('device_type, traffic_source, is_new_user')
        .gte('created_at', startDate)
        .lte('created_at', endDate) as any;

      const eventList = events || [];

      // Device breakdown
      const deviceCounts = eventList.reduce((acc: any, e: any) => {
        const device = e.device_type || 'unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {});

      // Traffic source breakdown
      const sourceCounts = eventList.reduce((acc: any, e: any) => {
        const source = e.traffic_source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      // New vs returning
      const newUsers = eventList.filter((e: any) => e.is_new_user).length;
      const returning = eventList.length - newUsers;

      return {
        devices: Object.entries(deviceCounts).map(([name, value]) => ({ name, value: value as number })),
        sources: Object.entries(sourceCounts).map(([name, value]) => ({ name, value: value as number })),
        userTypes: [
          { name: 'New Users', value: newUsers },
          { name: 'Returning', value: returning },
        ],
      };
    },
    staleTime: 60000,
  });

  // Fetch performance metrics
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['analytics-performance', dateRange.start, dateRange.end],
    queryFn: async () => {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      const { data: metrics } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate) as any;

      const metricList = metrics || [];

      // Group by service
      const serviceMetrics = metricList.reduce((acc: any, m: any) => {
        const service = m.service || 'unknown';
        if (!acc[service]) {
          acc[service] = { total: 0, success: 0, totalLatency: 0, count: 0 };
        }
        acc[service].total++;
        if (m.success) acc[service].success++;
        acc[service].totalLatency += m.value_ms || 0;
        acc[service].count++;
        return acc;
      }, {});

      return Object.entries(serviceMetrics).map(([service, data]: [string, any]) => ({
        service,
        successRate: data.total > 0 ? (data.success / data.total) * 100 : 100,
        avgLatency: data.count > 0 ? data.totalLatency / data.count : 0,
        totalCalls: data.total,
      }));
    },
    staleTime: 60000,
  });

  return {
    stats,
    funnelData,
    timeSeriesData,
    productData,
    segmentData,
    performanceData,
    isLoading: statsLoading || funnelLoading || timeSeriesLoading || productLoading || segmentLoading || performanceLoading,
  };
}
