/**
 * Busy Restaurant Banner
 * Contextual banner showing extended prep time when restaurant is busy
 */
import { useState } from "react";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusyRestaurantBannerProps {
  adjustedPrepTime: number | null;
  bonusMinutes: number | null;
  className?: string;
}

export function BusyRestaurantBanner({
  adjustedPrepTime,
  bonusMinutes,
  className,
}: BusyRestaurantBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const prepRange = adjustedPrepTime
    ? `${adjustedPrepTime}-${adjustedPrepTime + 10} min`
    : "40-50 min";

  return (
    <div
      className={cn(
        "relative bg-amber-500/10 border border-amber-500/30 rounded-xl p-4",
        className
      )}
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 hover:bg-amber-500/30 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="font-bold text-amber-400">
            High demand — longer preparation times.
          </p>
          <p className="text-sm text-zinc-400 mt-1">
            Expected wait: {prepRange}
            {bonusMinutes && (
              <span className="text-amber-400/80">
                {" "}(~{bonusMinutes} min longer)
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
