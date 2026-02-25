/**
 * Stats Section - Clean white stat cards with colored top accents
 */
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Plane, Users, Globe, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { icon: Users, value: 500000, label: "Happy Travelers", suffix: "+", prefix: "", iconBg: "bg-[hsl(var(--flights-light))]", iconColor: "text-[hsl(var(--flights))]", borderColor: "border-t-[hsl(var(--flights))]" },
  { icon: Plane, value: 120, label: "Airlines Compared", suffix: "+", prefix: "", iconBg: "bg-primary/10", iconColor: "text-primary", borderColor: "border-t-primary" },
  { icon: Globe, value: 50, label: "Countries Covered", suffix: "+", prefix: "", iconBg: "bg-[hsl(var(--cars-light))]", iconColor: "text-[hsl(var(--cars))]", borderColor: "border-t-[hsl(var(--cars))]" },
  { icon: Shield, value: 99.9, label: "Uptime Guarantee", suffix: "%", prefix: "", decimals: 1, iconBg: "bg-[hsl(var(--hotels-light))]", iconColor: "text-[hsl(var(--hotels))]", borderColor: "border-t-[hsl(var(--hotels))]" },
];

function AnimatedCounter({ value, suffix, prefix, decimals = 0 }: { value: number; suffix: string; prefix: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * value);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };
    requestAnimationFrame(animate);
  }, [inView, value]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : count >= 1000
      ? `${Math.floor(count / 1000)}K`
      : Math.floor(count).toString();

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{formatted}{suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="py-14 sm:py-20 relative">
      {/* Subtle gradient band */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-medium text-muted-foreground mb-8"
        >
          Trusted by travelers worldwide
        </motion.p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="text-center"
            >
              <div className={cn(
                "p-6 sm:p-8 card-premium border-t-[3px]",
                stat.borderColor
              )}>
                <div className={cn(
                  "w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center",
                  stat.iconBg
                )}>
                  <stat.icon className={cn("w-6 h-6", stat.iconColor)} />
                </div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-1.5">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                    decimals={stat.decimals}
                  />
                </p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
