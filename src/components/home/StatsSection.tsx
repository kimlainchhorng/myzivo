/**
 * Stats Section - Premium animated counters with glassmorphism cards
 */
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Plane, Users, Globe, Shield, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { icon: Users, value: 500000, label: "Happy Travelers", suffix: "+", prefix: "", gradient: "from-emerald-500 to-teal-500" },
  { icon: Plane, value: 120, label: "Airlines Compared", suffix: "+", prefix: "", gradient: "from-sky-500 to-blue-500" },
  { icon: Globe, value: 50, label: "Countries Covered", suffix: "+", prefix: "", gradient: "from-violet-500 to-purple-500" },
  { icon: Shield, value: 99.9, label: "Uptime Guarantee", suffix: "%", prefix: "", decimals: 1, gradient: "from-amber-500 to-orange-500" },
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
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,hsl(142_71%_45%/0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 shimmer-chip">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">ZIVO by the Numbers</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="p-6 sm:p-8 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/50 glow-border-hover hover:-translate-y-1 transition-all duration-300">
                <div className={cn(
                  "w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center",
                  "bg-gradient-to-br shadow-lg",
                  stat.gradient,
                  "group-hover:scale-110 transition-transform duration-300",
                  "float-gentle"
                )} style={{ animationDelay: `${index * 300}ms` }}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-foreground mb-1.5">
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
