import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const forecastData = [
  { month: "Jan", actual: 245000, forecast: 240000, target: 250000 },
  { month: "Feb", actual: 268000, forecast: 265000, target: 270000 },
  { month: "Mar", actual: 290000, forecast: 285000, target: 295000 },
  { month: "Apr", actual: null, forecast: 310000, target: 320000 },
  { month: "May", actual: null, forecast: 335000, target: 350000 },
  { month: "Jun", actual: null, forecast: 360000, target: 380000 },
];

const serviceBreakdown = [
  { service: "Rides", current: 145000, projected: 185000, growth: 27.6 },
  { service: "Eats", current: 82000, projected: 110000, growth: 34.1 },
  { service: "Hotels", current: 38000, projected: 48000, growth: 26.3 },
  { service: "Flights", current: 25000, projected: 32000, growth: 28.0 },
];

const insights = [
  { 
    title: "Peak Season Approaching", 
    description: "Summer travel bookings typically increase 40% in Q2",
    impact: "positive",
    value: "+$125K"
  },
  { 
    title: "New Market Expansion", 
    description: "Austin launch projected to add 15% revenue by Q3",
    impact: "positive",
    value: "+$85K"
  },
  { 
    title: "Driver Supply Constraint", 
    description: "Current driver shortage may limit ride capacity",
    impact: "negative",
    value: "-$32K"
  },
];

const AdminRevenueForecasting = () => {
  const currentRevenue = 290000;
  const forecastedRevenue = 360000;
  const growthRate = ((forecastedRevenue - currentRevenue) / currentRevenue * 100).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            Revenue Forecasting
          </h2>
          <p className="text-muted-foreground mt-1">AI-powered predictions and growth analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Q2 2024
          </Button>
          <Button className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Update Forecast
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-teal-500/5 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <Badge className="bg-green-500/10 text-green-500 gap-1">
                <ArrowUpRight className="h-3 w-3" />
                {growthRate}%
              </Badge>
            </div>
            <p className="text-2xl font-bold">${(forecastedRevenue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">Q2 Forecast</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200" style={{ animationDelay: "50ms" }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Target className="h-5 w-5 text-amber-500" />
              <span className="text-xs text-muted-foreground">vs Target</span>
            </div>
            <p className="text-2xl font-bold">94.7%</p>
            <p className="text-sm text-muted-foreground">Target Achievement</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <span className="text-xs text-muted-foreground">Accuracy</span>
            </div>
            <p className="text-2xl font-bold">97.2%</p>
            <p className="text-sm text-muted-foreground">Forecast Accuracy</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200" style={{ animationDelay: "150ms" }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-xs text-muted-foreground">YoY</span>
            </div>
            <p className="text-2xl font-bold">+42.5%</p>
            <p className="text-sm text-muted-foreground">Year over Year</p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "200ms" }}>
        <CardHeader>
          <CardTitle className="text-lg">Revenue Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis tickFormatter={(v) => `$${v/1000}K`} className="text-xs" />
                <Tooltip 
                  formatter={(value: number) => [`$${(value/1000).toFixed(0)}K`, '']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#94a3b8" 
                  strokeDasharray="5 5"
                  fill="none"
                  strokeWidth={2}
                  name="Target"
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#actualGradient)"
                  strokeWidth={2}
                  name="Actual"
                />
                <Area 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#8b5cf6" 
                  fill="url(#forecastGradient)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Forecast"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-500" />
              <span className="text-sm text-muted-foreground">Forecast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-slate-400" style={{ borderStyle: 'dashed' }} />
              <span className="text-sm text-muted-foreground">Target</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Service Breakdown */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "250ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Service Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceBreakdown.map((service, index) => (
                <div 
                  key={service.service}
                  className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{service.service}</span>
                    <Badge className="bg-green-500/10 text-green-500 gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      {service.growth}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current: </span>
                      <span className="font-medium">${(service.current/1000).toFixed(0)}K</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Projected: </span>
                      <span className="font-medium text-primary">${(service.projected/1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div 
                  key={insight.title}
                  className={cn(
                    "p-4 rounded-xl transition-all animate-in fade-in slide-in-from-bottom-2 duration-200",
                    insight.impact === "positive" ? "bg-green-500/5 border border-green-500/20" : "bg-red-500/5 border border-red-500/20"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {insight.impact === "positive" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium text-sm">{insight.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                    <Badge className={cn(
                      insight.impact === "positive" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {insight.value}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRevenueForecasting;
