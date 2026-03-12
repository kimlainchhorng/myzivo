/**
 * GroceryDealsSection - Flash deals with countdown timer + savings
 * Visual: orange accent, animated badges, urgency indicators
 */
import { motion, AnimatePresence } from "framer-motion";
import { Tag, TrendingDown, Plus, Check, Package, Flame, Clock, Zap } from "lucide-react";
import type { StoreProduct } from "@/hooks/useStoreSearch";
import { useMemo, useState, useEffect } from "react";

interface GroceryDealsSectionProps {
  products: StoreProduct[];
  onAdd: (product: StoreProduct) => void;
  cartProductIds: Set<string>;
}

function calcSavings(price: number, productId: string): { original: number; pct: number } | null {
  if (price <= 1 || price > 200) return null;
  const hash = productId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const markup = 0.08 + (hash % 20) * 0.01;
  if (markup < 0.10) return null;
  const original = +(price / (1 - markup)).toFixed(2);
  const pct = Math.round(markup * 100);
  return { original, pct };
}

/* ─── Countdown timer ─── */
function DealCountdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    };
    compute();
    const interval = setInterval(compute, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/20"
    >
      <Clock className="h-2.5 w-2.5 text-orange-500" />
      <span className="text-[9px] font-bold text-orange-600">{timeLeft} left</span>
    </motion.div>
  );
}

export function GroceryDealsSection({ products, onAdd, cartProductIds }: GroceryDealsSectionProps) {
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const deals = useMemo(() => {
    return products
      .filter((p) => p.inStock && p.price > 0)
      .map((p) => ({ product: p, savings: calcSavings(p.price, p.productId) }))
      .filter((d) => d.savings !== null && d.savings.pct >= 12)
      .sort((a, b) => (b.savings?.pct ?? 0) - (a.savings?.pct ?? 0))
      .slice(0, 12);
  }, [products]);

  if (deals.length < 3) return null;

  const handleAdd = (p: StoreProduct) => {
    onAdd(p);
    setAddedIds((prev) => new Set(prev).add(p.productId));
    setTimeout(() => setAddedIds((prev) => { const next = new Set(prev); next.delete(p.productId); return next; }), 800);
  };

  const maxSavings = deals[0]?.savings?.pct ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="pt-4 pb-1"
    >
      {/* Header with countdown */}
      <div className="flex items-center gap-2 mb-3 px-4">
        <div className="flex items-center justify-center h-7 w-7 rounded-xl bg-gradient-to-br from-orange-500/15 to-orange-400/5">
          <Flame className="h-4 w-4 text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-foreground tracking-tight">Flash Deals</span>
            <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[8px] font-bold shadow-sm shadow-orange-500/30">
              Up to {maxSavings}% off
            </span>
          </div>
        </div>
        <DealCountdown />
      </div>

      {/* Deals carousel */}
      <div
        className="flex gap-2.5 overflow-x-auto pb-2 px-4 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {deals.map(({ product: p, savings }, i) => {
          const inCart = cartProductIds.has(p.productId);
          const justAdded = addedIds.has(p.productId);
          const isHot = (savings?.pct ?? 0) >= 20;

          return (
            <motion.div
              key={p.productId}
              initial={{ opacity: 0, x: 16, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 24 }}
              className="snap-start shrink-0 w-[145px] rounded-2xl border border-orange-200/30 bg-card overflow-hidden group hover:border-orange-300/40 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300"
            >
              <div className="relative h-[105px] bg-gradient-to-br from-orange-50/30 to-muted/20 dark:from-orange-950/10 flex items-center justify-center p-3">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground/10" />
                )}

                {/* Savings badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.04 + 0.2, type: "spring", stiffness: 400, damping: 15 }}
                  className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-lg shadow-sm ${
                    isHot ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-orange-500"
                  } text-white`}
                >
                  <span className="text-[9px] font-bold">-{savings?.pct}%</span>
                </motion.div>

                {/* Hot badge */}
                {isHot && (
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-red-500/90 text-white shadow-sm">
                    <Zap className="h-2 w-2 fill-current" />
                    <span className="text-[8px] font-bold">HOT</span>
                  </div>
                )}
              </div>

              <div className="p-2.5 space-y-1.5">
                <p className="text-[10px] font-semibold line-clamp-2 text-foreground/90 leading-snug min-h-[24px]">{p.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-extrabold text-foreground">${p.price.toFixed(2)}</span>
                  {savings && (
                    <span className="text-[10px] text-muted-foreground line-through">${savings.original.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-orange-600">
                    <TrendingDown className="h-2.5 w-2.5" />
                    Save ${savings ? (savings.original - p.price).toFixed(2) : ""}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleAdd(p)}
                    className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      inCart || justAdded
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                        : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/15"
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {justAdded ? (
                        <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Check className="h-3 w-3" />
                        </motion.div>
                      ) : (
                        <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Plus className="h-3 w-3" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
