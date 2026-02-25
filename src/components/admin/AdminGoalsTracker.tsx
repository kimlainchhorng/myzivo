import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Car,
  Utensils,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  name: string;
  category: "revenue" | "growth" | "operations" | "engagement";
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: "on_track" | "at_risk" | "completed" | "behind";
  trend: number;
}

const goals: Goal[] = [
  {
    id: "1",
    name: "Monthly Revenue",
    category: "revenue",
    target: 500000,
    current: 425800,
    unit: "$",
    deadline: "2024-01-31",
    status: "on_track",
    trend: 12.5,
  },
  {
    id: "2",
    name: "New User Signups",
    category: "growth",
    target: 5000,
    current: 4250,
    unit: "",
    deadline: "2024-01-31",
    status: "on_track",
    trend: 8.2,
  },
  {
    id: "3",
    name: "Driver Onboarding",
    category: "growth",
    target: 200,
    current: 145,
    unit: "",
    deadline: "2024-01-31",
    status: "at_risk",
    trend: -5.4,
  },
  {
    id: "4",
    name: "Ride Completion Rate",
    category: "operations",
    target: 95,
    current: 94.8,
    unit: "%",
    deadline: "2024-01-31",
    status: "on_track",
    trend: 1.2,
  },
  {
    id: "5",
    name: "Customer Satisfaction",
    category: "engagement",
    target: 4.8,
    current: 4.72,
    unit: "★",
    deadline: "2024-01-31",
    status: "at_risk",
    trend: -0.5,
  },
  {
    id: "6",
    name: "Restaurant Partners",
    category: "growth",
    target: 150,
    current: 168,
    unit: "",
    deadline: "2024-01-31",
    status: "completed",
    trend: 22.4,
  },
];

const categoryConfig = {
  revenue: { icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
  growth: { icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
  operations: { icon: Car, color: "text-primary", bg: "bg-primary/10" },
  engagement: { icon: Utensils, color: "text-amber-500", bg: "bg-amber-500/10" },
};

const statusConfig = {
  on_track: { color: "text-green-500", bg: "bg-green-500/10", label: "On Track" },
  at_risk: { color: "text-amber-500", bg: "bg-amber-500/10", label: "At Risk" },
  completed: { color: "text-blue-500", bg: "bg-blue-500/10", label: "Completed" },
  behind: { color: "text-red-500", bg: "bg-red-500/10", label: "Behind" },
};

const AdminGoalsTracker = () => {
  const completedGoals = goals.filter(g => g.status === "completed").length;
  const atRiskGoals = goals.filter(g => g.status === "at_risk").length;
  const overallProgress = Math.round(goals.reduce((sum, g) => sum + (g.current / g.target) * 100, 0) / goals.length);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
              <Target className="h-5 w-5 text-white" />
            </div>
            Goals Tracker
          </h2>
          <p className="text-muted-foreground mt-1">Track and manage organizational objectives</p>
        </div>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          Set New Goal
        </Button>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-teal-500/5 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Target className="h-5 w-5 text-primary" />
              <Badge className="bg-primary/10 text-primary">{overallProgress}%</Badge>
            </div>
            <p className="text-2xl font-bold">{goals.length}</p>
            <p className="text-sm text-muted-foreground">Active Goals</p>
            <Progress value={overallProgress} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-xs text-muted-foreground">This Month</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{completedGoals}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span className="text-xs text-muted-foreground">Needs Attention</span>
            </div>
            <p className="text-2xl font-bold text-amber-500">{atRiskGoals}</p>
            <p className="text-sm text-muted-foreground">At Risk</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid gap-4">
        {goals.map((goal, index) => {
          const category = categoryConfig[goal.category];
          const status = statusConfig[goal.status];
          const CategoryIcon = category.icon;
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          const isPositive = goal.trend >= 0;

          return (
            <Card 
              key={goal.id}
              className={cn(
                "border-0 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200",
                goal.status === "at_risk" && "border border-amber-500/30",
                goal.status === "completed" && "border border-green-500/30"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn("p-3 rounded-xl shrink-0", category.bg)}>
                      <CategoryIcon className={cn("h-5 w-5", category.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold">{goal.name}</h3>
                        <Badge className={cn("text-[10px] h-4", status.bg, status.color)}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-muted-foreground">
                          {goal.unit === "$" ? `$${goal.current.toLocaleString()}` : `${goal.current}${goal.unit}`}
                          <span className="mx-1">/</span>
                          {goal.unit === "$" ? `$${goal.target.toLocaleString()}` : `${goal.target}${goal.unit}`}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-[10px] gap-0.5",
                            isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                          )}
                        >
                          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(goal.trend)}%
                        </Badge>
                      </div>
                      <Progress 
                        value={progress} 
                        className={cn(
                          "h-2",
                          goal.status === "completed" && "[&>div]:bg-green-500",
                          goal.status === "at_risk" && "[&>div]:bg-amber-500"
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">{Math.round(progress)}%</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminGoalsTracker;
