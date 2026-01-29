import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, TrendingUp, TrendingDown, Calendar, BarChart3, 
  ArrowRight, RefreshCw, Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const cohortData = [
  { cohort: "Jan 2024", week1: 100, week2: 68, week3: 52, week4: 45, week5: 42, week6: 40, week7: 38, week8: 36 },
  { cohort: "Dec 2023", week1: 100, week2: 72, week3: 58, week4: 50, week5: 46, week6: 44, week7: 42, week8: 40 },
  { cohort: "Nov 2023", week1: 100, week2: 65, week3: 48, week4: 42, week5: 38, week6: 35, week7: 33, week8: 31 },
  { cohort: "Oct 2023", week1: 100, week2: 70, week3: 55, week4: 48, week5: 44, week6: 42, week7: 40, week8: 38 },
  { cohort: "Sep 2023", week1: 100, week2: 62, week3: 45, week4: 38, week5: 35, week6: 32, week7: 30, week8: 28 },
];

const retentionTrend = [
  { month: "Aug", d1: 78, d7: 45, d14: 32, d30: 25 },
  { month: "Sep", d1: 80, d7: 48, d14: 35, d30: 28 },
  { month: "Oct", d1: 82, d7: 50, d14: 38, d30: 30 },
  { month: "Nov", d1: 79, d7: 46, d14: 34, d30: 27 },
  { month: "Dec", d1: 85, d7: 52, d14: 40, d30: 32 },
  { month: "Jan", d1: 88, d7: 55, d14: 42, d30: 35 },
];

const behaviorBySource = [
  { source: "Organic", signups: 4500, activations: 3800, retained: 2100, ltv: 125 },
  { source: "Paid Ads", signups: 3200, activations: 2400, retained: 1200, ltv: 95 },
  { source: "Referral", signups: 1800, activations: 1620, retained: 1100, ltv: 180 },
  { source: "Social", signups: 2200, activations: 1540, retained: 720, ltv: 85 },
  { source: "Email", signups: 800, activations: 720, retained: 480, ltv: 145 },
];

const lifecycleData = [
  { stage: "Signed Up", users: 12500, percentage: 100 },
  { stage: "Activated", users: 10000, percentage: 80 },
  { stage: "First Order", users: 7500, percentage: 60 },
  { stage: "Repeat Order", users: 4500, percentage: 36 },
  { stage: "Loyal (5+ orders)", users: 2800, percentage: 22 },
  { stage: "Champion (10+ orders)", users: 1200, percentage: 10 },
];

export default function AdminCohortAnalysis() {
  const avgRetention30d = 35;
  const retentionChange = 8;
  const avgLTV = 128;
  const activeCohorts = 12;

  const getCohortColor = (value: number) => {
    if (value >= 60) return "bg-green-500/80 text-white";
    if (value >= 40) return "bg-green-500/50 text-white";
    if (value >= 30) return "bg-amber-500/50 text-white";
    if (value >= 20) return "bg-amber-500/30";
    return "bg-red-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Cohort Analysis
          </h2>
          <p className="text-muted-foreground">User retention and behavior analysis by signup cohort</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="weekly">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
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
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">30-Day Retention</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{avgRetention30d}%</p>
                  <Badge className="bg-green-500/10 text-green-500">
                    <TrendingUp className="h-3 w-3 mr-1" />+{retentionChange}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg LTV</p>
                <p className="text-2xl font-bold">${avgLTV}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Cohorts</p>
                <p className="text-2xl font-bold">{activeCohorts}</p>
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
                <p className="text-sm text-muted-foreground">Activation Rate</p>
                <p className="text-2xl font-bold">80%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="heatmap">
        <TabsList>
          <TabsTrigger value="heatmap">Retention Heatmap</TabsTrigger>
          <TabsTrigger value="trends">Retention Trends</TabsTrigger>
          <TabsTrigger value="lifecycle">User Lifecycle</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-6">
          {/* Cohort Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Retention Heatmap</CardTitle>
              <CardDescription>Weekly retention rates by signup cohort (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Cohort</th>
                      <th className="text-center py-2 px-3 font-medium">Week 1</th>
                      <th className="text-center py-2 px-3 font-medium">Week 2</th>
                      <th className="text-center py-2 px-3 font-medium">Week 3</th>
                      <th className="text-center py-2 px-3 font-medium">Week 4</th>
                      <th className="text-center py-2 px-3 font-medium">Week 5</th>
                      <th className="text-center py-2 px-3 font-medium">Week 6</th>
                      <th className="text-center py-2 px-3 font-medium">Week 7</th>
                      <th className="text-center py-2 px-3 font-medium">Week 8</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((row) => (
                      <tr key={row.cohort}>
                        <td className="py-2 px-3 font-medium">{row.cohort}</td>
                        {[row.week1, row.week2, row.week3, row.week4, row.week5, row.week6, row.week7, row.week8].map((value, i) => (
                          <td key={i} className="py-2 px-3">
                            <div className={`text-center py-2 px-3 rounded ${getCohortColor(value)}`}>
                              {value}%
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Retention Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Retention Trend</CardTitle>
              <CardDescription>Day 1, 7, 14, and 30 retention over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={retentionTrend}>
                  <defs>
                    <linearGradient id="d1Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Legend />
                  <Area type="monotone" dataKey="d1" name="Day 1" stroke="hsl(var(--primary))" fill="url(#d1Grad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="d7" name="Day 7" stroke="hsl(var(--chart-2))" fill="transparent" strokeWidth={2} />
                  <Area type="monotone" dataKey="d14" name="Day 14" stroke="hsl(var(--chart-3))" fill="transparent" strokeWidth={2} />
                  <Area type="monotone" dataKey="d30" name="Day 30" stroke="hsl(var(--chart-4))" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Behavior by Source */}
          <Card>
            <CardHeader>
              <CardTitle>Behavior by Acquisition Source</CardTitle>
              <CardDescription>User quality metrics by signup source</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={behaviorBySource}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="source" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="signups" name="Signups" fill="hsl(var(--muted))" radius={4} />
                  <Bar dataKey="activations" name="Activations" fill="hsl(var(--chart-2))" radius={4} />
                  <Bar dataKey="retained" name="Retained (30d)" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-6">
          {/* User Lifecycle Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>User Lifecycle Funnel</CardTitle>
              <CardDescription>User progression through lifecycle stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lifecycleData.map((stage, i) => (
                  <div key={stage.stage} className="flex items-center gap-4">
                    <div className="w-40 text-sm font-medium">{stage.stage}</div>
                    <div className="flex-1">
                      <div className="relative h-10 bg-muted rounded-lg overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 rounded-lg flex items-center justify-end pr-3"
                          style={{ width: `${stage.percentage}%` }}
                        >
                          <span className="text-sm font-medium text-primary-foreground">
                            {stage.users.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <Badge variant="outline">{stage.percentage}%</Badge>
                    </div>
                    {i < lifecycleData.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* LTV by Source */}
          <Card>
            <CardHeader>
              <CardTitle>LTV by Acquisition Source</CardTitle>
              <CardDescription>Customer lifetime value comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behaviorBySource.sort((a, b) => b.ltv - a.ltv).map((source) => (
                  <div key={source.source} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="font-medium">{source.source}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{source.signups.toLocaleString()} users</span>
                      <Badge className="bg-green-500/10 text-green-500">
                        ${source.ltv} LTV
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
