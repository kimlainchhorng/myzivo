import { Plane, Hotel, Car, Globe, Shield, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  { icon: Plane, label: "Flights", description: "Compare 300+ airlines", color: "text-sky-400", bg: "bg-sky-500/20" },
  { icon: Hotel, label: "Hotels", description: "500,000+ properties", color: "text-amber-400", bg: "bg-amber-500/20" },
  { icon: Car, label: "Car Rentals", description: "50+ rental partners", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  { icon: Shield, label: "Secure", description: "Partner-verified bookings", color: "text-violet-400", bg: "bg-violet-500/20" },
];

const LiveActivityFeed = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">All-in-One Travel</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Everything You Need</h2>
          <p className="text-muted-foreground">Search, compare, and book with confidence</p>
        </div>

        <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.label}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", feature.bg)}>
                  <Icon className={cn("w-5 h-5", feature.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{feature.label}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LiveActivityFeed;
