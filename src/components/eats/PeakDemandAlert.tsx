/**
 * PeakDemandAlert — Proactive dismissible banner for predicted high demand or low coverage
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PeakDemandAlertProps {
  isHighDemand: boolean;
  isLowCoverage: boolean;
  alertMessage: string | null;
  coverageMessage: string | null;
  isSystemResponding?: boolean;
  storageKey?: string;
  className?: string;
}

export function PeakDemandAlert({
  isHighDemand,
  isLowCoverage,
  alertMessage,
  coverageMessage,
  isSystemResponding,
  storageKey = "peak-demand-alert",
  className,
}: PeakDemandAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(storageKey);
    if (dismissed === "true") setIsDismissed(true);
  }, [storageKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(storageKey, "true");
  };

  if (isDismissed || (!isHighDemand && !isLowCoverage)) return null;

  // Prioritize high demand over low coverage
  const showHighDemand = isHighDemand && !!alertMessage;
  const title = showHighDemand ? "High demand expected soon" : "Limited delivery coverage";
  const body = showHighDemand
    ? "Order early for the fastest delivery."
    : "Fewer drivers available — delivery times may vary.";
  const Icon = showHighDemand ? TrendingUp : AlertTriangle;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className={cn(
          "rounded-2xl p-4 border backdrop-blur-sm relative overflow-hidden",
          showHighDemand
            ? "bg-amber-500/10 border-amber-500/30"
            : "bg-yellow-500/10 border-yellow-500/30",
          className
        )}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all duration-200"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
            showHighDemand ? "bg-amber-500/20" : "bg-yellow-500/20"
          )}>
            <Icon className={cn(
              "w-5 h-5",
              showHighDemand ? "text-amber-500" : "text-yellow-500"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-bold text-sm",
              showHighDemand ? "text-amber-400" : "text-yellow-400"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-xs mt-1",
              showHighDemand ? "text-amber-300/70" : "text-yellow-300/70"
            )}>
              {body}
            </p>
            {isSystemResponding && (
              <p className={cn(
                "text-xs mt-1",
                showHighDemand ? "text-amber-300/70" : "text-yellow-300/70"
              )}>
                We're pre-positioning drivers to keep things moving.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
