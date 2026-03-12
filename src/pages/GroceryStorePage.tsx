/**
 * GroceryStorePage - 2026 Spatial UI product search (v2)
 * Enhanced with floating cart bar, improved header, better loading states
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, ShoppingCart, Plus, Minus, Trash2,
  Loader2, X, Package, Store, Sparkles, Clock, Star, ChevronUp,
} from "lucide-react";
import { GroceryCheckoutDrawer } from "@/components/grocery/GroceryCheckoutDrawer";
import { GroceryProductCard } from "@/components/grocery/GroceryProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { useStoreSearch, type StoreProduct } from "@/hooks/useStoreSearch";
import { useGroceryCart } from "@/hooks/useGroceryCart";
import { getStoreBySlug } from "@/config/groceryStores";
import { getStoreStatus } from "@/utils/storeStatus";
import { addRecentStore } from "@/components/grocery/GroceryRecentStores";

export default function GroceryStorePage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const storeCfg = getStoreBySlug(slug || "walmart");

  const [query, setQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const storeName = storeCfg?.name ?? "Walmart";
  const { products, isLoading, isLoadingMore, hasMore, error, search, loadMore, clearResults } = useStoreSearch(storeName);
  const cart = useGroceryCart();
  const hasLoadedDefaults = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Track recent store visit
  useEffect(() => {
    if (slug) addRecentStore(slug);
  }, [slug]);

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, loadMore]);

  // Auto-fetch
  useEffect(() => {
    if (storeCfg && !hasLoadedDefaults.current) {
      hasLoadedDefaults.current = true;
      search(storeCfg.defaultQuery);
    }
  }, [storeCfg, search]);

  if (!storeCfg) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Store className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-bold mb-2">Store not found</h2>
        <Button variant="outline" onClick={() => navigate("/grocery")}>Back to stores</Button>
        <ZivoMobileNav />
      </div>
    );
  }

  const status = getStoreStatus(storeCfg.hours);

  const handleSearch = (val: string) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      debounceRef.current = setTimeout(() => search(storeCfg.defaultQuery), 100);
      return;
    }
    debounceRef.current = setTimeout(() => search(val), 500);
  };

  const handleAdd = (p: StoreProduct) => {
    cart.addItem(
      { productId: p.productId, name: p.name, price: p.price, image: p.image, brand: p.brand },
      storeName
    );
    toast.success("Added to cart", { duration: 1500 });
  };

  const handleCheckout = () => {
    if (cart.itemCount === 0) { toast.error("Your cart is empty"); return; }
    setShowCart(false);
    setShowCheckout(true);
  };

  const handleOrderPlaced = (orderId: string) => {
    cart.clearCart();
    setShowCheckout(false);
    navigate(`/grocery/order-placed?id=${orderId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/6 blur-[60px]" />
        <div className="absolute bottom-1/3 -left-20 h-48 w-48 rounded-full bg-accent/8 blur-[60px]" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/70 backdrop-blur-2xl border-b border-border/20">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/grocery")}
            className="p-2 rounded-2xl hover:bg-muted/60 transition-colors duration-200"
            aria-label="Back to stores"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative h-10 w-10 rounded-2xl bg-background border border-border/30 flex items-center justify-center p-1.5 shadow-sm">
              <img src={storeCfg.logo} alt={storeName} className="h-full w-full object-contain" />
              {/* Live status dot */}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                {status.isOpen && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ring-2 ring-background ${status.isOpen ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
              </span>
            </div>
            <div>
              <h1 className="text-base font-bold truncate leading-tight">{storeName}</h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-muted-foreground font-medium">Delivered by ZIVO</p>
                <span className="text-[9px] text-muted-foreground/60">·</span>
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  {storeCfg.deliveryMin}m
                </span>
                <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  {storeCfg.rating}
                </span>
              </div>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCart(!showCart)}
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

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder={storeCfg.placeholder}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-9 rounded-2xl bg-muted/30 border-border/20 h-11 text-sm focus:bg-muted/50 transition-colors"
              aria-label={`Search ${storeName} products`}
            />
            {query && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => { setQuery(""); search(storeCfg.defaultQuery); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-muted/60 hover:bg-muted transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
            className="sticky top-[132px] z-20 mx-4 mb-4 bg-card/95 backdrop-blur-xl rounded-[24px] border border-border/40 shadow-2xl overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">Cart</h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">{cart.itemCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  {cart.items.length > 0 && (
                    <button onClick={cart.clearCart} className="text-[11px] text-destructive hover:underline font-medium">Clear</button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCart(false)}
                    className="p-1 rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  </motion.button>
                </div>
              </div>

              {cart.items.length === 0 ? (
                <div className="text-center py-6">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-hide">
                  {cart.items.map((item, i) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-2.5 p-2 rounded-[16px] bg-muted/20 border border-border/15"
                    >
                      {item.image && (
                        <div className="h-10 w-10 rounded-xl bg-background border border-border/20 flex items-center justify-center p-1 shrink-0">
                          <img src={item.image} alt="" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          ${item.price.toFixed(2)} × {item.quantity} = <span className="font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <motion.button whileTap={{ scale: 0.8 }} onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)} className="p-1.5 rounded-lg hover:bg-muted active:scale-95 transition-all"><Minus className="h-3 w-3" /></motion.button>
                        <span className="text-[11px] font-bold w-4 text-center">{item.quantity}</span>
                        <motion.button whileTap={{ scale: 0.8 }} onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)} className="p-1.5 rounded-lg hover:bg-muted active:scale-95 transition-all"><Plus className="h-3 w-3" /></motion.button>
                        <motion.button whileTap={{ scale: 0.8 }} onClick={() => cart.removeItem(item.productId)} className="p-1.5 rounded-lg hover:bg-destructive/10 ml-0.5 active:scale-95 transition-all"><Trash2 className="h-3 w-3 text-destructive" /></motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {cart.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/20">
                  <div className="flex justify-between text-sm font-bold mb-3">
                    <span>Total</span><span className="text-primary">${cart.total.toFixed(2)}</span>
                  </div>
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Button onClick={handleCheckout} className="w-full rounded-2xl h-11 font-bold">
                      <Package className="h-4 w-4 mr-2" />Place Order
                    </Button>
                  </motion.div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">A ZIVO driver will shop & deliver</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-3.5 w-3.5 rounded" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-[22px] border border-border/20 bg-card/60 overflow-hidden"
              >
                <Skeleton className="aspect-square" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-2 w-12 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-2/3 rounded" />
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-9 w-full rounded-[14px] mt-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-4 mt-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Empty */}
      {!isLoading && !error && products.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Search className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {query.length >= 2 ? `No products found for "${query}"` : "No products available"}
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">Try a different search term</p>
        </motion.div>
      )}

      {/* Result count */}
      {!isLoading && products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 mb-2 flex items-center gap-2"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground font-medium">
            {products.length} product{products.length !== 1 ? "s" : ""}{query ? ` for "${query}"` : ""}
          </span>
        </motion.div>
      )}

      {/* Product Grid */}
      {!isLoading && products.length > 0 && (
        <div className="px-4 pb-2 grid grid-cols-2 gap-2.5">
          {products.map((product, i) => (
            <GroceryProductCard
              key={product.productId || i}
              product={product}
              index={i}
              cartItem={cart.items.find((c) => c.productId === product.productId)}
              onAdd={handleAdd}
              onUpdateQuantity={cart.updateQuantity}
            />
          ))}
        </div>
      )}

      {/* Load more sentinel */}
      <div ref={sentinelRef} className="h-1" />
      {isLoadingMore && (
        <div className="flex justify-center py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-muted-foreground px-4 py-2 rounded-full bg-muted/30 border border-border/20"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>Loading more…</span>
          </motion.div>
        </div>
      )}

      {/* Floating cart bar - fixed at bottom when cart has items */}
      <AnimatePresence>
        {cart.itemCount > 0 && !showCart && !showCheckout && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
            className="fixed bottom-20 left-4 right-4 z-20"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCart(true)}
              className="w-full flex items-center justify-between gap-3 p-3.5 pl-4 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 border border-primary/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-[12px] font-bold">{cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""}</p>
                  <p className="text-[10px] opacity-80">Tap to view cart</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-extrabold">${cart.total.toFixed(2)}</p>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCheckout && (
          <GroceryCheckoutDrawer
            items={cart.items}
            total={cart.total}
            onClose={() => setShowCheckout(false)}
            onOrderPlaced={handleOrderPlaced}
          />
        )}
      </AnimatePresence>

      <ZivoMobileNav />
    </div>
  );
}
