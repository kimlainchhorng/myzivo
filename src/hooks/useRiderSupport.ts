/**
 * Rider Support Hooks
 * Hooks for rider help & support operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Fetch user's recent rides for selection in support tickets
export function useRecentRides(limit = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recent-rides", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("id, pickup_address, dropoff_address, fare_amount, created_at, status")
        .eq("rider_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

// Fetch user's support tickets
export function useRiderTickets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["rider-tickets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

// Get ticket count for badge display
export function useRiderTicketCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["rider-ticket-count", user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .in("status", ["open", "pending", "in_progress"]);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}

// Create a rider support ticket
export function useCreateRiderTicket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      category: string;
      subject: string;
      message: string;
      rideId?: string;
    }) => {
      const ticketNumber = `ZR-${Date.now().toString().slice(-6)}`;

      const { error } = await supabase.from("support_tickets").insert({
        ticket_number: ticketNumber,
        user_id: user?.id,
        category: data.category,
        subject: data.subject,
        description: data.message,
        ride_id: data.rideId || null,
        status: "open",
        priority: data.category === "safety" ? "urgent" : data.category === "lost_item" ? "high" : "normal",
      });

      if (error) throw error;
      return { ticketNumber };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["rider-ticket-count"] });
    },
    onError: (error) => {
      console.error("[useCreateRiderTicket] Error:", error);
      toast.error("Failed to submit ticket. Please try again.");
    },
  });
}

// Category configuration
export const TICKET_CATEGORIES = [
  { value: "payment", label: "Payment Issue", priority: "normal" },
  { value: "driver", label: "Driver Issue", priority: "normal" },
  { value: "rider", label: "Rider Account", priority: "normal" },
  { value: "safety", label: "Safety Concern", priority: "urgent" },
  { value: "lost_item", label: "Lost Item", priority: "high" },
  { value: "other", label: "Other", priority: "normal" },
] as const;

export type TicketCategory = typeof TICKET_CATEGORIES[number]["value"];
