/**
 * Admin Travel Dashboard Hooks
 * Provides data fetching and mutations for admin operations
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DashboardStats {
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  todayRevenue: number;
  weekRevenue: number;
  pendingCancellations: number;
  failedBookings: number;
  openTickets: number;
  paymentFailures: number;
  providerHealth: {
    provider_name: string;
    status: string;
    last_success_at?: string;
    last_error_at?: string;
    error_count_24h?: number;
    success_count_24h?: number;
  };
}

interface TravelOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  status: string;
  cancellation_status: string;
  holder_name: string;
  holder_email: string;
  holder_phone: string | null;
  total: number;
  subtotal: number;
  taxes: number;
  fees: number;
  currency: string;
  provider: string;
  admin_notes: string | null;
  flagged_for_review: boolean;
  flagged_reason: string | null;
  created_at: string;
  updated_at: string;
  travel_order_items: TravelOrderItem[];
  travel_payments: TravelPayment[];
}

interface TravelOrderItem {
  id: string;
  type: string;
  title: string;
  start_date: string;
  end_date: string | null;
  adults: number;
  children: number;
  price: number;
  supplier_status: string;
  provider_reference: string | null;
  cancellation_policy: string | null;
  cancellable: boolean;
  cancellation_deadline: string | null;
  supplier_payload: object | null;
}

interface TravelPayment {
  id: string;
  status: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
}

interface OrdersResponse {
  success: boolean;
  data: TravelOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function invokeAdminApi<T>(action: string, params: object = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-travel-dashboard", {
    body: { action, ...params },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error || "Request failed");
  
  return data.data;
}

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ["admin-travel-dashboard-stats"],
    queryFn: async () => {
      return invokeAdminApi<DashboardStats>("dashboard");
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAdminTravelOrders(options: {
  page?: number;
  limit?: number;
  status?: string;
  searchQuery?: string;
}) {
  const { page = 1, limit = 20, status, searchQuery } = options;

  return useQuery({
    queryKey: ["admin-travel-orders", page, limit, status, searchQuery],
    queryFn: async (): Promise<OrdersResponse> => {
      const { data, error } = await supabase.functions.invoke("admin-travel-dashboard", {
        body: { 
          action: "orders", 
          page, 
          limit, 
          status: status || "all", 
          searchQuery 
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Request failed");
      
      return data;
    },
  });
}

export function useAdminOrderDetail(orderId: string | undefined) {
  return useQuery({
    queryKey: ["admin-travel-order", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID required");
      
      const { data, error } = await supabase.functions.invoke("admin-travel-dashboard", {
        body: { action: "order_detail", orderId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Request failed");
      
      return data.data as TravelOrder & { audit_logs: object[] };
    },
    enabled: !!orderId,
  });
}

export function useAdminResendConfirmation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke("admin-travel-dashboard", {
        body: { action: "resend_confirmation", orderId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to resend");
      
      return data;
    },
    onSuccess: () => {
      toast.success("Confirmation email resent");
    },
    onError: (error) => {
      toast.error(`Failed to resend: ${error.message}`);
    },
  });
}

export function useAdminFlagOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, flagReason }: { orderId: string; flagReason?: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-travel-dashboard", {
        body: { action: "flag_order", orderId, flagReason },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to update flag");
      
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.flagged ? "Order flagged for review" : "Flag removed");
      queryClient.invalidateQueries({ queryKey: ["admin-travel-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-travel-order"] });
    },
    onError: (error) => {
      toast.error(`Failed to update flag: ${error.message}`);
    },
  });
}

export function useAdminUpdateNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, notes }: { orderId: string; notes: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-travel-dashboard", {
        body: { action: "update_notes", orderId, notes },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to update notes");
      
      return data;
    },
    onSuccess: () => {
      toast.success("Notes updated");
      queryClient.invalidateQueries({ queryKey: ["admin-travel-order"] });
    },
    onError: (error) => {
      toast.error(`Failed to update notes: ${error.message}`);
    },
  });
}

export function useAdminProviderStatus() {
  return useQuery({
    queryKey: ["admin-provider-status"],
    queryFn: async () => {
      return invokeAdminApi<object[]>("provider_status");
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useAdminProcessCancellation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      action, 
      adminNotes, 
      refundAmount 
    }: { 
      orderId: string; 
      action: "approve" | "reject"; 
      adminNotes?: string;
      refundAmount?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke("process-travel-cancellation", {
        body: { orderId, action, adminNotes, refundAmount },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to process");
      
      return data;
    },
    onSuccess: (data, variables) => {
      const msg = variables.action === "approve" 
        ? "Cancellation approved and refund processed" 
        : "Cancellation rejected";
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["admin-travel-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-travel-order"] });
      queryClient.invalidateQueries({ queryKey: ["admin-travel-dashboard-stats"] });
    },
    onError: (error) => {
      toast.error(`Failed to process: ${error.message}`);
    },
  });
}
