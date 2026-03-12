/**
 * GroceryCategoryBrowser - Premium category sections with animated cards
 * Lazy-loads products per category with skeleton loading + scroll snap
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Check, ChevronRight, Loader2, ShoppingBag } from "lucide-react";
import type { StoreName } from "@/config/groceryStores";
import { getStoreConfig } from "@/config/groceryStores";
import type { StoreProduct } from "@/hooks/useStoreSearch";
import { Skeleton } from "@/components/ui/skeleton";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const CATEGORIES = [
  { emoji: "🥦", label: "Fresh Produce", query: "fresh fruits vegetables salad", gradient: "from-emerald-500/10 to-emerald-400/5" },
  { emoji: "🥛", label: "Dairy & Eggs", query: "milk eggs cheese yogurt butter", gradient: "from-sky-500/10 to-sky-400/5" },
  { emoji: "🍿", label: "Snacks", query: "chips cookies crackers popcorn nuts", gradient: "from-amber-500/10 to-amber-400/5" },
  { emoji: "🥤", label: "Beverages", query: "water juice soda coffee tea", gradient: "from-violet-500/10 to-violet-400/5" },
  { emoji: "🧊", label: "Frozen Foods", query: "frozen pizza meals ice cream waffles", gradient: "from-cyan-500/10 to-cyan-400/5" },
  { emoji: "🍝", label: "Pantry Staples", query: "pasta rice cereal oatmeal soup", gradient: "from-orange-500/10 to-orange-400/5" },
  { emoji: "🥩", label: "Meat & Seafood", query: "chicken beef salmon pork turkey", gradient: "from-rose-500/10 to-rose-400/5" },
  { emoji: "🧹", label: "Household", query: "cleaning supplies soap detergent paper towels", gradient: "from-indigo-500/10 to-indigo-400/5" },
];

/* ─── Category skeleton ─── */
function CategorySkeleton() {
  return (
    <div className="pt-3 pb-1">
      <div className="flex items-center gap-2 mb-2.5 px-4">
        <Skeleton className="h-5 w-5 rounded-md" />
        <Skeleton className="h-3.5 w-24" />
      </div>
      <div className="flex gap-2.5 px-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shrink-0 w-[130px] rounded-2xl border border-border/20 overflow-hidden">
            <Skeleton className="h-[90px]" />
            <div className="p-2 space-y-1.5">
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-3.5 w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CategorySectionProps {
  category: typeof CATEGORIES[0];
  store: StoreName;
  onAdd: (product: StoreProduct) => void;
  cartProductIds: Set<string>;
  onBrowse: (query: string) => void;
  index: number;
}

function CategorySection({ category, store, onAdd, cartProductIds, onBrowse, index }: CategorySectionProps) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const cfg = getStoreConfig(store);
    const url = `${SUPABASE_URL}/functions/v1/${cfg.edgeFunction}?q=${encodeURIComponent(category.query)}&page=1`;

    fetch(url, {
      headers: { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY },
    })
      .then((r) => r.json())
      .then((data) => {
        const items: StoreProduct[] = (data.products || []).slice(0, 10).map((p: any) => ({ ...p, store }));
        setProducts(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [store, category.query]);

  const handleAdd = (p: StoreProduct) => {
    onAdd(p);
    setAddedIds((prev) => new Set(prev).add(p.productId));
    setTimeout(() => setAddedIds((prev) => { const next = new Set(prev); next.delete(p.productId); return next; }), 800);
  };

  if (!loading && products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 26 }}
      className="pt-4 pb-1"
    >
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3 px-4">
        <div className={`flex items-center justify-center h-7 w-7 rounded-xl bg-gradient-to-br ${category.gradient}`}>
          <span className="text-sm">{category.emoji}</span>
        </div>
        <span className="text-[13px] font-bold text-foreground tracking-tight">{category.label}</span>
        <button
          onClick={() => onBrowse(category.query)}
          className="ml-auto flex items-center gap-0.5 text-[10px] text-primary font-semibold hover:underline group"
        >
          See all <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {loading ? (
        <div className="flex gap-2.5 px-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[130px] rounded-2xl border border-border/20 overflow-hidden">
              <div className="h-[90px] bg-muted/20 animate-pulse" />
              <div className="p-2 space-y-1.5">
                <div className="h-2.5 w-full bg-muted/30 rounded animate-pulse" />
                <div className="h-3.5 w-14 bg-muted/30 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex gap-2.5 overflow-x-auto pb-2 px-4 snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
        >
          {products.map((p, i) => {
            const inCart = cartProductIds.has(p.productId);
            const justAdded = addedIds.has(p.productId);
            return (
              <motion.div
                key={p.productId}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 24 }}
                className="snap-start shrink-0 w-[130px] rounded-2xl border border-border/30 bg-card overflow-hidden group hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className={`relative h-[90px] bg-gradient-to-br ${category.gradient} flex items-center justify-center p-2.5`}>
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground/10" />
                  )}
                  <span className={`absolute top-1.5 left-1.5 h-1.5 w-1.5 rounded-full ${p.inStock ? "bg-emerald-500" : "bg-destructive"}`} />
                </div>
                <div className="p-2 space-y-1">
                  <p className="text-[10px] font-semibold line-clamp-2 text-foreground/90 leading-tight min-h-[24px]">{p.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-extrabold text-foreground">${p.price.toFixed(2)}</span>
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
      )}
    </motion.div>
  );
}

interface GroceryCategoryBrowserProps {
  store: StoreName;
  onAdd: (product: StoreProduct) => void;
  cartProductIds: Set<string>;
  onBrowse: (query: string) => void;
}

export function GroceryCategoryBrowser({ store, onAdd, cartProductIds, onBrowse }: GroceryCategoryBrowserProps) {
  const [visibleCount, setVisibleCount] = useState(3);

  return (
    <div className="space-y-1 pb-2">
      <div className="flex items-center gap-2 px-4 pt-5 pb-1">
        <ShoppingBag className="h-4 w-4 text-primary" />
        <span className="text-[14px] font-bold text-foreground tracking-tight">Browse by Category</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{CATEGORIES.length} categories</span>
      </div>

      {CATEGORIES.slice(0, visibleCount).map((cat, i) => (
        <CategorySection
          key={cat.label}
          category={cat}
          store={store}
          onAdd={onAdd}
          cartProductIds={cartProductIds}
          onBrowse={onBrowse}
          index={i}
        />
      ))}

      {visibleCount < CATEGORIES.length && (
        <div className="px-4 pt-2 pb-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setVisibleCount(CATEGORIES.length)}
            className="w-full py-3 rounded-2xl border border-dashed border-primary/25 text-[12px] font-bold text-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Show {CATEGORIES.length - visibleCount} more categories
          </motion.button>
        </div>
      )}
    </div>
  );
}
