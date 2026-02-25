/**
 * Peak Hours Grid Component
 * Visual heatmap-style grid showing order volume by hour
 */

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { PeakHoursData } from "@/lib/analytics";

interface PeakHoursGridProps {
  data: PeakHoursData[];
  className?: string;
}

const PeakHoursGrid = ({ data, className }: PeakHoursGridProps) => {
  // Get max orders for color scaling
  const maxOrders = useMemo(() => {
    return Math.max(...data.map((d) => d.orders), 1);
  }, [data]);

  // Get color intensity based on value
  const getIntensityClass = (orders: number) => {
    const ratio = orders / maxOrders;
    if (ratio === 0) return "bg-muted/30";
    if (ratio < 0.2) return "bg-cyan-500/20";
    if (ratio < 0.4) return "bg-green-500/30";
    if (ratio < 0.6) return "bg-yellow-500/40";
    if (ratio < 0.8) return "bg-orange-500/50";
    return "bg-red-500/60";
  };

  // Filter to reasonable hours (6am - 11pm)
  const filteredData = data.filter((d) => d.hour >= 6 && d.hour <= 23);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Grid */}
      <div className="grid grid-cols-6 gap-2">
        {filteredData.map((hourData) => (
          <div
            key={hourData.hour}
            className={cn(
              "aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 cursor-default",
              getIntensityClass(hourData.orders)
            )}
            title={`${hourData.label}: ${hourData.orders} orders, $${hourData.revenue.toLocaleString()}`}
          >
            <span className="text-xs font-medium">{hourData.label}</span>
            <span className="text-lg font-bold">{hourData.orders}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <span className="text-xs text-muted-foreground">Low</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-muted/30" />
          <div className="w-4 h-4 rounded bg-cyan-500/20" />
          <div className="w-4 h-4 rounded bg-green-500/30" />
          <div className="w-4 h-4 rounded bg-yellow-500/40" />
          <div className="w-4 h-4 rounded bg-orange-500/50" />
          <div className="w-4 h-4 rounded bg-red-500/60" />
        </div>
        <span className="text-xs text-muted-foreground">High</span>
      </div>
    </div>
  );
};

export default PeakHoursGrid;
