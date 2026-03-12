/**
 * GroceryMarketplace - Instacart-style store grid
 * User picks a store → navigates to /grocery/store/:slug
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { GROCERY_STORES } from "@/config/groceryStores";
import { useGroceryCart } from "@/hooks/useGroceryCart";
import { useState, useMemo } from "react";

export default function GroceryMarketplace() {
  const navigate = useNavigate();
  const cart = useGroceryCart();
  const [filter, setFilter] = useState("");

  const filteredStores = useMemo(
    () =>
      filter.trim()
        ? GROCERY_STORES.filter((s) =>
            s.name.toLowerCase().includes(filter.toLowerCase())
          )
        : GROCERY_STORES,
    [filter]
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold flex-1">Grocery</h1>
          <button
            onClick={() => navigate("/grocery/store/walmart")}
            className="relative p-2 rounded-xl hover:bg-muted"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold min-w-[18px] h-[18px] px-1">
                {cart.itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Search stores */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stores…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 rounded-xl bg-muted/50 border-border/50"
            />
          </div>
        </div>
      </div>

      {/* Section title */}
      <div className="px-4 pt-5 pb-2">
        <h2 className="text-base font-bold">Choose a store</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          A ZIVO driver will shop and deliver your items
        </p>
      </div>

      {/* Store grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filteredStores.map((store, i) => (
          <motion.button
            key={store.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/grocery/store/${store.slug}`)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/50 bg-card hover:bg-muted/50 active:scale-[0.97] transition-all relative"
          >
            {/* Promo badge */}
            {store.promo && (
              <Badge
                variant="secondary"
                className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border-0"
              >
                {store.promo}
              </Badge>
            )}

            {/* Logo */}
            <div className="h-16 w-16 rounded-2xl bg-white border border-border/30 flex items-center justify-center p-2">
              <img
                src={store.logo}
                alt={store.name}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Name */}
            <span className="text-sm font-semibold text-foreground">{store.name}</span>
          </motion.button>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">
          No stores found
        </p>
      )}

      <ZivoMobileNav />
    </div>
  );
}
