import { Users, Star, Globe, Award, TrendingUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { icon: Users, value: "15M+", label: "Happy Customers", color: "text-primary" },
  { icon: Star, value: "4.9", label: "Average Rating", color: "text-amber-400" },
  { icon: Globe, value: "195", label: "Countries", color: "text-blue-400" },
  { icon: Award, value: "$2.5B", label: "Total Savings", color: "text-green-400" },
  { icon: TrendingUp, value: "50M+", label: "Bookings", color: "text-violet-400" },
  { icon: Shield, value: "100%", label: "Secure", color: "text-cyan-400" },
];

const PlatformStats = () => {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-primary/5 via-transparent to-teal-500/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  "text-center",
                  "animate-in fade-in zoom-in-95"
                )}
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-card/50 border border-border/50 flex items-center justify-center mx-auto mb-3">
                  <Icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <p className="font-display text-2xl md:text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PlatformStats;
