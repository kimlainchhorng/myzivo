/**
 * GroceryMarketplace - 2026 Spatial UI store selection (v4)
 */
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, ShoppingCart, Sparkles, Clock, Zap, ChevronRight, TrendingUp, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import GroceryCategories from "@/components/grocery/GroceryCategories";
import GroceryPromos from "@/components/grocery/GroceryPromos";
import GroceryRecentStores from "@/components/grocery/GroceryRecentStores";
import GroceryReorder from "@/components/grocery/GroceryReorder";
import { GROCERY_STORES, type StoreCategory, type StoreConfig } from "@/config/groceryStores";
import { useGroceryCart } from "@/hooks/useGroceryCart";
import { useState, useMemo, useEffect } from "react";
import { GroceryHeroSkeleton, GroceryGridSkeleton, GroceryListSkeleton } from "@/components/grocery/GroceryStoreSkeleton";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 320, damping: 24 } },
};

function StoreCardGrid({ store }: { store: StoreConfig }) {
  const navigate = useNavigate();
  return (
    <motion.button
      variants={cardVariant}
      layout
      whileTap={{ scale: 0.96 }}
      onClick={() => navigate(`/grocery/store/${store.slug}`)}
      className="group relative flex flex-col items-center gap-2 p-4 pt-5 pb-3.5 rounded-[20px] border border-border/40 bg-card/90 backdrop-blur-sm hover:bg-card hover:border-primary/20 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300"
    >
      {store.promo && (
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-bold">
          {store.promo}
        </span>
      )}
      <div className="h-14 w-14 rounded-2xl bg-background border border-border/30 flex items-center justify-center p-2 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
        <img src={store.logo} alt={store.name} className="h-full w-full object-contain" />
      </div>
      <div className="text-center w-full">
        <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
          {store.name}
        </p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            {store.deliveryMin}m
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
            <Star className="h-2.5 w-2.5 fill-current" />
            {store.rating}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function StoreCardList({ store }: { store: StoreConfig }) {
  const navigate = useNavigate();
  return (
    <motion.button
      variants={cardVariant}
      layout
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/grocery/store/${store.slug}`)}
      className="group w-full flex items-center gap-3.5 p-3.5 rounded-[18px] border border-border/30 bg-card/70 backdrop-blur-sm hover:bg-card hover:border-primary/15 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="h-11 w-11 rounded-xl bg-background border border-border/30 flex items-center justify-center p-1.5 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300 shrink-0">
        <img src={store.logo} alt={store.name} className="h-full w-full object-contain" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
            {store.name}
          </p>
          {store.promo && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[8px] font-bold">
              {store.promo}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 mt-0.5">
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            {store.deliveryMin}m
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
            <Star className="h-2.5 w-2.5 fill-current" />
            {store.rating}
          </span>
          <span className="text-[10px] text-muted-foreground/60">{store.hours}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors shrink-0" />
    </motion.button>
  );
}

export default function GroceryMarketplace() {
  const navigate = useNavigate();
  const cart = useGroceryCart();
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState<StoreCategory | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filteredStores = useMemo(() => {
    let stores = GROCERY_STORES;
    if (category !== "all") {
      stores = stores.filter((s) => s.category === category);
    }
    if (filter.trim()) {
      stores = stores.filter((s) =>
        s.name.toLowerCase().includes(filter.toLowerCase())
      );
    }
    return stores;
  }, [filter, category]);

  const popularStores = filteredStores.slice(0, 4);
  const moreStores = filteredStores.slice(4);

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/6 blur-[80px]" />
        <div className="absolute top-1/3 -left-24 h-56 w-56 rounded-full bg-accent/8 blur-[60px]" />
        <div className="absolute bottom-1/4 right-0 h-64 w-64 rounded-full bg-primary/4 blur-[80px]" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/70 backdrop-blur-2xl border-b border-border/20">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2 rounded-2xl hover:bg-muted/60 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Grocery & More</h1>
            <p className="text-[10px] text-muted-foreground font-medium">Delivered by ZIVO drivers</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/grocery/store/walmart")}
            className="relative p-2.5 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.itemCount > 0 && (
              <motion.span
                key={cart.itemCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold min-w-[22px] h-[22px] px-1 shadow-lg shadow-primary/40 ring-2 ring-background"
              >
                {cart.itemCount}
              </motion.span>
            )}
          </motion.button>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search stores…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 rounded-2xl bg-muted/30 border-border/20 h-11 text-sm focus:bg-muted/50 transition-colors"
            />
          </div>
        </div>

        {/* Category chips */}
        <GroceryCategories active={category} onChange={setCategory} />
      </div>

      {isLoading ? (
        <>
          <GroceryHeroSkeleton />
          <div className="px-4 pt-5 pb-2">
            <div className="h-4 w-28 rounded bg-muted/40" />
          </div>
          <GroceryGridSkeleton />
        </>
      ) : (
        <>
          {/* Hero banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 25 }}
            className="mx-4 mt-4 p-4 rounded-[20px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15 backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="relative flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/15 shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">Shop from any store</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Pick a store, add items, and a ZIVO driver shops & delivers to your door.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-primary/10">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                <Clock className="h-3 w-3 text-primary" />
                <span>~45 min</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>No markups</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span>Real-time prices</span>
              </div>
            </div>
          </motion.div>

          {/* Recent stores */}
          <GroceryRecentStores />

          {/* Deals carousel */}
          <GroceryPromos />

          {/* Order Again */}
          <GroceryReorder />

          {/* Popular stores */}
          {popularStores.length > 0 && (
            <>
              <div className="px-4 pt-5 pb-2">
                <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
                  {category === "all" ? "Popular Stores" : `${category.charAt(0).toUpperCase() + category.slice(1)} Stores`}
                </h2>
              </div>

              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`grid-${category}`}
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="px-4 grid grid-cols-2 gap-2.5"
                >
                  {popularStores.map((store) => (
                    <StoreCardGrid key={store.slug} store={store} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </>
          )}

          {/* More stores */}
          {moreStores.length > 0 && (
            <>
              <div className="px-4 pt-5 pb-2">
                <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">More Stores</h2>
              </div>

              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`list-${category}`}
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="px-4 space-y-2"
                >
                  {moreStores.map((store) => (
                    <StoreCardList key={store.slug} store={store} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </>
          )}

          {filteredStores.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No stores found</p>
            </div>
          )}
        </>
      )}

      <ZivoMobileNav />
    </div>
  );
}
