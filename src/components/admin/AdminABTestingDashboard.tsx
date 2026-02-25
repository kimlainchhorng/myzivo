import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FlaskConical, Play, Pause, CheckCircle2, TrendingUp, 
  Users, BarChart3, Clock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const experiments = [
  { 
    id: "1", name: "New Pricing Display", status: "running", 
    variants: [
      { name: "Control", users: 5000, conversions: 250, rate: 5.0 },
      { name: "Variant A", users: 5000, conversions: 310, rate: 6.2 }
    ],
    improvement: 24, confidence: 95, daysRunning: 14
  },
  { 
    id: "2", name: "Checkout Flow Redesign", status: "running", 
    variants: [
      { name: "Control", users: 3200, conversions: 480, rate: 15.0 },
      { name: "Variant A", users: 3200, conversions: 544, rate: 17.0 }
    ],
    improvement: 13.3, confidence: 88, daysRunning: 7
  },
  { 
    id: "3", name: "Push Notification Timing", status: "completed", 
    variants: [
      { name: "Morning", users: 8000, conversions: 640, rate: 8.0 },
      { name: "Evening", users: 8000, conversions: 720, rate: 9.0 }
    ],
    improvement: 12.5, confidence: 99, daysRunning: 21, winner: "Evening"
  },
  { 
    id: "4", name: "Driver ETA Display", status: "paused", 
    variants: [
      { name: "Minutes Only", users: 2000, conversions: 160, rate: 8.0 },
      { name: "Minutes + Map", users: 2000, conversions: 180, rate: 9.0 }
    ],
    improvement: 12.5, confidence: 72, daysRunning: 5
  },
];

export default function AdminABTestingDashboard() {
  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      running: "bg-green-500/10 text-green-500",
      completed: "bg-blue-500/10 text-blue-500",
      paused: "bg-amber-500/10 text-amber-500"
    };
    return <Badge className={config[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            A/B Testing Dashboard
          </h2>
          <p className="text-muted-foreground">Manage and analyze experiments</p>
        </div>
        <Button>
          <FlaskConical className="h-4 w-4 mr-2" />
          New Experiment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/10">
                <Play className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Lift</p>
                <p className="text-2xl font-bold">+15.6%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Users className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Users in Tests</p>
                <p className="text-2xl font-bold">36.4k</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {experiments.map((exp) => (
          <Card key={exp.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{exp.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(exp.status)}
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {exp.daysRunning} days
                    </span>
                    {exp.winner && (
                      <Badge className="bg-green-500/10 text-green-500">
                        Winner: {exp.winner}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {exp.status === "running" && (
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  {exp.status === "paused" && (
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {exp.variants.map((variant) => (
                  <div key={variant.name} className="p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{variant.name}</span>
                      <Badge variant="outline">{variant.rate}% CVR</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {variant.users.toLocaleString()} users • {variant.conversions} conversions
                    </div>
                    <Progress value={variant.rate * 5} className="h-2" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Statistical Confidence</span>
                <div className="flex items-center gap-3">
                  <Progress value={exp.confidence} className="w-32 h-2" />
                  <Badge className={exp.confidence >= 95 ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"}>
                    {exp.confidence}%
                  </Badge>
                  <Badge className="bg-primary/10 text-primary">
                    +{exp.improvement}% lift
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
