/**
 * Quick Stats Comparison Bar
 * Shows Cheapest, Fastest, and Best Value options for flight results
 */

import { Plane, Clock, Star, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface QuickStat {
  price: number;
  partner?: string;
  duration?: string;
}

interface QuickStatsBarProps {
  cheapest: QuickStat;
  fastest: QuickStat;
  bestValue: QuickStat;
  currency?: string;
  className?: string;
}

export function QuickStatsBar({
  cheapest,
  fastest,
  bestValue,
  currency = "USD",
  className,
}: QuickStatsBarProps) {
  const formatPrice = (price: number) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
    return `${symbols[currency] || '$'}${price.toLocaleString()}`;
  };

  const stats = [
    {
      label: "Cheapest",
      icon: Plane,
      price: cheapest.price,
      partner: cheapest.partner || "Aviasales",
      color: "emerald",
      bgClass: "bg-emerald-500/10",
      textClass: "text-emerald-500",
      borderClass: "border-emerald-500/30",
    },
    {
      label: "Fastest",
      icon: Clock,
      price: fastest.price,
      partner: fastest.partner || "JetRadar",
      duration: fastest.duration,
      color: "purple",
      bgClass: "bg-purple-500/10",
      textClass: "text-purple-500",
      borderClass: "border-purple-500/30",
    },
    {
      label: "Best Value",
      icon: Star,
      price: bestValue.price,
      partner: bestValue.partner || "Kiwi",
      color: "amber",
      bgClass: "bg-amber-500/10",
      textClass: "text-amber-500",
      borderClass: "border-amber-500/30",
    },
  ];

  return (
    <Card className={cn("overflow-hidden border-sky-500/20 bg-card/80 backdrop-blur-sm", className)}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-sky-500/10 to-blue-500/10 border-b border-border/50">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">Compare prices from multiple airlines and trusted partners</span>
            <Badge className="bg-sky-500/20 text-sky-500 text-[10px] gap-1">
              <Zap className="w-3 h-3" />
              Live Prices
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "flex items-center justify-center gap-3 p-4 transition-colors hover:bg-muted/30",
                stat.bgClass
              )}
            >
              <div className={cn("p-2 rounded-xl", stat.bgClass, stat.borderClass, "border")}>
                <stat.icon className={cn("w-5 h-5", stat.textClass)} />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className={cn("text-xl font-bold", stat.textClass)}>
                  {formatPrice(stat.price)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  via {stat.partner}
                  {stat.duration && <span className="ml-1">• {stat.duration}</span>}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-muted/30 border-t border-border/50">
          <p className="text-center text-[10px] text-muted-foreground">
            Prices update in real time. Final booking is completed securely on partner websites.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickStatsBar;
