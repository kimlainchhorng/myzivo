import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Plane,
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles
} from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface FlexibleDatesCalendarProps {
  origin: string;
  destination: string;
  onSelectDate?: (date: Date, price: number) => void;
  basePrice?: number;
  className?: string;
}

const generatePriceForDate = (date: Date, basePrice: number): number => {
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
  
  // Weekends are more expensive
  let multiplier = 1;
  if (dayOfWeek === 0 || dayOfWeek === 6) multiplier += 0.15;
  
  // Mid-week is cheaper
  if (dayOfWeek === 2 || dayOfWeek === 3) multiplier -= 0.1;
  
  // Random variation based on date
  const seed = dayOfMonth * 17 + date.getMonth() * 31;
  const variation = ((seed % 30) - 15) / 100;
  multiplier += variation;
  
  // Holidays and peak times
  const month = date.getMonth();
  if (month === 6 || month === 7 || month === 11) multiplier += 0.2; // Summer & December
  
  return Math.round(basePrice * multiplier);
};

const getPriceCategory = (price: number, avgPrice: number): 'low' | 'medium' | 'high' => {
  const diff = (price - avgPrice) / avgPrice;
  if (diff < -0.08) return 'low';
  if (diff > 0.08) return 'high';
  return 'medium';
};

export const FlexibleDatesCalendar = ({
  origin,
  destination,
  onSelectDate,
  basePrice = 450,
  className
}: FlexibleDatesCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate prices for all days
  const pricesMap = useMemo(() => {
    const map = new Map<string, number>();
    daysInMonth.forEach(day => {
      map.set(format(day, 'yyyy-MM-dd'), generatePriceForDate(day, basePrice));
    });
    return map;
  }, [daysInMonth, basePrice]);

  const avgPrice = useMemo(() => {
    const prices = Array.from(pricesMap.values());
    return prices.reduce((a, b) => a + b, 0) / prices.length;
  }, [pricesMap]);

  const lowestPrice = useMemo(() => Math.min(...Array.from(pricesMap.values())), [pricesMap]);
  const highestPrice = useMemo(() => Math.max(...Array.from(pricesMap.values())), [pricesMap]);

  const cheapestDays = useMemo(() => {
    return daysInMonth
      .filter(day => !isBefore(day, new Date()))
      .sort((a, b) => {
        const priceA = pricesMap.get(format(a, 'yyyy-MM-dd')) || 0;
        const priceB = pricesMap.get(format(b, 'yyyy-MM-dd')) || 0;
        return priceA - priceB;
      })
      .slice(0, 3);
  }, [daysInMonth, pricesMap]);

  // Get first day of week offset
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  const handleDateClick = (day: Date) => {
    if (isBefore(day, new Date())) return;
    setSelectedDate(day);
    const price = pricesMap.get(format(day, 'yyyy-MM-dd')) || basePrice;
    onSelectDate?.(day, price);
  };

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/10 border border-sky-500/40 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Flexible Dates</CardTitle>
              <p className="text-sm text-muted-foreground">
                {origin} → {destination}
              </p>
            </div>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              disabled={isSameMonth(currentMonth, new Date())}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-semibold min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Cheapest Days Banner */}
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Best deals this month</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {cheapestDays.map((day, i) => (
              <Badge
                key={i}
                variant="outline"
                className="bg-emerald-500/20 border-emerald-500/40 text-emerald-300 cursor-pointer hover:bg-emerald-500/30"
                onClick={() => handleDateClick(day)}
              >
                {format(day, 'EEE, MMM d')} - ${pricesMap.get(format(day, 'yyyy-MM-dd'))}
              </Badge>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
          
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {daysInMonth.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const price = pricesMap.get(dateKey) || basePrice;
            const category = getPriceCategory(price, avgPrice);
            const isPast = isBefore(day, new Date()) && !isToday(day);
            const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateKey;
            
            return (
              <motion.button
                key={dateKey}
                whileHover={{ scale: isPast ? 1 : 1.05 }}
                whileTap={{ scale: isPast ? 1 : 0.95 }}
                onClick={() => handleDateClick(day)}
                disabled={isPast}
                className={cn(
                  "aspect-square rounded-lg p-1 flex flex-col items-center justify-center transition-all relative",
                  isPast && "opacity-40 cursor-not-allowed",
                  !isPast && "cursor-pointer hover:ring-2 hover:ring-primary/50",
                  isSelected && "ring-2 ring-primary bg-primary/20",
                  isToday(day) && "ring-1 ring-sky-500/50",
                  category === 'low' && !isPast && "bg-emerald-500/10",
                  category === 'high' && !isPast && "bg-red-500/10",
                  category === 'medium' && !isPast && "bg-muted/30"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  isToday(day) && "text-sky-400"
                )}>
                  {format(day, 'd')}
                </span>
                {!isPast && (
                  <span className={cn(
                    "text-[10px] font-semibold",
                    category === 'low' && "text-emerald-400",
                    category === 'high' && "text-red-400",
                    category === 'medium' && "text-muted-foreground"
                  )}>
                    ${price}
                  </span>
                )}
                {category === 'low' && !isPast && price === lowestPrice && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                    <TrendingDown className="w-2 h-2 text-white" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500/30" />
            <span className="text-xs text-muted-foreground">Low (under ${Math.round(avgPrice * 0.92)})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted/50" />
            <span className="text-xs text-muted-foreground">Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500/30" />
            <span className="text-xs text-muted-foreground">High (over ${Math.round(avgPrice * 1.08)})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlexibleDatesCalendar;
