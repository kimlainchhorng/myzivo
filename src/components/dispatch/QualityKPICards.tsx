/**
 * QualityKPICards - Quality metrics KPI cards
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Star, AlertTriangle, MessageSquare, TrendingUp } from "lucide-react";
import type { QualityKPIs } from "@/hooks/useQualityMetrics";

interface QualityKPICardsProps {
  kpis: QualityKPIs | undefined;
  isLoading: boolean;
}

const QualityKPICards = ({ kpis, isLoading }: QualityKPICardsProps) => {
  const cards = [
    {
      title: "Avg Driver Rating",
      value: kpis?.avgDriverRating || 0,
      subValue: `7d: ${kpis?.avgDriverRating7d || 0}`,
      icon: Star,
      format: "rating" as const,
    },
    {
      title: "Avg Merchant Rating",
      value: kpis?.avgMerchantRating || 0,
      subValue: `7d: ${kpis?.avgMerchantRating7d || 0}`,
      icon: Star,
      format: "rating" as const,
    },
    {
      title: "Complaint Rate",
      value: kpis?.complaintRate || 0,
      subValue: "Orders with issues",
      icon: AlertTriangle,
      format: "percent" as const,
      warning: (kpis?.complaintRate || 0) > 10,
    },
    {
      title: "Total Ratings",
      value: kpis?.totalRatings || 0,
      subValue: `${kpis?.totalRatings7d || 0} this week`,
      icon: MessageSquare,
      format: "number" as const,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.warning ? "text-destructive" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className={`text-2xl font-bold ${card.warning ? "text-destructive" : ""}`}>
                    {card.format === "rating" ? (
                      <span className="flex items-center gap-1">
                        {card.value.toFixed(1)}
                        <Star className="h-4 w-4 fill-primary text-primary" />
                      </span>
                    ) : card.format === "percent" ? (
                      `${card.value}%`
                    ) : (
                      card.value.toLocaleString()
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.subValue}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QualityKPICards;
