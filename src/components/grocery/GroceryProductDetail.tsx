/**
 * GroceryProductDetail - Full product detail drawer
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Check, Package, Star, MapPin, ShieldCheck, Truck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoreProduct } from "@/hooks/useStoreSearch";
import type { GroceryCartItem } from "@/hooks/useGroceryCart";
import { useState } from "react";
import { GROCERY_STORES } from "@/config/groceryStores";

interface GroceryProductDetailProps {
  product: StoreProduct | null;
  cartItem?: GroceryCartItem;
  onClose: () => void;
  onAdd: (product: StoreProduct) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

function getStoreLogo(storeName: string): string | undefined {
  const store = GROCERY_STORES.find((s) => s.name.toLowerCase() === storeName.toLowerCase());
  return store?.logo;
}

export function GroceryProductDetail({
  product,
  cartItem,
  onClose,
  onAdd,
  onUpdateQuantity,
}: GroceryProductDetailProps) {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAdd(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 800);
  };

  const storeLogo = getStoreLogo(product.store);
  const showSavings = product.price > 5 && product.inStock;
  const originalPrice = showSavings ? +(product.price * (1 + 0.08)).toFixed(2) : null;

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] bg-card rounded-t-[28px] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-md border border-border/30 flex items-center justify-center shadow-md"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-foreground" />
            </button>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 overscroll-contain">
              {/* Product image */}
              <div className="relative aspect-square max-h-[320px] bg-gradient-to-br from-muted/10 via-muted/20 to-muted/30 flex items-center justify-center p-8">
                {product.image && !imgError ? (
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain drop-shadow-lg"
                    referrerPolicy="no-referrer"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <Package className="h-20 w-20 text-muted-foreground/15" />
                )}

                {/* Stock badge */}
                <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border shadow-sm ${
                  product.inStock
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-destructive/10 border-destructive/20"
                }`}>
                  <span className={`h-2 w-2 rounded-full ${product.inStock ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
                  <span className={`text-[10px] font-bold tracking-wide uppercase ${product.inStock ? "text-emerald-600" : "text-destructive"}`}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                {/* Rating */}
                {product.rating != null && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border/20">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-foreground">{product.rating}</span>
                  </div>
                )}
              </div>

              {/* Info section */}
              <div className="p-5 space-y-4">
                {/* Store info */}
                <div className="flex items-center gap-2">
                  {storeLogo ? (
                    <div className="h-7 w-7 rounded-lg bg-background border border-border/30 shadow-sm flex items-center justify-center p-0.5">
                      <img src={storeLogo} alt={product.store} className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-lg bg-background border border-border/30 shadow-sm flex items-center justify-center">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{product.store}</span>
                </div>

                {/* Brand */}
                {product.brand && (
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.12em] font-bold leading-none">
                    {product.brand}
                  </p>
                )}

                {/* Name */}
                <h2 className="text-lg font-bold text-foreground leading-snug">{product.name}</h2>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-foreground tracking-tight">
                    ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
                  </span>
                  {originalPrice && (
                    <span className="text-sm text-muted-foreground/60 line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                  )}
                  {showSavings && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600">
                      Save ${((originalPrice || 0) - product.price).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/30 border border-border/20">
                    <Truck className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-semibold text-muted-foreground">Same-Day Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/30 border border-border/20">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-semibold text-muted-foreground">~35 min</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/30 border border-border/20">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-semibold text-muted-foreground">Quality Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky CTA */}
            <div className="p-4 pb-6 border-t border-border/20 bg-card">
              {!product.inStock ? (
                <div className="text-sm text-muted-foreground text-center py-3 rounded-2xl bg-muted/30 font-medium border border-border/20">
                  Out of Stock
                </div>
              ) : cartItem ? (
                <div className="flex items-center justify-between bg-primary/10 rounded-2xl p-1.5 border border-primary/15">
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => onUpdateQuantity(product.productId, cartItem.quantity - 1)}
                    className="h-11 w-11 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border/20"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </motion.button>
                  <motion.span
                    key={cartItem.quantity}
                    initial={{ scale: 1.4 }}
                    animate={{ scale: 1 }}
                    className="text-lg font-extrabold text-primary min-w-[40px] text-center"
                  >
                    {cartItem.quantity}
                  </motion.span>
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => onUpdateQuantity(product.productId, cartItem.quantity + 1)}
                    className="h-11 w-11 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border/20"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
              ) : (
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    className="w-full rounded-2xl h-12 text-sm font-bold gap-2 shadow-lg shadow-primary/20"
                    onClick={handleAdd}
                  >
                    {justAdded ? (
                      <>
                        <Check className="h-4 w-4" /> Added to Cart!
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Add to Cart — ${product.price.toFixed(2)}
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
