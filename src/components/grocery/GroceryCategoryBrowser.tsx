/**
 * GroceryCategoryBrowser - Horizontal category sections with real API data
 * Each section fetches products for a specific category
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Package, Plus, Check, ChevronRight, Loader2 } from "lucide-react";
import type { StoreName } from "@/config/groceryStores";
import { getStoreConfig } from "@/config/groceryStores";
import type { StoreProduct } from "@/hooks/useStoreSearch";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const CATEGORIES = [
  { emoji: "🥦", label: "Fresh Produce", query: "fresh fruits vegetables salad" },
  { emoji: "🥛", label: "Dairy & Eggs", query: "milk eggs cheese yogurt butter" },
  { emoji: "🍿", label: "Snacks", query: "chips cookies crackers popcorn nuts" },
  { emoji: "🥤", label: "Beverages", query: "water juice soda coffee tea" },
  { emoji: "🧊", label: "Frozen Foods", query: "frozen pizza meals ice cream waffles" },
  { emoji: "🍝", label: "Pantry Staples", query: "pasta rice cereal oatmeal soup" },
];

interface CategorySectionProps {
  category: typeof CATEGORIES[0];
  store: StoreName;
  onAdd: (product: StoreProduct) => void;
  cartProductIds: Set<string>;
  onBrowse: (query: string) => void;
}

function CategorySection({ category, store, onAdd, cartProductIds, onBrowse }: CategorySectionProps) {
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
        const items: StoreProduct[] = (data.products || []).slice(0, 8).map((p: any) => ({ ...p, store }));
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
    <div className="pt-3 pb-1">
      <div className="flex items-center gap-1.5 mb-2.5 px-4">
        <span className="text-sm">{category.emoji}</span>
        <span className="text-[12px] font-bold text-foreground/80 uppercase tracking-wider">{category.label}</span>
        <button
          onClick={() => onBrowse(category.query)}
          className="ml-auto flex items-center gap-0.5 text-[10px] text-primary font-semibold hover:underline"
        >
          See all <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
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
                transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 24 }}
                className="snap-start shrink-0 w-[120px] rounded-2xl border border-border/30 bg-card overflow-hidden hover:border-primary/20 hover:shadow-md transition-all"
              >
                <div className="relative h-[85px] bg-gradient-to-br from-muted/5 to-muted/20 flex items-center justify-center p-2.5">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="h-full w-full object-contain" loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground/10" />
                  )}
                  <span className={`absolute top-1 left-1 h-1.5 w-1.5 rounded-full ${p.inStock ? "bg-emerald-500" : "bg-destructive"}`} />
                </div>
                <div className="p-1.5 space-y-0.5">
                  <p className="text-[9px] font-semibold line-clamp-2 text-foreground/90 leading-tight min-h-[20px]">{p.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-extrabold text-foreground">${p.price.toFixed(2)}</span>
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
      )}
    </div>
  );
}

interface GroceryCategoryBrowserProps {
  store: StoreName;
  onAdd: (product: StoreProduct) => void;
  cartProductIds: Set<string>;
  onBrowse: (query: string) => void;
}

export function GroceryCategoryBrowser({ store, onAdd, cartProductIds, onBrowse }: GroceryCategoryBrowserProps) {
  // Only render 3 categories to avoid hammering API
  const [visibleCount, setVisibleCount] = useState(3);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 px-4 pt-4 pb-1">
        <span className="text-[13px] font-bold text-foreground">Browse by Category</span>
      </div>
      {CATEGORIES.slice(0, visibleCount).map((cat) => (
        <CategorySection
          key={cat.label}
          category={cat}
          store={store}
          onAdd={onAdd}
          cartProductIds={cartProductIds}
          onBrowse={onBrowse}
        />
      ))}
      {visibleCount < CATEGORIES.length && (
        <div className="px-4 pb-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setVisibleCount(CATEGORIES.length)}
            className="w-full py-2.5 rounded-2xl border border-dashed border-border/30 text-[11px] font-semibold text-primary hover:bg-primary/5 transition-all"
          >
            Show {CATEGORIES.length - visibleCount} more categories
          </motion.button>
        </div>
      )}
    </div>
  );
}
