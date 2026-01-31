import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { 
  DollarSign, 
  MousePointerClick, 
  TrendingUp, 
  TrendingDown,
  Minus,
  BarChart3, 
  Download,
  Plane,
  Hotel,
  Car,
  Ticket,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Calendar,
  ArrowUpRight,
  Shield,
  FileText,
  PieChart,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  generateMonthlyReport,
  getOverviewStats,
  downloadCSV,
  PRODUCT_CONFIG,
  MonthlyReport,
} from "@/lib/revenueAnalytics";

// Generate demo data for visualization
function generateDemoData() {
  const now = new Date();
  const demoClicks = [];
  
  const services = ['flights', 'hotels', 'car_rental', 'transfers', 'activities', 'esim', 'luggage', 'compensation'];
  const ctaTypes = ['result_card', 'sticky_cta', 'top_cta', 'compare_prices', 'cross_sell'];
  const devices = ['mobile', 'desktop', 'tablet'];
  
  // Generate 150 demo clicks for the current month
  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    demoClicks.push({
      id: `demo_${i}`,
      timestamp: date.toISOString(),
      serviceType: services[Math.floor(Math.random() * services.length)],
      ctaType: ctaTypes[Math.floor(Math.random() * ctaTypes.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      price: 50 + Math.floor(Math.random() * 500),
      source: `zivo_${services[Math.floor(Math.random() * services.length)]}`,
      affiliatePartner: 'travelpayouts',
    });
  }
  
  // Store in localStorage for analytics to pick up
  localStorage.setItem("affiliate_clicks", JSON.stringify(demoClicks));
  
  return demoClicks;
}

export default function RevenueDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // Parse selected month
  const [year, month] = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    return [y, m - 1];
  }, [selectedMonth]);
  
  // Generate demo data on first load
  useMemo(() => {
    const existing = localStorage.getItem("affiliate_clicks");
    if (!existing || JSON.parse(existing).length < 10) {
      generateDemoData();
    }
  }, []);
  
  // Get report data
  const report = useMemo(() => generateMonthlyReport(year, month), [year, month]);
  const overview = useMemo(() => getOverviewStats(), []);
  
  // Generate month options (last 12 months)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  }, []);

  const handleExport = () => {
    downloadCSV(report);
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Revenue Dashboard – ZIVO Admin"
        description="Monthly revenue and performance analytics for ZIVO affiliate platform"
      />
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin Only
                </Badge>
              </div>
              <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
              <p className="text-muted-foreground">Track affiliate performance and optimize revenue</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[200px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <MousePointerClick className="w-5 h-5 text-primary" />
                  <Badge variant="secondary" className="text-xs">This Month</Badge>
                </div>
                <p className="text-3xl font-bold">{overview.totalClicksMonth.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
              </CardContent>
            </Card>
            
            <Card className="border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-background">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-sky-500" />
                  <Badge variant="secondary" className="text-xs">Last 7 Days</Badge>
                </div>
                <p className="text-3xl font-bold">{overview.totalClicksWeek.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Recent Clicks</p>
              </CardContent>
            </Card>
            
            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-background">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <Badge variant="secondary" className="text-xs">Estimated</Badge>
                </div>
                <p className="text-3xl font-bold">${overview.estimatedRevenue.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Est. Revenue</p>
              </CardContent>
            </Card>
            
            <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-background">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                  <Badge variant="secondary" className="text-xs">Top Earner</Badge>
                </div>
                <p className="text-2xl font-bold truncate">{overview.topEarningProduct}</p>
                <p className="text-sm text-muted-foreground">${overview.topEarningProductRevenue.toFixed(0)} revenue</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-5 gap-1">
              <TabsTrigger value="products" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="pages" className="gap-2">
                <FileText className="w-4 h-4" />
                Pages
              </TabsTrigger>
              <TabsTrigger value="subids" className="gap-2">
                <PieChart className="w-4 h-4" />
                SubIDs
              </TabsTrigger>
              <TabsTrigger value="devices" className="gap-2">
                <Smartphone className="w-4 h-4" />
                Devices
              </TabsTrigger>
              <TabsTrigger value="report" className="gap-2">
                <Download className="w-4 h-4" />
                Report
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance by Product
                  </CardTitle>
                  <CardDescription>
                    Click performance and estimated revenue by service type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.productPerformance.map((product, index) => (
                      <div key={product.product} className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-card text-2xl">
                          {product.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold truncate">{product.displayName}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">{product.clicks} clicks</span>
                              <span className="font-medium text-emerald-500">${product.estimatedRevenue.toFixed(0)}</span>
                            </div>
                          </div>
                          <Progress value={report.productPerformance[0]?.clicks ? (product.clicks / report.productPerformance[0].clicks * 100) : 0} className="h-2" />
                          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <span>CTR: {product.ctr.toFixed(1)}%</span>
                            <span>Top SubID: {product.topSubId}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {report.productPerformance.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No click data available for this period</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pages Tab */}
            <TabsContent value="pages">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Performance by Page
                  </CardTitle>
                  <CardDescription>
                    Click distribution across different pages and CTA locations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead>Best CTA Location</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Conversion Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.pagePerformance.map((page) => (
                        <TableRow key={page.page}>
                          <TableCell className="font-medium">{page.displayName}</TableCell>
                          <TableCell className="text-right">{page.clicks}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {page.topCTALocation}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{page.views}</TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              page.conversionRate > 5 ? "text-emerald-500" : 
                              page.conversionRate > 2 ? "text-amber-500" : "text-muted-foreground"
                            )}>
                              {page.conversionRate.toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SubIDs Tab */}
            <TabsContent value="subids">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    SubID Report
                  </CardTitle>
                  <CardDescription>
                    Performance breakdown by tracking SubID
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SubID</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.subIdReport.filter(s => s.clicks > 0).map((subId) => (
                        <TableRow key={subId.subId}>
                          <TableCell className="font-mono text-sm">{subId.subId}</TableCell>
                          <TableCell className="text-right font-medium">{subId.clicks}</TableCell>
                          <TableCell className="text-right">{subId.percentage.toFixed(1)}%</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {subId.product.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <TrendIcon trend={subId.trend} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {report.subIdReport.filter(s => s.clicks > 0).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No SubID data available for this period</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Devices Tab */}
            <TabsContent value="devices">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Device Breakdown
                    </CardTitle>
                    <CardDescription>
                      Clicks by device type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {[
                        { key: 'mobile' as const, label: 'Mobile', icon: Smartphone, color: 'bg-sky-500' },
                        { key: 'desktop' as const, label: 'Desktop', icon: Monitor, color: 'bg-violet-500' },
                        { key: 'tablet' as const, label: 'Tablet', icon: Tablet, color: 'bg-amber-500' },
                      ].map((device) => {
                        const count = report.deviceBreakdown[device.key];
                        const total = report.deviceBreakdown.mobile + report.deviceBreakdown.desktop + report.deviceBreakdown.tablet;
                        const percentage = total > 0 ? (count / total * 100) : 0;
                        
                        return (
                          <div key={device.key} className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", device.color)}>
                              <device.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{device.label}</span>
                                <span className="text-muted-foreground">{count} clicks</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}% of total</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Location Insights
                    </CardTitle>
                    <CardDescription>
                      Top regions by click volume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">Location tracking coming soon</p>
                      <p className="text-xs">Integrate with analytics provider for geo data</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Report Tab */}
            <TabsContent value="report">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Monthly Report
                  </CardTitle>
                  <CardDescription>
                    {report.month} {report.year} summary and export options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Summary
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-muted-foreground">Total Clicks</span>
                          <span className="font-semibold">{report.totalClicks.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-muted-foreground">Estimated Revenue</span>
                          <span className="font-semibold text-emerald-500">${report.estimatedRevenue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-muted-foreground">Top Product</span>
                          <span className="font-semibold capitalize">{report.topProduct.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-muted-foreground">Top SubID</span>
                          <span className="font-mono text-sm">{report.topSubId}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Export Options
                      </h3>
                      <div className="space-y-3">
                        <Button onClick={handleExport} className="w-full gap-2" variant="outline">
                          <Download className="w-4 h-4" />
                          Download CSV Report
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Includes all product performance, page metrics, and SubID breakdown
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 mt-6">
                        <p className="text-sm text-muted-foreground text-center">
                          <strong>Note:</strong> Revenue figures are estimates based on average commission rates. 
                          Actual earnings may vary based on partner reporting.
                        </p>
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
    </div>
  );
}
