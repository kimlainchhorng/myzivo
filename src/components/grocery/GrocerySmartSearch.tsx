/**
 * GrocerySmartSearch — autocomplete dropdown with store + product suggestions
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Store, ShoppingBag, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GROCERY_STORES } from "@/config/groceryStores";

const POPULAR_PRODUCTS = [
  { query: "Milk & Dairy", store: "walmart" },
  { query: "Fresh Produce", store: "kroger" },
  { query: "Snacks & Chips", store: "costco" },
  { query: "Pet Food", store: "petco" },
  { query: "Vitamins", store: "walgreens" },
  { query: "Phone Charger", store: "best-buy" },
];

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function GrocerySmartSearch({ value, onChange }: Props) {
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const query = value.trim().toLowerCase();

  const storeResults = query
    ? GROCERY_STORES.filter((s) => s.name.toLowerCase().includes(query)).slice(0, 3)
    : [];

  const productResults = query
    ? POPULAR_PRODUCTS.filter((p) => p.query.toLowerCase().includes(query)).slice(0, 3)
    : POPULAR_PRODUCTS.slice(0, 4);

  const showDropdown = isFocused && (storeResults.length > 0 || productResults.length > 0 || !query);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="px-4 pb-2 relative">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          ref={inputRef}
          placeholder="Search stores & products…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="pl-10 pr-9 rounded-2xl bg-muted/30 border-border/20 h-11 text-sm focus:bg-muted/50 transition-colors"
          aria-label="Search stores and products"
        />
        {value && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => { onChange(""); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-muted/60 hover:bg-muted transition-colors"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 28 }}
            className="absolute left-4 right-4 top-[calc(100%-2px)] z-50 rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl shadow-background/60 overflow-hidden"
          >
            {/* Store matches */}
            {storeResults.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stores</p>
                {storeResults.map((store) => (
                  <motion.button
                    key={store.slug}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      navigate(`/grocery/store/${store.slug}`);
                      setIsFocused(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-background border border-border/30 flex items-center justify-center p-1 shrink-0">
                      <img src={store.logo} alt={store.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[12px] font-semibold text-foreground">{store.name}</p>
                      <p className="text-[10px] text-muted-foreground">{store.deliveryMin}m delivery</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Product suggestions */}
            {productResults.length > 0 && (
              <div className={`p-2 ${storeResults.length > 0 ? "border-t border-border/20" : ""}`}>
                <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {query ? "Products" : "Popular searches"}
                </p>
                {productResults.map((product) => {
                  const store = GROCERY_STORES.find((s) => s.slug === product.store);
                  return (
                    <motion.button
                      key={product.query}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        navigate(`/grocery/store/${product.store}`);
                        setIsFocused(false);
                        onChange("");
                      }}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[12px] font-medium text-foreground">{product.query}</p>
                        {store && <p className="text-[10px] text-muted-foreground">at {store.name}</p>}
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
