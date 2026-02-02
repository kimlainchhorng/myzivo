import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface JobEarning {
  id: string;
  type: 'ride' | 'eats' | 'move';
  amount: number;
  date: string;
  customerName?: string;
  pickupAddress: string;
  dropoffAddress: string;
}

interface DriverEarningsData {
  today: number;
  week: number;
  month: number;
  pending: number;
  tripsByType: {
    ride: number;
    eats: number;
    move: number;
  };
  completedJobs: JobEarning[];
}

export const useDriverEarnings = (driverId: string | undefined) => {
  return useQuery({
    queryKey: ['driver-earnings-detailed', driverId],
    queryFn: async (): Promise<DriverEarningsData> => {
      if (!driverId) {
        return {
          today: 0,
          week: 0,
          month: 0,
          pending: 0,
          tripsByType: { ride: 0, eats: 0, move: 0 },
          completedJobs: [],
        };
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch completed trips (rides)
      const { data: trips } = await supabase
        .from('trips')
        .select('id, fare_amount, completed_at, pickup_address, dropoff_address, service_type, customer_name')
        .eq('driver_id', driverId)
        .eq('status', 'completed')
        .gte('completed_at', monthStart.toISOString())
        .order('completed_at', { ascending: false });

      // Fetch completed food orders (eats) - use updated_at as completion proxy
      const { data: foodOrders } = await supabase
        .from('food_orders')
        .select('id, delivery_fee, updated_at, delivery_address, customer_name')
        .eq('driver_id', driverId)
        .eq('status', 'completed')
        .gte('updated_at', monthStart.toISOString())
        .order('updated_at', { ascending: false });

      // Fetch completed package deliveries (move)
      const { data: packages } = await supabase
        .from('package_deliveries')
        .select('id, actual_payout, delivered_at, pickup_address, dropoff_address, customer_name')
        .eq('driver_id', driverId)
        .eq('status', 'delivered')
        .gte('delivered_at', monthStart.toISOString())
        .order('delivered_at', { ascending: false });

      // Calculate earnings
      let today = 0, week = 0, month = 0;
      const tripsByType = { ride: 0, eats: 0, move: 0 };
      const completedJobs: JobEarning[] = [];

      // Process trips
      trips?.forEach(trip => {
        const amount = trip.fare_amount || 0;
        const date = new Date(trip.completed_at!);
        
        month += amount;
        if (date >= weekStart) week += amount;
        if (date >= todayStart) today += amount;
        
        const type = (trip.service_type as 'ride' | 'eats' | 'move') || 'ride';
        tripsByType[type]++;

        completedJobs.push({
          id: trip.id,
          type,
          amount,
          date: trip.completed_at!,
          customerName: trip.customer_name || undefined,
          pickupAddress: trip.pickup_address,
          dropoffAddress: trip.dropoff_address,
        });
      });

      // Process food orders
      foodOrders?.forEach(order => {
        const amount = order.delivery_fee || 0;
        const date = new Date(order.updated_at!);
        
        month += amount;
        if (date >= weekStart) week += amount;
        if (date >= todayStart) today += amount;
        
        tripsByType.eats++;

        completedJobs.push({
          id: order.id,
          type: 'eats',
          amount,
          date: order.updated_at!,
          customerName: order.customer_name || undefined,
          pickupAddress: 'Restaurant',
          dropoffAddress: order.delivery_address || '',
        });
      });

      // Process package deliveries
      packages?.forEach(pkg => {
        const amount = pkg.actual_payout || 0;
        const date = new Date(pkg.delivered_at!);
        
        month += amount;
        if (date >= weekStart) week += amount;
        if (date >= todayStart) today += amount;
        
        tripsByType.move++;

        completedJobs.push({
          id: pkg.id,
          type: 'move',
          amount,
          date: pkg.delivered_at!,
          customerName: pkg.customer_name || undefined,
          pickupAddress: pkg.pickup_address,
          dropoffAddress: pkg.dropoff_address,
        });
      });

      // Sort by date descending
      completedJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Fetch pending payouts
      const { data: pendingPayouts } = await supabase
        .from('driver_withdrawals')
        .select('amount')
        .eq('driver_id', driverId)
        .eq('status', 'pending');

      const pending = pendingPayouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      return {
        today,
        week,
        month,
        pending,
        tripsByType,
        completedJobs: completedJobs.slice(0, 50), // Limit to 50 most recent
      };
    },
    enabled: !!driverId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
