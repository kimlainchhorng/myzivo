import { Globe, MapPin, Users, Building2, Plane, Car } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { value: "195+", label: "Countries", icon: Globe },
  { value: "50K+", label: "Cities", icon: MapPin },
  { value: "10M+", label: "Users", icon: Users },
  { value: "2M+", label: "Hotels", icon: Building2 },
  { value: "500+", label: "Airlines", icon: Plane },
  { value: "300+", label: "Car Partners", icon: Car },
];

const regions = [
  { name: "North America", cities: "12,500+", color: "from-blue-500 to-cyan-400" },
  { name: "Europe", cities: "18,200+", color: "from-violet-500 to-purple-400" },
  { name: "Asia Pacific", cities: "15,800+", color: "from-orange-500 to-amber-400" },
  { name: "Latin America", cities: "8,400+", color: "from-green-500 to-emerald-400" },
  { name: "Middle East", cities: "3,200+", color: "from-rose-500 to-pink-400" },
  { name: "Africa", cities: "2,100+", color: "from-yellow-500 to-amber-400" },
];

const GlobalReachSection = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Globe Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/5 to-teal-500/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Globe className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Global Coverage</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Worldwide Reach
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            ZIVO connects you to travel services across the globe
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  "group/stat p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm text-center",
                  "hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10",
                  "transition-all duration-300 animate-in fade-in zoom-in-95 duration-300"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover/stat:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-display text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Regions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {regions.map((region, index) => (
            <div
              key={region.name}
              className={cn(
                "group relative p-4 rounded-2xl overflow-hidden",
                "bg-gradient-to-br", region.color,
                "animate-in fade-in slide-in-from-bottom-4 duration-300"
              )}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-200" />
              <div className="relative text-white">
                <p className="font-bold text-sm mb-1">{region.name}</p>
                <p className="text-xs opacity-80">{region.cities} cities</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlobalReachSection;
