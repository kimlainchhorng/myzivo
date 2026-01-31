import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Car, Zap, Users, Fuel, DollarSign, Star, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const filters = [
  { icon: Car, label: "Economy", count: 45, color: "text-emerald-500", active: false },
  { icon: Car, label: "Compact", count: 32, color: "text-sky-500", active: false },
  { icon: Car, label: "SUV", count: 28, color: "text-amber-500", active: true },
  { icon: Car, label: "Luxury", count: 15, color: "text-purple-500", active: false },
  { icon: Zap, label: "Electric", count: 12, color: "text-emerald-500", active: false },
  { icon: Users, label: "7+ Seats", count: 18, color: "text-sky-500", active: false },
];

const quickFilters = [
  { icon: Fuel, label: "Free Fuel", active: false },
  { icon: Shield, label: "Full Insurance", active: true },
  { icon: Clock, label: "Free Cancellation", active: false },
  { icon: Star, label: "Top Rated", active: false },
  { icon: DollarSign, label: "Under $50/day", active: false },
];

const CarQuickFilters = () => {
  return (
    <section className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Filter className="w-3 h-3 mr-1" /> Quick Filters
            </Badge>
            <span className="text-sm text-muted-foreground">150 vehicles available</span>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">
            Clear All
          </Button>
        </div>

        {/* Vehicle Type Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.label}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 whitespace-nowrap",
                  "hover:-translate-y-0.5 active:scale-[0.98]",
                  filter.active
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/30"
                )}
              >
                <Icon className={cn("w-4 h-4", filter.active ? "text-primary" : filter.color)} />
                <span className="font-medium text-sm">{filter.label}</span>
                <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                  {filter.count}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Quick Toggle Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.label}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 whitespace-nowrap",
                  "hover:-translate-y-0.5 active:scale-[0.98]",
                  filter.active
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/30"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CarQuickFilters;
