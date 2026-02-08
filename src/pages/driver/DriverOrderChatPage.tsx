/**
 * Driver Order Chat Page
 * Route: /driver/orders/:id/chat
 */
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { OrderChatPage } from "@/components/eats/OrderChatPage";
import { EATS_TABLES } from "@/lib/eatsTables";
import { Loader2 } from "lucide-react";

export default function DriverOrderChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get driver ID for this user
  const { data: driver } = useQuery({
    queryKey: ["driver-for-user", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("drivers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch order to validate driver assignment and get status
  const { data: order, isLoading } = useQuery({
    queryKey: ["driver-order-chat-validation", id, driver?.id],
    queryFn: async () => {
      if (!id || !driver?.id) return null;

      const { data, error } = await supabase
        .from(EATS_TABLES.orders)
        .select("id, driver_id, status")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!driver?.id,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  // Order not found or not assigned to this driver
  if (!order || order.driver_id !== driver?.id) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
        <p className="text-lg font-medium mb-4">Order not found or not assigned to you</p>
        <button
          onClick={() => navigate("/driver")}
          className="px-4 py-2 bg-green-500 rounded-lg text-white"
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
      myRole="driver"
      backPath="/driver"
    />
  );
}
