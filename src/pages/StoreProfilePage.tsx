/**
 * StoreProfilePage - Ultra-premium 3D/4D Spatial UI store profile
 * Immersive glassmorphic design with depth, perspective, holographic cards
 */
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingCart, Star, Clock, MapPin, Phone, Store, Package, Loader2, Plus, Minus, Sparkles, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { useStoreProfile, useStoreProducts, useStoreProductCategories, type StoreProductItem } from "@/hooks/useStoreProfile";
import { useGroceryCart } from "@/hooks/useGroceryCart";
import { GroceryCheckoutDrawer } from "@/components/grocery/GroceryCheckoutDrawer";
import { useState, useRef } from "react";
import { toast } from "sonner";

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

  const { data: store, isLoading: loadingStore } = useStoreProfile(slug || "");
  const { data: products = [], isLoading: loadingProducts } = useStoreProducts(store?.id, selectedCategory);
  const { data: categories = [] } = useStoreProductCategories(store?.id);

  const handleAddToCart = (product: StoreProductItem) => {
    cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || "",
      brand: product.brand || "",
    }, store?.name || "Store");
    toast.success("Added to cart", { icon: "🛒" });
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
        <p className="text-muted-foreground">Store not found</p>
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
      <div className="relative w-full h-52 overflow-hidden" style={{ perspective: "800px" }}>
        <motion.div
          initial={{ scale: 1.15, rotateX: 4 }}
          animate={{ scale: 1, rotateX: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0 origin-bottom"
        >
          {store.banner_url ? (
            <img src={store.banner_url} alt={`${store.name} banner`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-sky-500/15" />
          )}
        </motion.div>
        {/* Gradient overlay with depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
        
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

          {/* Contact buttons */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.05]">
            {store.address && (
              <button
                onClick={() => navigate(`/rides?destination=${encodeURIComponent(store.address)}`)}
                className="flex-1 flex items-center gap-2 p-2.5 rounded-2xl bg-primary/[0.06] border border-primary/10 hover:bg-primary/10 transition-all text-left group active:scale-[0.97]"
              >
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-semibold text-primary uppercase tracking-wider">Ride there</p>
                  <p className="text-[10px] text-foreground truncate">{store.address}</p>
                </div>
              </button>
            )}
            {store.phone && (
              <a
                href={`tel:${store.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/10 hover:bg-emerald-500/10 transition-all group active:scale-[0.97] shrink-0"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Phone className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider">Call</p>
                  <p className="text-[10px] text-foreground font-medium">{store.phone}</p>
                </div>
              </a>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Category Tabs - Floating 3D pills ── */}
      {categories.length > 0 && (
        <div className="flex gap-2 px-4 pt-5 overflow-x-auto no-scrollbar">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedCategory(undefined)}
            className={cn(
              "px-4 py-2 rounded-2xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 border backdrop-blur-sm",
              !selectedCategory
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-primary/40"
                : "bg-card/50 text-muted-foreground border-white/[0.06] hover:bg-card/80"
            )}
          >
            All
          </motion.button>
          {categories.map((cat) => (
            <motion.button
              whileTap={{ scale: 0.9 }}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-2xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 border backdrop-blur-sm",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-primary/40"
                  : "bg-card/50 text-muted-foreground border-white/[0.06] hover:bg-card/80"
              )}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      )}

      {/* ── Section Header ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            {selectedCategory || "All Products"}
          </h2>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">
          {products.length} items
        </span>
      </div>

      {/* ── Products Grid - 3D Holographic Cards ── */}
      <div className="px-3 pt-1" style={{ perspective: "1200px" }}>
        {loadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package className="h-12 w-12 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">No products available yet</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-2"
          >
            {products.map((product, i) => {
              const cartItem = cart.items.find((c) => c.productId === product.id);
              const khrPrice = ((product as any).price_khr || Math.round(product.price * ((store as any)?.khr_rate || 4050)));
              const isLiked = likedProducts.has(product.id);
              return (
                <motion.div
                  key={product.id}
                  variants={cardVariant}
                  whileHover={{ y: -3, scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "group relative rounded-[16px] overflow-hidden transition-all duration-300",
                    "bg-card/60 backdrop-blur-xl border",
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

                    {/* Like button */}
                    <motion.button
                      whileTap={{ scale: 0.75 }}
                      onClick={(e) => { e.stopPropagation(); toggleLike(product.id); }}
                      className="absolute top-2 left-2 h-7 w-7 rounded-full bg-background/50 backdrop-blur-xl flex items-center justify-center border border-white/10 z-20 shadow-sm"
                    >
                      <Heart className={cn("h-3 w-3 transition-colors", isLiked ? "fill-rose-500 text-rose-500" : "text-muted-foreground/60")} />
                    </motion.button>

                    {/* Cart quantity badge */}
                    <AnimatePresence>
                      {cartItem && (
                        <motion.div
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 30 }}
                          transition={{ type: "spring", stiffness: 400, damping: 18 }}
                          className="absolute top-2 right-2 h-6 min-w-[24px] px-1.5 rounded-full bg-primary flex items-center justify-center ring-2 ring-background shadow-lg shadow-primary/30 z-20"
                        >
                          <span className="text-[9px] font-black text-primary-foreground">{cartItem.quantity}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Category chip */}
                    {product.category && (
                      <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-background/60 backdrop-blur-xl border border-white/10 z-20">
                        <span className="text-[7px] font-bold text-foreground/70 uppercase tracking-wider">{product.category}</span>
                      </div>
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
                    </p>

                    {/* Price row */}
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-base font-black text-foreground tracking-tight leading-none block">
                          ៛{khrPrice.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground/60 block mt-0.5">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Add button - 3D floating */}
                      {!cartItem && product.in_stock && (
                        <motion.button
                          whileTap={{ scale: 0.75, rotate: -15 }}
                          whileHover={{ scale: 1.1, y: -2 }}
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                          className="h-9 w-9 rounded-[14px] bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/30 border border-primary/30 relative overflow-hidden"
                        >
                          {/* Button shine */}
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
                        className="flex items-center justify-between bg-primary/[0.06] backdrop-blur-xl rounded-[12px] p-0.5 border border-primary/10 mt-1"
                      >
                        <motion.button
                          whileTap={{ scale: 0.75 }}
                          onClick={() => cart.updateQuantity(product.id, cartItem.quantity - 1)}
                          className="h-7 w-7 rounded-[10px] bg-background/70 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-sm"
                        >
                          <Minus className="h-3 w-3 text-foreground/70" />
                        </motion.button>
                        <motion.span
                          key={cartItem.quantity}
                          initial={{ scale: 1.5, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-xs font-black text-primary min-w-[20px] text-center"
                        >
                          {cartItem.quantity}
                        </motion.span>
                        <motion.button
                          whileTap={{ scale: 0.75 }}
                          onClick={() => cart.updateQuantity(product.id, cartItem.quantity + 1)}
                          className="h-7 w-7 rounded-[10px] bg-background/70 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-sm"
                        >
                          <Plus className="h-3 w-3 text-foreground/70" />
                        </motion.button>
                      </motion.div>
                    )}

                    {!product.in_stock && (
                      <div className="text-[8px] text-muted-foreground text-center py-1.5 rounded-xl bg-muted/10 backdrop-blur-sm font-semibold mt-1 uppercase tracking-wider">
                        Out of Stock
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
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
            className="fixed bottom-20 left-3 right-3 z-40"
          >
            <button
              onClick={() => setShowCart(true)}
              className="w-full h-14 rounded-2xl text-sm font-bold bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 flex items-center justify-center gap-2.5 border border-primary/30 relative overflow-hidden active:scale-[0.98] transition-transform"
            >
              {/* Button shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent pointer-events-none" />
              <ShoppingCart className="h-4.5 w-4.5 relative z-10" />
              <span className="relative z-10">View Cart · {cart.itemCount} items · ${cart.total.toFixed(2)}</span>
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
