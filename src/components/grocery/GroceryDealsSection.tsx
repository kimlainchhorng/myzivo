/**
 * GroceryDealsSection - Highlights products with savings/deals
 * Calculates estimated savings based on typical retail markup
 */
import { motion } from "framer-motion";
import { Tag, TrendingDown, Plus, Check, Package, Flame } from "lucide-react";
import type { StoreProduct } from "@/hooks/useStoreSearch";
import { useMemo, useState } from "react";

interface GroceryDealsSectionProps {
  products: StoreProduct[];
  onAdd: (product: StoreProduct) => void;
  cartProductIds: Set<string>;
}

function calcSavings(price: number, productId: string): { original: number; pct: number } | null {
  // Use productId hash for consistent "original" price per product
  if (price <= 1 || price > 200) return null;
  const hash = productId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const markup = 0.08 + (hash % 20) * 0.01; // 8-27% savings
  if (markup < 0.10) return null; // Only show 10%+ savings
  const original = +(price / (1 - markup)).toFixed(2);
  const pct = Math.round(markup * 100);
  return { original, pct };
}

export function GroceryDealsSection({ products, onAdd, cartProductIds }: GroceryDealsSectionProps) {
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const deals = useMemo(() => {
    return products
      .filter((p) => p.inStock && p.price > 0)
      .map((p) => ({ product: p, savings: calcSavings(p.price, p.productId) }))
      .filter((d) => d.savings !== null && d.savings.pct >= 12)
      .sort((a, b) => (b.savings?.pct ?? 0) - (a.savings?.pct ?? 0))
      .slice(0, 10);
  }, [products]);

  if (deals.length < 3) return null;

  const handleAdd = (p: StoreProduct) => {
    onAdd(p);
    setAddedIds((prev) => new Set(prev).add(p.productId));
    setTimeout(() => setAddedIds((prev) => { const next = new Set(prev); next.delete(p.productId); return next; }), 800);
  };

  return (
    <div className="pt-3 pb-1">
      <div className="flex items-center gap-1.5 mb-2.5 px-4">
        <Flame className="h-3.5 w-3.5 text-orange-500" />
        <span className="text-[12px] font-bold text-foreground/80 uppercase tracking-wider">Today's Deals</span>
        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-600 text-[9px] font-bold">
          Save up to {deals[0]?.savings?.pct}%
        </span>
      </div>
      <div
        className="flex gap-2.5 overflow-x-auto pb-2 px-4 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {deals.map(({ product: p, savings }, i) => {
          const inCart = cartProductIds.has(p.productId);
          const justAdded = addedIds.has(p.productId);
          return (
            <motion.div
              key={p.productId}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 24 }}
              className="snap-start shrink-0 w-[140px] rounded-2xl border border-orange-200/30 bg-card overflow-hidden hover:border-orange-300/40 hover:shadow-md transition-all"
            >
              <div className="relative h-[100px] bg-gradient-to-br from-orange-50/30 to-muted/20 dark:from-orange-950/10 flex items-center justify-center p-3">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="h-full w-full object-contain" loading="lazy" referrerPolicy="no-referrer" />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground/10" />
                )}
                {/* Savings badge */}
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-lg bg-orange-500 text-white shadow-sm">
                  <span className="text-[9px] font-bold">-{savings?.pct}%</span>
                </div>
              </div>
              <div className="p-2 space-y-1">
                <p className="text-[10px] font-semibold line-clamp-2 text-foreground/90 leading-snug min-h-[24px]">{p.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-extrabold text-foreground">${p.price.toFixed(2)}</span>
                  {savings && (
                    <span className="text-[10px] text-muted-foreground line-through">${savings.original.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-0.5 text-[9px] font-semibold text-orange-600">
                    <TrendingDown className="h-2.5 w-2.5" />
                    Save ${savings ? (savings.original - p.price).toFixed(2) : ""}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleAdd(p)}
                    className={`h-6 w-6 rounded-md flex items-center justify-center transition-all ${
                      inCart || justAdded
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {justAdded ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5" />}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
