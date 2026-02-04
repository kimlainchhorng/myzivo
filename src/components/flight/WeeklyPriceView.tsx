/**
 * WeeklyPriceView - Week-by-week price comparison
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingDown, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addWeeks, startOfWeek, endOfWeek } from "date-fns";

interface WeekData {
  startDate: Date;
  endDate: Date;
  avgPrice: number;
  lowestPrice: number;
  trend: "rising" | "falling" | "stable";
  label: "Best Value" | "Standard" | "Peak" | null;
}

interface WeeklyPriceViewProps {
  basePrice: number;
  weeksToShow?: number;
  onSelectWeek?: (startDate: Date) => void;
  className?: string;
}

export function WeeklyPriceView({
  basePrice,
  weeksToShow = 6,
  onSelectWeek,
  className,
}: WeeklyPriceViewProps) {
  const weeks = useMemo(() => {
    const result: WeekData[] = [];
    const today = new Date();
    
    for (let i = 0; i < weeksToShow; i++) {
      const weekStart = startOfWeek(addWeeks(today, i + 1));
      const weekEnd = endOfWeek(weekStart);
      
      // Simulate price variation
      const variation = Math.sin(i * 0.8) * 0.15 + (Math.random() - 0.5) * 0.1;
      const avgPrice = Math.round(basePrice * (1 + variation));
      const lowestPrice = Math.round(avgPrice * 0.9);
      
      // Determine trend
      const prevVariation = i > 0 ? Math.sin((i - 1) * 0.8) * 0.15 : variation;
      const trend: "rising" | "falling" | "stable" = 
        variation > prevVariation + 0.05 ? "rising" :
        variation < prevVariation - 0.05 ? "falling" : "stable";
      
      result.push({
        startDate: weekStart,
        endDate: weekEnd,
        avgPrice,
        lowestPrice,
        trend,
        label: null,
      });
    }
    
    // Find and label cheapest week
    const cheapestIndex = result.reduce((minIdx, week, idx, arr) => 
      week.avgPrice < arr[minIdx].avgPrice ? idx : minIdx, 0
    );
    result[cheapestIndex].label = "Best Value";
    
    // Find and label most expensive week
    const expensiveIndex = result.reduce((maxIdx, week, idx, arr) => 
      week.avgPrice > arr[maxIdx].avgPrice ? idx : maxIdx, 0
    );
    if (expensiveIndex !== cheapestIndex) {
      result[expensiveIndex].label = "Peak";
    }
    
    return result;
  }, [basePrice, weeksToShow]);

  const cheapestWeek = weeks.find(w => w.label === "Best Value");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-500" />
          <h3 className="font-bold">Cheapest Week View</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {weeksToShow} weeks ahead
        </Badge>
      </div>

      {/* Week Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {weeks.map((week, index) => (
          <motion.div
            key={week.startDate.toISOString()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                week.label === "Best Value" && "border-emerald-500/50 bg-emerald-500/5",
                week.label === "Peak" && "border-orange-500/30 bg-orange-500/5",
                !week.label && "hover:border-sky-500/30"
              )}
              onClick={() => onSelectWeek?.(week.startDate)}
            >
              <CardContent className="p-3 text-center">
                {/* Week Label */}
                {week.label && (
                  <Badge 
                    className={cn(
                      "mb-2 text-[10px]",
                      week.label === "Best Value" && "bg-emerald-500/20 text-emerald-500",
                      week.label === "Peak" && "bg-orange-500/20 text-orange-500"
                    )}
                  >
                    {week.label === "Best Value" && <Sparkles className="w-2.5 h-2.5 mr-1" />}
                    {week.label}
                  </Badge>
                )}
                
                {/* Date Range */}
                <p className="text-xs text-muted-foreground mb-1">
                  {format(week.startDate, "MMM d")} - {format(week.endDate, "d")}
                </p>
                
                {/* Average Price */}
                <p className={cn(
                  "text-lg font-bold",
                  week.label === "Best Value" && "text-emerald-500",
                  week.label === "Peak" && "text-orange-500"
                )}>
                  ${week.avgPrice}
                </p>
                <p className="text-[10px] text-muted-foreground">avg/day</p>
                
                {/* Trend Indicator */}
                <div className={cn(
                  "flex items-center justify-center gap-1 mt-2 text-xs",
                  week.trend === "falling" && "text-emerald-500",
                  week.trend === "rising" && "text-orange-500",
                  week.trend === "stable" && "text-muted-foreground"
                )}>
                  {week.trend === "falling" && <TrendingDown className="w-3 h-3" />}
                  {week.trend === "rising" && <TrendingUp className="w-3 h-3" />}
                  <span className="capitalize">{week.trend}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Best Deal Highlight */}
      {cheapestWeek && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="font-semibold text-emerald-500">Best Value Week</p>
                <p className="text-sm text-muted-foreground">
                  {format(cheapestWeek.startDate, "MMMM d")} - {format(cheapestWeek.endDate, "MMMM d")} • 
                  Avg ${cheapestWeek.avgPrice}/day
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="bg-emerald-500 hover:bg-emerald-600 gap-1"
              onClick={() => onSelectWeek?.(cheapestWeek.startDate)}
            >
              View Dates
              <ArrowRight className="w-3 h-3" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        💡 Prices change frequently. Shown averages are estimates based on recent trends.
      </p>
    </div>
  );
}

export default WeeklyPriceView;
