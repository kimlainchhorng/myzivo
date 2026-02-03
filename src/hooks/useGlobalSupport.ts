/**
 * Global Support Center Hook
 * Unified support tickets across all ZIVO services
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SupportTicket {
  id: string;
  ticket_number: string;
  service_type: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  reference_id: string | null;
  reference_type: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  first_response_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_type: string;
  message: string;
  attachments: unknown[];
  created_at: string;
}

export interface CreateTicketInput {
  service_type: string;
  category: string;
  subject: string;
  description: string;
  priority?: string;
  reference_id?: string;
  reference_type?: string;
}

// Support Categories by Service
export const SUPPORT_CATEGORIES: Record<string, { label: string; categories: string[] }> = {
  flights: {
    label: "Flights",
    categories: ["booking_issue", "refund_request", "schedule_change", "baggage", "check_in", "other"],
  },
  cars: {
    label: "Car Rental",
    categories: ["booking_issue", "refund_request", "vehicle_issue", "pickup_dropoff", "damage", "other"],
  },
  p2p_cars: {
    label: "P2P Car Sharing",
    categories: ["booking_issue", "damage_claim", "host_issue", "insurance", "payment", "other"],
  },
  rides: {
    label: "Rides",
    categories: ["ride_issue", "driver_complaint", "payment", "lost_item", "safety", "other"],
  },
  eats: {
    label: "Eats",
    categories: ["order_issue", "missing_items", "refund_request", "driver_issue", "restaurant", "other"],
  },
  move: {
    label: "Move",
    categories: ["delivery_issue", "damaged_package", "lost_package", "driver_issue", "pricing", "other"],
  },
  hotels: {
    label: "Hotels",
    categories: ["booking_issue", "refund_request", "room_issue", "amenities", "check_in", "other"],
  },
  account: {
    label: "Account",
    categories: ["login_issue", "payment_method", "profile", "security", "other"],
  },
  general: {
    label: "General",
    categories: ["feedback", "feature_request", "technical", "other"],
  },
};

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    booking_issue: "Booking Issue",
    refund_request: "Refund Request",
    schedule_change: "Schedule Change",
    baggage: "Baggage",
    check_in: "Check-in",
    vehicle_issue: "Vehicle Issue",
    pickup_dropoff: "Pickup/Drop-off",
    damage: "Damage",
    damage_claim: "Damage Claim",
    host_issue: "Host Issue",
    insurance: "Insurance",
    payment: "Payment",
    ride_issue: "Ride Issue",
    driver_complaint: "Driver Complaint",
    lost_item: "Lost Item",
    safety: "Safety",
    order_issue: "Order Issue",
    missing_items: "Missing Items",
    driver_issue: "Driver Issue",
    restaurant: "Restaurant",
    delivery_issue: "Delivery Issue",
    damaged_package: "Damaged Package",
    lost_package: "Lost Package",
    pricing: "Pricing",
    room_issue: "Room Issue",
    amenities: "Amenities",
    login_issue: "Login Issue",
    payment_method: "Payment Method",
    profile: "Profile",
    security: "Security",
    feedback: "Feedback",
    feature_request: "Feature Request",
    technical: "Technical",
    other: "Other",
  };
  return labels[category] || category;
}

// Get all tickets
export function useSupportTickets(statusFilter?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["support-tickets", user?.id, statusFilter],
    queryFn: async () => {
      let query = (supabase as any)
        .from("zivo_support_tickets")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SupportTicket[];
    },
    enabled: !!user,
  });
}

// Get single ticket with messages
export function useSupportTicket(ticketId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["support-ticket", ticketId],
    queryFn: async () => {
      const { data: ticket, error: ticketError } = await (supabase as any)
        .from("zivo_support_tickets")
        .select("*")
        .eq("id", ticketId!)
        .single();

      if (ticketError) throw ticketError;

      const { data: messages, error: messagesError } = await (supabase as any)
        .from("zivo_support_messages")
        .select("*")
        .eq("ticket_id", ticketId!)
        .eq("is_internal", false)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      return {
        ticket: ticket as SupportTicket,
        messages: (messages || []) as SupportMessage[],
      };
    },
    enabled: !!user && !!ticketId,
  });
}

// Create ticket
export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateTicketInput) => {
      const { data, error } = await (supabase as any)
        .from("zivo_support_tickets")
        .insert({
          user_id: user!.id,
          service_type: input.service_type,
          category: input.category,
          subject: input.subject,
          description: input.description,
          priority: input.priority || "normal",
          reference_id: input.reference_id,
          reference_type: input.reference_type,
        })
        .select()
        .single();

      if (error) throw error;
      return data as SupportTicket;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success(`Ticket ${data.ticket_number} created`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create ticket");
    },
  });
}

// Add message to ticket
export function useAddSupportMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const { error } = await (supabase as any).from("zivo_support_messages").insert({
        ticket_id: ticketId,
        sender_type: "user",
        sender_id: user!.id,
        message,
      });

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["support-ticket", vars.ticketId] });
      toast.success("Message sent");
    },
  });
}

// Close ticket
export function useCloseTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await (supabase as any)
        .from("zivo_support_tickets")
        .update({ status: "closed" })
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success("Ticket closed");
    },
  });
}
