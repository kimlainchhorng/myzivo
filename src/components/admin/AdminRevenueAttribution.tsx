import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, TrendingUp, Megaphone, Globe, Search, Mail, 
  Share2, Users, BarChart3, Target, RefreshCw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { Progress } from "@/components/ui/progress";

const channelData = [
  { channel: "Organic Search", revenue: 125000, users: 45000, conversion: 3.2, color: "hsl(var(--primary))" },
  { channel: "Paid Ads", revenue: 98000, users: 32000, conversion: 2.8, color: "hsl(var(--chart-2))" },
  { channel: "Social Media", revenue: 67000, users: 28000, conversion: 2.1, color: "hsl(var(--chart-3))" },
  { channel: "Email", revenue: 54000, users: 18000, conversion: 4.5, color: "hsl(var(--chart-4))" },
  { channel: "Referral", revenue: 43000, users: 12000, conversion: 5.2, color: "hsl(var(--chart-5))" },
  { channel: "Direct", revenue: 38000, users: 15000, conversion: 3.8, color: "hsl(var(--muted))" },
];

const campaignPerformance = [
  { campaign: "Summer Promo", spend: 25000, revenue: 85000, roi: 240 },
  { campaign: "New User Bonus", spend: 18000, revenue: 62000, roi: 244 },
  { campaign: "Driver Referral", spend: 12000, revenue: 48000, roi: 300 },
  { campaign: "Flash Sale", spend: 8000, revenue: 32000, roi: 300 },
  { campaign: "App Install", spend: 15000, revenue: 45000, roi: 200 },
];

const trendData = [
  { month: "Aug", organic: 85000, paid: 65000, social: 42000 },
  { month: "Sep", organic: 92000, paid: 72000, social: 48000 },
  { month: "Oct", organic: 98000, paid: 78000, social: 52000 },
  { month: "Nov", organic: 112000, paid: 88000, social: 58000 },
  { month: "Dec", organic: 118000, paid: 92000, social: 62000 },
  { month: "Jan", organic: 125000, paid: 98000, social: 67000 },
];

const touchpointData = [
  { touchpoint: "First Touch", value: 35 },
  { touchpoint: "Last Touch", value: 28 },
  { touchpoint: "Multi-Touch", value: 22 },
  { touchpoint: "Assist", value: 15 },
];

export default function AdminRevenueAttribution() {
  const totalAttributedRevenue = 425000;
  const avgCAC = 24.50;
  const avgROAS = 3.8;
  const topChannel = "Organic Search";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Revenue Attribution
          </h2>
          <p className="text-muted-foreground">Track revenue by marketing channel, campaign, and source</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-teal-500/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attributed Revenue</p>
                <p className="text-2xl font-bold">${(totalAttributedRevenue / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg CAC</p>
                <p className="text-2xl font-bold">${avgCAC}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg ROAS</p>
                <p className="text-2xl font-bold">{avgROAS}x</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Search className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Channel</p>
                <p className="text-lg font-bold">{topChannel}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Channel Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Channel</CardTitle>
            <CardDescription>Attribution across marketing channels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tickFormatter={(v) => `$${v / 1000}k`} />
                <YAxis dataKey="channel" type="category" width={100} className="text-xs" />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attribution Model */}
        <Card>
          <CardHeader>
            <CardTitle>Attribution Model Distribution</CardTitle>
            <CardDescription>Credit distribution by touchpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={touchpointData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ touchpoint, value }) => `${touchpoint}: ${value}%`}
                >
                  {touchpointData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend by Channel */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend by Channel</CardTitle>
          <CardDescription>Monthly revenue attribution breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="organicGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="socialGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="organic" name="Organic" stroke="hsl(var(--primary))" fill="url(#organicGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="paid" name="Paid Ads" stroke="hsl(var(--chart-2))" fill="url(#paidGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="social" name="Social" stroke="hsl(var(--chart-3))" fill="url(#socialGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>ROI by marketing campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaignPerformance.map((campaign) => (
              <div key={campaign.campaign} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{campaign.campaign}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Spend: ${campaign.spend.toLocaleString()}</span>
                    <span className="text-green-500">Revenue: ${campaign.revenue.toLocaleString()}</span>
                    <Badge className="bg-green-500/10 text-green-500">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {campaign.roi}% ROI
                    </Badge>
                  </div>
                </div>
                <Progress value={(campaign.revenue / 100000) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Channel Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Breakdown</CardTitle>
          <CardDescription>Detailed metrics by acquisition channel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Channel</th>
                  <th className="text-right py-3 px-4">Revenue</th>
                  <th className="text-right py-3 px-4">Users</th>
                  <th className="text-right py-3 px-4">Conversion</th>
                  <th className="text-right py-3 px-4">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {channelData.map((channel) => (
                  <tr key={channel.channel} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }} />
                        {channel.channel}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-medium">${channel.revenue.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{channel.users.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{channel.conversion}%</td>
                    <td className="text-right py-3 px-4">
                      <Badge variant="outline">
                        {((channel.revenue / totalAttributedRevenue) * 100).toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
