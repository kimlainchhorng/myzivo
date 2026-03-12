/**
 * GroceryOrderAgain - Shows previously purchased items for quick reorder
 * Pulls from localStorage order history
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Plus, Check, Package } from "lucide-react";
import type { StoreProduct } from "@/hooks/useStoreSearch";

const HISTORY_KEY = "zivo-grocery-order-history";

export interface OrderHistoryItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  store: string;
  lastOrdered: string;
  orderCount: number;
}

/** Save items to order history after checkout */
export function saveToOrderHistory(items: { productId: string; name: string; price: number; image: string; brand: string; store: string }[]) {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    const history: OrderHistoryItem[] = stored ? JSON.parse(stored) : [];
    const now = new Date().toISOString();

    items.forEach((item) => {
      const existing = history.find((h) => h.productId === item.productId);
      if (existing) {
        existing.lastOrdered = now;
        existing.orderCount += 1;
        existing.price = item.price;
      } else {
        history.push({ ...item, lastOrdered: now, orderCount: 1 });
      }
    });

    // Keep last 50 items, sorted by most recent
    history.sort((a, b) => new Date(b.lastOrdered).getTime() - new Date(a.lastOrdered).getTime());
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch {
    // Silently fail
  }
}

export function getOrderHistory(store?: string): OrderHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    const history: OrderHistoryItem[] = JSON.parse(stored);
    if (store) return history.filter((h) => h.store.toLowerCase() === store.toLowerCase());
    return history;
  } catch {
    return [];
  }
}

interface GroceryOrderAgainProps {
  store: string;
  onAdd: (product: StoreProduct) => void;
  cartProductIds: Set<string>;
}

export function GroceryOrderAgain({ store, onAdd, cartProductIds }: GroceryOrderAgainProps) {
  const [history, setHistory] = useState<OrderHistoryItem[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHistory(getOrderHistory(store));
  }, [store]);

  if (history.length === 0) return null;

  const handleAdd = (item: OrderHistoryItem) => {
    onAdd({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      brand: item.brand,
      rating: null,
      inStock: true,
      store: item.store,
    });
    setAddedIds((prev) => new Set(prev).add(item.productId));
    setTimeout(() => setAddedIds((prev) => { const next = new Set(prev); next.delete(item.productId); return next; }), 800);
  };

  return (
    <div className="pt-3 pb-1">
      <div className="flex items-center gap-1.5 mb-3 px-4">
        <RotateCcw className="h-3.5 w-3.5 text-primary" />
        <span className="text-[12px] font-bold text-foreground/80 uppercase tracking-wider">Order Again</span>
        <span className="text-[10px] text-muted-foreground ml-1">({history.length})</span>
      </div>
      <div
        className="flex gap-2.5 overflow-x-auto pb-2 px-4 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {history.slice(0, 10).map((item, i) => {
          const inCart = cartProductIds.has(item.productId);
          const justAdded = addedIds.has(item.productId);
          return (
            <motion.div
              key={item.productId}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
              className="snap-start shrink-0 w-[130px] rounded-2xl border border-border/30 bg-card overflow-hidden hover:border-primary/20 hover:shadow-md transition-all"
            >
              <div className="relative h-[90px] bg-gradient-to-br from-primary/[0.03] to-muted/20 flex items-center justify-center p-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-contain" loading="lazy" referrerPolicy="no-referrer" />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground/10" />
                )}
                {item.orderCount > 1 && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-primary/15 backdrop-blur-sm">
                    <span className="text-[8px] font-bold text-primary">{item.orderCount}× ordered</span>
                  </div>
                )}
              </div>
              <div className="p-2 space-y-1">
                <p className="text-[10px] font-semibold line-clamp-2 text-foreground/90 leading-snug min-h-[24px]">{item.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-extrabold text-foreground">${item.price.toFixed(2)}</span>
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleAdd(item)}
                    className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${
                      inCart || justAdded
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/15"
                    }`}
                  >
                    {justAdded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
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
