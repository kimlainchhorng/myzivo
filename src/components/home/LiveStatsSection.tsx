import { Users, UtensilsCrossed, Star, Clock, Sparkles, TrendingUp, Globe } from "lucide-react";
import { StatCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

const LiveStatsSection = () => {
  return (
    <section className="py-10 sm:py-14 lg:py-24 border-y border-border/40 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-eats/8" />
      <div className="absolute top-1/2 left-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-gradient-radial from-eats/10 to-transparent rounded-full blur-3xl" />
      
      {/* Floating icons */}
      <div className="absolute top-20 left-[8%] hidden md:block opacity-30">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-400/20 flex items-center justify-center backdrop-blur-sm">
          <TrendingUp className="w-6 h-6 text-primary/60" />
        </div>
      </div>
      <div className="absolute bottom-20 right-[10%] hidden md:block opacity-25">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center backdrop-blur-sm">
          <Globe className="w-6 h-6 text-sky-400/60" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-teal-400/15 border border-primary/25 text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-lg shadow-primary/10 animate-in zoom-in-95 duration-300">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-muted-foreground">Live Platform Stats</span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-primary via-teal-400 to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                millions
              </span>
              {" "}worldwide
            </h2>
          </div>

          {/* Stats Grid - improved mobile layout */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {[
              { value: "2.5M+", label: "Active riders", icon: Users, trend: { value: "12%", positive: true }, color: "rides" as const, delay: "0" },
              { value: "50K+", label: "Partner restaurants", icon: UtensilsCrossed, trend: { value: "8%", positive: true }, color: "eats" as const, delay: "75" },
              { value: "4.9★", label: "Average rating", icon: Star, trend: { value: "0.2", positive: true }, color: "amber" as const, delay: "150" },
              { value: "< 5 min", label: "Avg. pickup time", icon: Clock, trend: { value: "15%", positive: true }, color: "primary" as const, delay: "225" },
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className={cn(
                  "group relative overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-300",
                  "hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]",
                  "animate-in fade-in slide-in-from-bottom-4 touch-manipulation"
                )}
                style={{ animationDelay: `${stat.delay}ms` }}
              >
                <StatCard
                  value={stat.value}
                  label={stat.label}
                  icon={<stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  trend={stat.trend}
                  color={stat.color}
                />
                {/* Hover shine effect */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
                  style={{ transform: 'skewX(-15deg)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveStatsSection;