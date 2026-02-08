/**
 * ZIVO Eats — Order Detail Page
 * Real-time status updates with driver tracking and live map
 */
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, Clock, UtensilsCrossed, HelpCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveEatsOrder } from "@/hooks/useLiveEatsOrder";
import { useEatsDriver } from "@/hooks/useEatsDriver";
import { StatusTimeline } from "@/components/eats/StatusTimeline";
import { DriverInfoCard } from "@/components/eats/DriverInfoCard";
import { DeliveryMap } from "@/components/eats/DeliveryMap";
import { HelpModal } from "@/components/eats/HelpModal";
import { useCart } from "@/contexts/CartContext";
import SEOHead from "@/components/SEOHead";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function EatsOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { order, loading, error } = useLiveEatsOrder(id);
  const { driver } = useEatsDriver(order?.driver_id);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const { clearCart, addItem } = useCart();

  // Determine if we should show the map
  const showMap = order && ["confirmed", "preparing", "ready_for_pickup", "out_for_delivery"].includes(order.status);
  const isDelivering = order?.status === "out_for_delivery";

  // Order Again handler
  const handleOrderAgain = () => {
    if (!order) return;

    // Clear current cart
    clearCart();

    // Rebuild cart from order items
    const orderItems = (order.items as any[]) || [];
    const restaurantName = order.restaurants?.name || "Restaurant";

    orderItems.forEach((item) => {
      addItem({
        id: item.menu_item_id,
        restaurantId: order.restaurant_id,
        restaurantName,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes,
        imageUrl: item.imageUrl,
      });
    });

    toast.success("Items added to cart!");
    navigate("/eats/cart");
  };

  // Loading state
  if (loading) {
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

  const restaurantName = order.restaurants?.name || "Restaurant";
  const restaurantPhone = order.restaurants?.phone;
  const items = (order.items as any[]) || [];
  const createdAt = new Date(order.created_at);

  // Prepare timestamps for timeline
  const timestamps = {
    placed_at: order.placed_at,
    created_at: order.created_at,
    accepted_at: order.accepted_at,
    prepared_at: order.prepared_at,
    ready_at: order.ready_at,
    picked_up_at: order.picked_up_at,
    delivered_at: order.delivered_at,
  };

  // Get status-specific messaging
  const getStatusMessage = () => {
    switch (order.status) {
      case "pending":
        return "Waiting for restaurant confirmation...";
      case "confirmed":
        return "Restaurant is preparing your order";
      case "preparing":
        return "Your food is being prepared";
      case "ready_for_pickup":
        return "Order ready for pickup";
      case "out_for_delivery":
        return "Driver is on the way!";
      case "delivered":
        return "Order delivered. Enjoy!";
      case "cancelled":
        return "Order was cancelled";
      default:
        return "Processing your order...";
    }
  };

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
          <button
            onClick={() => setHelpModalOpen(true)}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Live Status Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-2xl border ${
            order.status === "delivered" 
              ? "bg-emerald-500/10 border-emerald-500/30" 
              : order.status === "cancelled"
              ? "bg-red-500/10 border-red-500/30"
              : "bg-orange-500/10 border-orange-500/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              order.status === "delivered" 
                ? "bg-emerald-500" 
                : order.status === "cancelled"
                ? "bg-red-500"
                : "bg-orange-500 animate-pulse"
            }`} />
            <div>
              <p className={`font-bold text-sm ${
                order.status === "delivered" 
                  ? "text-emerald-400" 
                  : order.status === "cancelled"
                  ? "text-red-400"
                  : "text-orange-400"
              }`}>
                {getStatusMessage()}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {order.status !== "delivered" && order.status !== "cancelled" && "Updates in real-time"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Live Delivery Map */}
        {showMap && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DeliveryMap
              driverLat={driver?.current_lat}
              driverLng={driver?.current_lng}
              deliveryAddress={order.delivery_address || undefined}
              deliveryLat={order.delivery_lat || undefined}
              deliveryLng={order.delivery_lng || undefined}
              className="h-48"
            />
          </motion.div>
        )}

        {/* Driver Info Card */}
        {driver && (
          <DriverInfoCard
            driver={driver}
            isDelivering={isDelivering}
          />
        )}

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
          <StatusTimeline currentStatus={order.status} timestamps={timestamps} />
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
          
          {order.discount_amount && order.discount_amount > 0 && (
            <div className="flex justify-between text-sm text-emerald-400">
              <span>Discount {order.promo_code && `(${order.promo_code})`}</span>
              <span>-${order.discount_amount.toFixed(2)}</span>
            </div>
          )}
          
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

        {/* Order Again Button */}
        {(order.status === "delivered" || order.status === "cancelled") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleOrderAgain}
              className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Order Again
            </Button>
          </motion.div>
        )}

        {/* Help Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-zinc-700 bg-zinc-900 text-white"
            onClick={() => setHelpModalOpen(true)}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Need Help with this Order?
          </Button>
        </motion.div>
      </div>

      {/* Help Modal */}
      <HelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
        orderId={order.id}
        restaurantPhone={restaurantPhone}
      />
    </div>
  );
}
