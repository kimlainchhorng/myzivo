/**
 * Group Order Hook
 * Manages group order sessions: create, join, add/remove items, lock, realtime sync
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { GroupPayment } from "@/components/eats/GroupPaymentCard";

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

  const setPaymentMode = useCallback(
    async (
      sessionId: string,
      mode: "host_pays" | "split_even" | "pay_own",
      participants: { userId: string; userName: string; amount: number }[]
    ) => {
      // Lock session and set payment mode
      const { error: updateErr } = await supabase
        .from("group_order_sessions")
        .update({ status: "locked", payment_mode: mode } as any)
        .eq("id", sessionId);

      if (updateErr) {
        toast.error("Failed to lock order");
        return false;
      }

      if (mode === "host_pays") return true;

      // Create payment rows for split modes
      const rows = participants
        .filter((p) => p.amount > 0)
        .map((p) => ({
          session_id: sessionId,
          user_id: p.userId,
          user_name: p.userName,
          amount: p.amount,
          status: "pending" as const,
        }));

      if (rows.length > 0) {
        const { error: insertErr } = await supabase
          .from("group_order_payments" as any)
          .insert(rows);

        if (insertErr) {
          console.error("Failed to create payment rows:", insertErr);
          toast.error("Failed to create payment records");
          return false;
        }
      }

      return true;
    },
    []
  );

  const markPaymentPaid = useCallback(async (paymentId: string) => {
    const { error } = await supabase
      .from("group_order_payments" as any)
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", paymentId);

    if (error) {
      toast.error("Payment failed");
      return false;
    }
    return true;
  }, []);

  return {
    startGroupOrder,
    joinGroupOrder,
    addGroupItem,
    removeGroupItem,
    lockSession,
    markCheckedOut,
    setPaymentMode,
    markPaymentPaid,
  };
}

/**
 * Real-time subscription to a group order session and its items
 */
export function useGroupSession(sessionId: string | null) {
  const [session, setSession] = useState<GroupOrderSession | null>(null);
  const [items, setItems] = useState<GroupOrderItem[]>([]);
  const [payments, setPayments] = useState<GroupPayment[]>([]);
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
      const [sessionRes, itemsRes, paymentsRes] = await Promise.all([
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
        supabase
          .from("group_order_payments" as any)
          .select("*")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true }),
      ]);

      if (sessionRes.data) setSession(sessionRes.data as GroupOrderSession);
      if (itemsRes.data) setItems(itemsRes.data as GroupOrderItem[]);
      if (paymentsRes.data) setPayments(paymentsRes.data as unknown as GroupPayment[]);
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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_order_payments",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPayments((prev) => [...prev, payload.new as GroupPayment]);
          } else if (payload.eventType === "UPDATE") {
            setPayments((prev) =>
              prev.map((p) =>
                p.id === (payload.new as GroupPayment).id
                  ? (payload.new as GroupPayment)
                  : p
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

  const paidCount = payments.filter((p) => p.status === "paid").length;
  const allPaid = payments.length > 0 && paidCount === payments.length;

  return {
    session,
    items,
    itemsByUser,
    total,
    participantCount,
    payments,
    paidCount,
    allPaid,
    isLoading,
  };
}
