/**
 * Group Order Hook
 * Manages group order sessions: create, join, add/remove items, lock, realtime sync
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GroupOrderSession {
  id: string;
  restaurant_id: string;
  host_user_id: string;
  invite_code: string;
  status: "open" | "locked" | "checked_out" | "cancelled";
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupOrderItem {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  menu_item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  notes: string | null;
  created_at: string;
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function useGroupOrder() {
  const { user } = useAuth();

  const startGroupOrder = useCallback(
    async (restaurantId: string): Promise<string | null> => {
      if (!user) {
        toast.error("Please log in to start a group order");
        return null;
      }

      const invite_code = generateInviteCode();

      const { data, error } = await supabase
        .from("group_order_sessions")
        .insert({
          restaurant_id: restaurantId,
          host_user_id: user.id,
          invite_code,
          status: "open",
        })
        .select("invite_code")
        .single();

      if (error) {
        toast.error("Failed to start group order");
        console.error(error);
        return null;
      }

      return data.invite_code;
    },
    [user]
  );

  const joinGroupOrder = useCallback(
    async (inviteCode: string) => {
      const { data, error } = await supabase
        .from("group_order_sessions")
        .select("*")
        .eq("invite_code", inviteCode.toUpperCase())
        .single();

      if (error || !data) {
        toast.error("Invalid invite code");
        return null;
      }

      if (data.status !== "open") {
        toast.error("This group order is no longer accepting items");
        return null;
      }

      return data as GroupOrderSession;
    },
    []
  );

  const addGroupItem = useCallback(
    async (
      sessionId: string,
      item: {
        menu_item_id: string;
        item_name: string;
        price: number;
        quantity: number;
        notes?: string;
      }
    ) => {
      if (!user) {
        toast.error("Please log in to add items");
        return false;
      }

      const userName =
        user.user_metadata?.full_name || user.email?.split("@")[0] || "Guest";

      const { error } = await supabase.from("group_order_items").insert({
        session_id: sessionId,
        user_id: user.id,
        user_name: userName,
        menu_item_id: item.menu_item_id,
        item_name: item.item_name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes || null,
      });

      if (error) {
        toast.error("Failed to add item");
        console.error(error);
        return false;
      }

      return true;
    },
    [user]
  );

  const removeGroupItem = useCallback(
    async (itemId: string) => {
      const { error } = await supabase
        .from("group_order_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        toast.error("Failed to remove item");
        return false;
      }
      return true;
    },
    []
  );

  const lockSession = useCallback(
    async (sessionId: string) => {
      const { error } = await supabase
        .from("group_order_sessions")
        .update({ status: "locked" })
        .eq("id", sessionId);

      if (error) {
        toast.error("Failed to lock group order");
        return false;
      }
      return true;
    },
    []
  );

  const markCheckedOut = useCallback(
    async (sessionId: string) => {
      await supabase
        .from("group_order_sessions")
        .update({ status: "checked_out" })
        .eq("id", sessionId);
    },
    []
  );

  return {
    startGroupOrder,
    joinGroupOrder,
    addGroupItem,
    removeGroupItem,
    lockSession,
    markCheckedOut,
  };
}

/**
 * Real-time subscription to a group order session and its items
 */
export function useGroupSession(sessionId: string | null) {
  const [session, setSession] = useState<GroupOrderSession | null>(null);
  const [items, setItems] = useState<GroupOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Initial fetch
  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchData = async () => {
      const [sessionRes, itemsRes] = await Promise.all([
        supabase
          .from("group_order_sessions")
          .select("*")
          .eq("id", sessionId)
          .single(),
        supabase
          .from("group_order_items")
          .select("*")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true }),
      ]);

      if (sessionRes.data) setSession(sessionRes.data as GroupOrderSession);
      if (itemsRes.data) setItems(itemsRes.data as GroupOrderItem[]);
      setIsLoading(false);
    };

    fetchData();
  }, [sessionId]);

  // Realtime subscription
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`group-order-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_order_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setSession(payload.new as GroupOrderSession);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_order_items",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setItems((prev) => [...prev, payload.new as GroupOrderItem]);
          } else if (payload.eventType === "DELETE") {
            setItems((prev) =>
              prev.filter((i) => i.id !== (payload.old as any).id)
            );
          } else if (payload.eventType === "UPDATE") {
            setItems((prev) =>
              prev.map((i) =>
                i.id === (payload.new as GroupOrderItem).id
                  ? (payload.new as GroupOrderItem)
                  : i
              )
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [sessionId]);

  // Grouped items by user
  const itemsByUser = items.reduce(
    (acc, item) => {
      if (!acc[item.user_name]) acc[item.user_name] = [];
      acc[item.user_name].push(item);
      return acc;
    },
    {} as Record<string, GroupOrderItem[]>
  );

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const participantCount = new Set(items.map((i) => i.user_id)).size;

  return {
    session,
    items,
    itemsByUser,
    total,
    participantCount,
    isLoading,
  };
}
