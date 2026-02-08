/**
 * ZIVO Eats Alerts Page
 * Order notifications and status updates
 */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, BellOff, Check, Package } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEatsAlerts } from "@/hooks/useEatsAlerts";
import { EatsBottomNav } from "@/components/eats/EatsBottomNav";
import SEOHead from "@/components/SEOHead";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function EatsAlerts() {
  const navigate = useNavigate();
  const { alerts, unreadCount, isLoading, markAsRead, markAllAsRead } = useEatsAlerts();

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <SEOHead
        title="Notifications — ZIVO Eats"
        description="Your order notifications and updates"
      />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate("/eats")}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-lg">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-orange-400">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 ? (
            <button
              onClick={markAllAsRead}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-orange-500"
            >
              <Check className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-12 h-12 rounded-xl bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                <Skeleton className="h-3 w-1/2 bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && alerts.length === 0 && (
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-4">
            <BellOff className="w-8 h-8 text-zinc-600" />
          </div>
          <h2 className="text-lg font-bold mb-2">No notifications yet</h2>
          <p className="text-sm text-zinc-500 text-center mb-6">
            Order notifications will appear here
          </p>
          <Button
            onClick={() => navigate("/eats")}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Browse Restaurants
          </Button>
        </div>
      )}

      {/* Alerts List */}
      {!isLoading && alerts.length > 0 && (
        <div className="divide-y divide-white/5">
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                if (!alert.is_read) {
                  markAsRead(alert.id);
                }
                if (alert.action_url) {
                  navigate(alert.action_url);
                } else if (alert.order_id) {
                  navigate(`/eats/orders/${alert.order_id}`);
                }
              }}
              className={cn(
                "flex gap-4 p-4 cursor-pointer transition-colors",
                !alert.is_read
                  ? "bg-orange-500/5 hover:bg-orange-500/10"
                  : "hover:bg-zinc-900/50"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  !alert.is_read
                    ? "bg-orange-500/20 text-orange-500"
                    : "bg-zinc-800 text-zinc-400"
                )}
              >
                <Package className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={cn(
                      "font-medium text-sm truncate",
                      !alert.is_read ? "text-white" : "text-zinc-300"
                    )}
                  >
                    {alert.title}
                  </h3>
                  {!alert.is_read && (
                    <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                  {alert.body}
                </p>
                <p className="text-[10px] text-zinc-600 mt-1">
                  {formatDistanceToNow(new Date(alert.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <EatsBottomNav />
    </div>
  );
}
