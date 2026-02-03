/**
 * Flight Analytics Hooks
 * Query aggregated analytics data for the admin dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, format } from 'date-fns';

export type TimeRange = 'today' | '7d' | '30d' | 'all';

const getStartDate = (range: TimeRange): Date => {
  const now = new Date();
  switch (range) {
    case 'today':
      return startOfDay(now);
    case '7d':
      return subDays(now, 7);
    case '30d':
      return subDays(now, 30);
    case 'all':
      return new Date(0);
  }
};

export interface FlightKPIs {
  searchesToday: number;
  searchesTotal: number;
  resultsShown: number;
  checkoutsStarted: number;
  bookingsCompleted: number;
  conversionRate: number;
  searchToResultsRate: number;
}

export interface FlightRevenue {
  revenueToday: number;
  revenueTotal: number;
  avgBookingValue: number;
  totalTaxesFees: number;
  totalZivoMargin: number;
  currency: string;
}

export interface RouteStats {
  origin: string;
  destination: string;
  count: number;
  revenue?: number;
}

export interface FlightFailures {
  zeroResultsCount: number;
  paymentFailures: number;
  ticketingFailures: number;
  autoRefundsTriggered: number;
  failedBookings: Array<{
    id: string;
    booking_reference: string;
    ticketing_status: string;
    ticketing_error: string | null;
    created_at: string;
    total_amount: number;
  }>;
}

/**
 * Fetch flight KPIs for analytics dashboard
 */
export function useFlightKPIs(range: TimeRange = '7d') {
  const startDate = getStartDate(range);

  return useQuery({
    queryKey: ['flight-kpis', range],
    queryFn: async (): Promise<FlightKPIs> => {
      const startIso = startDate.toISOString();
      const todayStart = startOfDay(new Date()).toISOString();

      // Parallel queries for efficiency
      const [searchesResult, funnelResult, bookingsResult] = await Promise.all([
        // Total searches
        supabase
          .from('flight_search_logs')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startIso),
        
        // Funnel events
        supabase
          .from('flight_funnel_events')
          .select('event_type')
          .gte('created_at', startIso),
        
        // Completed bookings
        supabase
          .from('flight_bookings')
          .select('id', { count: 'exact', head: true })
          .eq('ticketing_status', 'issued')
          .gte('created_at', startIso),
      ]);

      // Today's searches
      const { count: searchesToday } = await supabase
        .from('flight_search_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart);

      const searchesTotal = searchesResult.count || 0;
      const funnelEvents = funnelResult.data || [];
      const bookingsCompleted = bookingsResult.count || 0;

      // Count funnel events by type
      const resultsShown = funnelEvents.filter(e => e.event_type === 'results_loaded').length;
      const checkoutsStarted = funnelEvents.filter(e => e.event_type === 'checkout_started').length;

      // Calculate rates
      const conversionRate = searchesTotal > 0 ? (bookingsCompleted / searchesTotal) * 100 : 0;
      const searchToResultsRate = searchesTotal > 0 ? (resultsShown / searchesTotal) * 100 : 0;

      return {
        searchesToday: searchesToday || 0,
        searchesTotal,
        resultsShown,
        checkoutsStarted,
        bookingsCompleted,
        conversionRate: Math.round(conversionRate * 100) / 100,
        searchToResultsRate: Math.round(searchToResultsRate * 100) / 100,
      };
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch revenue metrics
 */
export function useFlightRevenue(range: TimeRange = '7d') {
  const startDate = getStartDate(range);

  return useQuery({
    queryKey: ['flight-revenue', range],
    queryFn: async (): Promise<FlightRevenue> => {
      const startIso = startDate.toISOString();
      const todayStart = startOfDay(new Date()).toISOString();

      // Get all completed bookings in range
      const { data: bookings } = await supabase
        .from('flight_bookings')
        .select('total_amount, taxes_fees, zivo_markup, currency, created_at')
        .eq('ticketing_status', 'issued')
        .gte('created_at', startIso);

      const allBookings = bookings || [];
      
      // Today's revenue
      const todayBookings = allBookings.filter(b => b.created_at >= todayStart);
      const revenueToday = todayBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      
      // Total revenue
      const revenueTotal = allBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      
      // Average booking value
      const avgBookingValue = allBookings.length > 0 ? revenueTotal / allBookings.length : 0;
      
      // Taxes and ZIVO margin
      const totalTaxesFees = allBookings.reduce((sum, b) => sum + (b.taxes_fees || 0), 0);
      const totalZivoMargin = allBookings.reduce((sum, b) => sum + (b.zivo_markup || 0), 0);

      return {
        revenueToday: Math.round(revenueToday * 100) / 100,
        revenueTotal: Math.round(revenueTotal * 100) / 100,
        avgBookingValue: Math.round(avgBookingValue * 100) / 100,
        totalTaxesFees: Math.round(totalTaxesFees * 100) / 100,
        totalZivoMargin: Math.round(totalZivoMargin * 100) / 100,
        currency: 'USD',
      };
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch top searched and booked routes
 */
export function useFlightTopRoutes(range: TimeRange = '7d', limit = 10) {
  const startDate = getStartDate(range);

  return useQuery({
    queryKey: ['flight-top-routes', range, limit],
    queryFn: async () => {
      const startIso = startDate.toISOString();

      // Get search logs for route analysis
      const { data: searches } = await supabase
        .from('flight_search_logs')
        .select('origin_iata, destination_iata, offers_count')
        .gte('created_at', startIso);

      // Get bookings for revenue analysis
      const { data: bookings } = await supabase
        .from('flight_bookings')
        .select('origin, destination, total_amount')
        .eq('ticketing_status', 'issued')
        .gte('created_at', startIso);

      // Aggregate searched routes
      const searchedRoutes = new Map<string, number>();
      const zeroResultsRoutes = new Map<string, number>();
      
      (searches || []).forEach(s => {
        const key = `${s.origin_iata}-${s.destination_iata}`;
        searchedRoutes.set(key, (searchedRoutes.get(key) || 0) + 1);
        
        if (s.offers_count === 0) {
          zeroResultsRoutes.set(key, (zeroResultsRoutes.get(key) || 0) + 1);
        }
      });

      // Aggregate booked routes
      const bookedRoutes = new Map<string, { count: number; revenue: number }>();
      (bookings || []).forEach(b => {
        const key = `${b.origin}-${b.destination}`;
        const existing = bookedRoutes.get(key) || { count: 0, revenue: 0 };
        bookedRoutes.set(key, {
          count: existing.count + 1,
          revenue: existing.revenue + (b.total_amount || 0),
        });
      });

      // Convert to sorted arrays
      const topSearched: RouteStats[] = Array.from(searchedRoutes.entries())
        .map(([route, count]) => {
          const [origin, destination] = route.split('-');
          return { origin, destination, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      const topBooked: RouteStats[] = Array.from(bookedRoutes.entries())
        .map(([route, data]) => {
          const [origin, destination] = route.split('-');
          return { origin, destination, count: data.count, revenue: data.revenue };
        })
        .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
        .slice(0, limit);

      const zeroResults: RouteStats[] = Array.from(zeroResultsRoutes.entries())
        .map(([route, count]) => {
          const [origin, destination] = route.split('-');
          return { origin, destination, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return { topSearched, topBooked, zeroResults };
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch failure metrics
 */
export function useFlightFailures(range: TimeRange = '7d') {
  const startDate = getStartDate(range);

  return useQuery({
    queryKey: ['flight-failures', range],
    queryFn: async (): Promise<FlightFailures> => {
      const startIso = startDate.toISOString();

      const [searchesResult, failedBookingsResult, refundsResult] = await Promise.all([
        // Zero-result searches
        supabase
          .from('flight_search_logs')
          .select('id', { count: 'exact', head: true })
          .eq('offers_count', 0)
          .gte('created_at', startIso),
        
        // Failed bookings
        supabase
          .from('flight_bookings')
          .select('id, booking_reference, ticketing_status, ticketing_error, created_at, total_amount, payment_status')
          .in('ticketing_status', ['failed'])
          .gte('created_at', startIso)
          .order('created_at', { ascending: false })
          .limit(20),
        
        // Auto-refunds
        supabase
          .from('flight_bookings')
          .select('id', { count: 'exact', head: true })
          .eq('payment_status', 'refunded')
          .gte('created_at', startIso),
      ]);

      // Count payment failures vs ticketing failures
      const failedBookings = failedBookingsResult.data || [];
      const paymentFailures = failedBookings.filter(b => b.payment_status === 'failed').length;
      const ticketingFailures = failedBookings.filter(b => b.ticketing_status === 'failed').length;

      return {
        zeroResultsCount: searchesResult.count || 0,
        paymentFailures,
        ticketingFailures,
        autoRefundsTriggered: refundsResult.count || 0,
        failedBookings: failedBookings.map(b => ({
          id: b.id,
          booking_reference: b.booking_reference || 'N/A',
          ticketing_status: b.ticketing_status,
          ticketing_error: b.ticketing_error,
          created_at: b.created_at,
          total_amount: b.total_amount,
        })),
      };
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch chart data for revenue and searches over time
 */
export function useFlightChartData(range: TimeRange = '7d') {
  const startDate = getStartDate(range);

  return useQuery({
    queryKey: ['flight-chart-data', range],
    queryFn: async () => {
      const startIso = startDate.toISOString();

      const [searchesResult, bookingsResult] = await Promise.all([
        supabase
          .from('flight_search_logs')
          .select('created_at')
          .gte('created_at', startIso),
        
        supabase
          .from('flight_bookings')
          .select('created_at, total_amount')
          .eq('ticketing_status', 'issued')
          .gte('created_at', startIso),
      ]);

      const searches = searchesResult.data || [];
      const bookings = bookingsResult.data || [];

      // Group by date
      const searchesByDate = new Map<string, number>();
      const revenueByDate = new Map<string, number>();
      const bookingsByDate = new Map<string, number>();

      searches.forEach(s => {
        const date = format(new Date(s.created_at), 'MMM d');
        searchesByDate.set(date, (searchesByDate.get(date) || 0) + 1);
      });

      bookings.forEach(b => {
        const date = format(new Date(b.created_at), 'MMM d');
        revenueByDate.set(date, (revenueByDate.get(date) || 0) + (b.total_amount || 0));
        bookingsByDate.set(date, (bookingsByDate.get(date) || 0) + 1);
      });

      // Create chart data array
      const dates = new Set([...searchesByDate.keys(), ...revenueByDate.keys()]);
      const chartData = Array.from(dates).map(date => ({
        date,
        searches: searchesByDate.get(date) || 0,
        bookings: bookingsByDate.get(date) || 0,
        revenue: revenueByDate.get(date) || 0,
      }));

      return chartData;
    },
    staleTime: 60 * 1000,
  });
}
