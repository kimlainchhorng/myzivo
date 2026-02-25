/**
 * Multi-Stop Tracking Progress
 * Shows route progress for multi-stop orders
 */

import { MapPin, Check, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface TrackingStop {
  stopOrder: number;
  address: string;
  status: "pending" | "current" | "delivered";
  deliveredAt?: string | null;
  instructions?: string;
}

interface MultiStopTrackingProgressProps {
  stops: TrackingStop[];
  currentStopIndex: number;
  className?: string;
}

export function MultiStopTrackingProgress({
  stops,
  currentStopIndex,
  className,
}: MultiStopTrackingProgressProps) {
  if (stops.length <= 1) return null;
  
  const totalStops = stops.length;
  const deliveredCount = stops.filter((s) => s.status === "delivered").length;
  const allDelivered = deliveredCount === totalStops;
  
  return (
    <div className={cn("bg-zinc-900 rounded-2xl p-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-eats" />
        <span className="text-sm font-semibold text-white">Route Progress</span>
        <span className="text-xs text-zinc-500 ml-auto">
          {deliveredCount}/{totalStops} stops
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1.5 bg-zinc-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-eats to-orange-500 transition-all duration-500"
          style={{ width: `${(deliveredCount / totalStops) * 100}%` }}
        />
      </div>
      
      {/* Status Message */}
      {allDelivered ? (
        <div className="flex items-center gap-2 text-emerald-400 mb-4">
          <Check className="w-5 h-5" />
          <span className="font-semibold">All {totalStops} stops delivered!</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-eats mb-4 flex-wrap">
          {deliveredCount > 0 && (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm">
                Delivered Stop {deliveredCount}
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-500" />
            </>
          )}
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">
            Heading to Stop {currentStopIndex + 1}
          </span>
        </div>
      )}
      
      {/* Stop List */}
      <div className="space-y-3">
        {stops.map((stop, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 py-2 px-3 rounded-xl transition-all duration-200",
              stop.status === "current" && "bg-eats/10 border border-eats/30",
              stop.status === "delivered" && "bg-emerald-500/10",
              stop.status === "pending" && "opacity-60"
            )}
          >
            {/* Stop Indicator */}
            <div className="shrink-0 mt-0.5">
              {stop.status === "delivered" ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : stop.status === "current" ? (
                <div className="w-6 h-6 rounded-full bg-eats flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                  {stop.stopOrder}
                </div>
              )}
            </div>
            
            {/* Stop Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  Stop {stop.stopOrder}
                </span>
                {stop.status === "current" && (
                  <span className="text-xs text-eats">Arriving...</span>
                )}
              </div>
              <p className="text-sm text-zinc-400 truncate">{stop.address}</p>
              {stop.status === "delivered" && stop.deliveredAt && (
                <p className="text-xs text-emerald-400 mt-0.5">
                  Delivered {format(new Date(stop.deliveredAt), "h:mm a")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
