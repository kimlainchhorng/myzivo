/**
 * ZIVO Eats Unread Chats Hook
 * Counts total unread messages across all active orders for badge display
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CHAT_TABLES, CHAT_ACTIVE_STATUSES } from "@/lib/chatTables";

/**
 * Get total unread chat message count for current user
 * Works for customers, drivers, and merchants
 */
export function useEatsUnreadChats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["eats-unread-chats", user?.id],
    queryFn: async () => {
      if (!user) return 0;

      // 1. Get all chat memberships for this user
      const { data: memberships, error: memberError } = await supabase
        .from(CHAT_TABLES.chatMembers)
        .select("chat_id")
        .eq("user_id", user.id);

      if (memberError) throw memberError;
      if (!memberships || memberships.length === 0) return 0;

      const chatIds = memberships.map((m) => m.chat_id);

      // 2. Get the order_chats to check order status
      const { data: orderChats, error: orderError } = await supabase
        .from(CHAT_TABLES.orderChats)
        .select("id, order_id")
        .in("id", chatIds);

      if (orderError) throw orderError;
      if (!orderChats || orderChats.length === 0) return 0;

      const orderIds = orderChats.map((c) => c.order_id);

      // 3. Filter to only active orders
      const { data: activeOrders, error: ordersError } = await supabase
        .from("food_orders")
        .select("id")
        .in("id", orderIds)
        .in("status", [...CHAT_ACTIVE_STATUSES]);

      if (ordersError) throw ordersError;
      if (!activeOrders || activeOrders.length === 0) return 0;

      const activeOrderIds = new Set(activeOrders.map((o) => o.id));
      const activeChatIds = orderChats
        .filter((c) => activeOrderIds.has(c.order_id))
        .map((c) => c.id);

      if (activeChatIds.length === 0) return 0;

      // 4. Get last read times for each active chat
      const { data: reads } = await supabase
        .from(CHAT_TABLES.chatReads)
        .select("chat_id, last_read_at")
        .eq("user_id", user.id)
        .in("chat_id", activeChatIds);

      const readMap = new Map(
        reads?.map((r) => [r.chat_id, r.last_read_at]) || []
      );

      // 5. Count unread messages in each active chat
      let totalUnread = 0;

      for (const chatId of activeChatIds) {
        const lastReadAt = readMap.get(chatId) || "1970-01-01";

        const { count } = await supabase
          .from(CHAT_TABLES.chatMessages)
          .select("*", { count: "exact", head: true })
          .eq("chat_id", chatId)
          .neq("sender_id", user.id)
          .gt("created_at", lastReadAt);

        totalUnread += count || 0;
      }

      return totalUnread;
    },
    enabled: !!user,
    refetchInterval: 60000, // Poll every minute
    staleTime: 30000,
  });
}

/**
 * Get unread count for a specific order's chat
 */
export function useOrderChatUnread(orderId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["order-chat-unread", orderId],
    queryFn: async () => {
      if (!orderId || !user) return 0;

      // Get chat for this order
      const { data: chat } = await supabase
        .from(CHAT_TABLES.orderChats)
        .select("id")
        .eq("order_id", orderId)
        .maybeSingle();

      if (!chat) return 0;

      // Get last read
      const { data: readData } = await supabase
        .from(CHAT_TABLES.chatReads)
        .select("last_read_at")
        .eq("chat_id", chat.id)
        .eq("user_id", user.id)
        .maybeSingle();

      const lastReadAt = readData?.last_read_at || "1970-01-01";

      // Count unread
      const { count } = await supabase
        .from(CHAT_TABLES.chatMessages)
        .select("*", { count: "exact", head: true })
        .eq("chat_id", chat.id)
        .neq("sender_id", user.id)
        .gt("created_at", lastReadAt);

      return count || 0;
    },
    enabled: !!orderId && !!user,
    refetchInterval: 30000,
  });
}
