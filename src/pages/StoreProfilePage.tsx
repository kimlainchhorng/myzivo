/**
 * StoreProfilePage - 3D/4D Spatial UI store profile
 * Premium glassmorphic design with depth, perspective, and animated backgrounds
 */
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingCart, Star, Clock, MapPin, Phone, Store, Package, Loader2, Plus, Minus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { useStoreProfile, useStoreProducts, useStoreProductCategories, type StoreProductItem } from "@/hooks/useStoreProfile";
import { useGroceryCart } from "@/hooks/useGroceryCart";
import { GroceryCheckoutDrawer } from "@/components/grocery/GroceryCheckoutDrawer";
import { useState } from "react";
import { toast } from "sonner";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30, rotateX: 15, scale: 0.9 },
  show: {
    opacity: 1, y: 0, rotateX: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 22 },
  },
};

export default function StoreProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const cart = useGroceryCart();
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

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
    toast.success("Added to cart");
  };

  if (loadingStore) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      {/* ── Animated 3D Background ── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        {/* Floating orbs */}
        <motion.div
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 -right-20 w-64 h-64 rounded-full bg-primary/[0.04] blur-3xl"
        />
        <motion.div
          animate={{ y: [20, -20, 20], x: [10, -10, 10], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 -left-32 w-72 h-72 rounded-full bg-sky-500/[0.03] blur-3xl"
        />
        <motion.div
          animate={{ y: [10, -15, 10], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 right-10 w-48 h-48 rounded-full bg-emerald-500/[0.03] blur-3xl"
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── Banner with 3D parallax ── */}
      <div className="relative w-full h-48 overflow-hidden" style={{ perspective: "800px" }}>
        <motion.div
          initial={{ scale: 1.1, rotateX: 3 }}
          animate={{ scale: 1, rotateX: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 origin-bottom"
        >
          {store.banner_url ? (
            <img
              src={store.banner_url}
              alt={`${store.name} banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/25 via-primary/10 to-sky-500/10" />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        
        {/* Nav overlay - glassmorphic */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-3 z-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-2xl bg-background/60 backdrop-blur-xl flex items-center justify-center shadow-lg border border-border/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCart(true)}
            className="relative h-10 w-10 rounded-2xl bg-background/60 backdrop-blur-xl flex items-center justify-center shadow-lg border border-border/20"
          >
            <ShoppingCart className="h-4 w-4" />
            {cart.itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-background shadow-md"
              >
                {cart.itemCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>

      {/* ── Store Info Card - 3D glassmorphic ── */}
      <div className="relative px-4 -mt-14 z-10" style={{ perspective: "1000px" }}>
        <motion.div
          initial={{ y: 40, opacity: 0, rotateX: 8 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="bg-card/80 backdrop-blur-2xl rounded-3xl border border-border/20 shadow-2xl shadow-primary/5 p-4 relative overflow-hidden"
        >
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent rounded-3xl pointer-events-none" />
          
          <div className="flex items-start gap-3 relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              className="h-16 w-16 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/20 overflow-hidden flex items-center justify-center shrink-0 shadow-lg"
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

          {/* Contact - glassmorphic buttons */}
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border/10">
            {store.address && (
              <button
                onClick={() => navigate(`/rides?destination=${encodeURIComponent(store.address)}`)}
                className="flex items-center gap-2.5 w-full p-2.5 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all text-left group active:scale-[0.98]"
              >
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Address · Tap to ride</p>
                  <p className="text-xs text-foreground truncate">{store.address}</p>
                </div>
              </button>
            )}
            {store.phone && (
              <a
                href={`tel:${store.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2.5 w-full p-2.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-all text-left group active:scale-[0.98]"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Call Store</p>
                  <p className="text-xs text-foreground font-medium">{store.phone}</p>
                </div>
              </a>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Category Tabs - 3D pills ── */}
      {categories.length > 0 && (
        <div className="flex gap-2 px-4 pt-5 overflow-x-auto no-scrollbar">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setSelectedCategory(undefined)}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 border",
              !selectedCategory
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-primary/50"
                : "bg-card/60 backdrop-blur-sm text-muted-foreground border-border/20 hover:bg-card"
            )}
          >
            All
          </motion.button>
          {categories.map((cat) => (
            <motion.button
              whileTap={{ scale: 0.92 }}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 border",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-primary/50"
                  : "bg-card/60 backdrop-blur-sm text-muted-foreground border-border/20 hover:bg-card"
              )}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      )}

      {/* ── Products Grid - 3D Spatial Cards ── */}
      <div className="px-3 pt-4" style={{ perspective: "1200px" }}>
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
            className="grid grid-cols-2 gap-3"
          >
            {products.map((product, i) => {
              const cartItem = cart.items.find((c) => c.productId === product.id);
              const khrPrice = ((product as any).price_khr || Math.round(product.price * ((store as any)?.khr_rate || 4050)));
              return (
                <motion.div
                  key={product.id}
                  variants={cardVariant}
                  whileHover={{ y: -4, scale: 1.02, rotateX: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "group relative rounded-2xl overflow-hidden transition-shadow duration-300",
                    "bg-card/70 backdrop-blur-xl border",
                    cartItem
                      ? "border-primary/30 shadow-xl shadow-primary/15"
                      : "border-border/15 shadow-md hover:shadow-xl hover:border-primary/20"
                  )}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Glassmorphic shine */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none z-10 rounded-2xl" />

                  {/* Image container with depth */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/5 via-transparent to-muted/10">
                    {/* Soft radial glow behind product */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2/3 h-2/3 rounded-full bg-primary/[0.04] blur-2xl" />
                    </div>
                    
                    {product.image_url ? (
                      <motion.img
                        src={product.image_url}
                        alt={product.name}
                        className="relative h-full w-full object-contain p-2 drop-shadow-lg"
                        loading="lazy"
                        style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/10" />
                      </div>
                    )}

                    {/* Cart quantity badge - floating 3D */}
                    <AnimatePresence>
                      {cartItem && (
                        <motion.div
                          initial={{ scale: 0, y: -10 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0, y: -10 }}
                          className="absolute top-2 right-2 h-6 min-w-[24px] px-1.5 rounded-xl bg-primary flex items-center justify-center ring-2 ring-background shadow-lg z-20"
                        >
                          <span className="text-[10px] font-extrabold text-primary-foreground">{cartItem.quantity}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Info section with depth */}
                  <div className="relative p-2.5 space-y-1">
                    {/* Brand tag */}
                    {product.brand && (
                      <p className="text-[8px] font-bold text-primary/50 uppercase tracking-[0.15em] truncate">
                        {product.brand}
                      </p>
                    )}
                    
                    {/* Product name */}
                    <p className="text-[12px] font-semibold line-clamp-2 leading-snug text-foreground min-h-[30px]">
                      {product.name}
                    </p>

                    {/* Price + Quick Add */}
                    <div className="flex items-end justify-between pt-0.5">
                      <div className="space-y-0">
                        <span className="text-[15px] font-black text-foreground tracking-tight leading-none block">
                          ៛{khrPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground/70">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      
                      {!cartItem && product.in_stock && (
                        <motion.button
                          whileTap={{ scale: 0.8, rotateZ: -10 }}
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                          className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center shadow-lg shadow-primary/25 border border-primary/20"
                        >
                          <Plus className="h-4 w-4 text-primary-foreground" />
                        </motion.button>
                      )}
                    </div>

                    {/* Quantity controls - glassmorphic */}
                    {cartItem && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between bg-primary/8 backdrop-blur-sm rounded-xl p-0.5 border border-primary/15 mt-1"
                      >
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => cart.updateQuantity(product.id, cartItem.quantity - 1)}
                          className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/20 shadow-sm"
                        >
                          <Minus className="h-3 w-3" />
                        </motion.button>
                        <motion.span
                          key={cartItem.quantity}
                          initial={{ scale: 1.4 }}
                          animate={{ scale: 1 }}
                          className="text-xs font-extrabold text-primary"
                        >
                          {cartItem.quantity}
                        </motion.span>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => cart.updateQuantity(product.id, cartItem.quantity + 1)}
                          className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/20 shadow-sm"
                        >
                          <Plus className="h-3 w-3" />
                        </motion.button>
                      </motion.div>
                    )}

                    {!product.in_stock && (
                      <div className="text-[9px] text-muted-foreground text-center py-1.5 rounded-xl bg-muted/20 backdrop-blur-sm font-medium mt-1">
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

      {/* ── Floating Cart Bar - 3D glassmorphic ── */}
      <AnimatePresence>
        {cart.itemCount > 0 && !showCart && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 left-4 right-4 z-40"
          >
            <Button
              onClick={() => setShowCart(true)}
              className="w-full h-13 rounded-2xl text-sm font-bold shadow-2xl shadow-primary/30 gap-2 border border-primary/20"
            >
              <ShoppingCart className="h-4 w-4" />
              View Cart · {cart.itemCount} items · ${cart.total.toFixed(2)}
            </Button>
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
