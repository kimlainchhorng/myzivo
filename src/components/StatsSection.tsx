import { useEffect, useState, useRef } from "react";
import { Car, Users, MapPin, UtensilsCrossed, Plane, Hotel } from "lucide-react";

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
      
      // Easing function for smooth animation
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
        gradient: "gradient-rides",
        text: "text-primary-foreground",
        iconColor: "text-rides",
      };
    case "eats":
      return {
        gradient: "gradient-eats",
        text: "text-secondary-foreground",
        iconColor: "text-eats",
      };
    case "sky":
      return {
        gradient: "bg-gradient-to-br from-sky-500 to-sky-600",
        text: "text-white",
        iconColor: "text-sky-500",
      };
    case "amber":
      return {
        gradient: "bg-gradient-to-br from-amber-500 to-amber-600",
        text: "text-white",
        iconColor: "text-amber-500",
      };
    default:
      return {
        gradient: "gradient-rides",
        text: "text-primary-foreground",
        iconColor: "text-rides",
      };
  }
};

const StatsSection = () => {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rides/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Trusted by <span className="text-gradient-rides">millions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powering transportation and delivery across the globe
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {stats.map((stat, index) => {
            const colors = getColorClasses(stat.color);
            return (
              <div
                key={stat.label}
                className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 mx-auto rounded-xl ${colors.gradient} flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <p className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
