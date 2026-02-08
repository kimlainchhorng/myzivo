/**
 * ZIVO Eats Alerts Hook
 * Manages order notifications and alerts
 */
import { useState, useEffect, useCallback } from "react";
import { eatsApi, EatsNotification } from "@/lib/eatsApi";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { EATS_TABLES } from "@/lib/eatsTables";

export function useEatsAlerts(limit = 50) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<EatsNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    if (!user?.id) {
      setAlerts([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await eatsApi.getAlerts();
      setAlerts(data.slice(0, limit));

      // Count unread
      const unread = data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err: unknown) {
      console.error("Error fetching eats alerts:", err);
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, limit]);

  // Mark single alert as read
  const markAsRead = useCallback(async (alertId: string) => {
    try {
      await eatsApi.markAlertRead(alertId);
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, is_read: true, read_at: new Date().toISOString() }
            : a
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking alert as read:", err);
      toast.error("Failed to mark as read");
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await eatsApi.markAllAlertsRead();
      setAlerts((prev) =>
        prev.map((a) => ({ ...a, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success("All alerts marked as read");
    } catch (err) {
      console.error("Error marking all as read:", err);
      toast.error("Failed to mark all as read");
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Real-time subscription for new alerts
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("eats-alerts-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: EATS_TABLES.notifications,
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newAlert = payload.new as unknown as EatsNotification;
          // Only add in_app notifications
          if ((newAlert as unknown as { channel: string }).channel === "in_app") {
            setAlerts((prev) => [newAlert, ...prev].slice(0, limit));
            setUnreadCount((prev) => prev + 1);

            // Show toast for new notification
            toast(newAlert.title, {
              description: newAlert.body?.substring(0, 80),
              action: newAlert.action_url
                ? {
                    label: "View",
                    onClick: () => {
                      window.location.href = newAlert.action_url!;
                    },
                  }
                : undefined,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, limit]);

  return {
    alerts,
    unreadCount,
    isLoading,
    error,
    fetchAlerts,
    markAsRead,
    markAllAsRead,
  };
}
