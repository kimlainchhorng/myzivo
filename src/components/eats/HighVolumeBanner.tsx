/**
 * High Volume Banner
 * Shows warning when restaurant has high order queue
 */
import { useState } from "react";
import { ClipboardList, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HighVolumeBannerProps {
  queueLength: number;
  estimatedWait: number;
  isVeryHigh?: boolean;
  className?: string;
}

export function HighVolumeBanner({
  queueLength,
  estimatedWait,
  isVeryHigh = false,
  className,
}: HighVolumeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "relative rounded-xl p-4 border",
        isVeryHigh
          ? "bg-red-500/10 border-red-500/30"
          : "bg-amber-500/10 border-amber-500/30",
        className
      )}
    >
      <button
        onClick={() => setDismissed(true)}
        className={cn(
          "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
          isVeryHigh
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
        )}
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
            isVeryHigh ? "bg-red-500/20" : "bg-amber-500/20"
          )}
        >
          <ClipboardList
            className={cn(
              "w-5 h-5",
              isVeryHigh ? "text-red-400" : "text-amber-400"
            )}
          />
        </div>
        <div>
          <p
            className={cn(
              "font-bold",
              isVeryHigh ? "text-red-400" : "text-amber-400"
            )}
          >
            {isVeryHigh
              ? "Very high demand — expect extended wait times."
              : "High order volume — preparation may take longer."}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {queueLength > 0 && (
              <>
                {queueLength} order{queueLength !== 1 ? "s" : ""} ahead of yours.{" "}
              </>
            )}
            {estimatedWait > 0 && (
              <span className={isVeryHigh ? "text-red-400/80" : "text-amber-400/80"}>
                ~{estimatedWait} min before your order starts.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
