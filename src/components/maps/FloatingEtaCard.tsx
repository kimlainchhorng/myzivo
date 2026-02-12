/**
 * FloatingEtaCard Component
 * 
 * Compact glassmorphic ETA overlay for map views.
 * Shows ETA, distance, and traffic level indicator.
 */

import { memo } from "react";
import { Clock, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingEtaCardProps {
  etaMinutes: number | null;
  distanceMiles?: number | null;
  trafficLevel?: "light" | "moderate" | "heavy" | null;
  statusLabel?: string;
  className?: string;
}

const trafficColors: Record<string, string> = {
  light: "bg-emerald-500",
  moderate: "bg-yellow-500",
  heavy: "bg-red-500",
};

const FloatingEtaCard = memo(function FloatingEtaCard({
  etaMinutes,
  distanceMiles,
  trafficLevel,
  statusLabel,
  className,
}: FloatingEtaCardProps) {
  if (etaMinutes == null) return null;

  return (
    <div
      className={cn(
        "absolute top-3 right-3 z-20",
        "rounded-2xl border border-white/10 bg-background/70 backdrop-blur-xl shadow-lg",
        "px-4 py-3 min-w-[120px]",
        className
      )}
    >
      {/* Status label */}
      {statusLabel && (
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          {statusLabel}
        </p>
      )}

      {/* ETA */}
      <div className="flex items-baseline gap-1.5">
        <Clock className="w-3.5 h-3.5 text-emerald-500 self-center" />
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {etaMinutes}
        </span>
        <span className="text-xs text-muted-foreground">min</span>
      </div>

      {/* Distance + Traffic */}
      <div className="flex items-center gap-2 mt-1.5">
        {distanceMiles != null && (
          <div className="flex items-center gap-1">
            <Navigation className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground tabular-nums">
              {distanceMiles.toFixed(1)} mi
            </span>
          </div>
        )}
        {trafficLevel && (
          <div className="flex items-center gap-1">
            <div className={cn("w-2 h-2 rounded-full", trafficColors[trafficLevel] ?? "bg-muted")} />
            <span className="text-[10px] text-muted-foreground capitalize">{trafficLevel}</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default FloatingEtaCard;
