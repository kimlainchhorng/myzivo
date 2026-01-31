import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, TrendingDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlightPriceCalendarProps {
  className?: string;
  onSelectDate?: (date: string) => void;
}

export default function FlightPriceCalendar({ className, onSelectDate }: FlightPriceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate mock price data for the calendar
  const generatePriceData = () => {
    const prices: { [key: number]: { price: number; trend: 'low' | 'medium' | 'high' } } = {};
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const basePrice = 150 + Math.random() * 200;
      const price = Math.round(basePrice);
      const trend = price < 200 ? 'low' : price < 280 ? 'medium' : 'high';
      prices[day] = { price, trend };
    }
    return prices;
  };

  const [priceData] = useState(generatePriceData);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getTrendColor = (trend: 'low' | 'medium' | 'high') => {
    switch (trend) {
      case 'low': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'high': return 'bg-rose-500/20 text-rose-500 border-rose-500/30';
    }
  };

  const lowestPrice = Math.min(...Object.values(priceData).map(p => p.price));

  return (
    <section className={cn("py-10 sm:py-16", className)}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
            <Calendar className="w-4 h-4 mr-2" />
            Price Calendar
          </Badge>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Find the Cheapest Days to Fly
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore prices across the month to find the best deals for your trip
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="icon" onClick={prevMonth} className="touch-manipulation">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3 className="text-lg sm:text-xl font-semibold">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="touch-manipulation">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs sm:text-sm text-muted-foreground font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first of the month */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const { price, trend } = priceData[day];
                  const isLowest = price === lowestPrice;
                  
                  return (
                    <button
                      key={day}
                      onClick={() => onSelectDate?.(
                        `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      )}
                      className={cn(
                        "aspect-square p-1 rounded-lg border transition-all duration-200 touch-manipulation",
                        "hover:scale-105 hover:shadow-lg active:scale-95",
                        getTrendColor(trend),
                        isLowest && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background"
                      )}
                    >
                      <div className="h-full flex flex-col items-center justify-center">
                        <span className="text-xs sm:text-sm font-medium">{day}</span>
                        <span className="text-[10px] sm:text-xs font-bold">${price}</span>
                        {isLowest && <Sparkles className="w-3 h-3 mt-0.5 animate-pulse" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/30" />
                  <span className="text-xs text-muted-foreground">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/30" />
                  <span className="text-xs text-muted-foreground">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-rose-500/20 border border-rose-500/30" />
                  <span className="text-xs text-muted-foreground">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Best Price</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
