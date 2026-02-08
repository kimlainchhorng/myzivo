/**
 * Merchant Order Chat Page
 * Route: /merchant/orders/:id/chat
 */
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { OrderChatPage } from "@/components/eats/OrderChatPage";
import { EATS_TABLES } from "@/lib/eatsTables";
import { Loader2 } from "lucide-react";

export default function MerchantOrderChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get restaurant owned by this user
  const { data: restaurant } = useQuery({
    queryKey: ["restaurant-for-user", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch order to validate restaurant ownership and get status
  const { data: order, isLoading } = useQuery({
    queryKey: ["merchant-order-chat-validation", id, restaurant?.id],
    queryFn: async () => {
      if (!id || !restaurant?.id) return null;

      const { data, error } = await supabase
        .from(EATS_TABLES.orders)
        .select("id, restaurant_id, status")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!restaurant?.id,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Order not found or not for this restaurant
  if (!order || order.restaurant_id !== restaurant?.id) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
        <p className="text-lg font-medium mb-4">Order not found or not for your restaurant</p>
        <button
          onClick={() => navigate("/restaurant")}
          className="px-4 py-2 bg-orange-500 rounded-lg text-white"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <OrderChatPage
      orderId={order.id}
      orderNumber={order.id.slice(0, 8).toUpperCase()}
      orderStatus={order.status}
      myRole="merchant"
      backPath="/restaurant"
    />
  );
}
