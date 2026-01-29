import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, AlertTriangle, XCircle, TrendingUp, 
  Star, Clock, Target, BarChart3
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { Progress } from "@/components/ui/progress";

const qualityTrend = [
  { week: "W1", score: 92, target: 95 },
  { week: "W2", score: 94, target: 95 },
  { week: "W3", score: 93, target: 95 },
  { week: "W4", score: 96, target: 95 },
  { week: "W5", score: 95, target: 95 },
  { week: "W6", score: 97, target: 95 },
];

const qualityMetrics = [
  { subject: 'Driver Rating', A: 94, fullMark: 100 },
  { subject: 'On-Time', A: 88, fullMark: 100 },
  { subject: 'Completion', A: 96, fullMark: 100 },
  { subject: 'Customer Sat', A: 92, fullMark: 100 },
  { subject: 'Response Time', A: 85, fullMark: 100 },
  { subject: 'Resolution', A: 91, fullMark: 100 },
];

const qualityIssues = [
  { category: "Late Pickups", count: 145, trend: "down", severity: "medium" },
  { category: "Wrong Orders", count: 32, trend: "down", severity: "high" },
  { category: "Driver Complaints", count: 28, trend: "up", severity: "medium" },
  { category: "App Crashes", count: 12, trend: "down", severity: "critical" },
  { category: "Payment Failures", count: 8, trend: "stable", severity: "high" },
];

export default function AdminQualityAssurance() {
  const overallScore = 94.5;
  const passedChecks = 98;
  const openIssues = 25;
  const resolvedThisWeek = 42;

  const getSeverityBadge = (severity: string) => {
    const config: Record<string, string> = {
      low: "bg-blue-500/10 text-blue-500",
      medium: "bg-amber-500/10 text-amber-500",
      high: "bg-orange-500/10 text-orange-500",
      critical: "bg-red-500/10 text-red-500"
    };
    return <Badge className={config[severity]}>{severity}</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "down") return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-red-500" />;
    return <span className="text-muted-foreground">—</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Quality Assurance
          </h2>
          <p className="text-muted-foreground">Monitor and improve service quality</p>
        </div>
        <Button>
          <BarChart3 className="h-4 w-4 mr-2" />
          Quality Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Star className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quality Score</p>
                <p className="text-2xl font-bold">{overallScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passed Checks</p>
                <p className="text-2xl font-bold">{passedChecks}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Issues</p>
                <p className="text-2xl font-bold">{openIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved (Week)</p>
                <p className="text-2xl font-bold">{resolvedThisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quality Score Trend</CardTitle>
            <CardDescription>Weekly quality score vs target</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={qualityTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis className="text-xs" domain={[85, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" name="Score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Dimensions</CardTitle>
            <CardDescription>Performance across quality metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={qualityMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" className="text-xs" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Score" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quality Issues</CardTitle>
          <CardDescription>Current issues requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityIssues.map((issue) => (
              <div key={issue.category} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  {issue.severity === "critical" ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : issue.severity === "high" ? (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                  <div>
                    <p className="font-medium">{issue.category}</p>
                    <p className="text-sm text-muted-foreground">{issue.count} instances this week</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getTrendIcon(issue.trend)}
                  {getSeverityBadge(issue.severity)}
                  <Button variant="outline" size="sm">Investigate</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
