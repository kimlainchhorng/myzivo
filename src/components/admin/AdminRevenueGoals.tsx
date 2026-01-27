import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Flame,
  Award,
  ChevronUp
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RevenueGoal {
  id: string;
  label: string;
  current: number;
  target: number;
  period: string;
  daysRemaining: number;
  trend: "up" | "down" | "stable";
  onTrack: boolean;
}

const goals: RevenueGoal[] = [
  {
    id: "daily",
    label: "Daily Revenue",
    current: 8450,
    target: 10000,
    period: "Today",
    daysRemaining: 0,
    trend: "up",
    onTrack: true,
  },
  {
    id: "weekly",
    label: "Weekly Revenue",
    current: 52340,
    target: 70000,
    period: "This Week",
    daysRemaining: 3,
    trend: "up",
    onTrack: true,
  },
  {
    id: "monthly",
    label: "Monthly Revenue",
    current: 187500,
    target: 250000,
    period: "January 2026",
    daysRemaining: 4,
    trend: "up",
    onTrack: false,
  },
  {
    id: "quarterly",
    label: "Quarterly Revenue",
    current: 625000,
    target: 750000,
    period: "Q1 2026",
    daysRemaining: 64,
    trend: "stable",
    onTrack: true,
  },
];

const AdminRevenueGoals = () => {
  const totalProgress = goals.reduce((acc, g) => acc + (g.current / g.target * 100), 0) / goals.length;

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Revenue Goals
          </CardTitle>
          <Badge variant="secondary" className={cn(
            totalProgress >= 75 ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
          )}>
            {totalProgress.toFixed(0)}% Overall
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {goals.map((goal, index) => {
          const progress = (goal.current / goal.target) * 100;
          const remaining = goal.target - goal.current;
          const dailyNeeded = goal.daysRemaining > 0 ? remaining / goal.daysRemaining : 0;
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-4 rounded-xl border transition-all",
                goal.onTrack 
                  ? "bg-green-500/5 border-green-500/20" 
                  : "bg-amber-500/5 border-amber-500/20"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{goal.label}</h4>
                    {goal.onTrack ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] h-5">
                        <Flame className="h-3 w-3 mr-1" />
                        On Track
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] h-5">
                        Needs Push
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {goal.period}
                    {goal.daysRemaining > 0 && (
                      <span className="text-foreground font-medium ml-1">
                        • {goal.daysRemaining} days left
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-bold">{goal.current.toLocaleString()}</span>
                    <span className="text-muted-foreground">/ ${goal.target.toLocaleString()}</span>
                  </div>
                  {goal.trend === "up" && (
                    <div className="flex items-center gap-1 text-green-500 text-xs mt-1 justify-end">
                      <ChevronUp className="h-3 w-3" />
                      <span>Trending up</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Progress 
                  value={Math.min(progress, 100)} 
                  className="h-2"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    ${remaining.toLocaleString()} remaining
                  </span>
                  <span className={cn(
                    "font-medium",
                    progress >= 100 ? "text-green-500" : "text-foreground"
                  )}>
                    {progress.toFixed(1)}%
                  </span>
                </div>
                {goal.daysRemaining > 0 && dailyNeeded > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    Need ${dailyNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })}/day to reach goal
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
        
        {/* Achievement Badge */}
        <div className="pt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4 text-primary" />
          <span>Keep pushing! 3 goals on track this period</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRevenueGoals;
