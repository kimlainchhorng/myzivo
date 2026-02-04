/**
 * Scale Scenario Card
 * Displays growth projections at different timeframes
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Users, DollarSign, Rocket } from "lucide-react";
import { SCALE_SCENARIOS } from "@/config/revenueAssumptions";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface ScaleScenarioCardProps {
  className?: string;
  compact?: boolean;
}

const scenarioStyles = {
  Conservative: {
    gradient: 'from-slate-500/10 to-slate-600/10',
    border: 'border-slate-500/30',
    badge: 'bg-slate-500/20 text-slate-400',
  },
  Growth: {
    gradient: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-500',
  },
  Scale: {
    gradient: 'from-primary/10 to-violet-500/10',
    border: 'border-primary/30',
    badge: 'bg-primary/20 text-primary',
  },
};

export const ScaleScenarioCard = ({ className, compact = false }: ScaleScenarioCardProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          Growth Scenarios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-4", compact ? "" : "md:grid-cols-3")}>
          {SCALE_SCENARIOS.map((scenario) => {
            const styles = scenarioStyles[scenario.name as keyof typeof scenarioStyles];
            
            return (
              <div
                key={scenario.name}
                className={cn(
                  "p-5 rounded-xl border bg-gradient-to-br",
                  styles.gradient,
                  styles.border
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <Badge className={styles.badge}>
                    {scenario.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {scenario.timeframe}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Bookings/mo:</span>
                    <span className="font-semibold">
                      {scenario.bookingsPerMonth.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Blended:</span>
                    <span className="font-semibold">
                      ${scenario.blendedCommission}/booking
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t border-border/50">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground">Monthly</span>
                      <span className="font-bold text-lg">
                        {formatPrice(scenario.monthlyRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-sm text-muted-foreground">Annual</span>
                      <span className="font-bold text-xl">
                        {scenario.annualRevenue >= 1000000 
                          ? `$${(scenario.annualRevenue / 1000000).toFixed(1)}M`
                          : formatPrice(scenario.annualRevenue)
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                {!compact && (
                  <p className="text-xs text-muted-foreground mt-4">
                    {scenario.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScaleScenarioCard;
