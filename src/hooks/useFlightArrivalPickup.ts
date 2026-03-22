/**
 * useFlightArrivalPickup — Links a customer's flight booking to a ride request
 * so drivers can see flight number + arrival time for airport pickups.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FlightArrivalInfo {
  flightNumber: string | null;
  arrivalTime: string | null;
  bookingId: string;
  origin: string;
  destination: string;
  bookingReference: string;
}

/**
 * Fetches the user's upcoming flight that arrives today/tomorrow
 * so it can be linked to a ride pickup at the airport.
 */
export function useUpcomingFlightArrival() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["upcoming-flight-arrival", user?.id],
    queryFn: async (): Promise<FlightArrivalInfo | null> => {
      if (!user?.id) return null;

      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      // Find flights arriving today or tomorrow
      const { data, error } = await supabase
        .from("flight_bookings")
        .select("id, booking_reference, origin, destination, departure_date, return_date, ticketing_status")
        .eq("customer_id", user.id)
        .eq("ticketing_status", "issued")
        .gte("departure_date", now.toISOString().split("T")[0])
        .lte("departure_date", tomorrow.toISOString().split("T")[0])
        .order("departure_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      return {
        flightNumber: null, // Will be populated from Duffel order data
        arrivalTime: data.departure_date,
        bookingId: data.id,
        origin: data.origin || "",
        destination: data.destination || "",
        bookingReference: data.booking_reference,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Build job metadata for airport pickup linked to a flight
 */
export function buildFlightPickupJobData(flight: FlightArrivalInfo) {
  return {
    flight_number: flight.flightNumber,
    flight_arrival_time: flight.arrivalTime,
    is_airport_pickup: true,
    linked_flight_booking_id: flight.bookingId,
  };
}
