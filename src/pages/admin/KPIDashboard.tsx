/**
 * KPI DASHBOARD
 * Data-driven decision making for ZIVO
 * 
 * Core metrics: Visitors → Searches → Clicks → Bookings → Revenue
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Users,
  Search,
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  Plane,
  Hotel,
  Car,
  MapPin,
  Package,
  Smartphone,
  Monitor,
  Tablet,
  Bell,
  Shield,
  Globe,
  Mail,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { usePeriodComparison } from "@/hooks/useKPIDashboard";
import {
  CONVERSION_BENCHMARKS,
  TRAFFIC_SOURCES,
  PRODUCT_CATEGORIES,
  getConversionHealth,
  formatMetricValue,
} from "@/config/analyticsKPIs";
import { subDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DATE_RANGES = [
  { label: "Today", days: 0 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

const PRODUCT_ICONS: Record<string, React.ElementType> = {
  flights: Plane,
  hotels: Hotel,
  cars: Car,
  activities: MapPin,
  addons: Package,
};

const DEVICE_ICONS: Record<string, React.ElementType> = {
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
};

const SOURCE_ICONS: Record<string, React.ElementType> = {
  seo: Globe,
  paid: MousePointerClick,
  social: Share2,
  direct: Users,
  email: Mail,
  referral: Share2,
};

export default function KPIDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDays, setSelectedDays] = useState(7);
  
  const dateRange = {
    start: subDays(new Date(), selectedDays),
    end: new Date(),
  };
  
  const { current, changes, isLoading } = usePeriodComparison(dateRange);
  
  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your analytics report is being generated...",
    });
  };

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
                KPI Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">Run ZIVO by data, not assumptions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedDays.toString()}
              onValueChange={(v) => setSelectedDays(parseInt(v))}
            >
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGES.map((range) => (
                  <SelectItem key={range.days} value={range.days.toString()}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Primary KPIs - Golden Funnel */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard
            title="Visitors"
            value={current.dailyMetrics?.visitors || 0}
            change={changes?.visitors}
            icon={Users}
            loading={isLoading}
            format="number"
          />
          <KPICard
            title="Searches"
            value={current.dailyMetrics?.searches || 0}
            change={changes?.searches}
            icon={Search}
            loading={isLoading}
            format="number"
          />
          <KPICard
            title="Clicks"
            value={current.dailyMetrics?.clicks || 0}
            change={changes?.clicks}
            icon={MousePointerClick}
            loading={isLoading}
            format="number"
          />
          <KPICard
            title="Bookings"
            value={current.dailyMetrics?.bookings || 0}
            change={changes?.bookings}
            icon={ShoppingCart}
            loading={isLoading}
            format="number"
          />
          <KPICard
            title="Revenue"
            value={current.dailyMetrics?.revenue || 0}
            change={changes?.revenue}
            icon={DollarSign}
            loading={isLoading}
            format="currency"
            highlight
          />
          <Card className="bg-gradient-to-br from-primary/10 to-teal-400/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Top Route</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <p className="font-bold text-sm truncate">
                  {current.dailyMetrics?.topRoute || "N/A"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Conversion Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Conversion Rates
            </CardTitle>
            <CardDescription>
              Monitor your funnel health against benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {CONVERSION_BENCHMARKS.map((benchmark) => {
                const value = current.conversionRates
                  ? (current.conversionRates as any)[
                      benchmark.metric.replace(/_([a-z])/g, (_, l) => l.toUpperCase())
                    ] || 0
                  : 0;
                const health = getConversionHealth(value, benchmark);
                
                return (
                  <ConversionCard
                    key={benchmark.metric}
                    label={`${benchmark.from} → ${benchmark.to}`}
                    value={value}
                    benchmark={benchmark}
                    health={health}
                    loading={isLoading}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[250px]" />
                  ) : (
                    <div className="space-y-4">
                      {current.revenueByCategory?.map((cat, i) => {
                        const config = PRODUCT_CATEGORIES.find(p => p.id === cat.category);
                        const Icon = PRODUCT_ICONS[cat.category] || Package;
                        const total = current.revenueByCategory?.reduce((s, c) => s + c.revenue, 0) || 1;
                        const percentage = (cat.revenue / total) * 100;
                        
                        return (
                          <div key={cat.category}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: `${config?.color}20` }}
                                >
                                  <Icon className="w-4 h-4" style={{ color: config?.color }} />
                                </div>
                                <span className="font-medium capitalize">{cat.category}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold">${cat.revenue.toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({cat.bookings} bookings)
                                </span>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Revenue Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[250px]" />
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <MetricBox
                        label="Revenue per Booking"
                        value={
                          current.dailyMetrics && current.dailyMetrics.bookings > 0
                            ? current.dailyMetrics.revenue / current.dailyMetrics.bookings
                            : 0
                        }
                        format="currency"
                      />
                      <MetricBox
                        label="Revenue per User"
                        value={
                          current.dailyMetrics && current.dailyMetrics.visitors > 0
                            ? current.dailyMetrics.revenue / current.dailyMetrics.visitors
                            : 0
                        }
                        format="currency"
                      />
                      <MetricBox
                        label="Daily Revenue"
                        value={(current.dailyMetrics?.revenue || 0) / Math.max(selectedDays, 1)}
                        format="currency"
                      />
                      <MetricBox
                        label="Click Value"
                        value={
                          current.dailyMetrics && current.dailyMetrics.clicks > 0
                            ? current.dailyMetrics.revenue / current.dailyMetrics.clicks
                            : 0
                        }
                        format="currency"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Traffic Tab */}
          <TabsContent value="traffic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Traffic Quality by Source</CardTitle>
                <CardDescription>
                  High bounce rate or zero-click traffic = affiliate risk
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px]" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-3 px-2 font-semibold text-sm">Source</th>
                          <th className="text-right py-3 px-2 font-semibold text-sm">Visitors</th>
                          <th className="text-right py-3 px-2 font-semibold text-sm">Searches</th>
                          <th className="text-right py-3 px-2 font-semibold text-sm">Clicks</th>
                          <th className="text-right py-3 px-2 font-semibold text-sm">Bookings</th>
                          <th className="text-right py-3 px-2 font-semibold text-sm">Revenue</th>
                          <th className="text-right py-3 px-2 font-semibold text-sm">Bounce</th>
                        </tr>
                      </thead>
                      <tbody>
                        {current.trafficBySource?.map((source) => {
                          const config = TRAFFIC_SOURCES.find(s => s.id === source.source);
                          const Icon = SOURCE_ICONS[source.source] || Globe;
                          const isBounceHigh = source.bounceRate > 60;
                          
                          return (
                            <tr key={source.source} className="border-b border-border/30">
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${config?.color || '#888'}20` }}
                                  >
                                    <Icon className="w-4 h-4" style={{ color: config?.color }} />
                                  </div>
                                  <span className="font-medium capitalize">{source.source}</span>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-right">{source.visitors.toLocaleString()}</td>
                              <td className="py-3 px-2 text-right">{source.searches.toLocaleString()}</td>
                              <td className="py-3 px-2 text-right">{source.clicks.toLocaleString()}</td>
                              <td className="py-3 px-2 text-right">{source.bookings.toLocaleString()}</td>
                              <td className="py-3 px-2 text-right font-bold">${source.revenue.toLocaleString()}</td>
                              <td className="py-3 px-2 text-right">
                                <Badge variant={isBounceHigh ? "destructive" : "secondary"}>
                                  {source.bounceRate.toFixed(1)}%
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Routes Tab */}
          <TabsContent value="routes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performing Routes</CardTitle>
                <CardDescription>
                  Use this to create more SEO pages and run ads on proven routes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px]" />
                ) : (
                  <div className="space-y-3">
                    {current.topRoutes?.slice(0, 10).map((route, i) => (
                      <div
                        key={route.route}
                        className={cn(
                          "p-4 rounded-lg border transition-colors",
                          i === 0 && "border-primary/50 bg-primary/5"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                              {i + 1}
                            </span>
                            <span className="font-medium">{route.route}</span>
                          </div>
                          <Badge variant={route.conversionRate > 2 ? "default" : "secondary"}>
                            {route.conversionRate.toFixed(2)}% CVR
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{route.searches.toLocaleString()} searches</span>
                          <span>{route.clicks.toLocaleString()} clicks</span>
                          <span>{route.bookings} bookings</span>
                          <span className="font-bold text-foreground">
                            ${route.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Device Performance</CardTitle>
                  <CardDescription>
                    Optimize UI where conversion is weaker
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[200px]" />
                  ) : (
                    <div className="space-y-4">
                      {current.deviceBreakdown?.map((device) => {
                        const Icon = DEVICE_ICONS[device.device] || Monitor;
                        
                        return (
                          <div key={device.device} className="p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon className="w-5 h-5 text-primary" />
                                <span className="font-medium capitalize">{device.device}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {device.visitors.toLocaleString()} users
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">CVR</span>
                                <p className="font-bold">{device.conversionRate.toFixed(2)}%</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">RPU</span>
                                <p className="font-bold">${device.revenuePerUser.toFixed(2)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Bounce</span>
                                <p className="font-bold">{device.bounceRate.toFixed(1)}%</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Price Alert Performance</CardTitle>
                  <CardDescription>
                    High alert engagement = strong retention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[200px]" />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <Bell className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {current.priceAlertStats?.created.toLocaleString() || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Alerts Created</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">Click Rate</p>
                          <p className="text-xl font-bold">
                            {(current.priceAlertStats?.clickRate || 0).toFixed(1)}%
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">Booking Rate</p>
                          <p className="text-xl font-bold">
                            {(current.priceAlertStats?.bookingRate || 0).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Error Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Error & Failure Metrics
                  </CardTitle>
                  <CardDescription>
                    Fix these FIRST
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[200px]" />
                  ) : (
                    <div className="space-y-3">
                      <ErrorRow
                        label="Search Errors"
                        value={current.errorMetrics?.searchErrors || 0}
                        severity="critical"
                      />
                      <ErrorRow
                        label="No-Result Searches"
                        value={current.errorMetrics?.noResultSearches || 0}
                        severity="high"
                      />
                      <ErrorRow
                        label="Provider Timeouts"
                        value={current.errorMetrics?.providerTimeouts || 0}
                        severity="critical"
                      />
                      <ErrorRow
                        label="Broken Redirects"
                        value={current.errorMetrics?.brokenRedirects || 0}
                        severity="critical"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Affiliate Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    Affiliate Health
                  </CardTitle>
                  <CardDescription>
                    If clicks ≠ conversions → investigate immediately
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[200px]" />
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">Clicks Recorded</p>
                          <p className="text-2xl font-bold">
                            {(current.affiliateHealth?.clicksRecorded || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">Conversions</p>
                          <p className="text-2xl font-bold">
                            {(current.affiliateHealth?.conversionsRecorded || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Commission Confirmed</p>
                        <p className="text-2xl font-bold text-emerald-500">
                          ${(current.affiliateHealth?.commissionConfirmed || 0).toLocaleString()}
                        </p>
                      </div>
                      {(current.affiliateHealth?.discrepancy || 0) > 95 && (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-500">
                              High discrepancy detected ({current.affiliateHealth?.discrepancy.toFixed(1)}%)
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Check partner tracking integration
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ============================================
// SUBCOMPONENTS
// ============================================

function KPICard({
  title,
  value,
  change,
  icon: Icon,
  loading,
  format,
  highlight,
}: {
  title: string;
  value: number;
  change?: number;
  icon: React.ElementType;
  loading?: boolean;
  format?: "number" | "currency" | "percent";
  highlight?: boolean;
}) {
  if (loading) return <Skeleton className="h-24" />;

  const formattedValue =
    format === "currency"
      ? `$${value.toLocaleString()}`
      : format === "percent"
      ? `${value.toFixed(1)}%`
      : value.toLocaleString();

  const isPositive = (change || 0) > 0;
  const TrendIcon = change === undefined ? null : isPositive ? TrendingUp : change < 0 ? TrendingDown : Minus;

  return (
    <Card className={cn(highlight && "border-primary/50 bg-primary/5")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className={cn("w-4 h-4", highlight ? "text-primary" : "text-muted-foreground")} />
          {TrendIcon && change !== undefined && (
            <span
              className={cn(
                "text-xs font-medium flex items-center gap-0.5",
                isPositive ? "text-emerald-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
              )}
            >
              <TrendIcon className="w-3 h-3" />
              {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>
        <p className={cn("text-xl font-bold", highlight && "text-primary")}>{formattedValue}</p>
        <p className="text-xs text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}

function ConversionCard({
  label,
  value,
  benchmark,
  health,
  loading,
}: {
  label: string;
  value: number;
  benchmark: typeof CONVERSION_BENCHMARKS[0];
  health: "healthy" | "warning" | "critical";
  loading?: boolean;
}) {
  if (loading) return <Skeleton className="h-24" />;

  const healthColors = {
    healthy: "border-emerald-500/50 bg-emerald-500/5",
    warning: "border-amber-500/50 bg-amber-500/5",
    critical: "border-red-500/50 bg-red-500/5",
  };

  const healthTextColors = {
    healthy: "text-emerald-500",
    warning: "text-amber-500",
    critical: "text-red-500",
  };

  return (
    <div className={cn("p-4 rounded-lg border", healthColors[health])}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-2xl font-bold", healthTextColors[health])}>
        {value.toFixed(1)}%
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Benchmark: {benchmark.healthyMin}–{benchmark.healthyMax}%
      </p>
    </div>
  );
}

function MetricBox({
  label,
  value,
  format,
}: {
  label: string;
  value: number;
  format: "number" | "currency" | "percent";
}) {
  const formatted =
    format === "currency"
      ? `$${value.toFixed(2)}`
      : format === "percent"
      ? `${value.toFixed(1)}%`
      : value.toLocaleString();

  return (
    <div className="p-4 rounded-lg bg-muted/50">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-bold">{formatted}</p>
    </div>
  );
}

function ErrorRow({
  label,
  value,
  severity,
}: {
  label: string;
  value: number;
  severity: "critical" | "high" | "medium";
}) {
  const isCritical = severity === "critical" && value > 0;
  const isHigh = severity === "high" && value > 10;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg",
        isCritical ? "bg-red-500/10 border border-red-500/30" :
        isHigh ? "bg-amber-500/10 border border-amber-500/30" :
        "bg-muted/50"
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      <Badge variant={isCritical ? "destructive" : isHigh ? "secondary" : "outline"}>
        {value}
      </Badge>
    </div>
  );
}
