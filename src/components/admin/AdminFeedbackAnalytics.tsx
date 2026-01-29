import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, TrendingUp, TrendingDown, Smile, Meh, Frown, 
  ThumbsUp, ThumbsDown, BarChart3, RefreshCw, Filter
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const npsData = [
  { month: "Aug", score: 42 },
  { month: "Sep", score: 45 },
  { month: "Oct", score: 48 },
  { month: "Nov", score: 52 },
  { month: "Dec", score: 55 },
  { month: "Jan", score: 58 },
];

const sentimentData = [
  { name: "Positive", value: 68, color: "hsl(var(--chart-2))" },
  { name: "Neutral", value: 22, color: "hsl(var(--muted))" },
  { name: "Negative", value: 10, color: "hsl(var(--destructive))" },
];

const categoryRatings = [
  { category: "Driver Quality", rating: 4.6, responses: 12500 },
  { category: "App Experience", rating: 4.3, responses: 8900 },
  { category: "Pricing", rating: 3.8, responses: 7200 },
  { category: "Wait Time", rating: 3.5, responses: 9100 },
  { category: "Vehicle Cleanliness", rating: 4.4, responses: 11200 },
  { category: "Customer Support", rating: 4.1, responses: 5600 },
];

const topIssues = [
  { issue: "Long wait times during peak hours", count: 342, trend: "up" },
  { issue: "App crashes on payment", count: 189, trend: "down" },
  { issue: "Driver cancelled after accepting", count: 156, trend: "up" },
  { issue: "Incorrect fare charged", count: 98, trend: "down" },
  { issue: "Rude driver behavior", count: 67, trend: "down" },
];

const serviceBreakdown = [
  { service: "Rides", nps: 58, csat: 4.5, responses: 45000 },
  { service: "Eats", nps: 52, csat: 4.2, responses: 32000 },
  { service: "Car Rental", nps: 61, csat: 4.6, responses: 8500 },
  { service: "Hotels", nps: 55, csat: 4.4, responses: 12000 },
  { service: "Flights", nps: 48, csat: 4.1, responses: 6200 },
];

export default function AdminFeedbackAnalytics() {
  const overallNPS = 58;
  const overallCSAT = 4.4;
  const totalResponses = 103700;
  const responseRate = 24.5;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Customer Feedback Analytics
          </h2>
          <p className="text-muted-foreground">Sentiment analysis and NPS scoring across all services</p>
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
                <ThumbsUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NPS Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{overallNPS}</p>
                  <Badge className="bg-green-500/10 text-green-500">
                    <TrendingUp className="h-3 w-3 mr-1" />+6
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <BarChart3 className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CSAT Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{overallCSAT}/5</p>
                  <Badge className="bg-green-500/10 text-green-500">
                    <TrendingUp className="h-3 w-3 mr-1" />+0.2
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Responses</p>
                <p className="text-2xl font-bold">{(totalResponses / 1000).toFixed(1)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Filter className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">{responseRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* NPS Trend */}
        <Card>
          <CardHeader>
            <CardTitle>NPS Trend</CardTitle>
            <CardDescription>Net Promoter Score over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={npsData}>
                <defs>
                  <linearGradient id="npsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#npsGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Customer sentiment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-green-500" />
                <span className="text-sm">Positive (68%)</span>
              </div>
              <div className="flex items-center gap-2">
                <Meh className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Neutral (22%)</span>
              </div>
              <div className="flex items-center gap-2">
                <Frown className="h-5 w-5 text-destructive" />
                <span className="text-sm">Negative (10%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Ratings */}
        <Card>
          <CardHeader>
            <CardTitle>Category Ratings</CardTitle>
            <CardDescription>Average ratings by feedback category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryRatings.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{cat.category}</span>
                  <span className="font-medium">{cat.rating}/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(cat.rating / 5) * 100} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground w-20">
                    {cat.responses.toLocaleString()} resp
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Top Issues</CardTitle>
            <CardDescription>Most common customer complaints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topIssues.map((issue, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
                  <p className="text-sm">{issue.issue}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{issue.count}</Badge>
                  {issue.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Service Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Service Breakdown</CardTitle>
          <CardDescription>NPS and CSAT by service category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="service" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="nps" fill="hsl(var(--primary))" name="NPS Score" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
