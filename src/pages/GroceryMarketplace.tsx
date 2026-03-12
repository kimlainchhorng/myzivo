/**
 * GroceryMarketplace - 2026 Spatial UI store selection (v6)
 * Featured spotlight, live pulse, category counts, premium motion
 */
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ShoppingCart, Sparkles, Clock, Zap, ChevronRight, TrendingUp, Star, Store, MapPin, Truck, Shield } from "lucide-react";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import GroceryCategories from "@/components/grocery/GroceryCategories";
import GroceryPromos from "@/components/grocery/GroceryPromos";
import GroceryRecentStores from "@/components/grocery/GroceryRecentStores";
import GroceryReorder from "@/components/grocery/GroceryReorder";
import GrocerySmartSearch from "@/components/grocery/GrocerySmartSearch";
import { GROCERY_STORES, type StoreCategory, type StoreConfig } from "@/config/groceryStores";
import { useGroceryCart } from "@/hooks/useGroceryCart";
import { useState, useMemo, useEffect, useRef } from "react";
import { GroceryHeroSkeleton, GroceryGridSkeleton } from "@/components/grocery/GroceryStoreSkeleton";
import { getStoreStatus, getLiveEta } from "@/utils/storeStatus";
import GroceryDeliveryBar from "@/components/grocery/GroceryDeliveryBar";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 320, damping: 24 } },
};

/* ─── Live status dot ─── */
function StatusDot({ isOpen }: { isOpen: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      {isOpen && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      )}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
    </span>
  );
}

/* ─── Featured spotlight card ─── */
function FeaturedStore({ store, eta }: { store: StoreConfig; eta: number }) {
  const navigate = useNavigate();
  const status = getStoreStatus(store.hours);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/grocery/store/${store.slug}`)}
      className="w-full relative p-4 rounded-[24px] border border-primary/20 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent backdrop-blur-sm overflow-hidden group"
    >
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-accent/8 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex items-center gap-4">
        <div className="h-16 w-16 rounded-[20px] bg-background border border-border/30 flex items-center justify-center p-2.5 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
          <img src={store.logo} alt={store.name} className="h-full w-full object-contain" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1">
            <StatusDot isOpen={status.isOpen} />
            <span className={`text-[10px] font-semibold ${status.isOpen ? "text-emerald-500" : "text-muted-foreground/50"}`}>
              {status.label}
            </span>
            {store.promo && (
              <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-bold animate-pulse">
                {store.promo}
              </span>
            )}
          </div>
          <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{store.name}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Truck className="h-3 w-3 text-primary" />
              {eta}m
            </span>
            <span className="flex items-center gap-1 text-[11px] text-amber-400">
              <Star className="h-3 w-3 fill-current" />
              {store.rating}
            </span>
            <span className="text-[11px] text-muted-foreground">{store.hours}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary/60 transition-colors shrink-0" />
      </div>
    </motion.button>
  );
}

/* ─── Grid card ─── */
function StoreCardGrid({ store, eta }: { store: StoreConfig; eta: number }) {
  const navigate = useNavigate();
  const status = getStoreStatus(store.hours);

  return (
    <motion.button
      variants={cardVariant}
      layout
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(`/grocery/store/${store.slug}`)}
      className={`group relative flex flex-col items-center gap-2 p-4 pt-5 pb-3.5 rounded-[20px] border bg-card/90 backdrop-blur-sm hover:bg-card hover:shadow-xl transition-all duration-300 ${
        status.isOpen
          ? "border-border/40 hover:border-primary/20 hover:shadow-primary/8"
          : "border-border/20 opacity-70"
      }`}
    >
      {store.promo && (
        <motion.span
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 15, delay: 0.2 }}
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-bold"
        >
          {store.promo}
        </motion.span>
      )}
      
      <div className="absolute top-2.5 left-2.5">
        <StatusDot isOpen={status.isOpen} />
      </div>

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
            {eta}m
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

/* ─── List card ─── */
function StoreCardList({ store, eta }: { store: StoreConfig; eta: number }) {
  const navigate = useNavigate();
  const status = getStoreStatus(store.hours);

  return (
    <motion.button
      variants={cardVariant}
      layout
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/grocery/store/${store.slug}`)}
      className={`group w-full flex items-center gap-3.5 p-3.5 rounded-[18px] border bg-card/70 backdrop-blur-sm hover:bg-card transition-all duration-300 ${
        status.isOpen
          ? "border-border/30 hover:border-primary/15 hover:shadow-lg hover:shadow-primary/5"
          : "border-border/20 opacity-70"
      }`}
    >
      <div className="relative h-11 w-11 rounded-xl bg-background border border-border/30 flex items-center justify-center p-1.5 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300 shrink-0">
        <img src={store.logo} alt={store.name} className="h-full w-full object-contain" />
        <div className="absolute -top-0.5 -right-0.5">
          <StatusDot isOpen={status.isOpen} />
        </div>
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
            {eta}m
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
            <Star className="h-2.5 w-2.5 fill-current" />
            {store.rating}
          </span>
          <span className={`text-[10px] font-medium ${status.isOpen ? "text-emerald-500" : "text-muted-foreground/50"}`}>
            {status.label}
          </span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors shrink-0" />
    </motion.button>
  );
}

/* ─── Main page ─── */
export default function GroceryMarketplace() {
  const navigate = useNavigate();
  const cart = useGroceryCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState<StoreCategory | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  // Live ETAs — refresh every 30s
  const [etas, setEtas] = useState<Record<string, number>>({});
  useEffect(() => {
    const compute = () => {
      const map: Record<string, number> = {};
      GROCERY_STORES.forEach((s) => { map[s.slug] = getLiveEta(s.deliveryMin); });
      setEtas(map);
    };
    compute();
    const interval = setInterval(compute, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Parallax for hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 200], [0, -30]);
  const heroScale = useTransform(scrollY, [0, 200], [1, 0.97]);

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

  // Category counts for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: GROCERY_STORES.length };
    GROCERY_STORES.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Featured store = highest rated open store
  const featuredStore = useMemo(() => {
    if (filter.trim() || category !== "all") return null;
    return [...GROCERY_STORES]
      .filter((s) => getStoreStatus(s.hours).isOpen)
      .sort((a, b) => b.rating - a.rating)[0] || null;
  }, [filter, category]);

  const nonFeaturedStores = useMemo(() => {
    return filteredStores.filter((s) => s.slug !== featuredStore?.slug);
  }, [filteredStores, featuredStore]);

  const popularStores = nonFeaturedStores.slice(0, 4);
  const moreStores = nonFeaturedStores.slice(4);

  return (
    <div ref={scrollRef} className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          style={{ y: useTransform(scrollY, [0, 400], [0, 50]) }}
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/6 blur-[80px]"
        />
        <motion.div
          style={{ y: useTransform(scrollY, [0, 400], [0, -30]) }}
          className="absolute top-1/3 -left-24 h-56 w-56 rounded-full bg-accent/8 blur-[60px]"
        />
        <div className="absolute bottom-1/4 right-0 h-64 w-64 rounded-full bg-primary/4 blur-[80px]" />
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-background/70 backdrop-blur-2xl border-b border-border/20">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2 rounded-2xl hover:bg-muted/60 transition-colors duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Grocery & More</h1>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] text-muted-foreground font-medium">Delivered by ZIVO drivers</p>
              {!isLoading && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/40 text-[9px] font-bold text-muted-foreground"
                >
                  <Store className="h-2.5 w-2.5" />
                  {GROCERY_STORES.length} stores
                </motion.span>
              )}
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/grocery/store/walmart")}
            className="relative p-2.5 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
            aria-label="Shopping cart"
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

        {/* Smart search */}
        <GrocerySmartSearch value={filter} onChange={setFilter} />

        {/* Category chips with counts */}
        <GroceryCategories active={category} onChange={setCategory} counts={categoryCounts} />
      </div>

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <GroceryHeroSkeleton />
          <div className="px-4 pt-5 pb-2">
            <div className="h-4 w-28 rounded bg-muted/40" />
          </div>
          <GroceryGridSkeleton />
        </motion.div>
      ) : (
        <>
          {/* Hero banner with parallax */}
          <motion.div
            style={{ y: heroY, scale: heroScale }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, type: "spring" as const, stiffness: 300, damping: 25 }}
            className="mx-4 mt-4 p-4 rounded-[20px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15 backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="relative flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="p-2.5 rounded-2xl bg-primary/15 shrink-0"
              >
                <Zap className="h-5 w-5 text-primary" />
              </motion.div>
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
                <Shield className="h-3 w-3 text-primary" />
                <span>No markups</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span>Real-time prices</span>
              </div>
            </div>
          </motion.div>

          {/* Featured spotlight */}
          {featuredStore && (
            <div className="px-4 pt-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">Featured</h2>
              </div>
              <FeaturedStore store={featuredStore} eta={etas[featuredStore.slug] ?? featuredStore.deliveryMin} />
            </div>
          )}

          {/* Recent stores */}
          <GroceryRecentStores />

          {/* Deals carousel */}
          <GroceryPromos />

          {/* Order Again */}
          <GroceryReorder />

          {/* Popular stores */}
          {popularStores.length > 0 && (
            <>
              <div className="px-4 pt-5 pb-2 flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
                  {category === "all" ? "Popular Stores" : `${category.charAt(0).toUpperCase() + category.slice(1)} Stores`}
                </h2>
                <motion.span
                  key={filteredStores.length}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[10px] font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full"
                >
                  {filteredStores.length} stores
                </motion.span>
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
                    <StoreCardGrid key={store.slug} store={store} eta={etas[store.slug] ?? store.deliveryMin} />
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
                    <StoreCardList key={store.slug} store={store} eta={etas[store.slug] ?? store.deliveryMin} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </>
          )}

          {filteredStores.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <Store className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No stores found</p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">Try a different search or category</p>
            </motion.div>
          )}
        </>
      )}

      <ZivoMobileNav />
    </div>
  );
}
