/**
 * Scheduled Bookings — queries scheduled_bookings table from Supabase
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ScheduledBooking {
  id: string;
  bookingType: string;
  pickupAddress: string;
  destinationAddress: string | null;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  estimatedPrice: number | null;
  driverId: string | null;
  createdAt: string;
}

export function useScheduledBookings() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["scheduled-bookings", user?.id],
    queryFn: async (): Promise<ScheduledBooking[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("scheduled_bookings")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["pending", "confirmed", "driver_assigned"])
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true })
        .limit(20);
      if (error) throw error;
      return (data || []).map(b => ({
        id: b.id,
        bookingType: b.booking_type,
        pickupAddress: b.pickup_address,
        destinationAddress: b.destination_address,
        scheduledDate: b.scheduled_date,
        scheduledTime: b.scheduled_time,
        status: b.status,
        estimatedPrice: b.estimated_price,
        driverId: b.driver_id,
        createdAt: b.created_at,
      }));
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  return {
    bookings: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useScheduledBookingsQuery(..._args: any[]) {
  const result = useScheduledBookings();
  return {
    data: result.bookings,
    isLoading: result.isLoading,
    error: result.error,
  };
}
