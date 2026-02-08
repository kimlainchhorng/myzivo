/**
 * ZIVO Eats — Order Detail Page
 * Shows order status timeline and details
 */
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, Clock, UtensilsCrossed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSingleEatsOrder } from "@/hooks/useEatsOrders";
import { StatusTimeline } from "@/components/eats/StatusTimeline";
import SEOHead from "@/components/SEOHead";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function EatsOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useSingleEatsOrder(id);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => navigate("/eats/orders")}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg">Order Details</h1>
            <div className="w-10" />
          </div>
        </div>
        <div className="p-6 space-y-6">
          <Skeleton className="h-40 rounded-2xl bg-zinc-800" />
          <Skeleton className="h-32 rounded-2xl bg-zinc-800" />
          <Skeleton className="h-48 rounded-2xl bg-zinc-800" />
        </div>
      </div>
    );
  }

  // Error / Not found
  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6">
        <UtensilsCrossed className="w-16 h-16 text-zinc-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">Order not found</h2>
        <p className="text-zinc-500 mb-6">This order doesn't exist or you don't have access</p>
        <Button onClick={() => navigate("/eats/orders")} variant="outline">
          View My Orders
        </Button>
      </div>
    );
  }

  const restaurantName = (order.restaurants as any)?.name || "Restaurant";
  const restaurantPhone = (order.restaurants as any)?.phone;
  const items = (order.items as any[]) || [];
  const createdAt = new Date(order.created_at);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <SEOHead 
        title={`Order from ${restaurantName} — ZIVO Eats`} 
        description="Track your food order" 
      />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate("/eats/orders")}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-lg">Order Details</h1>
            <p className="text-xs text-zinc-500">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-5"
        >
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            Order Status
          </h2>
          <StatusTimeline currentStatus={order.status} />
        </motion.div>

        {/* Restaurant Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-zinc-800 flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">{restaurantName}</h3>
              <p className="text-sm text-zinc-500">
                {format(createdAt, "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            {restaurantPhone && (
              <a
                href={`tel:${restaurantPhone}`}
                className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center"
              >
                <Phone className="w-4 h-4 text-orange-500" />
              </a>
            )}
          </div>
        </motion.div>

        {/* Delivery Address */}
        {order.delivery_address && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Delivery Address</p>
                <p className="text-zinc-400 text-sm">{order.delivery_address}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-5"
        >
          <h2 className="font-bold mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 font-medium text-sm">
                      {item.quantity}x
                    </span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-zinc-500 mt-0.5">{item.notes}</p>
                  )}
                </div>
                <span className="text-sm text-zinc-400">
                  ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Price Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-5 space-y-3"
        >
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Subtotal</span>
            <span>${order.subtotal?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Delivery Fee</span>
            <span>${order.delivery_fee?.toFixed(2) || "0.00"}</span>
          </div>
          {order.tax && order.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-orange-400">${order.total_amount?.toFixed(2) || "0.00"}</span>
            </div>
          </div>
        </motion.div>

        {/* Support Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-zinc-700 bg-zinc-900 text-white"
            onClick={() => navigate("/support")}
          >
            Need Help with this Order?
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
