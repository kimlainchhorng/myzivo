import { useEffect, useState, useRef } from "react";
import { Car, Users, MapPin, UtensilsCrossed, Plane, Hotel, TrendingUp, BarChart3, Rocket } from "lucide-react";

const stats = [
  {
    icon: Car,
    value: 10000000,
    suffix: "+",
    label: "Rides Completed",
    color: "rides" as const,
  },
  {
    icon: Users,
    value: 50000,
    suffix: "+",
    label: "Active Drivers",
    color: "rides" as const,
  },
  {
    icon: UtensilsCrossed,
    value: 5000,
    suffix: "+",
    label: "Restaurant Partners",
    color: "eats" as const,
  },
  {
    icon: MapPin,
    value: 200,
    suffix: "+",
    label: "Cities Worldwide",
    color: "rides" as const,
  },
  {
    icon: Plane,
    value: 1000,
    suffix: "+",
    label: "Flight Routes",
    color: "sky" as const,
  },
  {
    icon: Hotel,
    value: 25000,
    suffix: "+",
    label: "Hotel Partners",
    color: "amber" as const,
  },
];

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(0) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + "K";
  }
  return num.toString();
};

const AnimatedCounter = ({ 
  value, 
  suffix, 
  duration = 2000 
}: { 
  value: number; 
  suffix: string; 
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, value, duration]);

  return (
    <span ref={ref}>
      {formatNumber(count)}{suffix}
    </span>
  );
};

const getColorClasses = (color: string) => {
  switch (color) {
    case "rides":
      return {
        gradient: "bg-gradient-to-br from-primary to-teal-400",
        glow: "shadow-primary/30",
        text: "text-white",
      };
    case "eats":
      return {
        gradient: "bg-gradient-to-br from-eats to-orange-500",
        glow: "shadow-eats/30",
        text: "text-white",
      };
    case "sky":
      return {
        gradient: "bg-gradient-to-br from-sky-500 to-blue-500",
        glow: "shadow-sky-500/30",
        text: "text-white",
      };
    case "amber":
      return {
        gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
        glow: "shadow-amber-500/30",
        text: "text-white",
      };
    default:
      return {
        gradient: "bg-gradient-to-br from-primary to-teal-400",
        glow: "shadow-primary/30",
        text: "text-white",
      };
  }
};

const StatsSection = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1200px] h-[700px] sm:h-[1200px] bg-gradient-radial from-primary/15 via-transparent to-transparent rounded-full blur-3xl" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-eats/15 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-sky-500/15 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-gradient-radial from-violet-500/10 to-transparent rounded-full blur-3xl" />
      
      {/* Floating icon decorations */}
      <div className="absolute top-32 left-[10%] hidden lg:block opacity-30 animate-float">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-teal-400/15 flex items-center justify-center backdrop-blur-sm">
          <BarChart3 className="w-6 h-6 text-primary/50" />
        </div>
      </div>
      <div className="absolute bottom-40 right-[8%] hidden lg:block opacity-30 animate-float-delayed">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-eats/15 to-orange-500/15 flex items-center justify-center backdrop-blur-sm">
          <Rocket className="w-6 h-6 text-eats/50" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14 sm:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-eats/15 border border-primary/25 text-sm font-bold mb-6 shadow-lg shadow-primary/10 animate-in zoom-in-95 duration-300">
            <TrendingUp className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-muted-foreground">Growing Every Day</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-primary via-teal-400 to-eats bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              millions
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Powering <span className="text-foreground font-medium">transportation and delivery</span> across the globe
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const colors = getColorClasses(stat.color);
            return (
              <div
                key={stat.label}
                className="group animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'both' }}
              >
                <div className="relative p-5 sm:p-6 text-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2 hover:scale-[1.02]">
                  {/* Shine sweep effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 pointer-events-none" />
                  
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
                  
                  {/* Background glow */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 ${colors.gradient} rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity`} />
                  
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl ${colors.gradient} flex items-center justify-center mb-4 shadow-lg ${colors.glow} relative overflow-hidden transition-transform duration-200 group-hover:scale-110`}>
                    <stat.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.text} relative z-10`} />
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
