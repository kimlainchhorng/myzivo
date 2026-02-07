/**
 * Demand Heatmap Component
 * Displays orders by zone and hour as a heatmap
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeatmapData {
  zones: string[];
  hours: number[];
  data: Array<{
    zone_code: string;
    hour: number;
    orders_count: number;
  }>;
}

interface DemandHeatmapProps {
  data: HeatmapData | undefined;
  isLoading: boolean;
}

const DemandHeatmap = ({ data, isLoading }: DemandHeatmapProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demand Heatmap (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.zones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demand Heatmap (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p>No demand data available yet</p>
            <p className="text-sm">Data will appear as orders are processed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find max value for color scaling
  const maxCount = Math.max(...data.data.map((d) => d.orders_count), 1);

  // Create lookup map for quick access
  const dataMap = new Map<string, number>();
  for (const d of data.data) {
    dataMap.set(`${d.zone_code}-${d.hour}`, d.orders_count);
  }

  // Get color intensity based on count
  const getColor = (count: number) => {
    if (count === 0) return "bg-muted";
    const intensity = count / maxCount;
    if (intensity >= 0.8) return "bg-red-500";
    if (intensity >= 0.6) return "bg-orange-500";
    if (intensity >= 0.4) return "bg-amber-500";
    if (intensity >= 0.2) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Format hour display
  const formatHour = (hour: number) => {
    if (hour === 0) return "12a";
    if (hour === 12) return "12p";
    if (hour < 12) return `${hour}a`;
    return `${hour - 12}p`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demand Heatmap (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-sm font-medium text-muted-foreground sticky left-0 bg-background">
                  Zone
                </th>
                {data.hours.map((hour) => (
                  <th
                    key={hour}
                    className="p-1 text-center text-xs font-medium text-muted-foreground min-w-[32px]"
                  >
                    {formatHour(hour)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.zones.map((zone) => (
                <tr key={zone}>
                  <td className="p-2 text-sm font-medium sticky left-0 bg-background border-r border-border">
                    {zone}
                  </td>
                  {data.hours.map((hour) => {
                    const count = dataMap.get(`${zone}-${hour}`) || 0;
                    return (
                      <td key={hour} className="p-1">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-sm mx-auto flex items-center justify-center text-xs font-medium",
                            getColor(count),
                            count > 0 ? "text-white" : "text-muted-foreground"
                          )}
                          title={`${zone} @ ${formatHour(hour)}: ${count} orders`}
                        >
                          {count > 0 ? count : ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-6 text-sm">
          <span className="text-muted-foreground">Low</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-500" />
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <div className="w-4 h-4 rounded bg-amber-500" />
            <div className="w-4 h-4 rounded bg-orange-500" />
            <div className="w-4 h-4 rounded bg-red-500" />
          </div>
          <span className="text-muted-foreground">High</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemandHeatmap;
