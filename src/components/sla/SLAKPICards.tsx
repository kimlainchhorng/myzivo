/**
 * SLA KPI Cards
 * Dashboard cards showing key SLA metrics
 */

import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle,
  Timer,
  TrendingUp
} from "lucide-react";
import { SLAKPIs } from "@/hooks/useSLAMetrics";
import { Skeleton } from "@/components/ui/skeleton";

interface SLAKPICardsProps {
  kpis: SLAKPIs | undefined;
  isLoading: boolean;
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}

const SLAKPICards = ({ kpis, isLoading }: SLAKPICardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "On-Time Rate",
      value: `${kpis?.onTimeRate || 0}%`,
      subtext: `${kpis?.totalDelivered || 0} delivered`,
      icon: CheckCircle2,
      color: (kpis?.onTimeRate || 0) >= 90 ? "text-green-500" : (kpis?.onTimeRate || 0) >= 75 ? "text-amber-500" : "text-destructive",
      bgColor: (kpis?.onTimeRate || 0) >= 90 ? "bg-green-500/10" : (kpis?.onTimeRate || 0) >= 75 ? "bg-amber-500/10" : "bg-destructive/10",
    },
    {
      label: "At Risk",
      value: kpis?.atRiskCount || 0,
      subtext: "active orders",
      icon: AlertTriangle,
      color: (kpis?.atRiskCount || 0) > 0 ? "text-amber-500" : "text-muted-foreground",
      bgColor: (kpis?.atRiskCount || 0) > 0 ? "bg-amber-500/10" : "bg-muted",
    },
    {
      label: "Breached",
      value: kpis?.breachedCount || 0,
      subtext: "active orders",
      icon: XCircle,
      color: (kpis?.breachedCount || 0) > 0 ? "text-destructive" : "text-muted-foreground",
      bgColor: (kpis?.breachedCount || 0) > 0 ? "bg-destructive/10" : "bg-muted",
    },
    {
      label: "Avg Assign",
      value: formatSeconds(kpis?.avgAssignSeconds || 0),
      subtext: "time to assign",
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Avg Prep",
      value: formatSeconds(kpis?.avgPrepSeconds || 0),
      subtext: "merchant prep",
      icon: Timer,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Avg Delivery",
      value: formatSeconds(kpis?.avgDeliverySeconds || 0),
      subtext: "pickup to drop",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <div className={`p-1.5 rounded-md ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.subtext}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SLAKPICards;
