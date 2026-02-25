import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  TrendingDown,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Flame,
  Snowflake,
  Sun,
  Leaf,
  Info,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlightPrices } from "@/hooks/useFlightPrices";
import { format, startOfMonth, addMonths } from "date-fns";

interface MonthData {
  month: string;
  year: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  trend: 'up' | 'down' | 'stable';
  season: 'peak' | 'shoulder' | 'low';
  events?: string[];
  hasRealData?: boolean;
}

interface CalendarHeatmapProps {
  className?: string;
  origin?: string;
  destination?: string;
  onMonthSelect?: (month: string, year: number) => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const generateYearData = (year: number, realPrices?: Map<string, number>): MonthData[] => {
  const basePrice = 450;
  const seasonalFactors = [0.9, 0.85, 0.95, 1.0, 1.1, 1.25, 1.4, 1.35, 1.1, 0.95, 0.9, 1.2];
  const seasons: ('peak' | 'shoulder' | 'low')[] = ['low', 'low', 'shoulder', 'shoulder', 'shoulder', 'peak', 'peak', 'peak', 'shoulder', 'shoulder', 'low', 'peak'];
  
  return MONTHS.map((month, i) => {
    const monthKey = `${year}-${String(i + 1).padStart(2, '0')}`;
    const hasRealData = realPrices?.has(monthKey);
    
    // Use real price if available, otherwise calculate
    const factor = seasonalFactors[i];
    let avgPrice = hasRealData ? realPrices!.get(monthKey)! : Math.round(basePrice * factor);
    const variance = avgPrice * 0.2;
    
    return {
      month,
      year,
      avgPrice,
      minPrice: Math.round(avgPrice - variance),
      maxPrice: Math.round(avgPrice + variance),
      trend: factor > 1.1 ? 'up' : factor < 0.95 ? 'down' : 'stable',
      season: seasons[i],
      events: i === 11 ? ['Christmas', 'New Year'] : i === 6 ? ['Summer Peak'] : undefined,
      hasRealData,
    };
  });
};

export const CalendarHeatmap = ({ 
  className, 
  origin = "JFK",
  destination = "LHR",
  onMonthSelect,
}: CalendarHeatmapProps) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);
  const [viewMode, setViewMode] = useState<'year' | 'compare'>('year');

  // Fetch real prices for multiple months
  const { data: priceData, isLoading } = useFlightPrices({
    origin,
    destination,
    departureDate: `${selectedYear}-01`,
    enabled: origin.length === 3 && destination.length === 3,
  });

  // Build a map of real prices by month
  const realPricesMap = useMemo(() => {
    if (!priceData?.success || !priceData.prices) return new Map<string, number>();
    
    const pricesByMonth = new Map<string, number[]>();
    priceData.prices.forEach(p => {
      const monthKey = p.departureAt.substring(0, 7);
      if (!pricesByMonth.has(monthKey)) {
        pricesByMonth.set(monthKey, []);
      }
      pricesByMonth.get(monthKey)!.push(p.price);
    });
    
    // Get average price per month
    const avgPrices = new Map<string, number>();
    pricesByMonth.forEach((prices, month) => {
      avgPrices.set(month, Math.round(prices.reduce((a, b) => a + b, 0) / prices.length));
    });
    
    return avgPrices;
  }, [priceData]);

  const hasRealPrices = realPricesMap.size > 0;
  
  const yearData = useMemo(() => generateYearData(selectedYear, realPricesMap), [selectedYear, realPricesMap]);
  const prevYearData = useMemo(() => generateYearData(selectedYear - 1), [selectedYear]);

  const minPrice = Math.min(...yearData.map(m => m.minPrice));
  const maxPrice = Math.max(...yearData.map(m => m.maxPrice));
  const cheapestMonth = yearData.find(m => m.minPrice === minPrice);

  const getPriceColor = (price: number) => {
    const range = maxPrice - minPrice;
    const normalized = (price - minPrice) / range;
    
    if (normalized < 0.33) return 'bg-emerald-500';
    if (normalized < 0.66) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getSeasonIcon = (season: 'peak' | 'shoulder' | 'low') => {
    switch (season) {
      case 'peak': return Flame;
      case 'shoulder': return Sun;
      case 'low': return Snowflake;
    }
  };

  const getSeasonColor = (season: 'peak' | 'shoulder' | 'low') => {
    switch (season) {
      case 'peak': return 'text-rose-400';
      case 'shoulder': return 'text-amber-400';
      case 'low': return 'text-emerald-400';
    }
  };

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/40 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">Price Calendar</CardTitle>
                {hasRealPrices && (
                  <Badge variant="outline" className="bg-sky-500/10 text-sky-500 border-sky-500/30">
                    <Zap className="w-3 h-3 mr-1" />
                    Live Prices
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {origin} → {destination} • Best times to fly
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSelectedYear(selectedYear - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSelectedYear(selectedYear + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Best Time Banner */}
        {cheapestMonth && (
          <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-b border-emerald-500/30">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="font-medium">Best time to book: {cheapestMonth.month} {selectedYear}</p>
                <p className="text-sm text-muted-foreground">
                  Prices as low as ${cheapestMonth.minPrice} - Save up to ${maxPrice - cheapestMonth.minPrice}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Heatmap Grid */}
        <div className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
              {yearData.map((month, i) => {
                const SeasonIcon = getSeasonIcon(month.season);
                const isSelected = selectedMonth?.month === month.month;
                
                return (
                  <motion.button
                    key={month.month}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => {
                      setSelectedMonth(isSelected ? null : month);
                      if (!isSelected && onMonthSelect) {
                        onMonthSelect(month.month, month.year);
                      }
                    }}
                    className={cn(
                      "relative p-3 rounded-xl border transition-all text-center",
                      isSelected 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-border/50 hover:border-border"
                    )}
                  >
                    {/* Price indicator bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl overflow-hidden">
                      <div 
                        className={cn("h-full", getPriceColor(month.avgPrice))}
                        style={{ width: `${((month.avgPrice - minPrice) / (maxPrice - minPrice)) * 100}%` }}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground mb-1">{month.month}</p>
                    <p className="text-lg font-bold">${month.avgPrice}</p>
                    
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <SeasonIcon className={cn("w-3 h-3", getSeasonColor(month.season))} />
                      {month.trend === 'down' && <TrendingDown className="w-3 h-3 text-emerald-400" />}
                      {month.trend === 'up' && <TrendingUp className="w-3 h-3 text-rose-400" />}
                      {month.hasRealData && <Zap className="w-3 h-3 text-sky-400" />}
                    </div>

                    {month.events && (
                      <Badge className="absolute -top-2 -right-2 text-[10px] px-1 bg-amber-500">
                        !
                      </Badge>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500" />
              <span className="text-muted-foreground">Low (${minPrice}-{Math.round(minPrice + (maxPrice-minPrice)*0.33)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500" />
              <span className="text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-rose-500" />
              <span className="text-muted-foreground">High (${Math.round(minPrice + (maxPrice-minPrice)*0.66)}-{maxPrice})</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-2 text-sm">
            <div className="flex items-center gap-2">
              <Snowflake className="w-4 h-4 text-emerald-400" />
              <span className="text-muted-foreground">Low Season</span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-muted-foreground">Shoulder</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <span className="text-muted-foreground">Peak Season</span>
            </div>
            {hasRealPrices && (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-400" />
                <span className="text-muted-foreground">Live Price Data</span>
              </div>
            )}
          </div>
        </div>

        {/* Selected Month Details */}
        {selectedMonth && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-border/50 bg-muted/20"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold">{selectedMonth.month} {selectedMonth.year}</h4>
                <Badge className={cn("mt-1", 
                  selectedMonth.season === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedMonth.season === 'peak' ? 'bg-rose-500/20 text-rose-400' :
                  'bg-amber-500/20 text-amber-400'
                )}>
                  {selectedMonth.season.charAt(0).toUpperCase() + selectedMonth.season.slice(1)} Season
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Price Range</p>
                <p className="text-lg font-bold">
                  ${selectedMonth.minPrice} - ${selectedMonth.maxPrice}
                </p>
              </div>
            </div>

            {selectedMonth.events && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-4">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">
                    Events: {selectedMonth.events.join(', ')} - Expect higher prices
                  </span>
                </div>
              </div>
            )}

            {/* Year-over-year comparison */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
              <p className="text-sm text-muted-foreground mb-2">vs. Last Year</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-lg font-bold">${selectedMonth.avgPrice}</p>
                  <p className="text-xs text-muted-foreground">{selectedMonth.year}</p>
                </div>
                <div className="text-muted-foreground">vs</div>
                <div>
                  <p className="text-lg font-bold">${prevYearData[MONTHS.indexOf(selectedMonth.month)].avgPrice}</p>
                  <p className="text-xs text-muted-foreground">{selectedMonth.year - 1}</p>
                </div>
                <Badge className={cn(
                  selectedMonth.avgPrice < prevYearData[MONTHS.indexOf(selectedMonth.month)].avgPrice
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                )}>
                  {selectedMonth.avgPrice < prevYearData[MONTHS.indexOf(selectedMonth.month)].avgPrice ? '↓' : '↑'}
                  ${Math.abs(selectedMonth.avgPrice - prevYearData[MONTHS.indexOf(selectedMonth.month)].avgPrice)}
                </Badge>
              </div>
            </div>

            <Button 
              className="w-full mt-4"
              onClick={() => {
                if (onMonthSelect) {
                  onMonthSelect(selectedMonth.month, selectedMonth.year);
                }
              }}
            >
              Search {selectedMonth.month} {selectedMonth.year} Flights
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarHeatmap;
