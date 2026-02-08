/**
 * Ad Revenue Chart
 * Shows daily ad revenue over time
 */

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAdsRevenue } from "@/hooks/useRestaurantAds";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface AdRevenueChartProps {
  days?: number;
}

const AdRevenueChart = ({ days = 30 }: AdRevenueChartProps) => {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);

  const { data: revenue, isLoading } = useAdsRevenue({
    from: startDate,
    to: endDate,
  });

  const chartData = useMemo(() => {
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    const revenueByDay = new Map(
      (revenue?.byDay || []).map((d) => [d.date, d.revenue])
    );

    return dateRange.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      return {
        date: format(date, "MMM d"),
        revenue: revenueByDay.get(dateStr) || 0,
      };
    });
  }, [revenue, startDate, endDate]);

  const hasData = chartData.some((d) => d.revenue > 0);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Loading revenue data...
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No revenue data yet.
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={(value) => `$${value}`}
            className="text-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdRevenueChart;
