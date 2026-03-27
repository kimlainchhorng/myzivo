/**
 * StoreProfilePage - Ultra-premium 3D/4D Spatial UI store profile
 * Immersive glassmorphic design with depth, perspective, holographic cards
 */
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingCart, Star, Clock, MapPin, Phone, Store, Package, Loader2, Plus, Minus, Sparkles, Heart, Eye, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { useStoreProfile, useStoreProducts, useStoreProductCategories, type StoreProductItem } from "@/hooks/useStoreProfile";
import { useGroceryCart } from "@/hooks/useGroceryCart";
import { GroceryCheckoutDrawer } from "@/components/grocery/GroceryCheckoutDrawer";
import { useState, useRef } from "react";
import StoreHeroCarousel from "@/components/grocery/StoreHeroCarousel";
import { toast } from "sonner";
import { useI18n } from "@/hooks/useI18n";
import storeRideBg from "@/assets/store-ride-bg.jpg";
import storeCallBg from "@/assets/store-call-bg.jpg";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24, rotateX: 12, scale: 0.92 },
  show: {
    opacity: 1, y: 0, rotateX: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 24 },
  },
};

/* Floating bokeh particle */
function BokehDot({ delay, size, x, y, color }: { delay: number; size: number; x: string; y: string; color: string }) {
  return (
    <motion.div
      animate={{ y: [-12, 12, -12], x: [-6, 6, -6], opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 6 + delay * 2, repeat: Infinity, ease: "easeInOut", delay }}
      className="absolute rounded-full blur-sm pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, background: color }}
    />
  );
}

export default function StoreProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const cart = useGroceryCart();
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  // Track selected size per product: productId -> variant index
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});
  const { t } = useI18n();

  const { data: store, isLoading: loadingStore } = useStoreProfile(slug || "");
  const { data: products = [], isLoading: loadingProducts } = useStoreProducts(store?.id, selectedCategory);
  const { data: categories = [] } = useStoreProductCategories(store?.id);

  const handleAddToCart = (product: StoreProductItem, sizeVariant?: { size: string; price_khr: number; price_usd: number }) => {
    cart.addItem({
      productId: sizeVariant ? `${product.id}__${sizeVariant.size}` : product.id,
      name: sizeVariant ? `${product.name} (${sizeVariant.size})` : product.name,
      price: sizeVariant ? sizeVariant.price_usd : product.price,
      image: product.image_url || "",
      brand: product.brand || "",
      sizeLabel: sizeVariant?.size,
    }, store?.name || "Store");
    toast.success(t("store.added_to_cart"), { icon: "🛒" });
  };

  const toggleLike = (id: string) => {
    setLikedProducts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loadingStore) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <Store className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">{t("store.not_found")}</p>
        <Button onClick={() => navigate("/grocery")} variant="outline">Back to Grocery</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      {/* ── Immersive Animated Background ── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        {/* Large floating orbs */}
        <motion.div
          animate={{ y: [-30, 30, -30], x: [-15, 15, -15], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 -right-16 w-80 h-80 rounded-full bg-primary/[0.06] blur-[80px]"
        />
        <motion.div
          animate={{ y: [25, -25, 25], x: [12, -12, 12], scale: [1.1, 0.9, 1.1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-sky-400/[0.05] blur-[80px]"
        />
        <motion.div
          animate={{ y: [15, -20, 15], scale: [1, 1.2, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 right-8 w-56 h-56 rounded-full bg-emerald-400/[0.04] blur-[60px]"
        />
        <motion.div
          animate={{ y: [-10, 20, -10], x: [8, -8, 8] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-2/3 left-1/3 w-40 h-40 rounded-full bg-rose-400/[0.03] blur-[50px]"
        />
        {/* Bokeh particles */}
        <BokehDot delay={0} size={6} x="15%" y="25%" color="hsl(var(--primary) / 0.3)" />
        <BokehDot delay={1} size={4} x="75%" y="40%" color="hsl(var(--primary) / 0.2)" />
        <BokehDot delay={2} size={8} x="60%" y="70%" color="hsl(142 76% 36% / 0.2)" />
        <BokehDot delay={0.5} size={5} x="30%" y="55%" color="hsl(200 90% 60% / 0.2)" />
        <BokehDot delay={1.5} size={3} x="85%" y="20%" color="hsl(var(--primary) / 0.25)" />
        <BokehDot delay={3} size={7} x="10%" y="80%" color="hsl(280 60% 60% / 0.15)" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 0.5px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* ── Banner with 3D parallax ── */}
      {(() => {
        const coverUrl = store.banner_url;

        return (
          <div className="relative w-full h-60 overflow-hidden">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={`${store.name} cover`}
                className="w-full h-full object-cover"
                style={{ objectPosition: `center ${(store as any).banner_position ?? 50}%` }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-sky-500/15" />
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none z-[1]" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-[1]" />

            {/* Nav buttons */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-3 z-10">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => navigate(-1)}
                className="h-10 w-10 rounded-2xl bg-background/50 backdrop-blur-2xl flex items-center justify-center shadow-xl border border-white/10"
              >
                <ArrowLeft className="h-4 w-4 text-foreground" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setShowCart(true)}
                className="relative h-10 w-10 rounded-2xl bg-background/50 backdrop-blur-2xl flex items-center justify-center shadow-xl border border-white/10"
              >
                <ShoppingCart className="h-4 w-4 text-foreground" />
                {cart.itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-background shadow-lg shadow-primary/30"
                  >
                    {cart.itemCount}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>
        );
      })()}

      {/* ── Store Info Card - 3D glassmorphic ── */}
      <div className="relative px-4 -mt-16 z-10" style={{ perspective: "1000px" }}>
        <motion.div
          initial={{ y: 50, opacity: 0, rotateX: 10 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="bg-card/70 backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-2xl shadow-black/10 p-4 relative overflow-hidden"
        >
          {/* Holographic shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-primary/[0.02] rounded-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="flex items-start gap-3 relative">
            <motion.div
              initial={{ scale: 0.7, opacity: 0, rotateY: -20 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              className="h-16 w-16 rounded-2xl bg-background/80 backdrop-blur-sm border border-white/10 overflow-hidden flex items-center justify-center shrink-0 shadow-xl shadow-black/5"
            >
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-full w-full object-contain p-1" />
              ) : (
                <Store className="h-8 w-8 text-muted-foreground/30" />
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">{store.name}</h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {store.rating || "4.5"}
                </span>
                {store.hours && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {store.hours}
                  </span>
                )}
                {store.delivery_min && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/15">
                    {store.delivery_min}m delivery
                  </Badge>
                )}
              </div>
              {store.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{store.description}</p>
              )}
            </div>
          </div>

          {/* Contact row — immersive 4D cards */}
          <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-white/[0.06]" style={{ perspective: "800px" }}>
            {store.address && (
              <motion.button
                whileTap={{ scale: 0.94, rotateX: 2 }}
                whileHover={{ scale: 1.03, rotateY: -3, rotateX: 2 }}
                onClick={() => {
                  const params = new URLSearchParams({ destination: store.address! });
                  const s = store as any;
                  if (s.latitude && s.longitude) {
                    params.set("destLat", String(s.latitude));
                    params.set("destLng", String(s.longitude));
                  }
                  navigate(`/rides/hub?${params.toString()}`);
                }}
                className="relative flex items-center gap-2.5 rounded-xl border border-white/20 overflow-hidden h-14 px-3 group"
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow: "0 6px 24px -6px hsl(var(--primary) / 0.2), 0 2px 6px -2px hsl(0 0% 0% / 0.12), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)",
                }}
              >
                {/* Background image with parallax movement */}
                <motion.div
                  className="absolute inset-0 z-0"
                  animate={{ scale: [1, 1.08, 1], x: [0, 3, -2, 0], y: [0, -2, 1, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img src={storeRideBg} alt="" className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
                <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/60 via-black/40 to-black/50" />
                <motion.div
                  className="absolute inset-0 z-[2] pointer-events-none"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ background: "linear-gradient(135deg, transparent 30%, hsl(0 0% 100% / 0.12) 50%, transparent 70%)" }}
                />
                {/* Content */}
                <div className="relative z-[3] h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border border-white/20"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary) / 0.85), hsl(var(--primary) / 0.6))",
                    boxShadow: "0 3px 10px -2px hsl(var(--primary) / 0.5)",
                    transform: "translateZ(16px)",
                  }}
                >
                  <MapPin className="h-4 w-4 text-primary-foreground drop-shadow-md" />
                </div>
                <div className="relative z-[3] flex flex-col items-start min-w-0">
                  <p className="text-[11px] font-bold text-white drop-shadow-md">{t("store.ride_there") || "Ride There"}</p>
                  <p className="text-[8px] text-white/65 leading-tight truncate w-full drop-shadow-sm">{store.address}</p>
                </div>
              </motion.button>
            )}
            {store.phone && (
              <motion.a
                whileTap={{ scale: 0.94, rotateX: 2 }}
                whileHover={{ scale: 1.03, rotateY: 3, rotateX: 2 }}
                href={`tel:${store.phone.replace(/\s+/g, "")}`}
                className="relative flex items-center gap-2.5 rounded-xl border border-white/20 overflow-hidden h-14 px-3 group"
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow: "0 6px 24px -6px hsl(152 70% 50% / 0.2), 0 2px 6px -2px hsl(0 0% 0% / 0.12), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)",
                }}
              >
                <motion.div
                  className="absolute inset-0 z-0"
                  animate={{ scale: [1, 1.06, 1], x: [0, -2, 3, 0], y: [0, 2, -1, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img src={storeCallBg} alt="" className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
                <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/60 via-black/40 to-black/50" />
                <motion.div
                  className="absolute inset-0 z-[2] pointer-events-none"
                  animate={{ opacity: [0, 0.25, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  style={{ background: "linear-gradient(225deg, transparent 30%, hsl(0 0% 100% / 0.12) 50%, transparent 70%)" }}
                />
                <div className="relative z-[3] h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border border-white/20"
                  style={{
                    background: "linear-gradient(135deg, hsl(152 70% 45% / 0.9), hsl(152 70% 35% / 0.7))",
                    boxShadow: "0 3px 10px -2px hsl(152 70% 50% / 0.5)",
                    transform: "translateZ(16px)",
                  }}
                >
                  <Phone className="h-4 w-4 text-white drop-shadow-md" />
                </div>
                <div className="relative z-[3] flex flex-col items-start min-w-0">
                  <p className="text-[11px] font-bold text-white drop-shadow-md">{t("store.call_store") || "Call Store"}</p>
                  <p className="text-[10px] text-white/75 font-semibold drop-shadow-sm">{store.phone}</p>
                </div>
              </motion.a>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Promo Banner Carousel ── */}
      {(store.gallery_images?.length ?? 0) > 0 && (
        <div className="px-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-lg shadow-black/5 relative h-48"
          >
            <StoreHeroCarousel
              images={store.gallery_images!}
              storeName={store.name}
              positions={(store as any).gallery_positions}
            />
          </motion.div>
        </div>
      )}


      {/* ── Category Tabs - 3D Spatial Pills ── */}
      {categories.length > 0 && (
        <div className="relative px-4 pt-5">
          {/* Frosted track background */}
          <div className="absolute inset-x-4 top-5 bottom-0 rounded-2xl bg-card/30 backdrop-blur-xl border border-white/[0.06] shadow-inner" />
          <div className="relative flex gap-1.5 overflow-x-auto no-scrollbar p-1.5">
            <motion.button
              whileTap={{ scale: 0.88, rotateX: 8 }}
              whileHover={{ y: -2, scale: 1.03 }}
              onClick={() => setSelectedCategory(undefined)}
              className={cn(
                "relative px-5 py-2.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap shrink-0 transition-all duration-200",
                "border backdrop-blur-sm",
                !selectedCategory
                  ? "bg-gradient-to-b from-primary via-primary to-primary/85 text-primary-foreground shadow-xl shadow-primary/30 border-primary/50 ring-1 ring-primary/20"
                  : "bg-card/60 text-muted-foreground border-white/[0.08] hover:bg-card/90 hover:border-white/[0.15] hover:text-foreground"
              )}
              style={{ transformStyle: "preserve-3d" }}
            >
              {!selectedCategory && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
              )}
              <span className="relative z-10">All</span>
            </motion.button>
            {categories.map((cat) => (
              <motion.button
                whileTap={{ scale: 0.88, rotateX: 8 }}
                whileHover={{ y: -2, scale: 1.03 }}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "relative px-5 py-2.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap shrink-0 transition-all duration-200",
                  "border backdrop-blur-sm",
                  selectedCategory === cat
                    ? "bg-gradient-to-b from-primary via-primary to-primary/85 text-primary-foreground shadow-xl shadow-primary/30 border-primary/50 ring-1 ring-primary/20"
                    : "bg-card/60 text-muted-foreground border-white/[0.08] hover:bg-card/90 hover:border-white/[0.15] hover:text-foreground"
                )}
                style={{ transformStyle: "preserve-3d" }}
              >
                {selectedCategory === cat && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
                )}
                <span className="relative z-10">{cat}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ── Section Header ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            {selectedCategory || t("store.all_products")}
          </h2>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">
          {products.length} {t("store.items")}
        </span>
      </div>

      {/* ── Products Grid - 3D Holographic Cards ── */}
      <div className="px-3 pt-1 pb-40" style={{ perspective: "1200px" }}>
        {loadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package className="h-12 w-12 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">{t("store.no_products")}</p>
          </div>
        ) : (
          (() => {
            // Group by category when showing "All"
            const grouped = !selectedCategory
              ? categories.reduce<Record<string, typeof products>>((acc, cat) => {
                  acc[cat] = products.filter((p: any) => p.category === cat);
                  return acc;
                }, {})
              : { [selectedCategory]: products };

            // Add uncategorized
            if (!selectedCategory) {
              const uncategorized = products.filter((p: any) => !p.category || !categories.includes(p.category));
              if (uncategorized.length > 0) grouped[t("store.other") || "Other"] = uncategorized;
            }

            return Object.entries(grouped).map(([cat, catProducts]) => {
              if (!catProducts.length) return null;
              return (
                <div key={cat} className="mb-5">
                  {!selectedCategory && Object.keys(grouped).length > 1 && (
                    <div className="flex items-center gap-2.5 mb-3 px-1">
                      <div className="h-7 w-7 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Package className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <h3 className="text-[13px] font-bold text-foreground tracking-tight">{cat}</h3>
                      <span className="text-[10px] text-muted-foreground/60 font-medium bg-muted/30 px-2 py-0.5 rounded-full">{catProducts.length}</span>
                      <div className="flex-1 h-px bg-border/30 ml-1" />
                    </div>
                  )}
                  <div
                    className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="flex gap-3"
                    >
                    {catProducts.map((product, i) => {
                      const p = product as any;
                      const sizeVariants: { size: string; price_khr: number; price_usd: number }[] = (p.size_variants || []);
                      const hasSizes = sizeVariants.length > 0;
                      const selectedIdx = selectedSizes[product.id] ?? 0;
                      const activeVariant = hasSizes ? sizeVariants[selectedIdx] : null;
                      const activePrice = activeVariant ? activeVariant.price_usd : product.price;
                      const activeKhr = activeVariant ? activeVariant.price_khr : ((p.price_khr || Math.round(product.price * ((store as any)?.khr_rate || 4050))));
                      const cartKey = hasSizes && activeVariant ? `${product.id}__${activeVariant.size}` : product.id;
                      const cartItem = cart.items.find((c) => c.productId === cartKey);
                      const khrPrice = activeKhr;
                      const isLiked = likedProducts.has(product.id);
                      const hasBogo = p.discount_type === "bogo" && (p.buy_quantity || 0) >= 1 && (p.get_quantity || 0) >= 1
                        && (!p.discount_expires_at || new Date(p.discount_expires_at) > new Date());
                      const hasDiscount = !hasBogo && p.discount_type && p.discount_value > 0 && p.discount_price_khr != null
                        && (!p.discount_expires_at || new Date(p.discount_expires_at) > new Date());
                      const discountKhr = hasDiscount ? p.discount_price_khr : null;
                      const discountUsd = hasDiscount ? parseFloat((discountKhr / ((store as any)?.khr_rate || 4050)).toFixed(2)) : null;
                      const discountPct = hasDiscount && p.discount_type === "percentage" ? p.discount_value : null;
                      return (
                <motion.div
                  key={product.id}
                  variants={cardVariant}
                  whileHover={{ y: -3, scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "group relative rounded-[16px] overflow-hidden transition-all duration-300 snap-start shrink-0",
                    "bg-card/60 backdrop-blur-xl border",
                    "w-[46vw] min-w-[170px] max-w-[200px]",
                    cartItem
                      ? "border-primary/25 shadow-xl shadow-primary/10 ring-1 ring-primary/10"
                      : "border-white/[0.06] shadow-lg shadow-black/5 hover:shadow-xl hover:border-white/[0.12]"
                  )}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Holographic shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-primary/[0.02] pointer-events-none z-[5] rounded-[16px]" />
                  {/* Top edge highlight */}
                  <div className="absolute top-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent z-[5]" />

                  {/* Image container */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/[0.03] to-muted/[0.08]">
                    {/* Radial glow */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-1/2 h-1/2 rounded-full bg-primary/[0.05] blur-2xl" />
                    </div>

                    {product.image_url ? (
                      <motion.img
                        src={product.image_url}
                        alt={product.name}
                        className="relative h-full w-full object-contain p-2 drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        style={{ transform: "translateZ(12px)" }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/[0.08]" />
                      </div>
                    )}

                    {/* Like button - bottom right */}
                    <motion.button
                      whileTap={{ scale: 0.75 }}
                      onClick={(e) => { e.stopPropagation(); toggleLike(product.id); }}
                      className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-background/50 backdrop-blur-xl flex items-center justify-center border border-white/10 z-20 shadow-sm"
                    >
                      <Heart className={cn("h-3 w-3 transition-colors", isLiked ? "fill-rose-500 text-rose-500" : "text-muted-foreground/60")} />
                    </motion.button>

                    {/* Category chip - top left */}
                    {product.category && (
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-background/60 backdrop-blur-xl border border-white/10 z-20">
                        <span className="text-[7px] font-bold text-foreground/70 uppercase tracking-wider">{product.category}</span>
                      </div>
                    )}

                    {/* Product badge */}
                    {(product as any).badge && (() => {
                      const badgeMap: Record<string, { emoji: string; label: string; labelKm: string; cls: string; glow: string }> = {
                        "new": { emoji: "🆕", label: "New", labelKm: "ថ្មី", cls: "from-blue-500 via-indigo-500 to-purple-600", glow: "shadow-blue-500/40" },
                        "hot": { emoji: "🔥", label: "Hot", labelKm: "ក្ដៅ", cls: "from-red-500 via-orange-500 to-yellow-500", glow: "shadow-red-500/40" },
                        "popular": { emoji: "⭐", label: "Popular", labelKm: "កំពូល", cls: "from-amber-400 via-yellow-500 to-orange-500", glow: "shadow-amber-500/40" },
                        "best-seller": { emoji: "🏆", label: "Best", labelKm: "លក់ដាច់", cls: "from-emerald-500 via-green-500 to-teal-500", glow: "shadow-emerald-500/40" },
                        "limited": { emoji: "⏰", label: "Limited", labelKm: "មានកំណត់", cls: "from-purple-500 via-violet-500 to-pink-500", glow: "shadow-purple-500/40" },
                        "recommended": { emoji: "👍", label: "Pick", labelKm: "ណែនាំ", cls: "from-sky-400 via-blue-500 to-cyan-500", glow: "shadow-sky-500/40" },
                        "organic": { emoji: "🌿", label: "Organic", labelKm: "ធម្មជាតិ", cls: "from-green-500 via-emerald-500 to-lime-500", glow: "shadow-green-500/40" },
                        "imported": { emoji: "✈️", label: "Import", labelKm: "នាំចូល", cls: "from-violet-500 via-fuchsia-500 to-pink-500", glow: "shadow-violet-500/40" },
                      };
                      const b = badgeMap[(product as any).badge];
                      if (!b) return null;
                      return (
                        <motion.div
                          initial={{ scale: 0, x: 10 }}
                          animate={{ scale: 1, x: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          className={cn(
                            "absolute top-1.5 right-1.5 z-30",
                            "px-2 py-0.5 rounded-md",
                            "bg-gradient-to-r text-white",
                            "shadow-lg",
                            b.cls, b.glow
                          )}
                        >
                          <div className="flex flex-col items-center leading-none">
                            <span className="text-[10px] font-extrabold drop-shadow-sm">{b.labelKm}</span>
                            <span className="text-[7px] font-bold tracking-wider uppercase opacity-80">{b.label}</span>
                          </div>
                        </motion.div>
                      );
                    })()}

                    {/* Cart quantity badge */}
                    <AnimatePresence>
                      {cartItem && (
                        <motion.div
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 30 }}
                          transition={{ type: "spring", stiffness: 400, damping: 18 }}
                          className="absolute bottom-2 left-2 h-6 min-w-[24px] px-1.5 rounded-full bg-primary flex items-center justify-center ring-2 ring-background shadow-lg shadow-primary/30 z-20"
                        >
                          <span className="text-[9px] font-black text-primary-foreground">{cartItem.quantity}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>


                    {/* 🔥 3D Fire Discount Badge */}
                    {hasDiscount && (
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute bottom-1.5 left-1.5 z-20"
                        style={{ transformStyle: "preserve-3d", transform: "translateZ(30px)" }}
                      >
                        <div className="relative px-2.5 py-1 rounded-xl overflow-hidden">
                          {/* Fire background layers */}
                          <div className="absolute inset-0 bg-gradient-to-t from-red-700 via-orange-500 to-yellow-400 rounded-xl" />
                          <motion.div
                            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-gradient-to-t from-red-600/80 via-orange-400/60 to-yellow-300/40 rounded-xl blur-[1px]"
                          />
                          {/* Fire glow */}
                          <motion.div
                            animate={{ opacity: [0.3, 0.7, 0.3], y: [-1, 1, -1] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -inset-1 bg-orange-500/30 rounded-xl blur-md"
                          />
                          {/* Flame particles */}
                          <motion.div
                            animate={{ y: [-2, -8], opacity: [1, 0], scale: [1, 0.5] }}
                            transition={{ duration: 0.7, repeat: Infinity, ease: "easeOut" }}
                            className="absolute -top-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-300"
                          />
                          <motion.div
                            animate={{ y: [-2, -10], opacity: [0.8, 0], scale: [1, 0.3] }}
                            transition={{ duration: 0.9, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                            className="absolute -top-0.5 right-2 w-1 h-1 rounded-full bg-orange-300"
                          />
                          <motion.div
                            animate={{ y: [-1, -6], opacity: [0.7, 0], scale: [1, 0.4] }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                            className="absolute -top-1 left-1/2 w-1 h-1 rounded-full bg-yellow-200"
                          />
                          {/* Content */}
                          <div className="relative flex items-center gap-1 z-10">
                            <motion.div
                              animate={{ rotate: [-5, 5, -5], scale: [1, 1.15, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <Flame className="h-3 w-3 text-white drop-shadow-lg" />
                            </motion.div>
                            <span className="text-[9px] font-black text-white drop-shadow-md tracking-wide">
                              {discountPct ? `-${discountPct}%` : t("store.sale")}
                            </span>
                          </div>
                          {/* Inner shine */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl pointer-events-none" />
                        </div>
                      </motion.div>
                    )}

                    {/* BOGO Badge */}
                    {hasBogo && (
                      <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute bottom-1.5 left-1.5 z-20"
                      >
                        <div className="relative px-2.5 py-1 rounded-xl overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-xl" />
                          <motion.div
                            animate={{ opacity: [0.5, 0.9, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-gradient-to-r from-emerald-400/40 via-teal-400/30 to-emerald-400/40 rounded-xl blur-[1px]"
                          />
                          <div className="relative flex items-center gap-1 z-10">
                            <span className="text-[9px] font-black text-white drop-shadow-md tracking-wide">
                              {t("store.buy_x_get_y").replace("{buy}", String(p.buy_quantity)).replace("{get}", String(p.get_quantity))}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent rounded-xl pointer-events-none" />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Info section */}
                  <div className="relative px-2.5 pt-1.5 pb-2.5 space-y-0.5">
                    {/* Brand */}
                    {product.brand && (
                      <p className="text-[9px] font-bold text-primary/50 uppercase tracking-[0.12em] truncate">
                        {product.brand}
                      </p>
                    )}
                    
                    {/* Product name */}
                    <p className="text-[14px] font-semibold line-clamp-2 leading-tight text-foreground">
                      {product.name}
                      {(product as any).unit && (
                        <span className="text-[10px] font-medium text-muted-foreground ml-1">/ {(product as any).unit}</span>
                      )}
                    </p>

                    {/* Size selector + Price row */}
                    <div className="flex items-end justify-between gap-1 mt-0.5">
                      <div className="min-w-0 flex-1">
                        {/* Size pills */}
                        {hasSizes && (
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            {sizeVariants.map((sv, sIdx) => (
                              <button
                                key={sv.size}
                                onClick={(e) => { e.stopPropagation(); setSelectedSizes(prev => ({ ...prev, [product.id]: sIdx })); }}
                                className={cn(
                                  "h-7 px-3 rounded-xl text-[11px] font-extrabold tracking-wide border-2 transition-all",
                                  selectedIdx === sIdx
                                    ? "bg-primary/15 border-primary/40 text-primary shadow-md shadow-primary/15 scale-105"
                                    : "bg-muted/10 border-border/30 text-muted-foreground/50 hover:border-primary/20"
                                )}
                              >
                                {sv.size}
                              </button>
                            ))}
                          </div>
                        )}
                        {/* Price */}
                        {hasDiscount && !hasSizes ? (
                          <>
                            <span className="text-base font-black text-destructive tracking-tight leading-none block">
                              ៛{discountKhr.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-medium text-muted-foreground/50 line-through">
                                ៛{khrPrice.toLocaleString()}
                              </span>
                              <span className="text-[9px] font-medium text-muted-foreground/50">
                                ${discountUsd?.toFixed(2)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-base font-black text-foreground tracking-tight leading-none block">
                              ៛{khrPrice.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground/50 block mt-0.5">
                              ${activePrice.toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {/* Add button */}
                      {!cartItem && product.in_stock && (
                        <motion.button
                          whileTap={{ scale: 0.75, rotate: -15 }}
                          whileHover={{ scale: 1.1, y: -2 }}
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(product, activeVariant || undefined); }}
                          className="h-9 w-9 shrink-0 rounded-[14px] bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/30 border border-primary/30 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                          <Plus className="h-4 w-4 text-primary-foreground relative z-10" />
                        </motion.button>
                      )}
                    </div>

                    {/* Quantity stepper - glassmorphic */}
                    {cartItem && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between bg-primary/[0.08] backdrop-blur-xl rounded-[12px] p-0.5 border border-primary/15 mt-1.5"
                      >
                        <motion.button
                          whileTap={{ scale: 0.75 }}
                          onClick={(e) => { e.stopPropagation(); cart.updateQuantity(cartKey, cartItem.quantity - 1); }}
                          className="h-8 w-8 rounded-[10px] bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/20 shadow-sm touch-manipulation active:bg-muted"
                        >
                          <Minus className="h-3.5 w-3.5 text-foreground/70" />
                        </motion.button>
                        <motion.span
                          key={cartItem.quantity}
                          initial={{ scale: 1.5, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-sm font-black text-primary min-w-[28px] text-center"
                        >
                          {cartItem.quantity}
                        </motion.span>
                        <motion.button
                          whileTap={{ scale: 0.75 }}
                          onClick={(e) => { e.stopPropagation(); cart.updateQuantity(cartKey, cartItem.quantity + 1); }}
                          className="h-8 w-8 rounded-[10px] bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/20 shadow-sm touch-manipulation active:bg-muted"
                        >
                          <Plus className="h-3.5 w-3.5 text-foreground/70" />
                        </motion.button>
                      </motion.div>
                    )}

                    {!product.in_stock && (
                      <div className="text-[8px] text-muted-foreground text-center py-1.5 rounded-xl bg-muted/10 backdrop-blur-sm font-semibold mt-1 uppercase tracking-wider">
                        {t("store.out_of_stock")}
                      </div>
                    )}
                  </div>
                </motion.div>
                    );
                    })}
                    </motion.div>
                  </div>
              );
            });
          })()
        )}
      </div>

      {/* ── Floating Cart Bar - Premium 3D ── */}
      <AnimatePresence>
        {cart.itemCount > 0 && !showCart && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 left-3 right-3 z-50"
          >
            <button
              onClick={() => setShowCart(true)}
              className="w-full rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 border border-primary/30 relative overflow-hidden active:scale-[0.98] transition-transform px-4 py-3"
            >
              {/* Shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                {/* Left: cart icon + count */}
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-extrabold">{t("store.view_cart")}</p>
                    <p className="text-[10px] font-medium opacity-80">{cart.itemCount} {t("store.items")}</p>
                  </div>
                </div>
                {/* Right: price */}
                <div className="text-right">
                  <p className="text-[14px] font-extrabold">៛{Math.round(cart.total * ((store as any)?.khr_rate || 4050)).toLocaleString()}</p>
                  <p className="text-[10px] font-medium opacity-80">${cart.total.toFixed(2)}</p>
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showCart && (
        <GroceryCheckoutDrawer
          items={cart.items}
          total={cart.total}
          onClose={() => setShowCart(false)}
          onOrderPlaced={() => { cart.clearCart(); setShowCart(false); }}
          onRemoveItem={cart.removeItem}
          onUpdateQuantity={cart.updateQuantity}
        />
      )}
      <ZivoMobileNav />
    </div>
  );
}
