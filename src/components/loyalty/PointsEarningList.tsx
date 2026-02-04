/**
 * POINTS EARNING LIST
 * 
 * Shows all the ways users can earn ZIVO Points
 */

import { 
  Sparkles, 
  Plane, 
  Bell, 
  UserPlus, 
  Users, 
  Star,
  CheckCircle,
  Gift
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EARNING_RULES, POINTS_COMPLIANCE, type EarningRule } from "@/config/zivoPoints";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  booking: Plane,
  alert: Bell,
  account: UserPlus,
  referral: Users,
  review: Star,
};

const ICON_COLORS = {
  booking: "text-sky-500 bg-sky-500/10",
  alert: "text-amber-500 bg-amber-500/10",
  account: "text-emerald-500 bg-emerald-500/10",
  referral: "text-violet-500 bg-violet-500/10",
  review: "text-pink-500 bg-pink-500/10",
};

interface PointsEarningListProps {
  className?: string;
  /** List of actions user has already completed (for checkmarks) */
  completedActions?: string[];
}

export default function PointsEarningList({
  className,
  completedActions = [],
}: PointsEarningListProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="w-5 h-5 text-primary" />
          Ways to Earn Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {EARNING_RULES.map((rule) => {
          const Icon = ICON_MAP[rule.icon];
          const isCompleted = completedActions.includes(rule.id);
          const colorClass = ICON_COLORS[rule.icon];
          
          return (
            <div 
              key={rule.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                isCompleted && rule.oneTime 
                  ? "bg-muted/30 border-muted" 
                  : "hover:border-primary/30"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                colorClass.split(' ')[1]
              )}>
                <Icon className={cn("w-4 h-4", colorClass.split(' ')[0])} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "font-medium text-sm",
                    isCompleted && rule.oneTime && "text-muted-foreground line-through"
                  )}>
                    {rule.action}
                  </p>
                  {rule.oneTime && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                      One-time
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {rule.description}
                </p>
              </div>
              
              <div className="text-right shrink-0">
                {isCompleted && rule.oneTime ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    +{rule.points}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Compliance note */}
        <p className="text-[10px] text-muted-foreground text-center pt-2 border-t">
          {POINTS_COMPLIANCE.checkoutNote}
        </p>
      </CardContent>
    </Card>
  );
}
