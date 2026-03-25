/**
 * StoreProfilePage - Full store profile with banner, logo, info & products
 * For manual-catalog stores (Cambodia market etc.)
 */
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingCart, Star, Clock, MapPin, Phone, Store, Package, Loader2 } from "lucide-react";
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

          {/* Contact info */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/20">
            {store.address && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                <MapPin className="h-3 w-3 shrink-0" /> {store.address}
              </span>
            )}
            {store.phone && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Phone className="h-3 w-3 shrink-0" /> {store.phone}
              </span>
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
                    "group relative rounded-2xl bg-card border overflow-hidden transition-all",
                    cartItem
                      ? "border-primary/30 shadow-md shadow-primary/10"
                      : "border-border/30 hover:border-primary/15 hover:shadow-lg"
                  )}
                >
                  {/* Image */}
                  <div className="aspect-square bg-muted/10 flex items-center justify-center p-2">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground/15" />
                    )}
                    <AnimatePresence>
                      {cartItem && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-1.5 right-1.5 h-6 min-w-[24px] px-1 rounded-full bg-primary flex items-center justify-center ring-2 ring-background"
                        >
                          <span className="text-[9px] font-extrabold text-primary-foreground">{cartItem.quantity}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Info */}
                  <div className="p-2.5 space-y-1">
                    {product.brand && (
                      <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider truncate">{product.brand}</p>
                    )}
                    <p className="text-[11px] font-semibold line-clamp-2 leading-snug text-foreground/90 min-h-[28px]">
                      {product.name}
                    </p>
                    <span className="text-[14px] font-extrabold text-foreground tracking-tight block">
                      ${product.price.toFixed(2)}
                    </span>
                    {cartItem ? (
                      <div className="flex items-center justify-between bg-primary/10 rounded-xl p-0.5 border border-primary/15">
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => cart.updateQuantity(product.id, cartItem.quantity - 1)}
                          className="h-7 w-7 rounded-lg bg-background flex items-center justify-center border border-border/20"
                        >
                          <span className="text-sm font-bold">−</span>
                        </motion.button>
                        <span className="text-[12px] font-extrabold text-primary">{cartItem.quantity}</span>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => cart.updateQuantity(product.id, cartItem.quantity + 1)}
                          className="h-7 w-7 rounded-lg bg-background flex items-center justify-center border border-border/20"
                        >
                          <span className="text-sm font-bold">+</span>
                        </motion.button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full rounded-xl text-[10px] h-8 font-bold"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </Button>
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
