/**
 * Reassignment Banner Component
 * Shows dedicated messaging when driver is being reassigned
 * Provides transparency during the reassignment process
 */
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, CheckCircle, Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReassignmentBannerProps {
  isSearching: boolean;
  newDriverAssigned: boolean;
  nearbyCount?: number | null;
  className?: string;
}

export function ReassignmentBanner({
  isSearching,
  newDriverAssigned,
  nearbyCount,
  className,
}: ReassignmentBannerProps) {
  // Don't show if neither state is active
  if (!isSearching && !newDriverAssigned) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isSearching && (
        <motion.div
          key="searching"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 overflow-hidden",
            className
          )}
        >
          {/* Main content */}
          <div className="flex items-start gap-3">
            {/* Animated refresh icon */}
            <div className="relative shrink-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 text-amber-400" />
              </motion.div>
              {/* Pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-amber-400"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-300">
                Finding another driver near you...
              </h3>
              <p className="text-sm text-zinc-400 mt-0.5">
                Your previous driver had to cancel. We're finding someone new!
              </p>
            </div>
          </div>

          {/* Animated progress bar */}
          <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full"
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
              <Car className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300">
                {nearbyCount} driver{nearbyCount !== 1 ? "s" : ""} nearby
              </span>
            </motion.div>
          )}
        </motion.div>
      )}

      {newDriverAssigned && !isSearching && (
        <motion.div
          key="assigned"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            "bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4",
            className
          )}
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 200 }}
              className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-emerald-300">
                New driver assigned!
              </h3>
              <p className="text-sm text-zinc-400">
                Your order is back on track
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
