/**
 * UnifiedPerformancePanel — Cross-channel attribution + funnel + CSV export.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { useUnifiedPerformance, type DateRange } from "@/hooks/useUnifiedPerformance";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { toast } from "sonner";

const COLORS = ["hsl(var(--primary))", "hsl(217 91% 60%)", "hsl(142 71% 45%)"];

export default function UnifiedPerformancePanel({ storeId }: { storeId: string }) {
  const [range, setRange] = useState<DateRange>("30d");
  const { data, isLoading } = useUnifiedPerformance(storeId, range);

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ["Date", "Ads Revenue", "Marketing Revenue", "Organic Revenue"],
      ...data.series.map((s) => [s.date, s.ads.toFixed(2), s.marketing.toFixed(2), s.organic.toFixed(2)]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `performance-${range}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold">Unified performance</h3>
          <p className="text-[11px] text-muted-foreground">Cross-channel attribution & funnel</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={range} onValueChange={(v) => setRange(v as DateRange)}>
            <TabsList className="h-8">
              <TabsTrigger value="7d" className="h-7 text-xs">7d</TabsTrigger>
              <TabsTrigger value="30d" className="h-7 text-xs">30d</TabsTrigger>
              <TabsTrigger value="90d" className="h-7 text-xs">90d</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="w-3.5 h-3.5 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {isLoading || !data ? (
        <Card><CardContent className="py-12 text-center text-xs text-muted-foreground">Loading…</CardContent></Card>
      ) : (
        <>
          {/* Totals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Card className="p-3">
              <div className="text-[10px] text-muted-foreground">Ads revenue</div>
              <div className="text-lg font-bold">${(data.totals.ads_revenue_cents / 100).toFixed(0)}</div>
            </Card>
            <Card className="p-3">
              <div className="text-[10px] text-muted-foreground">Marketing rev</div>
              <div className="text-lg font-bold">${(data.totals.marketing_revenue_cents / 100).toFixed(0)}</div>
            </Card>
            <Card className="p-3">
              <div className="text-[10px] text-muted-foreground">Total spend</div>
              <div className="text-lg font-bold">${(data.totals.total_spend_cents / 100).toFixed(0)}</div>
            </Card>
            <Card className="p-3">
              <div className="text-[10px] text-muted-foreground">ROAS</div>
              <div className="text-lg font-bold">{data.totals.roas.toFixed(2)}x</div>
            </Card>
          </div>

          {/* Stacked area */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue attribution</CardTitle></CardHeader>
            <CardContent className="pb-4">
              <div className="h-48" role="img" aria-label="Daily revenue by source">
                <ResponsiveContainer>
                  <AreaChart data={data.series}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="ads" stackId="1" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="marketing" stackId="1" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="organic" stackId="1" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Funnel + Mix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Funnel</CardTitle></CardHeader>
              <CardContent className="space-y-2 pb-4">
                {[
                  { l: "Impressions", v: data.funnel.impressions, w: 100 },
                  { l: "Clicks", v: data.funnel.clicks, w: data.funnel.impressions ? (data.funnel.clicks / data.funnel.impressions) * 100 : 0 },
                  { l: "Add to cart", v: data.funnel.addToCart, w: data.funnel.impressions ? (data.funnel.addToCart / data.funnel.impressions) * 100 : 0 },
                  { l: "Purchases", v: data.funnel.purchases, w: data.funnel.impressions ? (data.funnel.purchases / data.funnel.impressions) * 100 : 0 },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>{s.l}</span>
                      <span className="font-semibold">{s.v.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${Math.max(2, s.w)}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Channel mix</CardTitle></CardHeader>
              <CardContent className="pb-4">
                <div className="h-40" role="img" aria-label="Channel mix pie chart">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={data.mix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={(e: any) => `${e.name}`}>
                        {data.mix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
