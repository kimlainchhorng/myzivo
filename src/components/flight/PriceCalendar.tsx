import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingDown,
  TrendingUp,
  CalendarDays,
  Sparkles,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore } from "date-fns";
import { useFlightPrices, getLowestPriceForDate } from "@/hooks/useFlightPrices";

interface PriceCalendarProps {
  basePrice: number;
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  fromCode: string;
  toCode: string;
}

const PriceCalendar = ({
  basePrice,
  selectedDate,
  onSelectDate,
  fromCode,
  toCode
}: PriceCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch real prices from Travelpayouts API
  const departureMonth = format(currentMonth, 'yyyy-MM');
  const { data: priceData, isLoading, isError } = useFlightPrices({
    origin: fromCode,
    destination: toCode,
    departureDate: departureMonth,
    enabled: fromCode.length === 3 && toCode.length === 3,
  });

  // Fallback price generator for when API doesn't have data
  const getFallbackPrice = (date: Date): number => {
    const seed = date.getDate() + date.getMonth() * 31 + fromCode.charCodeAt(0) + toCode.charCodeAt(0);
    const dayOfWeek = date.getDay();
    let variation = ((seed * 9301 + 49297) % 233280) / 233280;
    variation = (variation - 0.5) * 0.4;
    if (dayOfWeek === 0 || dayOfWeek === 6) variation += 0.15;
    if (dayOfWeek === 2 || dayOfWeek === 3) variation -= 0.1;
    const month = date.getMonth();
    if (month === 11 || month === 6 || month === 7) variation += 0.2;
    return Math.round(basePrice * (1 + variation));
  };

  // Calculate prices for the month - use real data when available
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    return days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const realPrice = priceData?.prices ? getLowestPriceForDate(priceData.prices, dateStr) : null;
      
      return {
        date,
        price: realPrice ?? getFallbackPrice(date),
        isRealPrice: realPrice !== null,
        isPast: isBefore(date, today)
      };
    });
  }, [currentMonth, basePrice, fromCode, toCode, priceData]);

  // Find lowest and highest prices
  const futureDays = monthDays.filter(d => !d.isPast);
  const lowestPrice = futureDays.length > 0 ? Math.min(...futureDays.map(d => d.price)) : basePrice;
  const highestPrice = futureDays.length > 0 ? Math.max(...futureDays.map(d => d.price)) : basePrice;

  const getPriceCategory = (price: number): 'low' | 'medium' | 'high' => {
    const range = highestPrice - lowestPrice;
    if (range === 0) return 'medium';
    const normalized = (price - lowestPrice) / range;
    if (normalized < 0.33) return 'low';
    if (normalized > 0.66) return 'high';
    return 'medium';
  };

  const priceColors = {
    low: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 hover:border-emerald-500',
    medium: 'bg-sky-500/10 text-muted-foreground border-border/50 hover:border-sky-500/50',
    high: 'bg-orange-500/10 text-orange-500/80 border-orange-500/30 hover:border-orange-500'
  };

  // Get day of week headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Pad start of month with empty cells
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const paddedDays = Array(firstDayOfMonth).fill(null);

  return (
    <div className="bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-sky-500" />
            Price Calendar
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </h3>
          <p className="text-sm text-muted-foreground">
            {fromCode} → {toCode} • {priceData?.prices?.length ? 'Real prices' : 'Estimated fares'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/30" />
          <span className="text-muted-foreground">Low prices</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-sky-500/20" />
          <span className="text-muted-foreground">Average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500/20" />
          <span className="text-muted-foreground">Higher prices</span>
        </div>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty padding cells */}
        {paddedDays.map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}
        
        {/* Day cells */}
        {monthDays.map(({ date, price, isPast, isRealPrice }) => {
          const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const category = getPriceCategory(price);
          const isLowest = price === lowestPrice && !isPast;
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => !isPast && onSelectDate(date)}
              disabled={isPast}
              className={cn(
                "relative aspect-square rounded-xl border transition-all duration-200 flex flex-col items-center justify-center p-1",
                isPast 
                  ? 'opacity-40 cursor-not-allowed bg-muted/30' 
                  : priceColors[category],
                isSelected && 'ring-2 ring-sky-500 ring-offset-2 ring-offset-background',
                !isPast && 'hover:scale-105 active:scale-95'
              )}
            >
              {/* Lowest price indicator */}
              {isLowest && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              
              <span className={cn(
                "text-sm font-semibold",
                isToday(date) && "text-sky-500"
              )}>
                {format(date, 'd')}
              </span>
              <span className={cn(
                "text-[10px] font-bold",
                category === 'low' ? 'text-emerald-500' : category === 'high' ? 'text-orange-500' : 'text-muted-foreground'
              )}>
                ${price}
              </span>
            </button>
          );
        })}
      </div>

      {/* Price insights */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lowest this month</p>
              <p className="text-lg font-bold text-emerald-500">${lowestPrice}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peak prices</p>
              <p className="text-lg font-bold text-orange-500">${highestPrice}</p>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          💡 {priceData?.prices?.length ? 'Prices updated in real-time from airlines' : 'Tip: Fly on Tuesdays & Wednesdays for the best deals'}
        </p>
      </div>
    </div>
  );
};

export default PriceCalendar;
