import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, TrendingDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const generateCalendarData = () => {
  const days = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Add empty cells for days before the first of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ day: null, price: null, level: null });
  }

  // Generate prices for each day
  for (let day = 1; day <= daysInMonth; day++) {
    const basePrice = 120 + Math.random() * 80;
    const price = Math.round(basePrice);
    const level = price < 140 ? "low" : price < 170 ? "medium" : "high";
    days.push({ day, price, level });
  }

  return days;
};

const HotelPriceCalendar = () => {
  const [calendarData] = useState(generateCalendarData);
  const today = new Date();
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  const lowestPrice = Math.min(...calendarData.filter(d => d.price).map(d => d.price as number));

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-amber-500/10 via-card/50 to-orange-500/10 border border-amber-500/20 rounded-3xl p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Badge className="mb-2 bg-amber-500/20 text-amber-500 border-amber-500/30">
                <Calendar className="w-3 h-3 mr-1" /> Price Calendar
              </Badge>
              <h3 className="text-xl md:text-2xl font-display font-bold">
                Find the Cheapest Nights
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Prices vary by date - see when to book for the best deals
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">{monthName}</span>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-card/50 rounded-2xl p-4 mb-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((item, index) => (
                <button
                  key={index}
                  disabled={!item.day}
                  className={cn(
                    "aspect-square p-1 rounded-lg transition-all duration-200",
                    "flex flex-col items-center justify-center",
                    item.day && "hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
                    item.level === "low" && "bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30",
                    item.level === "medium" && "bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20",
                    item.level === "high" && "bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20",
                    !item.day && "opacity-0 cursor-default"
                  )}
                >
                  {item.day && (
                    <>
                      <span className="text-xs text-muted-foreground">{item.day}</span>
                      <span className={cn(
                        "text-xs font-bold",
                        item.level === "low" && "text-emerald-500",
                        item.level === "medium" && "text-amber-500",
                        item.level === "high" && "text-rose-500"
                      )}>
                        ${item.price}
                      </span>
                      {item.price === lowestPrice && (
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500/30 border border-emerald-500/50" />
              <span className="text-xs text-muted-foreground">Low Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500/30 border border-amber-500/50" />
              <span className="text-xs text-muted-foreground">Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-rose-500/30 border border-rose-500/50" />
              <span className="text-xs text-muted-foreground">High Price</span>
            </div>
          </div>

          {/* Best Deal Highlight */}
          <div className="mt-6 flex items-center justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="font-semibold text-sm text-emerald-500">Best Price Found</p>
                <p className="text-xs text-muted-foreground">Multiple dates available at ${lowestPrice}/night</p>
              </div>
            </div>
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
              View Dates
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelPriceCalendar;
