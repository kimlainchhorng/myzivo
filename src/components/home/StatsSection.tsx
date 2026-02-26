/**
 * Stats Section - Full-width dramatic counters with gradient accents
 */
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Plane, Users, Globe, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { icon: Users, value: 2000000, label: "Travelers Served", suffix: "+", decimals: 0, color: "text-[hsl(var(--flights))]" },
  { icon: Plane, value: 500, label: "Airlines Compared", suffix: "+", decimals: 0, color: "text-primary" },
  { icon: Globe, value: 190, label: "Countries Covered", suffix: "+", decimals: 0, color: "text-[hsl(var(--cars))]" },
  { icon: Shield, value: 99.9, label: "Uptime Guarantee", suffix: "%", decimals: 1, color: "text-[hsl(var(--hotels))]" },
];

function AnimatedCounter({ value, suffix, decimals = 0 }: { value: number; suffix: string; decimals?: number }) {
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
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * value);
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(value);
    };
    requestAnimationFrame(animate);
  }, [inView, value]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : count >= 1000000
      ? `${(count / 1000000).toFixed(0)}M`
      : Math.floor(count).toString();

  return <span ref={ref} className="tabular-nums">{formatted}{suffix}</span>;
}

export default function StatsSection() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/30 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">By the numbers</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter">
            Trusted by travelers <span className="gradient-text-primary">worldwide</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center group"
            >
              <div className={cn(
                "w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center bg-muted/50 border border-border/50 group-hover:scale-110 transition-transform duration-200",
              )}>
                <stat.icon className={cn("w-7 h-7", stat.color)} />
              </div>
              <p className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tighter mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
              </p>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
