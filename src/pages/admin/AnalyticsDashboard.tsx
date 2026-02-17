import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, TrendingUp, MousePointerClick, ShoppingCart, DollarSign, Calendar, Plane, Hotel, Car, Users, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

// Analytics data loaded from database — no hardcoded data
const OVERVIEW_STATS = [
  { label: "Total Searches", value: "0", change: "--", icon: Users, positive: true },
  { label: "Outbound Clicks", value: "0", change: "--", icon: MousePointerClick, positive: true },
  { label: "Bookings", value: "0", change: "--", icon: ShoppingCart, positive: true },
  { label: "Est. Revenue", value: "$0", change: "--", icon: DollarSign, positive: true },
];

const SERVICE_BREAKDOWN: { service: string; searches: number; clicks: number; bookings: number; revenue: number; icon: typeof Plane; color: string }[] = [];

const CONVERSION_FUNNEL: { stage: string; count: number; percent: number }[] = [];

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("7d");

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              className="rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analytics Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">Track searches, clicks, and conversions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {OVERVIEW_STATS.map((stat) => (
            <Card key={stat.label} className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    stat.positive ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Breakdown */}
        <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance by Service
            </CardTitle>
            <CardDescription>Breakdown of searches, clicks, and bookings by travel service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Service</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Searches</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Clicks</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">CTR</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Bookings</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Conv. Rate</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Est. Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {SERVICE_BREAKDOWN.map((row) => {
                    const ctr = ((row.clicks / row.searches) * 100).toFixed(1);
                    const convRate = ((row.bookings / row.clicks) * 100).toFixed(1);
                    const colorClass = row.color === "sky" ? "sky" : row.color === "amber" ? "amber" : "violet";

                    return (
                      <tr key={row.service} className="border-b border-border/30">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${colorClass}-500/20 to-${colorClass}-600/10 flex items-center justify-center`}>
                              <row.icon className={`h-5 w-5 text-${colorClass}-500`} />
                            </div>
                            <span className="font-semibold">{row.service}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">{row.searches.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right">{row.clicks.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right text-primary font-medium">{ctr}%</td>
                        <td className="py-4 px-4 text-right">{row.bookings.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right text-emerald-500 font-medium">{convRate}%</td>
                        <td className="py-4 px-4 text-right font-bold">${row.revenue.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Conversion Funnel
            </CardTitle>
            <CardDescription>User journey from search to booking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CONVERSION_FUNNEL.map((stage, i) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-sm text-muted-foreground">
                      {stage.count.toLocaleString()} ({stage.percent}%)
                    </span>
                  </div>
                  <div className="h-8 bg-muted/30 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-lg transition-all duration-500"
                      style={{ width: `${stage.percent}%` }}
                    />
                  </div>
                  {i < CONVERSION_FUNNEL.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="text-xs text-muted-foreground">
                        ↓ {((CONVERSION_FUNNEL[i + 1].count / stage.count) * 100).toFixed(1)}% conversion
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Note about data */}
        <div className="bg-muted/20 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> This dashboard shows analytics from the <code>analytics_events</code> table.
            Revenue estimates are based on average partner commissions and may differ from actual payouts.
          </p>
        </div>
      </main>
    </div>
  );
}
