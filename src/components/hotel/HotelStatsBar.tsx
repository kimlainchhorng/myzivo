import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { 
  Hotel, 
  Users, 
  Star, 
  Globe, 
  Shield, 
  Zap,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  Bed,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HotelStatsBarProps {
  className?: string;
}

export default function HotelStatsBar({ className }: HotelStatsBarProps) {
  const stats = [
    { 
      icon: Hotel, 
      value: 850000, 
      suffix: "+",
      label: "Properties", 
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    { 
      icon: Globe, 
      value: 190, 
      suffix: "+",
      label: "Countries", 
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    { 
      icon: Users, 
      value: 5.2,
      suffix: "M+",
      label: "Happy Guests", 
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    { 
      icon: Star, 
      value: 4.8, 
      label: "Avg Rating", 
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
  ];

  const trustBadges = [
    { icon: Shield, label: "Secure Booking", color: "text-emerald-500" },
    { icon: CheckCircle, label: "Verified Hotels", color: "text-amber-500" },
    { icon: Award, label: "Best Price Match", color: "text-orange-500" },
    { icon: Clock, label: "24/7 Support", color: "text-sky-500" },
  ];

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5" />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="flex flex-col items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 hover:border-amber-500/30 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4 touch-manipulation"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 transition-transform group-hover:scale-110",
                stat.bgColor
              )}>
                <stat.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", stat.color)} />
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className={cn("text-xl sm:text-2xl md:text-3xl font-bold", stat.color)}>
                  {typeof stat.value === 'number' && stat.value >= 100 ? (
                    <AnimatedCounter 
                      value={stat.value} 
                      duration={2} 
                      decimals={stat.value % 1 !== 0 ? 1 : 0}
                    />
                  ) : (
                    stat.value
                  )}
                </span>
                {stat.suffix && (
                  <span className={cn("text-sm sm:text-lg md:text-xl font-semibold", stat.color)}>{stat.suffix}</span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium text-center">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="relative overflow-hidden py-3 sm:py-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 flex-wrap">
            {trustBadges.map((badge, index) => (
              <div
                key={badge.label}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-card/50 backdrop-blur-xl border border-border/50 hover:border-amber-500/30 transition-all duration-300 animate-in fade-in"
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
              >
                <badge.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", badge.color)} />
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground whitespace-nowrap">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex justify-center mt-3 sm:mt-4">
          <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 px-3 sm:px-4 py-1 sm:py-1.5 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
            </span>
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Live Availability
            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5 sm:ml-1" />
          </Badge>
        </div>
      </div>
    </div>
  );
}
