import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, TrendingDown, DollarSign, Users, MapPin, 
  BarChart3, Target, Eye, RefreshCw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { Progress } from "@/components/ui/progress";

const marketShareData = [
  { name: "Zivo", share: 42, color: "hsl(var(--primary))" },
  { name: "Competitor A", share: 28, color: "hsl(var(--chart-2))" },
  { name: "Competitor B", share: 18, color: "hsl(var(--chart-3))" },
  { name: "Others", share: 12, color: "hsl(var(--muted))" },
];

const pricingComparison = [
  { route: "Airport", zivo: 45, compA: 48, compB: 52 },
  { route: "Downtown", zivo: 18, compA: 20, compB: 22 },
  { route: "Suburbs", zivo: 28, compA: 25, compB: 30 },
  { route: "Cross-City", zivo: 55, compA: 58, compB: 62 },
  { route: "Short Trip", zivo: 12, compA: 14, compB: 15 },
];

const featureComparison = [
  { feature: "App Rating", zivo: 4.6, compA: 4.3, compB: 4.1 },
  { feature: "Wait Time", zivo: 4.2, compA: 3.8, compB: 3.5 },
  { feature: "Driver Quality", zivo: 4.5, compA: 4.2, compB: 4.0 },
  { feature: "Pricing", zivo: 4.0, compA: 3.5, compB: 3.8 },
  { feature: "Coverage", zivo: 4.3, compA: 4.5, compB: 3.2 },
  { feature: "Support", zivo: 4.4, compA: 3.9, compB: 3.7 },
];

const radarData = [
  { subject: 'App Rating', Zivo: 92, CompA: 86, CompB: 82 },
  { subject: 'Wait Time', Zivo: 84, CompA: 76, CompB: 70 },
  { subject: 'Driver Quality', Zivo: 90, CompA: 84, CompB: 80 },
  { subject: 'Pricing', Zivo: 80, CompA: 70, CompB: 76 },
  { subject: 'Coverage', Zivo: 86, CompA: 90, CompB: 64 },
  { subject: 'Support', Zivo: 88, CompA: 78, CompB: 74 },
];

const trendsData = [
  { month: "Aug", zivo: 38, compA: 30, compB: 20 },
  { month: "Sep", zivo: 39, compA: 29, compB: 19 },
  { month: "Oct", zivo: 40, compA: 28, compB: 18 },
  { month: "Nov", zivo: 41, compA: 28, compB: 18 },
  { month: "Dec", zivo: 41, compA: 27, compB: 18 },
  { month: "Jan", zivo: 42, compA: 28, compB: 18 },
];

export default function AdminCompetitorAnalysis() {
  const marketPosition = 1;
  const priceAdvantage = -8.5;
  const growthRate = 4.2;
  const competitorCount = 5;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Competitor Analysis
          </h2>
          <p className="text-muted-foreground">Track competitor pricing and market positioning</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="downtown">Downtown</SelectItem>
              <SelectItem value="suburbs">Suburbs</SelectItem>
              <SelectItem value="airport">Airport</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-teal-500/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Market Position</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">#{marketPosition}</p>
                  <Badge className="bg-green-500/10 text-green-500">Leader</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price Advantage</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{priceAdvantage}%</p>
                  <TrendingDown className="h-4 w-4 text-green-500" />
                </div>
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
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">+{growthRate}%</p>
                  <Badge className="bg-green-500/10 text-green-500">
                    <TrendingUp className="h-3 w-3 mr-1" />MoM
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
                <Eye className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tracked Competitors</p>
                <p className="text-2xl font-bold">{competitorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Market Share */}
        <Card>
          <CardHeader>
            <CardTitle>Market Share Distribution</CardTitle>
            <CardDescription>Current market share by company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {marketShareData.map((company) => (
              <div key={company.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{company.name}</span>
                  <span>{company.share}%</span>
                </div>
                <Progress value={company.share} className="h-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Feature Comparison Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
            <CardDescription>Performance across key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" className="text-xs" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Zivo" dataKey="Zivo" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                <Radar name="Competitor A" dataKey="CompA" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} />
                <Radar name="Competitor B" dataKey="CompB" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.1} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pricing Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Comparison</CardTitle>
            <CardDescription>Average fare by route type ($)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pricingComparison}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="route" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="zivo" name="Zivo" fill="hsl(var(--primary))" radius={4} />
                <Bar dataKey="compA" name="Competitor A" fill="hsl(var(--chart-2))" radius={4} />
                <Bar dataKey="compB" name="Competitor B" fill="hsl(var(--chart-3))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Market Share Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Market Share Trend</CardTitle>
            <CardDescription>Share evolution over 6 months (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" domain={[0, 50]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="zivo" name="Zivo" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="compA" name="Competitor A" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="compB" name="Competitor B" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Feature Comparison</CardTitle>
          <CardDescription>Score comparison across all tracked metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Zivo</th>
                  <th className="text-center py-3 px-4">Competitor A</th>
                  <th className="text-center py-3 px-4">Competitor B</th>
                  <th className="text-center py-3 px-4">Advantage</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row) => {
                  const isLeader = row.zivo >= row.compA && row.zivo >= row.compB;
                  return (
                    <tr key={row.feature} className="border-b">
                      <td className="py-3 px-4 font-medium">{row.feature}</td>
                      <td className="text-center py-3 px-4">
                        <Badge className={isLeader ? "bg-green-500/10 text-green-500" : ""}>
                          {row.zivo}/5
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">{row.compA}/5</td>
                      <td className="text-center py-3 px-4">{row.compB}/5</td>
                      <td className="text-center py-3 px-4">
                        {isLeader ? (
                          <Badge className="bg-green-500/10 text-green-500">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Leading
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-500">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Behind
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
