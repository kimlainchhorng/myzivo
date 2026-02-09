/**
 * ZIVO Eats — My Orders Page
 * Order history with status badges and scheduled order indicators
 */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Package, UtensilsCrossed, ChevronRight, Loader2, CalendarClock, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyEatsOrders } from "@/hooks/useEatsOrders";
import { useReorder } from "@/hooks/useReorder";
import { useMyOrderReviews } from "@/hooks/useEatsReviews";
import SEOHead from "@/components/SEOHead";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CartProvider } from "@/contexts/CartContext";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-zinc-500/20", text: "text-zinc-400", label: "Pending" },
  confirmed: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Confirmed" },
  preparing: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Preparing" },
  ready_for_pickup: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Ready" },
  out_for_delivery: { bg: "bg-purple-500/20", text: "text-purple-400", label: "On the Way" },
  delivered: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Delivered" },
  cancelled: { bg: "bg-red-500/20", text: "text-red-400", label: "Cancelled" },
};

function EatsOrdersContent() {
  const navigate = useNavigate();
  const { data: orders, isLoading, error } = useMyEatsOrders();
  const { reorder, isReordering } = useReorder();
  const { data: reviewsMap } = useMyOrderReviews();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SEOHead title="My Orders — ZIVO Eats" description="View your food order history" />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate("/eats")}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">My Orders</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900/80 rounded-2xl p-5 border border-white/5">
                <div className="flex gap-4">
                  <Skeleton className="w-16 h-16 rounded-xl bg-zinc-800" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32 bg-zinc-800" />
                    <Skeleton className="h-4 w-24 bg-zinc-800" />
                    <Skeleton className="h-4 w-20 bg-zinc-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!orders || orders.length === 0) && (
          <div className="flex flex-col items-center justify-center pt-24">
            <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-zinc-500 text-center mb-8">
              Start exploring restaurants and place your first order
            </p>
            <Button
              onClick={() => navigate("/eats")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-8 h-12 rounded-xl"
            >
              Browse Restaurants
            </Button>
          </div>
        )}

        {/* Orders List */}
        {orders && orders.length > 0 && (
          <div className="space-y-4">
              {orders.map((order, index) => {
                const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                const restaurantName = (order.restaurants as any)?.name || "Restaurant";
                const createdAt = new Date(order.created_at);
                const items = (order.items as any[]) || [];
                const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
                const canReorder = order.status === "delivered" || order.status === "cancelled";

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-5"
                  >
                    <button
                      onClick={() => navigate(`/eats/orders/${order.id}`)}
                      className="w-full text-left hover:bg-zinc-800/50 -m-5 p-5 rounded-2xl transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-zinc-800 flex items-center justify-center shrink-0">
                          <UtensilsCrossed className="w-6 h-6 text-orange-500" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold line-clamp-1">{restaurantName}</h3>
                            <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge className={cn("text-xs font-semibold border-0", statusStyle.bg, statusStyle.text)}>
                              {statusStyle.label}
                            </Badge>
                            {/* Inline rating for delivered orders */}
                            {order.status === "delivered" && reviewsMap?.get(order.id) && (
                              <span className="flex items-center gap-1 text-xs text-orange-400 font-medium">
                                <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                                {reviewsMap.get(order.id)!.rating.toFixed(1)}
                              </span>
                            )}
                            {(order as any).is_scheduled && (order as any).deliver_by && (
                              <Badge className="bg-violet-500/20 text-violet-400 text-xs font-semibold border-0 flex items-center gap-1">
                                <CalendarClock className="w-3 h-3" />
                                {format(new Date((order as any).deliver_by), "MMM d, h:mm a")}
                              </Badge>
                            )}
                            <span className="text-sm text-zinc-500">
                              · ${order.total_amount?.toFixed(2) || "0.00"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
                            <span>·</span>
                            <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Reorder Button */}
                    {canReorder && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            reorder({
                              id: order.id,
                              restaurant_id: order.restaurant_id,
                              restaurants: order.restaurants as { name: string } | null,
                              items: items.map(item => ({
                                menu_item_id: item.menu_item_id,
                                name: item.name,
                                price: item.price,
                                quantity: item.quantity,
                                notes: item.notes,
                              })),
                            });
                          }}
                          disabled={isReordering}
                          className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                        >
                          {isReordering ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                          Reorder
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EatsOrders() {
  return (
    <CartProvider>
      <EatsOrdersContent />
    </CartProvider>
  );
}
