import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, TrendingUp, FlaskConical, Play, Pause, 
  BarChart3, Target, Settings
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

const experiments = [
  { id: "1", name: "Dynamic Surge Cap", status: "active", lift: 8.5, revenue: 12500, users: 15000, confidence: 94 },
  { id: "2", name: "Off-Peak Discounts", status: "active", lift: 12.2, revenue: 8900, users: 12000, confidence: 97 },
  { id: "3", name: "Loyalty Member Pricing", status: "paused", lift: 5.8, revenue: 6200, users: 8500, confidence: 82 },
  { id: "4", name: "First Ride Discount", status: "active", lift: 22.5, revenue: 15800, users: 5000, confidence: 99 },
  { id: "5", name: "Bundle Pricing", status: "draft", lift: 0, revenue: 0, users: 0, confidence: 0 },
];

const pricingModels = [
  { model: "Standard", baseRate: 2.50, perMile: 1.50, perMinute: 0.25, active: true },
  { model: "Premium", baseRate: 5.00, perMile: 2.50, perMinute: 0.50, active: true },
  { model: "Economy", baseRate: 1.50, perMile: 1.00, perMinute: 0.15, active: true },
  { model: "Surge", baseRate: 3.75, perMile: 2.25, perMinute: 0.38, active: true },
];

export default function AdminPricingExperiments() {
  const avgLift = 12.3;
  const activeExperiments = 3;
  const totalRevenueImpact = 43400;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      active: { icon: <Play className="h-3 w-3" />, class: "bg-green-500/10 text-green-500" },
      paused: { icon: <Pause className="h-3 w-3" />, class: "bg-amber-500/10 text-amber-500" },
      draft: { icon: <Settings className="h-3 w-3" />, class: "bg-muted text-muted-foreground" }
    };
    return (
      <Badge className={config[status].class}>
        {config[status].icon}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            Pricing Experiments
          </h2>
          <p className="text-muted-foreground">Test and optimize pricing strategies</p>
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
              <div className="p-2 rounded-xl bg-primary/10">
                <FlaskConical className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Tests</p>
                <p className="text-2xl font-bold">{activeExperiments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Lift</p>
                <p className="text-2xl font-bold">+{avgLift}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue Impact</p>
                <p className="text-2xl font-bold">+${(totalRevenueImpact / 1000).toFixed(1)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Target className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">75%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Experiments</CardTitle>
          <CardDescription>Pricing tests and their performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {experiments.map((exp) => (
            <div key={exp.id} className="p-4 rounded-lg bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{exp.name}</span>
                  {getStatusBadge(exp.status)}
                </div>
                {exp.status !== "draft" && (
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-500/10 text-green-500">
                      +{exp.lift}% lift
                    </Badge>
                    <Badge variant="outline">
                      {exp.confidence}% confidence
                    </Badge>
                  </div>
                )}
              </div>
              {exp.status !== "draft" && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Users in Test</p>
                    <p className="font-medium">{exp.users.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Revenue Impact</p>
                    <p className="font-medium text-green-500">+${exp.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Confidence</p>
                    <Progress value={exp.confidence} className="h-2 mt-1" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Models</CardTitle>
          <CardDescription>Current pricing configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pricingModels.map((model) => (
              <div key={model.model} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <Switch checked={model.active} />
                  <span className="font-medium">{model.model}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span>Base: ${model.baseRate}</span>
                  <span>Per Mile: ${model.perMile}</span>
                  <span>Per Min: ${model.perMinute}</span>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
