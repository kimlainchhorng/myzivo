/**
 * FareComparisonTool - Compare ride tiers with price history graph
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Car, Crown, Sparkles, Users, Clock, TrendingDown, TrendingUp, BarChart3, Check, ChevronRight, Zap, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FareTier {
  id: string;
  name: string;
  icon: typeof Car;
  price: number;
  originalPrice?: number;
  eta: number;
  surge: number;
  features: string[];
  color: string;
  gradient: string;
  recommended?: boolean;
}

const fareTiers: FareTier[] = [
  {
    id: "economy",
    name: "Economy",
    icon: Car,
    price: 12.50,
    eta: 4,
    surge: 1.0,
    features: ["4 seats", "Standard car"],
    color: "text-emerald-500",
    gradient: "from-emerald-500/10 to-emerald-500/5",
  },
  {
    id: "comfort",
    name: "Comfort",
    icon: Sparkles,
    price: 18.75,
    originalPrice: 22.00,
    eta: 3,
    surge: 1.0,
    features: ["4 seats", "Newer cars", "Extra legroom"],
    color: "text-primary",
    gradient: "from-primary/10 to-primary/5",
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium",
    icon: Crown,
    price: 28.00,
    eta: 5,
    surge: 1.0,
    features: ["4 seats", "Luxury vehicle", "Top-rated driver", "Complimentary water"],
    color: "text-amber-500",
    gradient: "from-amber-500/10 to-amber-500/5",
  },
  {
    id: "shared",
    name: "Shared",
    icon: Users,
    price: 8.25,
    eta: 7,
    surge: 1.0,
    features: ["Shared ride", "1-2 extra stops", "Best value"],
    color: "text-sky-500",
    gradient: "from-sky-500/10 to-sky-500/5",
  },
];

// Mock price history for the last 7 hours
const priceHistory = [
  { time: "6AM", economy: 10, comfort: 16, premium: 25 },
  { time: "8AM", economy: 14, comfort: 21, premium: 32 },
  { time: "10AM", economy: 11, comfort: 17, premium: 26 },
  { time: "12PM", economy: 12, comfort: 18, premium: 28 },
  { time: "2PM", economy: 13, comfort: 19, premium: 29 },
  { time: "4PM", economy: 15, comfort: 23, premium: 35 },
  { time: "Now", economy: 12.5, comfort: 18.75, premium: 28 },
];

interface FareComparisonToolProps {
  onSelect?: (tierId: string) => void;
  onPriceAlert?: (tierId: string) => void;
}

export default function FareComparisonTool({ onSelect, onPriceAlert }: FareComparisonToolProps) {
  const [selected, setSelected] = useState("comfort");
  const [showHistory, setShowHistory] = useState(false);

  const maxPrice = Math.max(...priceHistory.flatMap(h => [h.economy, h.comfort, h.premium]));

  return (
    <div className="rounded-2xl bg-card border border-border/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Compare Fares</h3>
            <p className="text-[10px] text-muted-foreground">Real-time pricing</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px] font-bold text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
          <TrendingDown className="w-3 h-3 mr-1" /> Prices dropping
        </Badge>
      </div>

      {/* Tier cards */}
      <div className="px-4 py-3 space-y-2">
        {fareTiers.map((tier, i) => {
          const Icon = tier.icon;
          const isSelected = selected === tier.id;
          const savings = tier.originalPrice ? ((tier.originalPrice - tier.price) / tier.originalPrice * 100).toFixed(0) : null;

          return (
            <motion.button
              key={tier.id}
              onClick={() => setSelected(tier.id)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left relative",
                isSelected
                  ? `bg-gradient-to-r ${tier.gradient} border-primary/20 ring-2 ring-primary/10`
                  : "bg-muted/10 border-border/20 hover:bg-muted/20"
              )}
            >
              {tier.recommended && (
                <div className="absolute -top-1 right-2 bg-primary text-primary-foreground text-[8px] font-black px-2 py-0.5 rounded-b-md">
                  BEST VALUE
                </div>
              )}

              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", `${tier.color.replace("text-", "bg-")}/10`)}>
                <Icon className={cn("w-5 h-5", tier.color)} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">{tier.name}</span>
                  {savings && (
                    <Badge className="text-[8px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold">
                      -{savings}%
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {tier.eta} min
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {tier.features[0]}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-baseline gap-1">
                  {tier.originalPrice && (
                    <span className="text-[10px] text-muted-foreground line-through">${tier.originalPrice.toFixed(2)}</span>
                  )}
                  <span className={cn("text-base font-black", isSelected ? "text-primary" : "text-foreground")}>
                    ${tier.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Price history toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-center gap-1 py-2 border-t border-border/20 text-[11px] font-bold text-muted-foreground hover:text-foreground"
      >
        {showHistory ? "Hide" : "Show"} price history
        <TrendingUp className="w-3 h-3" />
      </button>

      {/* Price history chart */}
      {showHistory && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-4 pb-3 overflow-hidden">
          <div className="rounded-xl bg-muted/20 border border-border/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground">Last 7 hours</span>
              <div className="flex gap-3">
                <span className="text-[9px] text-emerald-500 flex items-center gap-1"><span className="w-2 h-0.5 bg-emerald-500 rounded" /> Economy</span>
                <span className="text-[9px] text-primary flex items-center gap-1"><span className="w-2 h-0.5 bg-primary rounded" /> Comfort</span>
                <span className="text-[9px] text-amber-500 flex items-center gap-1"><span className="w-2 h-0.5 bg-amber-500 rounded" /> Premium</span>
              </div>
            </div>

            {/* Simple chart */}
            <div className="flex items-end gap-1 h-24">
              {priceHistory.map((point, i) => (
                <div key={point.time} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full flex gap-px items-end h-20">
                    <div className="flex-1 bg-emerald-500/40 rounded-t-sm" style={{ height: `${(point.economy / maxPrice) * 100}%` }} />
                    <div className="flex-1 bg-primary/40 rounded-t-sm" style={{ height: `${(point.comfort / maxPrice) * 100}%` }} />
                    <div className="flex-1 bg-amber-500/40 rounded-t-sm" style={{ height: `${(point.premium / maxPrice) * 100}%` }} />
                  </div>
                  <span className="text-[8px] text-muted-foreground">{point.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-10 text-xs flex-1"
          onClick={() => { onPriceAlert?.(selected); toast.success("Price alert set!"); }}
        >
          <Bell className="w-3.5 h-3.5 mr-1.5" /> Price Alert
        </Button>
        <Button
          size="sm"
          className="h-10 text-xs flex-1 font-bold"
          onClick={() => { onSelect?.(selected); toast.success(`${selected} selected!`); }}
        >
          Select {fareTiers.find(t => t.id === selected)?.name}
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
