/**
 * Eats Support Hook
 * Quick ticket creation for food order issues
 */
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type EatsIssueCategory = "order_issue" | "refund" | "missing_item" | "wrong_item" | "late_delivery" | "other";

interface CreateEatsTicketInput {
  orderId: string;
  message: string;
  category: EatsIssueCategory;
  restaurantName?: string;
}

/**
 * Create a support ticket specifically for Eats orders
 * Pre-fills order context and uses ZE- prefix for ticket numbers
 */
export function useCreateEatsTicket() {
  return useMutation({
    mutationFn: async ({ orderId, message, category, restaurantName }: CreateEatsTicketInput) => {
      // Generate ticket number with Eats prefix
      const ticketNumber = `ZE-${Date.now().toString().slice(-6)}`;
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Build subject line
      const categoryLabels: Record<EatsIssueCategory, string> = {
        order_issue: "Order Issue",
        refund: "Refund Request",
        missing_item: "Missing Item",
        wrong_item: "Wrong Item",
        late_delivery: "Late Delivery",
        other: "Other Issue",
      };
      
      const subject = restaurantName 
        ? `${categoryLabels[category]} - ${restaurantName}`
        : categoryLabels[category];

      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          ticket_number: ticketNumber,
          user_id: user?.id || null,
          order_id: orderId,
          subject,
          description: message || `${categoryLabels[category]} reported`,
          category: "eats",
          priority: category === "refund" ? "high" : "normal",
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Ticket ${data.ticket_number} created`, {
        description: "We'll get back to you shortly",
      });
    },
    onError: (error: Error) => {
      console.error("Error creating support ticket:", error);
      toast.error("Failed to create ticket", {
        description: "Please try again or contact support directly",
      });
    },
  });
}
