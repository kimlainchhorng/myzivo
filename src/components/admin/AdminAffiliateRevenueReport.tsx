import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plane,
  Hotel,
  Car,
  Compass,
  MousePointerClick,
  Monitor,
  Smartphone,
  Tablet,
  Home,
  Search,
  LayoutGrid,
  RefreshCw,
  TrendingUp,
  DollarSign,
  FileText,
  Download,
} from "lucide-react";
import { getAffiliateAnalytics } from "@/lib/affiliateTracking";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PRODUCT_COLORS = {
  flights: "#0ea5e9",
  hotels: "#f59e0b",
  car_rental: "#8b5cf6",
  activities: "#10b981",
};

const PAGE_COLORS = {
  homepage: "#3b82f6",
  search_results: "#22c55e",
  landing_page: "#f97316",
  cross_sell: "#a855f7",
  exit_intent: "#ef4444",
};

const DEVICE_COLORS = {
  desktop: "#6366f1",
  mobile: "#14b8a6",
  tablet: "#f43f5e",
};

const AdminAffiliateRevenueReport = () => {
  const [analytics, setAnalytics] = useState<ReturnType<typeof getAffiliateAnalytics> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setAnalytics(getAffiliateAnalytics());
      setIsRefreshing(false);
    }, 500);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Transform data for charts
  const productData = analytics ? [
    { name: "Flights", value: analytics.clicksByCTA?.result_card || 0, color: PRODUCT_COLORS.flights },
    { name: "Hotels", value: analytics.clicksByCTA?.cross_sell || 0, color: PRODUCT_COLORS.hotels },
    { name: "Car Rentals", value: analytics.clicksByCTA?.compare_prices || 0, color: PRODUCT_COLORS.car_rental },
    { name: "Activities", value: analytics.clicksByCTA?.trending_deal || 0, color: PRODUCT_COLORS.activities },
  ] : [];

  const pageData = analytics ? [
    { name: "Homepage", clicks: analytics.clicksByCTA?.popular_route || 0, color: PAGE_COLORS.homepage },
    { name: "Search Results", clicks: analytics.clicksByCTA?.result_card || 0, color: PAGE_COLORS.search_results },
    { name: "Landing Pages", clicks: analytics.clicksByCTA?.top_cta || 0, color: PAGE_COLORS.landing_page },
    { name: "Cross-Sell", clicks: analytics.clicksByCTA?.cross_sell || 0, color: PAGE_COLORS.cross_sell },
    { name: "Exit Intent", clicks: analytics.clicksByCTA?.exit_intent || 0, color: PAGE_COLORS.exit_intent },
  ] : [];

  const deviceData = analytics ? [
    { name: "Desktop", value: analytics.clicksByDevice?.desktop || 0, color: DEVICE_COLORS.desktop, icon: Monitor },
    { name: "Mobile", value: analytics.clicksByDevice?.mobile || 0, color: DEVICE_COLORS.mobile, icon: Smartphone },
    { name: "Tablet", value: analytics.clicksByDevice?.tablet || 0, color: DEVICE_COLORS.tablet, icon: Tablet },
  ] : [];

  const totalDeviceClicks = deviceData.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            Affiliate Revenue Report
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Internal analytics for affiliate click attribution (not public)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-sky-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <Plane className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics?.totalClicks || 0}</p>
                <p className="text-xs text-muted-foreground">Total Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics?.conversionRate || 0}%</p>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${analytics?.totalRevenue.toFixed(0) || 0}</p>
                <p className="text-xs text-muted-foreground">Est. Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics?.resultsViews || 0}</p>
                <p className="text-xs text-muted-foreground">Page Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="product" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="product" className="gap-2 data-[state=active]:bg-card">
            <LayoutGrid className="w-4 h-4" />
            By Product
          </TabsTrigger>
          <TabsTrigger value="page" className="gap-2 data-[state=active]:bg-card">
            <Search className="w-4 h-4" />
            By Page
          </TabsTrigger>
          <TabsTrigger value="device" className="gap-2 data-[state=active]:bg-card">
            <Monitor className="w-4 h-4" />
            By Device
          </TabsTrigger>
        </TabsList>

        {/* By Product */}
        <TabsContent value="product" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-primary" />
                  Clicks by Product Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {productData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Product Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Flights", icon: Plane, color: "text-sky-500", bgColor: "bg-sky-500/10", subId: "zivo_flights" },
                  { name: "Hotels", icon: Hotel, color: "text-amber-500", bgColor: "bg-amber-500/10", subId: "zivo_hotels" },
                  { name: "Car Rentals", icon: Car, color: "text-purple-500", bgColor: "bg-purple-500/10", subId: "zivo_cars" },
                  { name: "Activities", icon: Compass, color: "text-emerald-500", bgColor: "bg-emerald-500/10", subId: "zivo_activities" },
                ].map((product) => (
                  <div key={product.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", product.bgColor)}>
                        <product.icon className={cn("w-5 h-5", product.color)} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{product.subId}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono">Active</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* By Page */}
        <TabsContent value="page" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Clicks by Page / CTA Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pageData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#666" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#666" fontSize={12} width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="clicks" radius={[0, 4, 4, 0]}>
                      {pageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Device */}
        <TabsContent value="device" className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {deviceData.map((device) => {
              const Icon = device.icon;
              const percentage = ((device.value / totalDeviceClicks) * 100).toFixed(1);
              return (
                <Card key={device.name} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${device.color}20` }}
                      >
                        <Icon className="w-7 h-7" style={{ color: device.color }} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{device.name}</p>
                        <p className="text-3xl font-bold">{device.value}</p>
                        <p className="text-sm" style={{ color: device.color }}>{percentage}%</p>
                      </div>
                    </div>
                    <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percentage}%`, backgroundColor: device.color }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* SubID Reference */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-amber-500">
            <FileText className="w-4 h-4" />
            SubID Reference (Do Not Modify)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Flights", subId: "zivo_flights" },
              { label: "Hotels", subId: "zivo_hotels" },
              { label: "Car Rentals", subId: "zivo_cars" },
              { label: "Activities", subId: "zivo_activities" },
            ].map((item) => (
              <div key={item.subId} className="flex items-center justify-between p-2 rounded-xl bg-card border">
                <span className="text-sm font-medium">{item.label}</span>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{item.subId}</code>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            See <code className="bg-muted px-1 rounded">src/docs/AFFILIATE_SUBID_MAPPING.md</code> for full documentation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAffiliateRevenueReport;
