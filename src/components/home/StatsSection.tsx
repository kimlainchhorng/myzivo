/**
 * Stats Section - Animated counters showing ZIVO's reach
 */
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Plane, Users, Globe, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { icon: Users, value: 500000, label: "Happy Travelers", suffix: "+", prefix: "" },
  { icon: Plane, value: 120, label: "Airlines Compared", suffix: "+", prefix: "" },
  { icon: Globe, value: 50, label: "Countries Covered", suffix: "+", prefix: "" },
  { icon: Shield, value: 99.9, label: "Uptime Guarantee", suffix: "%", prefix: "", decimals: 1 },
];

function AnimatedCounter({ value, suffix, prefix, decimals = 0 }: { value: number; suffix: string; prefix: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
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
    <section className="py-16 sm:py-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className={cn(
                "w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center",
                "bg-primary/10 border border-primary/20",
                "group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300",
                "float-gentle"
              )} style={{ animationDelay: `${index * 300}ms` }}>
                <stat.icon className="w-7 h-7 text-primary" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  decimals={stat.decimals}
                />
              </p>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
