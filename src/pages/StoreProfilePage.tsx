/**
 * StoreProfilePage - Full store profile with banner, logo, info & products
 * For manual-catalog stores (Cambodia market etc.)
 */
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingCart, Star, Clock, MapPin, Phone, Store, Package, Loader2, Plus } from "lucide-react";
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
  show: { transition: { staggerChildren: 0.04 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 320, damping: 24 } },
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
    <div className="min-h-screen bg-background pb-24">
      {/* Banner */}
      <div className="relative w-full h-44 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
        {store.banner_url ? (
          <img
            src={store.banner_url}
            alt={`${store.name} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10" />
        )}
        {/* Nav overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-3 z-10">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center shadow-md border border-border/30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowCart(true)}
            className="relative h-9 w-9 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center shadow-md border border-border/30"
          >
            <ShoppingCart className="h-4 w-4" />
            {cart.itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {cart.itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Store Info Card - overlapping banner */}
      <div className="relative px-4 -mt-10 z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card rounded-2xl border border-border/40 shadow-lg p-4"
        >
          <div className="flex items-start gap-3">
            {/* Logo */}
            <div className="h-16 w-16 rounded-xl bg-background border border-border/30 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-full w-full object-contain p-1" />
              ) : (
                <Store className="h-8 w-8 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">{store.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {store.rating || "4.5"}
                </span>
                {store.hours && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {store.hours}
                  </span>
                )}
                {store.delivery_min && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {store.delivery_min}m delivery
                  </Badge>
                )}
              </div>
              {store.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{store.description}</p>
              )}
            </div>
          </div>

          {/* Contact info - clickable buttons */}
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border/20">
            {store.address && (
              <button
                onClick={() => navigate(`/rides?destination=${encodeURIComponent(store.address)}`)}
                className="flex items-center gap-2.5 w-full p-2.5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/20 transition-all duration-200 text-left group active:scale-[0.98]"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Address · Tap to ride</p>
                  <p className="text-xs text-foreground truncate">{store.address}</p>
                </div>
                <ArrowLeft className="h-3.5 w-3.5 text-primary/40 rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
            {store.phone && (
              <a
                href={`tel:${store.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2.5 w-full p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all duration-200 text-left group active:scale-[0.98]"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/15 transition-colors">
                  <Phone className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Call Store</p>
                  <p className="text-xs text-foreground font-medium">{store.phone}</p>
                </div>
                <Phone className="h-3.5 w-3.5 text-emerald-500/40 group-hover:text-emerald-500/60 transition-colors" />
              </a>
            )}
          </div>
        </motion.div>
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 px-4 pt-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
              !selectedCategory
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products */}
      <div className="px-4 pt-4">
        {loadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package className="h-12 w-12 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">No products available yet</p>
            <p className="text-xs text-muted-foreground/60">Products will be added soon</p>
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
              return (
                <motion.div
                  key={product.id}
                  variants={cardVariant}
                  className={cn(
                    "group relative rounded-2xl overflow-hidden transition-all",
                    "bg-card shadow-sm hover:shadow-xl",
                    cartItem
                      ? "ring-2 ring-primary/40 shadow-lg shadow-primary/10"
                      : "ring-1 ring-border/20 hover:ring-primary/20"
                  )}
                >
                  {/* Image with gradient overlay */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-muted/5 to-muted/20 flex items-center justify-center p-3 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <Package className="h-10 w-10 text-muted-foreground/10" />
                    )}
                    
                    {/* Category pill */}
                    {product.category && (
                      <span className="absolute top-2 left-2 text-[9px] font-semibold bg-background/80 backdrop-blur-sm text-muted-foreground px-2 py-0.5 rounded-full border border-border/20">
                        {product.category}
                      </span>
                    )}

                    {/* Cart badge */}
                    <AnimatePresence>
                      {cartItem && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-2 right-2 h-7 min-w-[28px] px-1.5 rounded-full bg-primary flex items-center justify-center ring-2 ring-background shadow-lg"
                        >
                          <span className="text-[11px] font-extrabold text-primary-foreground">{cartItem.quantity}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Info section */}
                  <div className="p-3 space-y-2">
                    {/* Brand */}
                    {product.brand && (
                      <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest truncate">
                        {product.brand}
                      </p>
                    )}
                    
                    {/* Product name */}
                    <p className="text-[13px] font-bold line-clamp-2 leading-snug text-foreground min-h-[34px]">
                      {product.name}
                    </p>

                    {/* Price row */}
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-lg font-black text-foreground tracking-tight leading-none block">
                          ៛{((product as any).price_khr || Math.round(product.price * ((store as any)?.khr_rate || 4050))).toLocaleString()}
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground mt-0.5 block">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      {!cartItem && product.in_stock && (
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleAddToCart(product)}
                          className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-shadow"
                        >
                          <Plus className="h-4.5 w-4.5 text-primary-foreground" />
                        </motion.button>
                      )}
                    </div>

                    {/* Quantity controls */}
                    {cartItem && (
                      <div className="flex items-center justify-between bg-primary/8 rounded-xl p-1 border border-primary/15">
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => cart.updateQuantity(product.id, cartItem.quantity - 1)}
                          className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border border-border/30 shadow-sm"
                        >
                          <span className="text-sm font-bold text-foreground">−</span>
                        </motion.button>
                        <motion.span
                          key={cartItem.quantity}
                          initial={{ scale: 1.3 }}
                          animate={{ scale: 1 }}
                          className="text-sm font-extrabold text-primary"
                        >
                          {cartItem.quantity}
                        </motion.span>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => cart.updateQuantity(product.id, cartItem.quantity + 1)}
                          className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border border-border/30 shadow-sm"
                        >
                          <span className="text-sm font-bold text-foreground">+</span>
                        </motion.button>
                      </div>
                    )}

                    {/* Out of stock */}
                    {!product.in_stock && (
                      <div className="text-[10px] text-muted-foreground text-center py-2 rounded-xl bg-muted/30 font-medium">
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

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {cart.itemCount > 0 && !showCart && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 z-40"
          >
            <Button
              onClick={() => setShowCart(true)}
              className="w-full h-12 rounded-2xl text-sm font-bold shadow-lg gap-2"
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
