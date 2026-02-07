/**
 * AnalyticsKPICards - KPI display cards with real-time counters
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, DollarSign, TrendingUp, Users, Calculator, CheckCircle } from "lucide-react";
import type { AnalyticsKPIs } from "@/hooks/useDispatchAnalytics";

interface AnalyticsKPICardsProps {
  kpis: AnalyticsKPIs | undefined;
  isLoading: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const AnalyticsKPICards = ({ kpis, isLoading }: AnalyticsKPICardsProps) => {
  const cards = [
    {
      title: "Total Orders",
      value: kpis?.ordersTotal || 0,
      icon: Package,
      format: "number" as const,
      description: `${kpis?.ordersDelivered || 0} delivered`,
    },
    {
      title: "Revenue",
      value: kpis?.revenueTotal || 0,
      icon: DollarSign,
      format: "currency" as const,
      description: "From delivered orders",
    },
    {
      title: "Platform Profit",
      value: kpis?.profitTotal || 0,
      icon: TrendingUp,
      format: "currency" as const,
      description: "Platform fees earned",
    },
    {
      title: "Drivers Online",
      value: kpis?.driversOnline || 0,
      icon: Users,
      format: "number" as const,
      description: "Active now",
    },
    {
      title: "Avg Order Value",
      value: kpis?.avgOrderValue || 0,
      icon: Calculator,
      format: "currency" as const,
      description: "Per delivered order",
    },
    {
      title: "Completion Rate",
      value: kpis?.completionRate || 0,
      icon: CheckCircle,
      format: "percent" as const,
      description: `${kpis?.ordersCancelled || 0} cancelled`,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {card.format === "currency"
                      ? formatCurrency(card.value)
                      : card.format === "percent"
                      ? formatPercent(card.value)
                      : card.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
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

export default AnalyticsKPICards;
