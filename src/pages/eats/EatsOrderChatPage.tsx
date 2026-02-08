/**
 * Eats Order Chat Page - Customer View
 * Route: /eats/orders/:id/chat
 */
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { OrderChatPage } from "@/components/eats/OrderChatPage";
import { EATS_TABLES } from "@/lib/eatsTables";
import { Loader2 } from "lucide-react";

export default function EatsOrderChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch order to validate ownership and get status
  const { data: order, isLoading } = useQuery({
    queryKey: ["eats-order-chat-validation", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from(EATS_TABLES.orders)
        .select("id, customer_id, status")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Order not found or not owner
  if (!order || order.customer_id !== user?.id) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
        <p className="text-lg font-medium mb-4">Order not found or access denied</p>
        <button
          onClick={() => navigate("/eats/orders")}
          className="px-4 py-2 bg-orange-500 rounded-lg text-white"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <OrderChatPage
      orderId={order.id}
      orderNumber={order.id.slice(0, 8).toUpperCase()}
      orderStatus={order.status}
      myRole="customer"
      backPath={`/eats/orders/${id}`}
    />
  );
}
