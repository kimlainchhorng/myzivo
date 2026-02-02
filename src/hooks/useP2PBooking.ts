/**
 * P2P Booking Hooks
 * Hooks for searching vehicles and managing bookings in the P2P car rental marketplace
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { P2PVehicle, BookingWithDetails } from "@/types/p2p";
import { toast } from "sonner";
import { differenceInDays, parseISO } from "date-fns";

// Re-export for convenience
export type { BookingWithDetails } from "@/types/p2p";

// Lightweight hook to check P2P vehicle availability in a location
export function useP2PVehicleCount(city?: string) {
  return useQuery({
    queryKey: ["p2pVehicleCount", city],
    queryFn: async () => {
      let query = supabase
        .from("p2p_vehicles")
        .select("id", { count: "exact", head: true })
        .eq("approval_status", "approved")
        .eq("is_available", true);

      if (city) {
        query = query.ilike("location_city", `%${city}%`);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Valid P2P booking statuses from the database enum
type P2PBookingStatusEnum = "pending" | "confirmed" | "active" | "completed" | "cancelled" | "disputed";

export interface P2PSearchFilters {
  city?: string;
  state?: string;
  pickupDate?: string;
  returnDate?: string;
  category?: string;
  transmission?: string;
  fuelType?: string;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  instantBook?: boolean;
}

export interface P2PVehicleWithOwner extends P2PVehicle {
  owner?: {
    id: string;
    full_name: string;
    rating: number | null;
    total_trips: number | null;
    response_rate: number | null;
  };
}

// Search available P2P vehicles
export function useP2PVehicleSearch(filters: P2PSearchFilters) {
  return useQuery({
    queryKey: ["p2pVehicleSearch", filters],
    queryFn: async (): Promise<P2PVehicleWithOwner[]> => {
      let query = supabase
        .from("p2p_vehicles")
        .select(`
          *,
          owner:car_owner_profiles!p2p_vehicles_owner_id_fkey(
            id, full_name, rating, total_trips, response_rate
          )
        `)
        .eq("approval_status", "approved")
        .eq("is_available", true)
        .order("rating", { ascending: false, nullsFirst: false });

      // Location filters
      if (filters.city) {
        query = query.ilike("location_city", `%${filters.city}%`);
      }
      if (filters.state) {
        query = query.eq("location_state", filters.state);
      }

      // Vehicle type filters - cast to expected enum types
      if (filters.category && filters.category !== "all") {
        query = query.eq("category", filters.category as P2PVehicle["category"]);
      }
      if (filters.transmission && filters.transmission !== "all") {
        query = query.eq("transmission", filters.transmission as P2PVehicle["transmission"]);
      }
      if (filters.fuelType && filters.fuelType !== "all") {
        query = query.eq("fuel_type", filters.fuelType as P2PVehicle["fuel_type"]);
      }

      // Price filters
      if (filters.minPrice) {
        query = query.gte("daily_rate", filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte("daily_rate", filters.maxPrice);
      }

      // Seats filter
      if (filters.seats) {
        query = query.gte("seats", filters.seats);
      }

      // Instant book filter
      if (filters.instantBook) {
        query = query.eq("instant_book", true);
      }

      const { data, error } = await query;
      if (error) throw error;

      // If dates provided, filter out vehicles with blocked dates
      if (filters.pickupDate && filters.returnDate && data) {
        const vehicleIds = data.map((v) => v.id);
        
        // Get blocked dates for these vehicles
        const { data: availability } = await supabase
          .from("vehicle_availability")
          .select("vehicle_id, date, is_available")
          .in("vehicle_id", vehicleIds)
          .gte("date", filters.pickupDate)
          .lte("date", filters.returnDate)
          .eq("is_available", false);

        // Get existing bookings for these vehicles
        const { data: existingBookings } = await supabase
          .from("p2p_bookings")
          .select("vehicle_id, pickup_date, return_date")
          .in("vehicle_id", vehicleIds)
          .in("status", ["pending", "confirmed", "active"] as P2PBookingStatusEnum[])
          .or(`pickup_date.lte.${filters.returnDate},return_date.gte.${filters.pickupDate}`);

        // Filter out unavailable vehicles
        const blockedVehicleIds = new Set([
          ...(availability?.map((a) => a.vehicle_id) || []),
          ...(existingBookings?.map((b) => b.vehicle_id) || []),
        ]);

        return data.filter((v) => !blockedVehicleIds.has(v.id));
      }

      return data || [];
    },
    enabled: true,
  });
}

// Fetch single vehicle with owner details
export function useP2PVehicleDetail(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ["p2pVehicleDetail", vehicleId],
    queryFn: async (): Promise<P2PVehicleWithOwner | null> => {
      if (!vehicleId) return null;

      const { data, error } = await supabase
        .from("p2p_vehicles")
        .select(`
          *,
          owner:car_owner_profiles!p2p_vehicles_owner_id_fkey(
            id, full_name, rating, total_trips, response_rate, bio
          )
        `)
        .eq("id", vehicleId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!vehicleId,
  });
}

// Fetch vehicle reviews
export function useVehicleReviews(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ["vehicleReviews", vehicleId],
    queryFn: async () => {
      if (!vehicleId) return [];

      const { data, error } = await supabase
        .from("p2p_reviews")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .eq("review_type", "renter_to_vehicle")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
}

// Calculate booking pricing
export function useBookingPricing(
  vehicleId: string | undefined,
  pickupDate: string | undefined,
  returnDate: string | undefined
) {
  return useQuery({
    queryKey: ["bookingPricing", vehicleId, pickupDate, returnDate],
    queryFn: async () => {
      if (!vehicleId || !pickupDate || !returnDate) return null;

      // Get vehicle rates
      const { data: vehicle, error: vehicleError } = await supabase
        .from("p2p_vehicles")
        .select("daily_rate, weekly_rate, monthly_rate, owner_id")
        .eq("id", vehicleId)
        .single();

      if (vehicleError) throw vehicleError;

      // Get commission settings
      const { data: commission } = await supabase
        .from("p2p_commission_settings")
        .select("*")
        .eq("is_active", true)
        .single();

      const totalDays = differenceInDays(parseISO(returnDate), parseISO(pickupDate));
      if (totalDays <= 0) return null;

      // Calculate best rate (weekly/monthly discounts)
      let dailyRate = vehicle.daily_rate;
      if (totalDays >= 30 && vehicle.monthly_rate) {
        dailyRate = vehicle.monthly_rate / 30;
      } else if (totalDays >= 7 && vehicle.weekly_rate) {
        dailyRate = vehicle.weekly_rate / 7;
      }

      const subtotal = dailyRate * totalDays;
      const serviceFeePercent = commission?.renter_service_fee_pct || 10;
      const serviceFee = subtotal * (serviceFeePercent / 100);
      const insuranceFee = (commission?.insurance_daily_fee || 15) * totalDays;
      const taxes = subtotal * 0.08; // 8% tax estimate
      const totalAmount = subtotal + serviceFee + insuranceFee + taxes;

      // Owner payout calculation
      const ownerCommissionPercent = commission?.owner_commission_pct || 15;
      const platformFee = subtotal * (ownerCommissionPercent / 100);
      const ownerPayout = subtotal - platformFee;

      return {
        vehicleId,
        ownerId: vehicle.owner_id,
        totalDays,
        dailyRate,
        subtotal,
        serviceFee,
        insuranceFee,
        taxes,
        totalAmount,
        platformFee,
        ownerPayout,
      };
    },
    enabled: !!vehicleId && !!pickupDate && !!returnDate,
  });
}

// Create booking request
export function useCreateBooking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vehicleId,
      pickupDate,
      returnDate,
      pickupLocation,
      notes,
      insuranceAccepted,
      termsAccepted,
    }: {
      vehicleId: string;
      pickupDate: string;
      returnDate: string;
      pickupLocation?: string;
      notes?: string;
      insuranceAccepted: boolean;
      termsAccepted: boolean;
    }) => {
      if (!user) throw new Error("Must be logged in");
      if (!termsAccepted) throw new Error("Must accept terms");

      // Get pricing
      const { data: vehicle } = await supabase
        .from("p2p_vehicles")
        .select("daily_rate, weekly_rate, monthly_rate, owner_id, location_address, instant_book")
        .eq("id", vehicleId)
        .single();

      if (!vehicle) throw new Error("Vehicle not found");

      // Get commission settings
      const { data: commission } = await supabase
        .from("p2p_commission_settings")
        .select("*")
        .eq("is_active", true)
        .single();

      const totalDays = differenceInDays(parseISO(returnDate), parseISO(pickupDate));

      // Calculate rates
      let dailyRate = vehicle.daily_rate;
      if (totalDays >= 30 && vehicle.monthly_rate) {
        dailyRate = vehicle.monthly_rate / 30;
      } else if (totalDays >= 7 && vehicle.weekly_rate) {
        dailyRate = vehicle.weekly_rate / 7;
      }

      const subtotal = dailyRate * totalDays;
      const serviceFeePercent = commission?.renter_service_fee_pct || 10;
      const serviceFee = subtotal * (serviceFeePercent / 100);
      const insuranceFee = insuranceAccepted
        ? (commission?.insurance_daily_fee || 15) * totalDays
        : 0;
      const taxes = subtotal * 0.08;
      const totalAmount = subtotal + serviceFee + insuranceFee + taxes;

      const ownerCommissionPercent = commission?.owner_commission_pct || 15;
      const platformFee = subtotal * (ownerCommissionPercent / 100);
      const ownerPayout = subtotal - platformFee;

      // Determine initial status based on instant_book
      const initialStatus: P2PBookingStatusEnum = vehicle.instant_book ? "confirmed" : "pending";

      const { data: booking, error } = await supabase
        .from("p2p_bookings")
        .insert({
          vehicle_id: vehicleId,
          renter_id: user.id,
          owner_id: vehicle.owner_id,
          pickup_date: pickupDate,
          return_date: returnDate,
          pickup_location: pickupLocation || vehicle.location_address,
          return_location: pickupLocation || vehicle.location_address,
          daily_rate: dailyRate,
          total_days: totalDays,
          subtotal,
          service_fee: serviceFee,
          insurance_fee: insuranceFee,
          taxes,
          total_amount: totalAmount,
          platform_fee: platformFee,
          owner_payout: ownerPayout,
          insurance_accepted: insuranceAccepted,
          terms_accepted: termsAccepted,
          notes,
          status: initialStatus,
          payment_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return booking;
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ["renterBookings"] });
      toast.success(
        booking.status === "confirmed"
          ? "Booking confirmed! Proceed to payment."
          : "Booking request sent to owner!"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create booking");
    },
  });
}

// Fetch renter's bookings
export function useRenterBookings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["renterBookings", user?.id],
    queryFn: async (): Promise<BookingWithDetails[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("p2p_bookings")
        .select(`
          *,
          vehicle:p2p_vehicles(
            id, make, model, year, images, location_city, location_state
          ),
          owner:car_owner_profiles!p2p_bookings_owner_id_fkey(
            id, full_name, phone, rating
          )
        `)
        .eq("renter_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

// Fetch single booking details
export function useBookingDetail(bookingId: string | undefined) {
  return useQuery({
    queryKey: ["bookingDetail", bookingId],
    queryFn: async (): Promise<BookingWithDetails | null> => {
      if (!bookingId) return null;

      const { data, error } = await supabase
        .from("p2p_bookings")
        .select(`
          *,
          vehicle:p2p_vehicles(
            id, make, model, year, images, location_city, location_state, location_address, seats, transmission, fuel_type
          ),
          owner:car_owner_profiles!p2p_bookings_owner_id_fkey(
            id, full_name, phone, email, rating
          )
        `)
        .eq("id", bookingId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });
}

// Cancel booking
export function useCancelBooking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      reason,
    }: {
      bookingId: string;
      reason?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("p2p_bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancelled_by: user.id,
          cancellation_reason: reason,
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renterBookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookingDetail"] });
      toast.success("Booking cancelled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel booking");
    },
  });
}

// Owner hooks for managing bookings
export function useOwnerBookings(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["ownerBookings", ownerId],
    queryFn: async (): Promise<BookingWithDetails[]> => {
      if (!ownerId) return [];

      const { data, error } = await supabase
        .from("p2p_bookings")
        .select(`
          *,
          vehicle:p2p_vehicles(
            id, make, model, year, images
          )
        `)
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!ownerId,
  });
}

// Owner approve/reject booking
export function useRespondToBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      action,
      reason,
    }: {
      bookingId: string;
      action: "confirm" | "reject";
      reason?: string;
    }) => {
      const update =
        action === "confirm"
          ? { status: "confirmed" as const }
          : {
              status: "cancelled" as const,
              cancelled_at: new Date().toISOString(),
              cancellation_reason: reason || "Rejected by owner",
            };

      const { data, error } = await supabase
        .from("p2p_bookings")
        .update(update)
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ownerBookings"] });
      toast.success(
        variables.action === "confirm"
          ? "Booking confirmed!"
          : "Booking rejected"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to respond to booking");
    },
  });
}

// Admin hooks for P2P bookings
export function useAdminP2PBookings(filters?: {
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["adminP2PBookings", filters],
    queryFn: async () => {
      let query = supabase
        .from("p2p_bookings")
        .select(`
          *,
          vehicle:p2p_vehicles(
            id, make, model, year, images
          ),
          owner:car_owner_profiles!p2p_bookings_owner_id_fkey(
            id, full_name, email
          )
        `)
        .order("created_at", { ascending: false }) as any; // Cast due to complex join types

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}
