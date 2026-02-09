/**
 * Prep Progress Banner Component
 * Visual indicator showing preparation progress with speed context
 */
import { motion } from "framer-motion";
import { ChefHat, Flame, Sparkles, Check, Zap, Hourglass } from "lucide-react";
import type { PrepStatus } from "@/hooks/usePrepProgress";
import { cn } from "@/lib/utils";

interface PrepProgressBannerProps {
  status: PrepStatus;
  progressPercent: number;
  isRunningFast?: boolean;
  isRunningSlow?: boolean;
  speedMessage?: string | null;
  className?: string;
}

// Status-specific styling
const STATUS_CONFIG: Record<PrepStatus, {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
  progressColor: string;
}> = {
  starting: {
    icon: ChefHat,
    label: "Starting your order",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    progressColor: "bg-orange-500",
  },
  preparing: {
    icon: Flame,
    label: "Preparing your order",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    progressColor: "bg-orange-500",
  },
  almost_ready: {
    icon: Sparkles,
    label: "Almost ready!",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    progressColor: "bg-amber-500",
  },
  ready: {
    icon: Check,
    label: "Ready for pickup!",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    progressColor: "bg-emerald-500",
  },
};

export function PrepProgressBanner({
  status,
  progressPercent,
  isRunningFast = false,
  isRunningSlow = false,
  speedMessage,
  className,
}: PrepProgressBannerProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border border-white/10 p-4",
        config.bg,
        className
      )}
    >
      {/* Header with icon and label */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          config.bg,
          "border border-white/10"
        )}>
          <Icon className={cn("w-5 h-5", config.color, status !== "ready" && "animate-pulse")} />
        </div>
        <div className="flex-1">
          <p className={cn("font-bold text-sm", config.color)}>
            {config.label}
          </p>
          <p className="text-xs text-zinc-500">
            {progressPercent}% complete
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("h-full rounded-full", config.progressColor)}
        />
      </div>

      {/* Speed message */}
      {speedMessage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 flex items-center gap-2"
        >
          {isRunningFast && (
            <>
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400">{speedMessage}</span>
            </>
          )}
          {isRunningSlow && (
            <>
              <Hourglass className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400">{speedMessage}</span>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
