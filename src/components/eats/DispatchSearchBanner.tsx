/**
 * Dispatch Search Banner Component
 * Animated banner shown when looking for a driver
 * Provides visibility into the driver matching process
 */
import { Search, Car } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DispatchSearchBannerProps {
  nearbyCount?: number | null;
  orderId: string;
  className?: string;
}

export function DispatchSearchBanner({
  nearbyCount,
  orderId,
  className,
}: DispatchSearchBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 overflow-hidden",
        className
      )}
    >
      {/* Main content */}
      <div className="flex items-start gap-3">
        {/* Animated search icon */}
        <div className="relative shrink-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center"
          >
            <Search className="w-5 h-5 text-indigo-400" />
          </motion.div>
          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-indigo-400"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-indigo-300">
            Finding the best driver near you...
          </h3>
          <p className="text-sm text-zinc-400 mt-0.5">
            We're matching you with a nearby driver
          </p>
        </div>
      </div>

      {/* Animated progress bar */}
      <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full"
        />
      </div>

      {/* Nearby drivers count */}
      {nearbyCount != null && nearbyCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 flex items-center gap-2"
        >
          <Car className="w-4 h-4 text-indigo-400" />
          <span className="text-sm text-indigo-300">
            {nearbyCount} driver{nearbyCount !== 1 ? "s" : ""} nearby
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
