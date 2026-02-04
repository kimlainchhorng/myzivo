/**
 * UrgencyBanner - Conversion boost component for price/availability urgency
 */

import { useState, useEffect } from "react";
import { X, TrendingUp, AlertTriangle, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type UrgencyType = "price_increase" | "limited_availability" | "session_expiring" | "high_demand";

interface UrgencyBannerProps {
  type?: UrgencyType;
  seatsLeft?: number;
  expiresInMinutes?: number;
  onDismiss?: () => void;
  onAction?: () => void;
  className?: string;
  sticky?: boolean;
}

const urgencyConfig: Record<UrgencyType, {
  icon: typeof TrendingUp;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  price_increase: {
    icon: TrendingUp,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  limited_availability: {
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
  },
  session_expiring: {
    icon: Clock,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  high_demand: {
    icon: Flame,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800",
  },
};

export function UrgencyBanner({
  type = "price_increase",
  seatsLeft,
  expiresInMinutes,
  onDismiss,
  onAction,
  className,
  sticky = false,
}: UrgencyBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(expiresInMinutes ? expiresInMinutes * 60 : 0);

  useEffect(() => {
    if (type !== "session_expiring" || !expiresInMinutes) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [type, expiresInMinutes]);

  if (dismissed) return null;

  const config = urgencyConfig[type];
  const Icon = config.icon;

  const getMessage = () => {
    switch (type) {
      case "price_increase":
        return "Prices may increase — complete your booking now";
      case "limited_availability":
        return seatsLeft
          ? `Only ${seatsLeft} seat${seatsLeft > 1 ? "s" : ""} left at this price`
          : "Limited availability at this price";
      case "session_expiring":
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        return `Your selected offer expires in ${mins}:${secs.toString().padStart(2, "0")}`;
      case "high_demand":
        return "High demand route — prices changing frequently";
      default:
        return "Complete your booking to lock in this price";
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-between gap-3 px-4 py-3 rounded-lg border",
        config.bgColor,
        config.borderColor,
        sticky && "sticky top-0 z-40",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("shrink-0", config.color)}>
          <Icon className="w-5 h-5" />
        </div>
        <p className={cn("text-sm font-medium", config.color)}>
          {getMessage()}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onAction && (
          <Button size="sm" onClick={onAction} className="h-8">
            Book Now
          </Button>
        )}
        <button
          onClick={handleDismiss}
          className={cn(
            "p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors",
            config.color
          )}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Compact inline version
export function UrgencyNotice({
  message = "Prices may change based on demand. Book now to lock in your rate.",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <TrendingUp className="w-4 h-4 text-amber-500 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default UrgencyBanner;
