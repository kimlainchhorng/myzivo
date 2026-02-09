/**
 * OrderEditBanner Component
 * Prominent banner showing edit availability with countdown timer
 * Color-coded urgency: Blue > 60s, Amber 30-60s, Red < 30s
 */
import { motion } from "framer-motion";
import { Edit3, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrderEditBannerProps {
  remainingSeconds: number;
  remainingDisplay: string;
  urgency: "normal" | "warning" | "critical";
  onEditClick: () => void;
  onCancelClick: () => void;
  className?: string;
}

export function OrderEditBanner({
  remainingSeconds,
  remainingDisplay,
  urgency,
  onEditClick,
  onCancelClick,
  className,
}: OrderEditBannerProps) {
  // Urgency-based styling
  const urgencyStyles = {
    normal: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      iconBg: "bg-cyan-500/20",
      iconColor: "text-cyan-400",
      timerColor: "text-cyan-400",
      pulse: "",
    },
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
      timerColor: "text-amber-400",
      pulse: "animate-pulse",
    },
    critical: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
      timerColor: "text-red-400",
      pulse: "animate-pulse",
    },
  };

  const styles = urgencyStyles[urgency];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      className={cn(
        "rounded-2xl border p-4",
        styles.bg,
        styles.border,
        className
      )}
    >
      {/* Header with icon and timer */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", styles.iconBg)}>
          <Edit3 className={cn("w-5 h-5", styles.iconColor)} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">You can edit or cancel this order</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock className={cn("w-3.5 h-3.5", styles.timerColor, styles.pulse)} />
            <span className={cn("text-sm font-mono font-bold", styles.timerColor, styles.pulse)}>
              {remainingDisplay}
            </span>
            <span className="text-xs text-zinc-500">remaining</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onEditClick}
          variant="outline"
          className={cn(
            "flex-1 h-10 rounded-xl text-sm font-medium",
            "bg-white/5 border-white/10 hover:bg-white/10",
            styles.iconColor
          )}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Items
        </Button>
        <Button
          onClick={onCancelClick}
          variant="outline"
          className="flex-1 h-10 rounded-xl text-sm font-medium bg-white/5 border-white/10 hover:bg-red-500/10 hover:border-red-500/30 text-red-400"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel Order
        </Button>
      </div>
    </motion.div>
  );
}
