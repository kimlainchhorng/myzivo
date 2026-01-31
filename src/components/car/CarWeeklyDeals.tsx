import { Calendar, ArrowRight, Percent, Clock, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const weeklyDeals = [
  { day: "Mon", discount: 15, available: true },
  { day: "Tue", discount: 20, available: true },
  { day: "Wed", discount: 25, available: true },
  { day: "Thu", discount: 15, available: true },
  { day: "Fri", discount: 5, available: true },
  { day: "Sat", discount: 0, available: false },
  { day: "Sun", discount: 10, available: true },
];

const CarWeeklyDeals = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-emerald-500/20 text-emerald-400 border-emerald-500/20">
            <Calendar className="w-3 h-3 mr-1" /> Weekly Deals
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Best Days to Rent
          </h2>
          <p className="text-muted-foreground">
            Pick up on these days for the biggest savings
          </p>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-8">
          {weeklyDeals.map((deal) => (
            <div
              key={deal.day}
              className={`p-4 rounded-xl text-center transition-all ${
                deal.discount >= 20
                  ? "bg-green-500/20 border border-green-500/30"
                  : deal.discount > 0
                  ? "bg-card/50 border border-border/50"
                  : "bg-muted/30 border border-border/30 opacity-60"
              }`}
            >
              <p className="text-xs font-bold mb-2">{deal.day}</p>
              {deal.discount > 0 ? (
                <>
                  <p className={`text-xl font-bold ${deal.discount >= 20 ? "text-green-400" : ""}`}>
                    {deal.discount}%
                  </p>
                  <p className="text-xs text-muted-foreground">off</p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Peak</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-green-400" />
              <h3 className="font-bold">Best Value</h3>
            </div>
            <p className="text-3xl font-bold text-green-400 mb-1">Wednesday</p>
            <p className="text-sm text-muted-foreground">Save up to 25% on rentals</p>
          </div>

          <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold">Off-Peak Hours</h3>
            </div>
            <p className="text-3xl font-bold text-amber-400 mb-1">Before 8 AM</p>
            <p className="text-sm text-muted-foreground">Extra 5% discount</p>
          </div>

          <div className="p-5 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-violet-400" />
              <h3 className="font-bold">Weekend Special</h3>
            </div>
            <p className="text-3xl font-bold text-violet-400 mb-1">Fri-Mon</p>
            <p className="text-sm text-muted-foreground">Pay for 3, get 4 days</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarWeeklyDeals;
