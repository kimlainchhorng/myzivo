import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingDown, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const alternativeDates = [
  { date: "Mon, Jan 20", price: 349, savings: 0, isCurrent: true },
  { date: "Tue, Jan 21", price: 329, savings: 20, isBest: true },
  { date: "Wed, Jan 22", price: 359, savings: -10 },
  { date: "Thu, Jan 23", price: 389, savings: -40 },
  { date: "Fri, Jan 24", price: 419, savings: -70 },
  { date: "Sat, Jan 25", price: 399, savings: -50 },
  { date: "Sun, Jan 26", price: 339, savings: 10 },
];

const FlightAlternativeDates = () => {
  return (
    <section className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Badge className="mb-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <Calendar className="w-3 h-3 mr-1" /> Flexible Dates
          </Badge>
          <h3 className="text-xl font-display font-bold">
            Save More with Flexible Travel Dates
          </h3>
          <p className="text-sm text-muted-foreground">
            See how prices vary by flying a day earlier or later
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {alternativeDates.map((alt, index) => (
            <button
              key={alt.date}
              className={cn(
                "flex-shrink-0 p-4 rounded-2xl border transition-all duration-200 min-w-[140px]",
                "hover:-translate-y-1 active:scale-[0.98]",
                alt.isCurrent 
                  ? "bg-sky-500/10 border-sky-500/30" 
                  : alt.isBest 
                    ? "bg-emerald-500/10 border-emerald-500/30 ring-2 ring-emerald-500/50"
                    : "bg-card/50 border-border/50 hover:border-primary/30"
              )}
            >
              {alt.isBest && (
                <Badge className="mb-2 bg-emerald-500 text-white border-0 text-[10px]">
                  <Sparkles className="w-3 h-3 mr-1" /> Best Price
                </Badge>
              )}
              {alt.isCurrent && (
                <Badge className="mb-2 bg-sky-500/20 text-sky-500 border-0 text-[10px]">
                  Selected
                </Badge>
              )}
              
              <p className="text-xs text-muted-foreground mb-1">{alt.date}</p>
              <p className={cn(
                "text-xl font-bold",
                alt.isBest ? "text-emerald-500" : alt.isCurrent ? "text-sky-500" : "text-foreground"
              )}>
                ${alt.price}
              </p>
              
              {alt.savings !== 0 && (
                <div className={cn(
                  "flex items-center gap-1 text-xs mt-1",
                  alt.savings > 0 ? "text-emerald-500" : "text-rose-500"
                )}>
                  <TrendingDown className={cn("w-3 h-3", alt.savings < 0 && "rotate-180")} />
                  <span>
                    {alt.savings > 0 ? `Save $${alt.savings}` : `+$${Math.abs(alt.savings)}`}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-500" />
            <span className="text-sm">
              <span className="font-bold text-emerald-500">Save $20</span>
              <span className="text-muted-foreground"> by flying on Tuesday instead</span>
            </span>
          </div>
          <Button size="sm" variant="outline" className="gap-1 text-emerald-500 border-emerald-500/30">
            Switch Date <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FlightAlternativeDates;
