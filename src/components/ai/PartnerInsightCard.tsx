/**
 * ZIVO Partner Insight Card
 * AI-generated performance insights for partners
 */

import { 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  Clock,
  Star,
  DollarSign,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AIPartnerInsight } from "@/types/ai";
import { useMarkInsightRead } from "@/hooks/useAIOptimization";
import { formatDistanceToNow } from "date-fns";

interface PartnerInsightCardProps {
  insight: AIPartnerInsight;
  onAction?: () => void;
}

const INSIGHT_ICONS = {
  performance: TrendingUp,
  opportunity: Target,
  warning: AlertTriangle,
  tip: Lightbulb,
};

const INSIGHT_COLORS = {
  performance: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  opportunity: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  tip: "bg-violet-500/10 text-violet-600 border-violet-500/30",
};

export function PartnerInsightCard({ insight, onAction }: PartnerInsightCardProps) {
  const markRead = useMarkInsightRead();
  const Icon = INSIGHT_ICONS[insight.insight_type] || Lightbulb;
  const colorClass = INSIGHT_COLORS[insight.insight_type] || INSIGHT_COLORS.tip;

  const handleClick = () => {
    if (!insight.is_read) {
      markRead.mutate(insight.id);
    }
    onAction?.();
  };

  const hasMetric = insight.current_value !== null && insight.benchmark_value !== null;
  const metricPercentage = hasMetric && insight.benchmark_value
    ? (insight.current_value! / insight.benchmark_value) * 100
    : null;

  return (
    <Card 
      className={`transition-all hover:shadow-md cursor-pointer ${
        !insight.is_read ? "ring-2 ring-primary/20" : ""
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass.split(" ")[0]}`}>
            <Icon className={`w-5 h-5 ${colorClass.split(" ")[1]}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`text-[10px] ${colorClass}`}>
                {insight.insight_type}
              </Badge>
              {!insight.is_read && (
                <Badge className="text-[10px] bg-primary">New</Badge>
              )}
              {insight.impact_estimate && (
                <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">
                  {insight.impact_estimate}
                </Badge>
              )}
            </div>

            <h4 className="font-semibold">{insight.title}</h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {insight.description}
            </p>

            {/* Metric comparison */}
            {hasMetric && (
              <div className="mt-3 p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{insight.metric_name}</span>
                  <span className="font-medium">
                    {insight.current_value} / {insight.benchmark_value}
                  </span>
                </div>
                {metricPercentage !== null && (
                  <Progress value={Math.min(metricPercentage, 100)} className="h-2" />
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>{formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}</span>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                Learn more
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Partner Insights List Component
 */
interface PartnerInsightsListProps {
  insights: AIPartnerInsight[];
  maxItems?: number;
}

export function PartnerInsightsList({ insights, maxItems = 5 }: PartnerInsightsListProps) {
  const displayedInsights = insights.slice(0, maxItems);
  const unreadCount = insights.filter(i => !i.is_read).length;

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Lightbulb className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No insights yet</p>
          <p className="text-sm text-muted-foreground">
            AI insights will appear here as we learn more about your performance
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <CheckCircle2 className="w-4 h-4" />
          <span>{unreadCount} new insight{unreadCount > 1 ? "s" : ""}</span>
        </div>
      )}
      {displayedInsights.map((insight) => (
        <PartnerInsightCard key={insight.id} insight={insight} />
      ))}
      {insights.length > maxItems && (
        <Button variant="outline" className="w-full">
          View all {insights.length} insights
        </Button>
      )}
    </div>
  );
}
