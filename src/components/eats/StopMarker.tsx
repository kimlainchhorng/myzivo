/**
 * Stop Marker Component
 * Numbered marker for multi-stop delivery maps
 */

import { cn } from "@/lib/utils";

interface StopMarkerProps {
  stopNumber: number;
  status: "pending" | "current" | "delivered";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StopMarker({
  stopNumber,
  status,
  size = "md",
  className,
}: StopMarkerProps) {
  const sizeClasses = {
    sm: "w-5 h-5 text-[10px]",
    md: "w-7 h-7 text-xs",
    lg: "w-9 h-9 text-sm",
  };
  
  const statusClasses = {
    pending: "bg-zinc-600 text-zinc-300 border-zinc-500",
    current: "bg-eats text-white border-white shadow-lg shadow-eats/30",
    delivered: "bg-emerald-500 text-white border-white",
  };
  
  return (
    <div
      className={cn(
        "rounded-full font-bold flex items-center justify-center border-2 transition-all",
        sizeClasses[size],
        statusClasses[status],
        status === "current" && "animate-pulse",
        className
      )}
    >
      {status === "delivered" ? "✓" : stopNumber}
    </div>
  );
}

/**
 * Get Google Maps marker icon for a stop
 */
export function getStopMarkerIcon(
  stopNumber: number,
  status: "pending" | "current" | "delivered"
): google.maps.Symbol {
  const colors = {
    pending: { fill: "#52525b", stroke: "#71717a" },
    current: { fill: "#f97316", stroke: "#ffffff" },
    delivered: { fill: "#22c55e", stroke: "#ffffff" },
  };
  
  const color = colors[status];
  
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: status === "current" ? 12 : 10,
    fillColor: color.fill,
    fillOpacity: 1,
    strokeColor: color.stroke,
    strokeWeight: status === "current" ? 3 : 2,
    labelOrigin: new google.maps.Point(0, 0),
  };
}

/**
 * Create marker label for a stop
 */
export function getStopMarkerLabel(
  stopNumber: number,
  status: "pending" | "current" | "delivered"
): google.maps.MarkerLabel {
  return {
    text: status === "delivered" ? "✓" : String(stopNumber),
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "11px",
  };
}
