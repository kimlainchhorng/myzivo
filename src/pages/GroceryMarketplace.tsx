/**
 * GroceryMarketplace - 2026 Spatial UI store selection
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, ShoppingCart, Sparkles, Clock, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-2xl hover:bg-muted/60 transition-colors duration-200">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">Grocery & More</h1>
            <p className="text-[11px] text-muted-foreground">Delivered by ZIVO drivers</p>
          </div>
          <button
            onClick={() => navigate("/grocery/store/walmart")}
            className="relative p-2.5 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors duration-200"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold min-w-[20px] h-[20px] px-1 shadow-lg shadow-primary/30"
              >
                {cart.itemCount}
              </motion.span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stores…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 rounded-2xl bg-muted/40 border-border/30 h-11 text-sm input-focus-glow"
            />
          </div>
        </div>
      </div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-4 mt-4 p-3.5 rounded-2xl bg-primary/5 border border-primary/10 backdrop-blur-sm"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 shrink-0">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Shop from any store</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Pick a store, add items to your cart, and a ZIVO driver shops & delivers to your door.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="flex items-center gap-3 px-4 mt-4 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>~45 min delivery</span>
        </div>
        <div className="h-3 w-px bg-border" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          <span>No markups on items</span>
        </div>
      </div>

      {/* Section title */}
      <div className="px-4 pt-3 pb-2">
        <h2 className="text-base font-bold">Choose a store</h2>
      </div>

      {/* Store grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filteredStores.map((store, i) => (
          <motion.button
            key={store.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => navigate(`/grocery/store/${store.slug}`)}
            className="group relative flex flex-col items-center gap-2.5 p-5 rounded-3xl border border-border/40 bg-card/80 backdrop-blur-sm hover:bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.96] transition-all duration-300"
          >
            {/* Promo badge */}
            {store.promo && (
              <Badge className="absolute top-2.5 right-2.5 text-[9px] px-2 py-0.5 bg-primary/15 text-primary border-primary/20 font-semibold">
                {store.promo}
              </Badge>
            )}

            {/* Logo container */}
            <div className="h-16 w-16 rounded-2xl bg-white border border-border/20 flex items-center justify-center p-2 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
              <img
                src={store.logo}
                alt={store.name}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Name */}
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
              {store.name}
            </span>
          </motion.button>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No stores found</p>
        </div>
      )}

      <ZivoMobileNav />
    </div>
  );
}
