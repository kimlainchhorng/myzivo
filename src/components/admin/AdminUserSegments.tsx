import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Snowflake, 
  Zap,
  Crown,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface UserSegment {
  id: string;
  name: string;
  description: string;
  count: number;
  percentage: number;
  trend: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const segments: UserSegment[] = [
  {
    id: "power",
    name: "Power Users",
    description: "10+ rides/orders per week",
    count: 1245,
    percentage: 8.2,
    trend: 12.5,
    icon: Zap,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "active",
    name: "Active Users",
    description: "2-9 rides/orders per week",
    count: 4820,
    percentage: 31.8,
    trend: 5.2,
    icon: Flame,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "occasional",
    name: "Occasional Users",
    description: "1-4 rides/orders per month",
    count: 5340,
    percentage: 35.2,
    trend: -2.1,
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "dormant",
    name: "Dormant Users",
    description: "No activity in 30+ days",
    count: 2890,
    percentage: 19.1,
    trend: -8.3,
    icon: Snowflake,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
  },
  {
    id: "new",
    name: "New Users",
    description: "Joined in last 7 days",
    count: 856,
    percentage: 5.7,
    trend: 18.2,
    icon: Clock,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
];

const AdminUserSegments = () => {
  const totalUsers = segments.reduce((sum, s) => sum + s.count, 0);

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-primary" />
            User Segments
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {totalUsers.toLocaleString()} Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {segments.map((segment, index) => {
            const Icon = segment.icon;
            
            return (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    segment.bgColor
                  )}>
                    <Icon className={cn("h-5 w-5", segment.color)} />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{segment.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {segment.count.toLocaleString()}
                        </span>
                        <span className={cn(
                          "flex items-center gap-0.5 text-xs font-medium",
                          segment.trend >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {segment.trend >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(segment.trend)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {segment.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={segment.percentage} 
                        className="h-1.5 flex-1"
                      />
                      <span className="text-[10px] text-muted-foreground w-10 text-right">
                        {segment.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Engagement Summary */}
        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-green-500/5">
            <p className="text-lg font-bold text-green-500">40%</p>
            <p className="text-[10px] text-muted-foreground">Highly Engaged</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-500/5">
            <p className="text-lg font-bold text-blue-500">35%</p>
            <p className="text-[10px] text-muted-foreground">Moderate</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-500/5">
            <p className="text-lg font-bold text-slate-500">25%</p>
            <p className="text-[10px] text-muted-foreground">At Risk</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUserSegments;
