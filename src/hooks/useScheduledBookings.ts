/**
 * Scheduled Bookings Hook — Supabase-backed
 * Full CRUD for scheduling rides, food orders, and deliveries
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ScheduledBookingType = "ride" | "eats" | "delivery";
export type ScheduledBookingStatus = "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";

export interface ScheduledBooking {
  id: string;
  user_id: string;
  booking_type: ScheduledBookingType;
  status: ScheduledBookingStatus;
  scheduled_date: string;
  scheduled_time: string;
  pickup_address: string;
  destination_address: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  destination_lat: number | null;
  destination_lng: number | null;
  estimated_price: number | null;
  details: Record<string, any>;
  driver_id: string | null;
  restaurant_id: string | null;
  cancellation_reason: string | null;
  reminder_sent: boolean;
  driver_assigned_at: string | null;
  created_at: string;
  updated_at: string;
}

// Backwards compat aliases
export type { ScheduledBookingType as ScheduledBookingTypeAlias };

export interface CreateScheduledBookingInput {
  booking_type: ScheduledBookingType;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:mm
  pickup_address: string;
  destination_address?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  destination_lat?: number;
  destination_lng?: number;
  estimated_price?: number;
  details?: Record<string, any>;
  restaurant_id?: string;
}

export interface EditScheduledBookingInput {
  scheduled_date?: string;
  scheduled_time?: string;
  pickup_address?: string;
  destination_address?: string;
  details?: Record<string, any>;
}

// Legacy compat wrapper (some older components use this)
export function useScheduledBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getScheduledBookings = (): ScheduledBooking[] => {
    const cached = queryClient.getQueryData<ScheduledBooking[]>(["scheduled-bookings", user?.id]);
    return cached || [];
  };

  const addScheduledBooking = (
    data: Omit<ScheduledBooking, "id" | "status" | "created_at" | "updated_at" | "user_id" | "driver_id" | "cancellation_reason" | "reminder_sent" | "driver_assigned_at">
  ): ScheduledBooking => {
    // For legacy compat, returns a stub — use the mutation hooks for real usage
    const stub: ScheduledBooking = {
      ...data,
      id: crypto.randomUUID(),
      user_id: user?.id || "",
      status: "scheduled",
      driver_id: null,
      cancellation_reason: null,
      reminder_sent: false,
      driver_assigned_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return stub;
  };

  const cancelScheduledBooking = (id: string) => {
    // Legacy compat — use useCancelScheduledBooking for real usage
    console.warn("Legacy cancelScheduledBooking called — use useCancelScheduledBooking hook");
  };

  const editScheduledBooking = (id: string, updates: Partial<EditScheduledBookingInput>) => {
    console.warn("Legacy editScheduledBooking called — use useEditScheduledBooking hook");
  };

  const getUpcoming = (): ScheduledBooking[] => {
    const all = getScheduledBookings();
    const now = new Date();
    return all
      .filter((b) => {
        if (b.status !== "scheduled" && b.status !== "confirmed") return false;
        const bookingDate = new Date(`${b.scheduled_date}T${b.scheduled_time}`);
        return bookingDate > now;
      })
      .sort((a, b) => {
        const da = new Date(`${a.scheduled_date}T${a.scheduled_time}`).getTime();
        const db = new Date(`${b.scheduled_date}T${b.scheduled_time}`).getTime();
        return da - db;
      });
  };

  return {
    getScheduledBookings,
    addScheduledBooking,
    cancelScheduledBooking,
    editScheduledBooking,
    getUpcoming,
  };
}

// ==========================
// React Query Hooks
// ==========================

export function useScheduledBookingsQuery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["scheduled-bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("scheduled_bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      if (error) throw error;
      return (data || []) as ScheduledBooking[];
    },
    enabled: !!user,
  });
}

export function useCreateScheduledBooking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateScheduledBookingInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await (supabase as any)
        .from("scheduled_bookings")
        .insert({
          user_id: user.id,
          booking_type: input.booking_type,
          scheduled_date: input.scheduled_date,
          scheduled_time: input.scheduled_time,
          pickup_address: input.pickup_address,
          destination_address: input.destination_address || null,
          pickup_lat: input.pickup_lat || null,
          pickup_lng: input.pickup_lng || null,
          destination_lat: input.destination_lat || null,
          destination_lng: input.destination_lng || null,
          estimated_price: input.estimated_price || null,
          details: input.details || {},
          restaurant_id: input.restaurant_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ScheduledBooking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-bookings"] });
      toast.success("Booking scheduled successfully!");
    },
    onError: (err) => {
      toast.error("Failed to schedule booking: " + (err as Error).message);
    },
  });
}

export function useCancelScheduledBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { error } = await (supabase as any)
        .from("scheduled_bookings")
        .update({
          status: "cancelled",
          cancellation_reason: reason || null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-bookings"] });
      toast.success("Booking cancelled");
    },
    onError: (err) => {
      toast.error("Failed to cancel: " + (err as Error).message);
    },
  });
}

export function useEditScheduledBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: EditScheduledBookingInput }) => {
      const { error } = await (supabase as any)
        .from("scheduled_bookings")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-bookings"] });
      toast.success("Booking updated");
    },
    onError: (err) => {
      toast.error("Failed to update: " + (err as Error).message);
    },
  });
}
