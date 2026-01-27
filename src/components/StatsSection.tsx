import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Car, Users, MapPin, UtensilsCrossed, Plane, Hotel, TrendingUp, Sparkles } from "lucide-react";

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
        gradient: "bg-gradient-to-br from-primary to-teal-400",
        glow: "shadow-primary/30",
        text: "text-white",
        iconBg: "from-primary/20 to-teal-400/10",
      };
    case "eats":
      return {
        gradient: "bg-gradient-to-br from-eats to-orange-500",
        glow: "shadow-eats/30",
        text: "text-white",
        iconBg: "from-eats/20 to-orange-500/10",
      };
    case "sky":
      return {
        gradient: "bg-gradient-to-br from-sky-500 to-blue-500",
        glow: "shadow-sky-500/30",
        text: "text-white",
        iconBg: "from-sky-500/20 to-blue-500/10",
      };
    case "amber":
      return {
        gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
        glow: "shadow-amber-500/30",
        text: "text-white",
        iconBg: "from-amber-500/20 to-orange-500/10",
      };
    default:
      return {
        gradient: "bg-gradient-to-br from-primary to-teal-400",
        glow: "shadow-primary/30",
        text: "text-white",
        iconBg: "from-primary/20 to-teal-400/10",
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
      
      {/* Floating emojis */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-32 left-[10%] text-4xl hidden lg:block opacity-40"
      >
        📊
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-40 right-[8%] text-4xl hidden lg:block opacity-30"
      >
        🚀
      </motion.div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 sm:mb-20"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring" }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-eats/15 border border-primary/25 text-sm font-bold mb-6 shadow-lg shadow-primary/10"
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <TrendingUp className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-muted-foreground">Growing Every Day</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-primary via-teal-400 to-eats bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              millions
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Powering <span className="text-foreground font-medium">transportation and delivery</span> across the globe
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const colors = getColorClasses(stat.color);
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
              <div className="relative p-5 sm:p-6 text-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Shine sweep effect */}
                  <motion.div
                    initial={{ x: "-100%", opacity: 0 }}
                    whileHover={{ x: "200%", opacity: 0.1 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 pointer-events-none"
                  />
                  
                  {/* Decorative corner with pulse */}
                  <motion.div 
                    animate={{ opacity: [0.05, 0.1, 0.05] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                    className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white to-transparent rounded-bl-full" 
                  />
                  
                  {/* Animated background glow */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.3 }}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 ${colors.gradient} rounded-full blur-2xl`}
                  />
                  
                  <motion.div 
                    whileHover={{ scale: 1.15, rotate: 8 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl ${colors.gradient} flex items-center justify-center mb-4 shadow-lg ${colors.glow} relative overflow-hidden`}
                  >
                    <stat.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.text} relative z-10`} />
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                  <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
