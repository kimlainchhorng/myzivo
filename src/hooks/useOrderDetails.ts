/**
 * useOrderDetails Hook
 * Fetches order details by order number
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrderItem {
  id: string;
  type: "hotel" | "activity" | "transfer";
  provider: string;
  provider_reference: string | null;
  title: string;
  start_date: string;
  end_date: string | null;
  adults: number;
  children: number;
  quantity: number;
  price: number;
  meta: Record<string, unknown>;
  status: string;
  created_at: string;
}

export interface Payment {
  id: string;
  provider: string;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  currency: string;
  subtotal: number;
  taxes: number;
  fees: number;
  total: number;
  status: string;
  provider: string;
  holder_name: string;
  holder_email: string;
  holder_phone: string | null;
  stripe_checkout_session_id: string | null;
  created_at: string;
  updated_at: string;
  travel_order_items: OrderItem[];
  travel_payments: Payment[];
}

export function useOrderDetails(orderNumber: string | undefined) {
  return useQuery({
    queryKey: ["travel-order", orderNumber],
    queryFn: async (): Promise<Order | null> => {
      if (!orderNumber) return null;

      const { data, error } = await supabase
        .from("travel_orders")
        .select(`
          *,
          travel_order_items (*),
          travel_payments (*)
        `)
        .eq("order_number", orderNumber)
        .single();

      if (error) {
        console.error("Error fetching order:", error);
        throw error;
      }

      return data as unknown as Order;
    },
    enabled: !!orderNumber,
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: ["my-travel-orders"],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("travel_orders")
        .select(`
          *,
          travel_order_items (*),
          travel_payments (*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }

      return (data || []) as unknown as Order[];
    },
  });
}
