/**
 * Quick Stats Comparison Bar — 3D Spatial UI
 * Cheapest / Fastest / Best Value with depth and polish
 */

import { Plane, Clock, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface QuickStat {
  price: number;
  airline?: string;
  duration?: string;
}

interface QuickStatsBarProps {
  cheapest: QuickStat;
  fastest: QuickStat;
  bestValue: QuickStat;
  currency?: string;
  className?: string;
}

export function QuickStatsBar({
  cheapest,
  fastest,
  bestValue,
  currency = "USD",
  className,
}: QuickStatsBarProps) {
  const formatPrice = (price: number) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
    return `${symbols[currency] || '$'}${price.toLocaleString()}`;
  };

  const stats = [
    {
      label: "Cheapest",
      icon: Plane,
      price: cheapest.price,
      airline: cheapest.airline,
      duration: cheapest.duration,
      gradient: "from-emerald-400/20 via-emerald-500/8 to-transparent",
      iconBg: "bg-emerald-500/12",
      iconBorder: "border-emerald-400/30",
      textColor: "text-emerald-600 dark:text-emerald-400",
      accentLine: "bg-emerald-500",
    },
    {
      label: "Fastest",
      icon: Clock,
      price: fastest.price,
      airline: fastest.airline,
      duration: fastest.duration,
      gradient: "from-violet-400/20 via-violet-500/8 to-transparent",
      iconBg: "bg-violet-500/12",
      iconBorder: "border-violet-400/30",
      textColor: "text-violet-600 dark:text-violet-400",
      accentLine: "bg-violet-500",
    },
    {
      label: "Best Value",
      icon: Star,
      price: bestValue.price,
      airline: bestValue.airline,
      duration: bestValue.duration,
      gradient: "from-amber-400/20 via-amber-500/8 to-transparent",
      iconBg: "bg-amber-500/12",
      iconBorder: "border-amber-400/30",
      textColor: "text-amber-600 dark:text-amber-400",
      accentLine: "bg-amber-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn("rounded-2xl overflow-hidden", className)}
      style={{
        background: "hsl(var(--card))",
        boxShadow: `
          0 1px 0 0 hsl(var(--border) / 0.1),
          0 4px 16px -4px hsl(var(--foreground) / 0.06),
          0 12px 32px -8px hsl(var(--foreground) / 0.04),
          inset 0 1px 0 0 hsl(0 0% 100% / 0.05)
        `,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20">
        <p className="text-[12px] font-medium text-muted-foreground">
          Compare prices from multiple airlines
        </p>
        <Badge className="bg-[hsl(var(--flights)/0.1)] text-[hsl(var(--flights))] text-[10px] gap-1 border-0 font-semibold px-2 py-0.5">
          <Zap className="w-2.5 h-2.5" />
          Live Prices
        </Badge>
      </div>

      {/* Stats */}
      <div className="divide-y divide-border/15">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r",
              stat.gradient,
              "hover:brightness-[1.02] transition-all active:scale-[0.99]"
            )}
          >
            {/* Left accent line */}
            <div className={cn("absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full", stat.accentLine, "opacity-60")} />

            {/* Icon */}
            <div
              className={cn(
                "shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border",
                stat.iconBg,
                stat.iconBorder,
              )}
              style={{
                boxShadow: "0 2px 6px -1px hsl(var(--foreground) / 0.04)",
              }}
            >
              <stat.icon className={cn("w-4 h-4", stat.textColor)} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {stat.label}
              </p>
              <p className={cn("text-lg font-extrabold tabular-nums leading-tight", stat.textColor)}>
                {formatPrice(stat.price)}
              </p>
              {stat.airline && (
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {stat.airline}
                  {stat.duration && <span className="opacity-60"> • {stat.duration}</span>}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border/15 bg-muted/20">
        <p className="text-center text-[10px] text-muted-foreground/70">
          Final prices shown — tickets issued instantly after payment.
        </p>
      </div>
    </motion.div>
  );
}

export default QuickStatsBar;
