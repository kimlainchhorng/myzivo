import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  UserPlus, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Users,
  FileText,
  Star
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const weeklyData = [
  { day: "Mon", started: 45, completed: 38, failed: 3 },
  { day: "Tue", started: 52, completed: 42, failed: 5 },
  { day: "Wed", started: 48, completed: 40, failed: 2 },
  { day: "Thu", started: 61, completed: 55, failed: 4 },
  { day: "Fri", started: 55, completed: 48, failed: 3 },
  { day: "Sat", started: 38, completed: 32, failed: 2 },
  { day: "Sun", started: 28, completed: 24, failed: 1 }
];

const funnelSteps = [
  { step: "Registration", count: 1250, rate: 100 },
  { step: "Email Verification", count: 1125, rate: 90 },
  { step: "Profile Setup", count: 980, rate: 78 },
  { step: "Document Upload", count: 820, rate: 66 },
  { step: "Background Check", count: 750, rate: 60 },
  { step: "Training Complete", count: 680, rate: 54 },
  { step: "First Trip", count: 620, rate: 50 }
];

const AdminOnboardingMetrics = () => {
  const totalStarted = weeklyData.reduce((sum, d) => sum + d.started, 0);
  const totalCompleted = weeklyData.reduce((sum, d) => sum + d.completed, 0);
  const completionRate = ((totalCompleted / totalStarted) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            Onboarding Metrics
          </h2>
          <p className="text-muted-foreground">Track user onboarding funnel and conversion</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          This Week
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-teal-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStarted}</p>
                <p className="text-xs text-muted-foreground">Started This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCompleted}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">3.2</p>
                <p className="text-xs text-muted-foreground">Avg Days to Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Weekly Onboarding Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="started" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Started" opacity={0.5} />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Onboarding Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnelSteps.map((step, index) => (
              <div key={step.step} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    {step.step}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{step.count}</span>
                    <span className="text-xs text-muted-foreground">({step.rate}%)</span>
                  </div>
                </div>
                <Progress 
                  value={step.rate} 
                  className={cn(
                    "h-2",
                    step.rate >= 80 ? "[&>div]:bg-green-500" :
                    step.rate >= 50 ? "[&>div]:bg-primary" :
                    "[&>div]:bg-amber-500"
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOnboardingMetrics;
