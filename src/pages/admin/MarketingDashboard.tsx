/**
 * Admin Marketing Dashboard
 * Track traffic, conversions, and ROI per channel
 */
import { useState } from "react";
import { 
  TrendingUp, Users, MousePointerClick, DollarSign, 
  Search, Globe, Share2, Mail, BarChart3, ArrowUpRight,
  Target, Megaphone, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";

// Mock data for demonstration
const channelData = [
  { channel: "Organic Search", visitors: 45230, conversions: 1245, revenue: 89420, cpc: 0, roi: "∞" },
  { channel: "Google Ads", visitors: 12450, conversions: 498, revenue: 35640, cpc: 2.45, roi: "185%" },
  { channel: "Meta Ads", visitors: 8920, conversions: 267, revenue: 19080, cpc: 1.89, roi: "142%" },
  { channel: "Creator/Influencer", visitors: 6780, conversions: 203, revenue: 14520, cpc: 0.75, roi: "320%" },
  { channel: "Email", visitors: 4560, conversions: 342, revenue: 24480, cpc: 0.12, roi: "890%" },
  { channel: "Direct", visitors: 15670, conversions: 627, revenue: 44880, cpc: 0, roi: "∞" },
];

const topPages = [
  { page: "/flights", visitors: 23450, conversions: 892, rate: "3.8%" },
  { page: "/hotels", visitors: 18920, conversions: 567, rate: "3.0%" },
  { page: "/hotels/new-york", visitors: 8450, conversions: 338, rate: "4.0%" },
  { page: "/flights/new-york-to-london", visitors: 6780, conversions: 305, rate: "4.5%" },
  { page: "/car-rental", visitors: 5670, conversions: 170, rate: "3.0%" },
];

export default function MarketingDashboard() {
  const [dateRange, setDateRange] = useState("30d");

  const totalVisitors = channelData.reduce((sum, c) => sum + c.visitors, 0);
  const totalConversions = channelData.reduce((sum, c) => sum + c.conversions, 0);
  const totalRevenue = channelData.reduce((sum, c) => sum + c.revenue, 0);
  const avgConversionRate = ((totalConversions / totalVisitors) * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-primary" />
              Marketing Dashboard
            </h1>
            <p className="text-muted-foreground">Track traffic, conversions, and ROI by channel</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Visitors</p>
                  <p className="text-2xl font-bold">{totalVisitors.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Target className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversions</p>
                  <p className="text-2xl font-bold">{totalConversions.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{avgConversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. Revenue</p>
                  <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Channel Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Channel Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Channel</th>
                    <th className="text-right py-3 px-4 font-medium">Visitors</th>
                    <th className="text-right py-3 px-4 font-medium">Conversions</th>
                    <th className="text-right py-3 px-4 font-medium">Revenue</th>
                    <th className="text-right py-3 px-4 font-medium">CPC</th>
                    <th className="text-right py-3 px-4 font-medium">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {channelData.map((row) => (
                    <tr key={row.channel} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{row.channel}</td>
                      <td className="py-3 px-4 text-right">{row.visitors.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{row.conversions.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">${row.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">${row.cpc.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={row.roi === "∞" ? "secondary" : "outline"} className="text-emerald-500">
                          {row.roi}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Landing Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Top SEO Landing Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPages.map((page) => (
                <div key={page.page} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-mono text-sm">{page.page}</p>
                    <p className="text-xs text-muted-foreground">{page.visitors.toLocaleString()} visitors</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{page.conversions} conversions</p>
                    <p className="text-xs text-emerald-500">{page.rate} rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </main>
    </div>
  );
}

