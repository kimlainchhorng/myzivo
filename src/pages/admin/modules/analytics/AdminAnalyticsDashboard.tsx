/**
 * Admin Analytics Dashboard
 * Comprehensive analytics and business intelligence
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import {
  Users,
  Search,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Activity,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { subDays, format } from 'date-fns';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface DateRange {
  label: string;
  start: Date;
  end: Date;
}

const dateRanges: DateRange[] = [
  { label: 'Today', start: subDays(new Date(), 0), end: new Date() },
  { label: 'Last 7 days', start: subDays(new Date(), 7), end: new Date() },
  { label: 'Last 30 days', start: subDays(new Date(), 30), end: new Date() },
  { label: 'Last 90 days', start: subDays(new Date(), 90), end: new Date() },
];

export default function AdminAnalyticsDashboard() {
  const [selectedRange, setSelectedRange] = useState<DateRange>(dateRanges[1]);
  const [selectedFunnel, setSelectedFunnel] = useState<string>('hotel');

  const {
    stats,
    funnelData,
    timeSeriesData,
    productData,
    segmentData,
    performanceData,
    isLoading,
  } = useAnalyticsData({ start: selectedRange.start, end: selectedRange.end });

  const handleExport = () => {
    // Export analytics data as CSV
    const csvData = timeSeriesData?.map(row => ({
      Date: row.date,
      Searches: row.searches,
      Checkouts: row.checkouts,
      Bookings: row.bookings,
      Revenue: row.revenue,
    }));

    if (!csvData) return;

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zivo-analytics-${format(selectedRange.start, 'yyyy-MM-dd')}-${format(selectedRange.end, 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const currentFunnel = funnelData?.find((f: any) => f.productType === selectedFunnel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Business Intelligence</h1>
          <p className="text-muted-foreground">
            Track conversions, revenue, and user behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedRange.label}
            onValueChange={(label) => {
              const range = dateRanges.find(r => r.label === label);
              if (range) setSelectedRange(range);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range.label} value={range.label}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <KpiCard
          title="Visitors"
          value={stats?.totalVisitors || 0}
          icon={Users}
          loading={isLoading}
        />
        <KpiCard
          title="Searches"
          value={stats?.totalSearches || 0}
          icon={Search}
          loading={isLoading}
        />
        <KpiCard
          title="Checkouts"
          value={stats?.totalCheckouts || 0}
          icon={ShoppingCart}
          loading={isLoading}
        />
        <KpiCard
          title="Bookings"
          value={stats?.totalBookings || 0}
          icon={CreditCard}
          loading={isLoading}
        />
        <KpiCard
          title="Conversion"
          value={`${(stats?.conversionRate || 0).toFixed(2)}%`}
          icon={TrendingUp}
          loading={isLoading}
          highlight
        />
        <KpiCard
          title="Avg Order"
          value={`$${(stats?.avgOrderValue || 0).toFixed(0)}`}
          icon={Activity}
          loading={isLoading}
        />
        <KpiCard
          title="Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={Zap}
          loading={isLoading}
          highlight
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="searches" stroke="#3b82f6" name="Searches" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="checkouts" stroke="#f59e0b" name="Checkouts" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="bookings" stroke="#22c55e" name="Bookings" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSeriesData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Funnel Analysis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Conversion Funnels</CardTitle>
          <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hotel">Hotels</SelectItem>
              <SelectItem value="activity">Activities</SelectItem>
              <SelectItem value="transfer">Transfers</SelectItem>
              <SelectItem value="flight">Flights</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px]" />
          ) : currentFunnel ? (
            <div className="flex flex-col md:flex-row items-stretch gap-2">
              {currentFunnel.steps.map((step: any, index: number) => (
                <div key={step.name} className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "flex-1 p-4 rounded-lg border-2 transition-colors",
                      index === 0 ? "bg-sky-500/10 border-sky-500/30" :
                      index === currentFunnel.steps.length - 1 ? "bg-emerald-500/10 border-emerald-500/30" :
                      "bg-blue-500/10 border-blue-500/30"
                    )}
                  >
                    <div className="text-sm font-medium mb-1">{step.name}</div>
                    <div className="text-2xl font-bold">{step.count.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {step.percentage.toFixed(1)}% conversion
                    </div>
                    {step.dropoff > 0 && (
                      <Badge variant="destructive" className="mt-2 text-xs">
                        -{step.dropoff} drop-off
                      </Badge>
                    )}
                  </div>
                  {index < currentFunnel.steps.length - 1 && (
                    <div className="hidden md:block text-muted-foreground">→</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No funnel data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Segmentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Product Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Performance by Product</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px]" />
            ) : (
              <div className="space-y-4">
                {productData?.map((product, index) => (
                  <div key={product.product} className="flex items-center gap-4">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{product.product}</span>
                        <span className="text-sm text-muted-foreground">
                          {product.bookings} bookings
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span>{product.searches} searches</span>
                        <span className="text-primary">{product.conversionRate.toFixed(2)}% CVR</span>
                        <span className="text-emerald-600">${product.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px]" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={segmentData?.devices || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {segmentData?.devices.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px]" />
            ) : (
              <div className="space-y-3">
                {segmentData?.sources.slice(0, 5).map((source, index) => (
                  <div key={source.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm capitalize">
                        {source.name.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <Badge variant="secondary">{source.value}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[100px]" />
          ) : performanceData && performanceData.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {performanceData.map((service: any) => (
                <div key={service.service} className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground capitalize mb-1">
                    {service.service}
                  </div>
                  <div className="text-2xl font-bold">
                    {service.avgLatency.toFixed(0)}ms
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={service.successRate >= 99 ? 'default' : service.successRate >= 95 ? 'secondary' : 'destructive'}
                    >
                      {service.successRate.toFixed(1)}% success
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {service.totalCalls} calls
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No performance data yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// KPI Card Component
function KpiCard({
  title,
  value,
  icon: Icon,
  loading,
  highlight,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  loading?: boolean;
  highlight?: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-24" />;
  }

  return (
    <Card className={cn(highlight && "border-primary/50 bg-primary/5")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className={cn("w-4 h-4", highlight ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className={cn("text-xl font-bold", highlight && "text-primary")}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-xs text-muted-foreground">{title}</div>
      </CardContent>
    </Card>
  );
}
