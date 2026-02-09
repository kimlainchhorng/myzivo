/**
 * OrderDelayBanner Component
 * Displays delay messaging to customers when orders are running late
 */
import { AlertTriangle, Clock, HelpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DelayLevel } from "@/hooks/useOrderDelayDetection";
import { cn } from "@/lib/utils";

interface OrderDelayBannerProps {
  delayLevel: DelayLevel;
  delayMinutes: number;
  newEtaMin: number | null;
  newEtaMax: number | null;
  onContactSupport?: () => void;
  className?: string;
}

const DELAY_CONFIG = {
  warning: {
    icon: Clock,
    title: null,
    bgClass: "bg-amber-500/10 border-amber-500/30",
    iconClass: "text-amber-400 bg-amber-500/20",
    textClass: "text-amber-400",
  },
  delayed: {
    icon: Clock,
    title: "ORDER DELAYED",
    bgClass: "bg-orange-500/10 border-orange-500/30",
    iconClass: "text-orange-400 bg-orange-500/20",
    textClass: "text-orange-400",
  },
  critical: {
    icon: AlertTriangle,
    title: "SIGNIFICANT DELAY",
    bgClass: "bg-red-500/10 border-red-500/30",
    iconClass: "text-red-400 bg-red-500/20",
    textClass: "text-red-400",
  },
};

const DELAY_MESSAGES = {
  warning: "Your order is running slightly behind schedule.",
  delayed: "Your order is taking longer than expected.",
  critical: "We apologize — your order is significantly delayed.",
};

export function OrderDelayBanner({
  delayLevel,
  delayMinutes,
  newEtaMin,
  newEtaMax,
  onContactSupport,
  className,
}: OrderDelayBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show for "none" level
  if (delayLevel === "none" || isDismissed) return null;

  const config = DELAY_CONFIG[delayLevel];
  const Icon = config.icon;
  const message = DELAY_MESSAGES[delayLevel];
  const showSupportButton = delayLevel === "critical" && onContactSupport;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
        animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        className={cn(
          "border rounded-2xl p-4 overflow-hidden",
          config.bgClass,
          className
        )}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              config.iconClass
            )}
          >
            <Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title for delayed/critical */}
            {config.title && (
              <p className={cn("text-xs font-bold tracking-wide mb-1", config.textClass)}>
                {config.title}
              </p>
            )}

            {/* Main message */}
            <p className="text-sm text-zinc-200">{message}</p>

            {/* Updated ETA */}
            {newEtaMin && newEtaMax && (
              <p className={cn("text-sm font-medium mt-2", config.textClass)}>
                Updated ETA: {newEtaMin}–{newEtaMax} min
              </p>
            )}

            {/* Supportive message */}
            {delayLevel !== "critical" && (
              <p className="text-xs text-zinc-500 mt-2">
                We're working to get your order to you ASAP.
              </p>
            )}

            {/* Support button for critical delays */}
            {showSupportButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={onContactSupport}
                className="mt-3 border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            )}
          </div>

          {/* Dismiss button (only for warning level) */}
          {delayLevel === "warning" && (
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-full hover:bg-white/10 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
