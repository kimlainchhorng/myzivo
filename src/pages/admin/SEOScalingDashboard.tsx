/**
 * SEO Scaling Analytics Dashboard
 * 
 * Tracks the key metrics for scaling from 1,000 to 100,000 users:
 * - Clicks → Bookings conversion
 * - Conversion rate by page type
 * - Revenue per user (RPU)
 * - Bounce rate
 * - SEO page performance
 * - Affiliate approval health
 */

import { useState, useMemo } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  MousePointerClick,
  DollarSign,
  Percent,
  BarChart3,
  Globe,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Plane,
  Hotel,
  Car,
  Calendar,
  RefreshCw,
  Download,
  Target,
  Users,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface PagePerformance {
  path: string;
  pageType: 'route' | 'city' | 'deals' | 'hotel' | 'car' | 'landing';
  views: number;
  clicks: number;
  conversions: number;
  bounceRate: number;
  avgTimeOnPage: number;
}

interface DailyMetrics {
  date: string;
  clicks: number;
  bookings: number;
  revenue: number;
  sessions: number;
}

// ============================================
// MOCK DATA (Replace with real API calls)
// ============================================

const generateMockDailyData = (days: number): DailyMetrics[] => {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const baseClicks = Math.floor(Math.random() * 500) + 100;
    const conversionRate = 0.02 + Math.random() * 0.03;
    return {
      date: format(date, 'MMM dd'),
      clicks: baseClicks,
      bookings: Math.floor(baseClicks * conversionRate),
      revenue: Math.floor(baseClicks * conversionRate * (Math.random() * 50 + 20)),
      sessions: Math.floor(baseClicks * 1.8),
    };
  });
};

const mockPagePerformance: PagePerformance[] = [
  { path: '/flights/new-york-to-london', pageType: 'route', views: 2340, clicks: 187, conversions: 12, bounceRate: 42, avgTimeOnPage: 125 },
  { path: '/flights/los-angeles-to-tokyo', pageType: 'route', views: 1890, clicks: 156, conversions: 9, bounceRate: 38, avgTimeOnPage: 142 },
  { path: '/flights/to-paris', pageType: 'city', views: 1560, clicks: 98, conversions: 6, bounceRate: 51, avgTimeOnPage: 98 },
  { path: '/hotels/miami', pageType: 'hotel', views: 1230, clicks: 89, conversions: 8, bounceRate: 44, avgTimeOnPage: 156 },
  { path: '/car-rentals/orlando', pageType: 'car', views: 980, clicks: 67, conversions: 5, bounceRate: 48, avgTimeOnPage: 112 },
  { path: '/deals', pageType: 'deals', views: 890, clicks: 123, conversions: 7, bounceRate: 35, avgTimeOnPage: 87 },
  { path: '/lp/flights', pageType: 'landing', views: 750, clicks: 89, conversions: 11, bounceRate: 55, avgTimeOnPage: 67 },
];

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#6366f1'];

const PAGE_TYPE_LABELS = {
  route: 'Flight Routes',
  city: 'City Pages',
  deals: 'Deals Hub',
  hotel: 'Hotel Cities',
  car: 'Car Rentals',
  landing: 'Ad Landing',
};

// ============================================
// COMPONENT
// ============================================

export default function SEOScalingDashboard() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);
  
  const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
  const dailyData = useMemo(() => generateMockDailyData(days), [days]);
  
  // Aggregate metrics
  const totalClicks = dailyData.reduce((sum, d) => sum + d.clicks, 0);
  const totalBookings = dailyData.reduce((sum, d) => sum + d.bookings, 0);
  const totalRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalSessions = dailyData.reduce((sum, d) => sum + d.sessions, 0);
  
  const conversionRate = totalClicks > 0 ? (totalBookings / totalClicks) * 100 : 0;
  const revenuePerUser = totalSessions > 0 ? totalRevenue / totalSessions : 0;
  const avgBounceRate = mockPagePerformance.reduce((sum, p) => sum + p.bounceRate, 0) / mockPagePerformance.length;
  
  // Page type breakdown
  const pageTypeBreakdown = useMemo(() => {
    const grouped: Record<string, { views: number; clicks: number; conversions: number }> = {};
    mockPagePerformance.forEach(p => {
      if (!grouped[p.pageType]) {
        grouped[p.pageType] = { views: 0, clicks: 0, conversions: 0 };
      }
      grouped[p.pageType].views += p.views;
      grouped[p.pageType].clicks += p.clicks;
      grouped[p.pageType].conversions += p.conversions;
    });
    return Object.entries(grouped).map(([type, data]) => ({
      name: PAGE_TYPE_LABELS[type as keyof typeof PAGE_TYPE_LABELS] || type,
      ...data,
    }));
  }, []);
  
  // SEO page count targets
  const seoTargets = {
    flightRoutes: { current: 156, target: 500 },
    cityPages: { current: 45, target: 100 },
    hotelCities: { current: 28, target: 50 },
    carCities: { current: 18, target: 50 },
    dealPages: { current: 12, target: 50 },
  };
  
  const totalSEOPages = Object.values(seoTargets).reduce((sum, t) => sum + t.current, 0);
  const totalSEOTarget = Object.values(seoTargets).reduce((sum, t) => sum + t.target, 0);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };
  
  return (
    <>
      <SEOHead 
        title="SEO Scaling Analytics - ZIVO Admin"
        description="Track SEO page performance and scaling metrics"
        noIndex
      />
      
      <Header />
      
      <main className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">SEO Scaling Dashboard</h1>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Growth Mode
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Track clicks → bookings, conversion rates, and page performance
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
                <SelectTrigger className="w-32">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
              </Button>
            </div>
          </div>
          
          {/* Primary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Clicks</p>
                    <p className="text-2xl lg:text-3xl font-bold">{totalClicks.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>+12.5% vs prior</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-sky-500/10">
                    <MousePointerClick className="w-5 h-5 text-sky-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bookings</p>
                    <p className="text-2xl lg:text-3xl font-bold">{totalBookings.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>+8.3% vs prior</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
                    <p className="text-2xl lg:text-3xl font-bold">{conversionRate.toFixed(2)}%</p>
                    <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>Target: 3.0%</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Percent className="w-5 h-5 text-violet-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Revenue/User</p>
                    <p className="text-2xl lg:text-3xl font-bold">${revenuePerUser.toFixed(2)}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                      <Target className="w-3 h-3" />
                      <span>LTV tracking</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <DollarSign className="w-5 h-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Conversion Trend */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Clicks → Bookings Trend
                </CardTitle>
                <CardDescription>Daily conversion funnel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke="#0ea5e9"
                      fill="url(#clicksGradient)"
                      name="Clicks"
                    />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke="#10b981"
                      fill="url(#bookingsGradient)"
                      name="Bookings"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Page Type Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Traffic by Page Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pageTypeBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="views"
                    >
                      {pageTypeBreakdown.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {pageTypeBreakdown.slice(0, 4).map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: COLORS[i] }}
                      />
                      <span className="text-muted-foreground truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* SEO Page Progress */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    SEO Page Generation Progress
                  </CardTitle>
                  <CardDescription>
                    {totalSEOPages} of {totalSEOTarget} pages created ({((totalSEOPages / totalSEOTarget) * 100).toFixed(0)}%)
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Generate Pages
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(seoTargets).map(([key, { current, target }]) => {
                  const percent = (current / target) * 100;
                  const labels: Record<string, { label: string; icon: typeof Plane }> = {
                    flightRoutes: { label: 'Flight Routes', icon: Plane },
                    cityPages: { label: 'City Pages', icon: Globe },
                    hotelCities: { label: 'Hotel Cities', icon: Hotel },
                    carCities: { label: 'Car Rentals', icon: Car },
                    dealPages: { label: 'Deal Pages', icon: Target },
                  };
                  const { label, icon: Icon } = labels[key] || { label: key, icon: FileText };
                  
                  return (
                    <div key={key} className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl font-bold">{current}</span>
                        <span className="text-sm text-muted-foreground">/ {target}</span>
                      </div>
                      <Progress value={percent} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs: Page Performance / Affiliate Health */}
          <Tabs defaultValue="pages" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pages" className="gap-2">
                <Globe className="w-4 h-4" />
                Top Pages
              </TabsTrigger>
              <TabsTrigger value="health" className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Affiliate Health
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pages">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Top Performing SEO Pages</CardTitle>
                  <CardDescription>Ranked by conversion rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 font-medium">Page</th>
                          <th className="text-left py-3 font-medium">Type</th>
                          <th className="text-right py-3 font-medium">Views</th>
                          <th className="text-right py-3 font-medium">Clicks</th>
                          <th className="text-right py-3 font-medium">Conv.</th>
                          <th className="text-right py-3 font-medium">CVR</th>
                          <th className="text-right py-3 font-medium">Bounce</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockPagePerformance
                          .sort((a, b) => (b.conversions / b.clicks) - (a.conversions / a.clicks))
                          .map((page) => {
                            const cvr = page.clicks > 0 ? (page.conversions / page.clicks) * 100 : 0;
                            return (
                              <tr key={page.path} className="border-b border-border/50 hover:bg-muted/30">
                                <td className="py-3">
                                  <code className="text-xs bg-muted px-2 py-1 rounded">{page.path}</code>
                                </td>
                                <td className="py-3">
                                  <Badge variant="outline" className="text-xs">
                                    {PAGE_TYPE_LABELS[page.pageType]}
                                  </Badge>
                                </td>
                                <td className="text-right py-3">{page.views.toLocaleString()}</td>
                                <td className="text-right py-3">{page.clicks}</td>
                                <td className="text-right py-3 font-medium text-emerald-500">{page.conversions}</td>
                                <td className="text-right py-3">
                                  <span className={cn(
                                    "font-medium",
                                    cvr >= 6 ? "text-emerald-500" : cvr >= 3 ? "text-amber-500" : "text-muted-foreground"
                                  )}>
                                    {cvr.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="text-right py-3">
                                  <span className={cn(
                                    page.bounceRate > 50 ? "text-red-500" : "text-muted-foreground"
                                  )}>
                                    {page.bounceRate}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="health">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Affiliate Approval Health
                  </CardTitle>
                  <CardDescription>Monitor partner compliance and payout status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium">Travelpayouts</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Active • Last payout 3d ago</p>
                      <p className="text-lg font-bold mt-2">$1,234.56</p>
                    </div>
                    
                    <div className="p-4 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium">Hotellook</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Active • Last payout 7d ago</p>
                      <p className="text-lg font-bold mt-2">$567.89</p>
                    </div>
                    
                    <div className="p-4 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium">EconomyBookings</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Active • Pending payout</p>
                      <p className="text-lg font-bold mt-2">$345.67</p>
                    </div>
                    
                    <div className="p-4 rounded-lg border bg-amber-500/5 border-amber-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <span className="font-medium">Klook</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Review pending • 2 days</p>
                      <p className="text-lg font-bold mt-2">$89.12</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
                    <h4 className="font-medium mb-2">Compliance Checklist</h4>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Affiliate disclosures visible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>No guaranteed price claims</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Search-to-book flow enforced</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Partner links open in new tab</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
