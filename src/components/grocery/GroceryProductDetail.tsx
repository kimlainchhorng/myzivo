/**
 * GroceryProductDetail - Enhanced product detail drawer with
 * quantity selector, product details, and related products
 */
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Minus, Check, Package, Star, MapPin, ShieldCheck,
  Truck, Clock, Info, ChevronRight, Heart, Barcode, Weight, Ruler, Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoreProduct } from "@/hooks/useStoreSearch";
import type { GroceryCartItem } from "@/hooks/useGroceryCart";
import { useState, useMemo } from "react";
import { GROCERY_STORES } from "@/config/groceryStores";

interface GroceryProductDetailProps {
  product: StoreProduct | null;
  cartItem?: GroceryCartItem;
  onClose: () => void;
  onAdd: (product: StoreProduct) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  allProducts?: StoreProduct[];
  onSelect?: (product: StoreProduct) => void;
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
  allProducts = [],
  onSelect,
}: GroceryProductDetailProps) {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const relatedProducts = useMemo(() => {
    if (!product || allProducts.length === 0) return [];
    return allProducts
      .filter((p) => p.productId !== product.productId && p.store === product.store && p.inStock)
      .slice(0, 6);
  }, [product, allProducts]);

  if (!product) return null;

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      onAdd(product);
    }
    setJustAdded(true);
    setQuantity(1);
    setTimeout(() => setJustAdded(false), 800);
  };

  const handleRelatedSelect = (p: StoreProduct) => {
    setImgError(false);
    setJustAdded(false);
    setQuantity(1);
    setShowDetails(false);
    onSelect?.(p);
  };

  const storeLogo = getStoreLogo(product.store);
  const showSavings = product.price > 5 && product.inStock;
  const originalPrice = showSavings ? +(product.price * 1.08).toFixed(2) : null;
  const savings = originalPrice ? +((originalPrice - product.price).toFixed(2)) : 0;
  const totalPrice = cartItem
    ? (product.price * cartItem.quantity)
    : (product.price * quantity);

  // Extract size info from product name
  const sizeMatch = product.name.match(/(\d+[\s-]?(?:oz|fl oz|lb|lbs|ct|count|pk|pack|rolls|sheets|gal|qt|pt|ml|L|kg|g)\.?)/i);
  const sizeInfo = sizeMatch ? sizeMatch[1] : null;

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
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] bg-card rounded-t-[28px] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Top action bar */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setLiked(!liked)}
                className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-md border border-border/30 flex items-center justify-center shadow-md"
                aria-label="Like"
              >
                <Heart className={`h-4 w-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-foreground/60"}`} />
              </motion.button>
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-md border border-border/30 flex items-center justify-center shadow-md"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-foreground" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 overscroll-contain pb-2">
              {/* Product image */}
              <div className="relative bg-gradient-to-br from-muted/5 via-muted/15 to-muted/25 flex items-center justify-center p-6" style={{ minHeight: 280 }}>
                {product.image && !imgError ? (
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="max-h-[260px] w-auto object-contain drop-shadow-xl"
                    referrerPolicy="no-referrer"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <Package className="h-24 w-24 text-muted-foreground/10" />
                )}

                {/* Stock badge */}
                <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-sm ${
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
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-md border border-border/20 shadow-sm">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-foreground">{product.rating}</span>
                    <span className="text-[9px] text-muted-foreground">/5</span>
                  </div>
                )}
              </div>

              {/* Info section */}
              <div className="px-5 pt-4 space-y-3.5">
                {/* Store row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {storeLogo ? (
                      <div className="h-8 w-8 rounded-xl bg-background border border-border/30 shadow-sm flex items-center justify-center p-1">
                        <img src={storeLogo} alt={product.store} className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-xl bg-background border border-border/30 shadow-sm flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">{product.store}</span>
                      <p className="text-[9px] text-muted-foreground">In-store pickup available</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
                    <Truck className="h-3 w-3 text-emerald-600" />
                    <span className="text-[9px] font-bold text-emerald-600">Same Day</span>
                  </div>
                </div>

                {/* Brand & Size row */}
                <div className="flex items-center gap-3">
                  {product.brand && (
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] font-bold leading-none">
                      {product.brand}
                    </p>
                  )}
                  {sizeInfo && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/40 border border-border/15">
                      <Box className="h-2.5 w-2.5 text-muted-foreground/60" />
                      <span className="text-[9px] font-semibold text-muted-foreground">{sizeInfo}</span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h2 className="text-xl font-bold text-foreground leading-snug tracking-tight">{product.name}</h2>

                {/* Price row */}
                <div className="flex items-end gap-2.5">
                  <span className="text-[32px] font-extrabold text-foreground tracking-tight leading-none">
                    ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
                  </span>
                  {originalPrice && (
                    <span className="text-base text-muted-foreground/50 line-through pb-0.5">
                      ${originalPrice.toFixed(2)}
                    </span>
                  )}
                  {showSavings && savings > 0 && (
                    <span className="ml-auto px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-600">
                      Save ${savings.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Delivery badges */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/40 border border-border/20">
                    <Truck className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-semibold text-foreground/80">Same-Day Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/40 border border-border/20">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-semibold text-foreground/80">~35 min</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/40 border border-border/20">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-semibold text-foreground/80">Quality Guaranteed</span>
                  </div>
                </div>

                {/* Product details expandable */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between py-3 border-t border-b border-border/15"
                >
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Product Details</span>
                  </div>
                  <motion.div animate={{ rotate: showDetails ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 pb-2">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="p-3 rounded-xl bg-muted/30 border border-border/15">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Brand</p>
                            <p className="text-sm font-semibold text-foreground">{product.brand || "—"}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/30 border border-border/15">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Store</p>
                            <p className="text-sm font-semibold text-foreground">{product.store}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/30 border border-border/15">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Rating</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <p className="text-sm font-semibold text-foreground">{product.rating ?? "N/A"}</p>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/30 border border-border/15">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Availability</p>
                            <p className={`text-sm font-semibold ${product.inStock ? "text-emerald-600" : "text-destructive"}`}>
                              {product.inStock ? "In Stock" : "Unavailable"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/20 border border-border/10">
                          <Barcode className="h-4 w-4 text-muted-foreground/50" />
                          <span className="text-[10px] text-muted-foreground font-mono tracking-wider">ID: {product.productId}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Related products */}
                {relatedProducts.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-foreground mb-3">You Might Also Like</h3>
                    <div className="flex gap-3 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-hide">
                      {relatedProducts.map((rp) => (
                        <motion.button
                          key={rp.productId}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRelatedSelect(rp)}
                          className="shrink-0 w-[120px] rounded-2xl bg-muted/20 border border-border/20 overflow-hidden text-left hover:border-primary/20 transition-colors"
                        >
                          <div className="aspect-square bg-gradient-to-br from-muted/5 to-muted/20 flex items-center justify-center p-3">
                            {rp.image ? (
                              <img
                                src={rp.image}
                                alt={rp.name}
                                className="h-full w-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Package className="h-8 w-8 text-muted-foreground/10" />
                            )}
                          </div>
                          <div className="p-2.5">
                            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-snug mb-1">{rp.name}</p>
                            <p className="text-xs font-bold text-foreground">${rp.price.toFixed(2)}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky bottom CTA */}
            <div className="shrink-0 p-4 pb-6 border-t border-border/20 bg-card shadow-[0_-4px_20px_-4px_hsl(var(--foreground)/0.05)]">
              {!product.inStock ? (
                <div className="text-sm text-muted-foreground text-center py-3.5 rounded-2xl bg-muted/30 font-medium border border-border/20">
                  Out of Stock
                </div>
              ) : cartItem ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-primary/8 rounded-2xl p-1.5 border border-primary/15">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => onUpdateQuantity(product.productId, cartItem.quantity - 1)}
                      className="h-12 w-12 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border/20 active:bg-muted transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4.5 w-4.5" />
                    </motion.button>
                    <div className="text-center">
                      <motion.span
                        key={cartItem.quantity}
                        initial={{ scale: 1.4, y: -3 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="text-xl font-extrabold text-primary block"
                      >
                        {cartItem.quantity}
                      </motion.span>
                      <span className="text-[9px] text-muted-foreground font-medium">in cart</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => onUpdateQuantity(product.productId, cartItem.quantity + 1)}
                      className="h-12 w-12 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border/20 active:bg-muted transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4.5 w-4.5" />
                    </motion.button>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Total: <span className="font-bold text-foreground">${totalPrice.toFixed(2)}</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Quantity selector */}
                  <div className="flex items-center justify-center gap-4">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-10 w-10 rounded-xl bg-muted/40 border border-border/20 flex items-center justify-center disabled:opacity-30 transition-opacity"
                    >
                      <Minus className="h-4 w-4" />
                    </motion.button>
                    <motion.span
                      key={quantity}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-extrabold text-foreground min-w-[32px] text-center"
                    >
                      {quantity}
                    </motion.span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10 rounded-xl bg-muted/40 border border-border/20 flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4" />
                    </motion.button>
                  </div>

                  {/* Add button */}
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Button
                      className="w-full rounded-2xl h-13 text-sm font-bold gap-2 shadow-lg shadow-primary/20"
                      onClick={handleAdd}
                    >
                      {justAdded ? (
                        <>
                          <Check className="h-4 w-4" /> Added to Cart!
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" /> Add to Cart — ${totalPrice.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
