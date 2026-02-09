/**
 * Dispatch Search Banner Component
 * Animated banner shown when looking for a driver
 * Provides visibility into the driver matching process
 */
import { Search, Car, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DispatchSearchBannerProps {
  nearbyCount?: number | null;
  orderId: string;
  className?: string;
  matchedDriverName?: string | null;
  isMatched?: boolean;
}

function getMatchEstimate(count: number | null | undefined): string | null {
  if (count == null) return null;
  if (count >= 3) return "Usually matched in under 1 min";
  if (count >= 1) return "Usually matched in 1-2 min";
  return null;
}

export function DispatchSearchBanner({
  nearbyCount,
  orderId,
  className,
  matchedDriverName,
  isMatched,
}: DispatchSearchBannerProps) {
  const matchEstimate = getMatchEstimate(nearbyCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "rounded-2xl p-4 overflow-hidden border",
        isMatched
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-indigo-500/10 border-indigo-500/30",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isMatched ? (
          <motion.div
            key="matched"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-emerald-300">Matched!</h3>
              <p className="text-sm text-zinc-400 mt-0.5">
                {matchedDriverName
                  ? `${matchedDriverName} is heading to the restaurant`
                  : "Your driver is heading to the restaurant"}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center"
                >
                  <Search className="w-5 h-5 text-indigo-400" />
                </motion.div>
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

            <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full"
              />
            </div>

            {/* Nearby drivers count + match estimate */}
            {nearbyCount != null && nearbyCount > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-indigo-300">
                    {nearbyCount} driver{nearbyCount !== 1 ? "s" : ""} nearby
                  </span>
                </div>
                {matchEstimate && (
                  <span className="text-xs text-zinc-500">{matchEstimate}</span>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
