/**
 * GroupedDeliveryBanner — Contextual message when order is part of a grouped delivery
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Truck, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupedDeliveryBannerProps {
  stopsBeforeCustomer: number;
  isDriverOnEarlierStop: boolean;
  orderId: string;
  className?: string;
}

export function GroupedDeliveryBanner({
  stopsBeforeCustomer,
  isDriverOnEarlierStop,
  orderId,
  className,
}: GroupedDeliveryBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if already dismissed this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem(`grouped-banner-${orderId}`);
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, [orderId]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(`grouped-banner-${orderId}`, "true");
  };

  // Don't show if dismissed or no stops before customer
  if (isDismissed || stopsBeforeCustomer <= 0) {
    return null;
  }

  // Determine message based on context
  const isNextStop = stopsBeforeCustomer === 1 && !isDriverOnEarlierStop;
  const hasMultipleStops = stopsBeforeCustomer > 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className={cn(
          "rounded-2xl p-4 border backdrop-blur-sm relative overflow-hidden",
          "bg-blue-500/10 border-blue-500/30",
          className
        )}
      >
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            {isNextStop ? (
              <Truck className="w-5 h-5 text-blue-400" />
            ) : (
              <Package className="w-5 h-5 text-blue-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-blue-400">
              Grouped delivery
            </p>
            <p className="text-xs mt-1 text-blue-300/70">
              {isNextStop ? (
                "Driver is heading to you next!"
              ) : hasMultipleStops ? (
                `Your driver has ${stopsBeforeCustomer} stops before yours. ETA updates as each delivery completes.`
              ) : (
                "Your driver is completing another nearby delivery first."
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
