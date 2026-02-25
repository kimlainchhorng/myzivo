import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import type { UptimeLogEntry } from "@/hooks/useSystemHealthDashboard";

interface UptimeChartProps {
  logs: UptimeLogEntry[];
  isLoading: boolean;
}

export default function UptimeChart({ logs, isLoading }: UptimeChartProps) {
  const chartData = useMemo(() => {
    if (!logs.length) return [];

    // Group by day and count status changes
    const byDay: Record<string, { date: string; operational: number; degraded: number; down: number }> = {};

    logs.forEach((log) => {
      const day = format(new Date(log.changed_at), "MMM dd");
      if (!byDay[day]) {
        byDay[day] = { date: day, operational: 0, degraded: 0, down: 0 };
      }
      if (log.new_status === "operational") byDay[day].operational++;
      else if (log.new_status === "degraded") byDay[day].degraded++;
      else byDay[day].down++;
    });

    return Object.values(byDay).reverse();
  }, [logs]);

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  if (!chartData.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm rounded-xl border border-border/50 bg-card/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
        No status changes recorded yet
      </div>
    );
  }

  return (
    <div className="h-64 rounded-xl border border-border/50 bg-card/50 p-4 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Area type="monotone" dataKey="operational" stackId="1" stroke="#34d399" fill="#34d399" fillOpacity={0.3} />
          <Area type="monotone" dataKey="degraded" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.3} />
          <Area type="monotone" dataKey="down" stackId="1" stroke="#f87171" fill="#f87171" fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
