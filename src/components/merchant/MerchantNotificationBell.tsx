/**
 * Merchant Notification Bell Component
 * Shows restaurant/merchant-specific notifications with real-time updates
 */
import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCheck, Package, Store, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface MerchantNotification {
  id: string;
  title: string;
  body: string;
  action_url: string | null;
  is_read: boolean;
  event_type: string | null;
  created_at: string;
}

const eventIcons: Record<string, typeof Package> = {
  order_created: Package,
  order_cancelled: XCircle,
  default: Store,
};

const eventColors: Record<string, string> = {
  order_created: "bg-emerald-500/20 text-emerald-500",
  order_cancelled: "bg-red-500/20 text-red-500",
  default: "bg-eats/20 text-eats",
};

export function MerchantNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<MerchantNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, action_url, is_read, event_type, created_at")
        .eq("user_id", user.id)
        .eq("channel", "in_app")
        .eq("category", "operational")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (err) {
      console.error("Error fetching merchant notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("is_read", false)
        .eq("category", "operational");

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleNotificationClick = (notification: MerchantNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    if (notification.action_url) {
      if (notification.action_url.startsWith("/")) {
        navigate(notification.action_url);
      } else {
        window.open(notification.action_url, "_blank");
      }
    }

    setOpen(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`merchant-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as MerchantNotification;
          // Only add operational notifications
          if ((payload.new as any).category === "operational") {
            setNotifications((prev) => [newNotification, ...prev].slice(0, 20));
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const getIcon = (eventType: string | null) => {
    return eventIcons[eventType || "default"] || eventIcons.default;
  };

  const getIconColorClass = (eventType: string | null) => {
    return eventColors[eventType || "default"] || eventColors.default;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl h-9 w-9 sm:h-10 sm:w-10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-eats text-[10px] font-bold text-white animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold">Order Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-eats" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll see order updates here
              </p>
            </div>
          ) : (
            <div className="py-2">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.event_type);
                const iconColorClass = getIconColorClass(notification.event_type);
                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-4 cursor-pointer",
                      !notification.is_read && "bg-eats/5"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        iconColorClass
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm line-clamp-1">
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="h-2 w-2 rounded-full bg-eats flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.body}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-sm text-eats hover:text-eats hover:bg-eats/10"
                onClick={() => {
                  navigate("/restaurant?tab=orders");
                  setOpen(false);
                }}
              >
                View All Orders
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default MerchantNotificationBell;
