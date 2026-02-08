/**
 * Driver Info Card Component
 * Shows assigned driver details for food delivery
 */
import { Star, Car, Navigation } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { EatsDriver } from "@/hooks/useEatsDriver";
import { motion } from "framer-motion";
import { MaskedCallButton } from "./MaskedCallButton";

interface DriverInfoCardProps {
  driver: EatsDriver;
  isDelivering: boolean;
  orderId?: string;
  className?: string;
}

export function DriverInfoCard({ driver, isDelivering, orderId, className }: DriverInfoCardProps) {

  const initials = driver.full_name
    ? driver.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DR";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-4",
        className
      )}
    >
      {/* Header with "Driver Assigned" label */}
      <div className="flex items-center gap-2 mb-4">
        <div className={cn(
          "w-2 h-2 rounded-full",
          isDelivering ? "bg-orange-500 animate-pulse" : "bg-emerald-500"
        )} />
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
          {isDelivering ? "Driver En Route" : "Driver Assigned"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Avatar with animation when delivering */}
        <div className="relative">
          <Avatar className="w-14 h-14 border-2 border-orange-500/30">
            <AvatarImage src={driver.avatar_url || undefined} alt={driver.full_name || "Driver"} />
            <AvatarFallback className="bg-gradient-to-br from-orange-500/20 to-zinc-800 text-orange-400 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isDelivering && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center"
            >
              <Navigation className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </div>

        {/* Driver Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">
            {driver.full_name || "Your Driver"}
          </h3>
          
          {/* Rating */}
          {driver.rating && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm text-zinc-300">{driver.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Vehicle Info */}
          {(driver.vehicle_make || driver.vehicle_model) && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
              <Car className="w-3 h-3" />
              <span className="truncate">
                {[driver.vehicle_color, driver.vehicle_make, driver.vehicle_model]
                  .filter(Boolean)
                  .join(" ")}
              </span>
              {driver.license_plate && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="font-mono">{driver.license_plate}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Call Button - use masked if orderId provided, otherwise fallback to tel: */}
        {orderId ? (
          <MaskedCallButton
            orderId={orderId}
            myRole="customer"
            targetRole="driver"
            variant="icon"
            className="w-12 h-12"
          />
        ) : driver.phone && (
          <a
            href={`tel:${driver.phone}`}
            className="w-12 h-12 rounded-full bg-eats hover:bg-eats/90 flex items-center justify-center shrink-0"
          >
            <Navigation className="w-5 h-5 text-white" />
          </a>
        )}
      </div>

      {/* Arriving indicator */}
      {isDelivering && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
              />
            </div>
            <span className="text-xs text-orange-400 font-medium">On the way...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
