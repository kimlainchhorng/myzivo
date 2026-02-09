/**
 * ZIVO Eats — Order Detail Page
 * Real-time status updates with driver tracking, live map, and scheduled delivery support
 * Includes demand awareness messaging for high-traffic periods
 * Smart dispatch transparency with clear driver assignment status
 */
import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, UtensilsCrossed, HelpCircle, RefreshCw, Share2, MessageCircle, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveEatsOrder } from "@/hooks/useLiveEatsOrder";
import { useEatsDriver } from "@/hooks/useEatsDriver";
import { useLiveDriverLocation } from "@/hooks/useLiveDriverLocation";
import { useEatsDeliveryFactors } from "@/hooks/useEatsDeliveryFactors";
import { useOrderBatchInfo } from "@/hooks/useOrderBatchInfo";
import { useEatsDispatchStatus } from "@/hooks/useEatsDispatchStatus";
import { useDriverProximity } from "@/hooks/useDriverProximity";
import { useSmartEta, type OrderPhase } from "@/hooks/useSmartEta";
import { useLearnedPrepTime } from "@/hooks/useLearnedPrepTime";
import { usePrepProgress } from "@/hooks/usePrepProgress";
import { StatusTimeline } from "@/components/eats/StatusTimeline";
import { DriverInfoCard } from "@/components/eats/DriverInfoCard";
import { DeliveryMap } from "@/components/eats/DeliveryMap";
import { EtaCountdown } from "@/components/eats/EtaCountdown";
import { EnhancedStatusBanner } from "@/components/eats/EnhancedStatusBanner";
import { HighDemandBanner } from "@/components/eats/HighDemandBanner";
import { LowDriverSupplyBanner } from "@/components/eats/LowDriverSupplyBanner";
import { IncentiveBoostBanner } from "@/components/eats/IncentiveBoostBanner";
import { PrepProgressBanner } from "@/components/eats/PrepProgressBanner";
import { GroupedDeliveryBanner } from "@/components/eats/GroupedDeliveryBanner";
import { GroupedDeliveryBadge } from "@/components/eats/GroupedDeliveryBadge";
import { DispatchSearchBanner } from "@/components/eats/DispatchSearchBanner";
import { HelpModal } from "@/components/eats/HelpModal";
import { OrderChatButton } from "@/components/eats/OrderChatButton";
import { MaskedCallButton } from "@/components/eats/MaskedCallButton";
import { useCart } from "@/contexts/CartContext";
import SEOHead from "@/components/SEOHead";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Haversine formula for distance calculation (miles)
function calculateDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.7613; // Earth radius in miles
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function EatsOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { order, loading, error } = useLiveEatsOrder(id);
  const { driver } = useEatsDriver(order?.driver_id);
  const { location: liveDriverLocation, isStale } = useLiveDriverLocation(order?.driver_id, order?.status);
  const deliveryFactors = useEatsDeliveryFactors();
  const { batchInfo } = useOrderBatchInfo(order?.id, (order as any)?.batch_id);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const { clearCart, addItem } = useCart();

  // Use live location when available, fall back to driver profile location
  const driverLat = liveDriverLocation?.lat ?? driver?.current_lat;
  const driverLng = liveDriverLocation?.lng ?? driver?.current_lng;
  const driverHeading = liveDriverLocation?.heading;

  // Get pickup coordinates from restaurant
  const pickupLat = order?.pickup_lat ?? order?.restaurants?.lat;
  const pickupLng = order?.pickup_lng ?? order?.restaurants?.lng;

  // Calculate distance from driver to delivery
  const distanceToDelivery = useMemo(() => {
    if (driverLat != null && driverLng != null && order?.delivery_lat != null && order?.delivery_lng != null) {
      return calculateDistanceMiles(driverLat, driverLng, order.delivery_lat, order.delivery_lng);
    }
    return undefined;
  }, [driverLat, driverLng, order?.delivery_lat, order?.delivery_lng]);

  // Fetch learned prep time for this restaurant
  const learnedPrep = useLearnedPrepTime(order?.restaurant_id);

  // Calculate prep progress for smoother status transitions
  const prepProgress = usePrepProgress({
    acceptedAt: order?.accepted_at,
    learnedPrepMinutes: learnedPrep.avgPrepMinutes,
    isOrderReady: order?.status === "ready_for_pickup" || order?.status === "ready",
  });

  // Dispatch status for transparent messaging (enhanced with pickup coordinates and prep progress)
  const dispatchStatus = useEatsDispatchStatus({
    status: order?.status || "",
    driverId: order?.driver_id,
    driverLat,
    driverLng,
    deliveryLat: order?.delivery_lat,
    deliveryLng: order?.delivery_lng,
    pickupLat,
    pickupLng,
    prepProgressPercent: prepProgress.progressPercent,
    isAlmostReady: prepProgress.status === "almost_ready",
  });

  // Driver proximity tracking for enhanced ETA
  const proximity = useDriverProximity({
    driverLat,
    driverLng,
    pickupLat,
    pickupLng,
    deliveryLat: order?.delivery_lat,
    deliveryLng: order?.delivery_lng,
    orderStatus: order?.status || "",
  });

  // Determine order phase for ETA calculation
  const orderPhase: OrderPhase = useMemo(() => {
    if (order?.status === "out_for_delivery") return "out_for_delivery";
    if (order?.status === "ready_for_pickup") return "ready";
    if (["confirmed", "preparing"].includes(order?.status || "")) return "preparing";
    return "preparing";
  }, [order?.status]);

  // Smart ETA with range calculation, learned prep time, and speed adjustment
  const smartEta = useSmartEta({
    orderStatus: order?.status || "",
    driverAssigned: !!order?.driver_id,
    driverLat,
    driverLng,
    pickupLat,
    pickupLng,
    deliveryLat: order?.delivery_lat,
    deliveryLng: order?.delivery_lng,
    supplyMultiplier: deliveryFactors.supplyMultiplier,
    // Learned prep time integration
    learnedPrepMinutes: learnedPrep.avgPrepMinutes,
    isPrepLearned: learnedPrep.isLearned,
    orderPhase,
    // Real-time prep speed adjustment
    actualPrepElapsed: prepProgress.elapsedMinutes,
    prepSpeedFactor: prepProgress.prepSpeedFactor,
  });
  
  const etaLabel: "to pickup" | "to you" | undefined = order?.status === "out_for_delivery"
    ? "to you"
    : order?.driver_id ? "to pickup" : undefined;

  // Determine if we should show the map or demand banner
  const showMap = order && ["confirmed", "preparing", "ready_for_pickup", "out_for_delivery"].includes(order.status);
  const isActiveOrder = order && order.status !== "delivered" && order.status !== "cancelled";
  const isDelivering = order?.status === "out_for_delivery";

  // Copy order link to clipboard for support/sharing
  const handleShareOrderLink = async () => {
    const orderLink = `https://hizivo.com/eats/orders/${id}`;
    try {
      await navigator.clipboard.writeText(orderLink);
      toast.success("Order link copied to clipboard");
    } catch (err) {
      // Fallback for older browsers
      toast.error("Failed to copy link");
    }
  };

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
            <div className="flex items-center justify-center gap-2">
              <p className="text-xs text-zinc-500">#{order.id.slice(0, 8).toUpperCase()}</p>
              {batchInfo.isBatched && <GroupedDeliveryBadge />}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareOrderLink}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
              title="Copy order link"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setHelpModalOpen(true)}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Enhanced Live Status Banner with Smart ETA Range */}
        <EnhancedStatusBanner
          phase={dispatchStatus.phase}
          message={dispatchStatus.message}
          subMessage={dispatchStatus.subMessage}
          etaMinRange={order.driver_id ? smartEta.etaMinRange : null}
          etaMaxRange={order.driver_id ? smartEta.etaMaxRange : null}
          etaLabel={etaLabel}
          isLocationBased={smartEta.isLive}
          showEtaExplanation={true}
          isPrepLearned={learnedPrep.isLearned}
        />

        {/* Scheduled Delivery Banner */}
        {(order as any).is_scheduled && (order as any).deliver_by && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                <CalendarClock className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="font-bold text-violet-400 text-sm">Scheduled Delivery</p>
                <p className="text-sm text-zinc-400">
                  {format(new Date((order as any).deliver_by), "EEEE, MMMM d 'at' h:mm a")}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* High Demand Banner - show when demand is active for non-completed orders */}
        {deliveryFactors.demandActive && isActiveOrder && (
          <HighDemandBanner level={deliveryFactors.demandLevel} orderId={order.id} />
        )}

        {/* Low Driver Supply Banner - show when few drivers available (not when demand banner shows) */}
        {deliveryFactors.showLowSupplyWarning && isActiveOrder && (
          <LowDriverSupplyBanner
            supplyLevel={deliveryFactors.driverSupply}
            driverCount={deliveryFactors.nearbyDriverCount}
            orderId={order.id}
          />
        )}

        {/* Incentive Boost Banner - show when incentive period active and supply is good */}
        {deliveryFactors.showIncentiveBanner && isActiveOrder && (
          <IncentiveBoostBanner orderId={order.id} />
        )}

        {/* Prep Progress Banner - show during preparation phase */}
        {order.status === "preparing" && (
          <PrepProgressBanner
            status={prepProgress.status}
            progressPercent={prepProgress.progressPercent}
            isRunningFast={prepProgress.isRunningFast}
            isRunningSlow={prepProgress.isRunningSlow}
            speedMessage={prepProgress.speedMessage}
          />
        )}

        {/* Dispatch Search Banner - show when looking for a driver */}
        <AnimatePresence>
          {dispatchStatus.showSearching && isActiveOrder && (
            <DispatchSearchBanner orderId={order.id} />
          )}
        </AnimatePresence>

        {/* Grouped Delivery Banner - show when order is part of a batch with other stops first */}
        {batchInfo.isBatched && batchInfo.stopsBeforeCustomer > 0 && isActiveOrder && (
          <GroupedDeliveryBanner
            stopsBeforeCustomer={batchInfo.stopsBeforeCustomer}
            isDriverOnEarlierStop={batchInfo.isDriverOnEarlierStop}
            orderId={order.id}
          />
        )}
        {/* Delivery PIN Display - Customer sees PIN when order is out for delivery */}
        {order.status === "out_for_delivery" && order.delivery_pin && !order.delivery_pin_verified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-emerald-500/20 to-zinc-900 border border-emerald-500/30 rounded-2xl p-5 text-center"
          >
            <p className="text-sm text-zinc-400 mb-2">Give this PIN to your driver</p>
            <div className="text-4xl font-mono font-bold tracking-[0.5em] text-white">
              {order.delivery_pin}
            </div>
            <p className="text-xs text-zinc-500 mt-2">Driver must enter this to complete delivery</p>
          </motion.div>
        )}

        {/* ETA Countdown for active deliveries with location-based refresh */}
        {order.driver_id && order.eta_dropoff && order.status !== "delivered" && order.status !== "cancelled" && (
          <EtaCountdown
            etaDropoff={order.eta_dropoff}
            driverLat={driverLat}
            driverLng={driverLng}
            deliveryLat={order.delivery_lat ?? undefined}
            deliveryLng={order.delivery_lng ?? undefined}
            demandLevel={deliveryFactors.demandLevel}
            showDemandNote={deliveryFactors.demandActive}
            batchStopEta={batchInfo.customerStopEta}
            batchPosition={
              batchInfo.isBatched && batchInfo.customerStopOrder
                ? { current: batchInfo.customerStopOrder, total: batchInfo.totalStops }
                : null
            }
            supplyMultiplier={deliveryFactors.supplyMultiplier}
            nearbyDriverCount={deliveryFactors.nearbyDriverCount}
            showLowSupplyNote={deliveryFactors.driverSupply === "low"}
            incentiveMultiplier={deliveryFactors.incentiveMultiplier}
            showIncentiveNote={deliveryFactors.isIncentivePeriod && deliveryFactors.driverSupply === "high"}
            lastLocationUpdate={proximity.lastEtaUpdate.getTime()}
            isLocationBased={driverLat != null && driverLng != null}
          />
        )}

        {/* Stale Location Warning */}
        {isStale && order.status === "out_for_delivery" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3"
          >
            <p className="text-sm text-yellow-400 text-center">
              Updating driver location...
            </p>
          </motion.div>
        )}

        {/* Live Delivery Map */}
        {showMap && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DeliveryMap
              driverLat={driverLat}
              driverLng={driverLng}
              driverHeading={driverHeading}
              deliveryAddress={order.delivery_address || undefined}
              deliveryLat={order.delivery_lat ?? undefined}
              deliveryLng={order.delivery_lng ?? undefined}
              restaurantLat={(order.restaurants as any)?.lat}
              restaurantLng={(order.restaurants as any)?.lng}
              isLocationStale={isStale}
              className="h-48"
            />
          </motion.div>
        )}

        {/* Driver Info Card */}
        {driver && (
          <div className="space-y-3">
            <DriverInfoCard
              driver={driver}
              isDelivering={isDelivering}
              orderId={order.id}
              distanceToDelivery={distanceToDelivery}
            />
            {/* Chat button for active orders */}
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <OrderChatButton
                orderId={order.id}
                basePath="/eats/orders"
                className="w-full"
                showLabel
              />
            )}
          </div>
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
          <StatusTimeline 
            currentStatus={order.status} 
            timestamps={timestamps}
            driverId={order.driver_id}
            assignedAt={order.assigned_at}
            dispatchPhase={dispatchStatus.phase}
            prepProgressPercent={prepProgress.progressPercent}
          />
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
            {/* Masked call to restaurant for active orders */}
            {order.status !== "delivered" && order.status !== "cancelled" ? (
              <MaskedCallButton
                orderId={order.id}
                myRole="customer"
                targetRole="merchant"
                variant="icon"
              />
            ) : restaurantPhone ? (
              <a
                href={`tel:${restaurantPhone}`}
                className="w-10 h-10 rounded-full bg-eats/20 flex items-center justify-center"
              >
                <UtensilsCrossed className="w-4 h-4 text-eats" />
              </a>
            ) : null}
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
          
          {order.service_fee != null && order.service_fee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Service Fee</span>
              <span>${order.service_fee.toFixed(2)}</span>
            </div>
          )}
          
          {order.tax != null && order.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
          )}
          
          {order.tip_amount != null && order.tip_amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Tip</span>
              <span>${order.tip_amount.toFixed(2)}</span>
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

        {/* Get Help Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-orange-500/30 bg-zinc-900/80 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50"
            onClick={() => setHelpModalOpen(true)}
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            Get Help with This Order
          </Button>
        </motion.div>
      </div>

      {/* Help Modal */}
      <HelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
        orderId={order.id}
        restaurantPhone={restaurantPhone}
        restaurantName={restaurantName}
      />
    </div>
  );
}
