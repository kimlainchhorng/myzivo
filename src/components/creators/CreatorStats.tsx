/**
 * Creator Stats Component
 * Visual performance stats for influencer dashboard
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MousePointer,
  TrendingUp,
  DollarSign,
  Award,
  Target,
  ArrowUp,
} from "lucide-react";
import { CreatorStats as CreatorStatsType } from "@/types/behaviorAnalytics";
import { cn } from "@/lib/utils";

interface CreatorStatsProps {
  stats: CreatorStatsType;
  className?: string;
}

const tierConfig = {
  starter: { label: 'Starter', color: 'slate', progress: 25 },
  rising: { label: 'Rising Star', color: 'sky', progress: 50 },
  pro: { label: 'Pro Creator', color: 'violet', progress: 75 },
  elite: { label: 'Elite Partner', color: 'amber', progress: 100 },
};

const CreatorStats = ({ stats, className }: CreatorStatsProps) => {
  const tier = tierConfig[stats.tier];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Tier Badge */}
      <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-sky-500/10 border border-primary/20">
        <Badge className={cn(
          "mb-3 text-sm px-3 py-1",
          `bg-${tier.color}-500/20 text-${tier.color}-600 border-${tier.color}-500/30`
        )}>
          <Award className="w-4 h-4 mr-1" />
          {tier.label}
        </Badge>
        <p className="text-sm text-muted-foreground mb-3">
          Keep growing to unlock more rewards
        </p>
        <Progress value={tier.progress} className="h-2 max-w-xs mx-auto" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Clicks */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MousePointer className="w-4 h-4" />
              <span className="text-xs">Total Clicks</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Conversions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="w-4 h-4" />
              <span className="text-xs">Conversions</span>
            </div>
            <p className="text-2xl font-bold">{stats.conversions.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Conversion Rate</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
              <span className="text-xs text-emerald-500 flex items-center">
                <ArrowUp className="w-3 h-3" />+0.3%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Earnings This Month */}
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">This Month</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              ${stats.earningsThisMonth.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Total Earnings */}
      <Card className="bg-gradient-to-r from-primary/5 to-sky-500/5 border-primary/20">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
          <p className="text-3xl font-bold">${stats.earningsTotal.toFixed(2)}</p>
        </CardContent>
      </Card>

      {/* Top Performing Links */}
      {stats.topLinks.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-3">Top Performing Links</h4>
            <div className="space-y-2">
              {stats.topLinks.slice(0, 3).map((link, index) => (
                <div
                  key={link.product}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm capitalize">{link.product}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{link.clicks} clicks</p>
                    <p className="text-xs text-muted-foreground">{link.conversions} conversions</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreatorStats;
