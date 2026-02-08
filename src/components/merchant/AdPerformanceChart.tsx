/**
 * Ad Performance Chart
 * Shows impressions and clicks over time
 */

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface AdPerformanceChartProps {
  restaurantId: string;
  days?: number;
}

const AdPerformanceChart = ({ restaurantId, days = 7 }: AdPerformanceChartProps) => {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);

  const { data: impressions } = useQuery({
    queryKey: ["ad-impressions-chart", restaurantId, days],
    queryFn: async () => {
      const { data } = await supabase
        .from("ad_impressions")
        .select("created_at")
        .eq("restaurant_id", restaurantId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());
      return data || [];
    },
  });

  const { data: clicks } = useQuery({
    queryKey: ["ad-clicks-chart", restaurantId, days],
    queryFn: async () => {
      const { data } = await supabase
        .from("ad_clicks")
        .select("created_at")
        .eq("restaurant_id", restaurantId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());
      return data || [];
    },
  });

  const chartData = useMemo(() => {
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    return dateRange.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayImpressions = (impressions || []).filter(
        (i) => i.created_at.split("T")[0] === dateStr
      ).length;
      const dayClicks = (clicks || []).filter(
        (c) => c.created_at.split("T")[0] === dateStr
      ).length;

      return {
        date: format(date, "MMM d"),
        impressions: dayImpressions,
        clicks: dayClicks,
      };
    });
  }, [impressions, clicks, startDate, endDate]);

  const hasData = chartData.some((d) => d.impressions > 0 || d.clicks > 0);

  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        No performance data yet. Start a campaign to see metrics!
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="impressions"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdPerformanceChart;
