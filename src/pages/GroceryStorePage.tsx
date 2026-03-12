/**
 * GroceryStorePage - 2026 Spatial UI product search
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, ShoppingCart, Plus, Minus, Trash2,
  Loader2, X, Package, Store, Sparkles,
} from "lucide-react";
import { GroceryCheckoutDrawer } from "@/components/grocery/GroceryCheckoutDrawer";
import { GroceryProductCard } from "@/components/grocery/GroceryProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { useStoreSearch, type StoreProduct } from "@/hooks/useStoreSearch";
import { useGroceryCart } from "@/hooks/useGroceryCart";
import { getStoreBySlug } from "@/config/groceryStores";

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
    toast.success("Added to cart");
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
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-1/3 -left-20 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/70 backdrop-blur-2xl border-b border-border/20">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/grocery")}
            className="p-2 rounded-2xl hover:bg-muted/60 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-9 w-9 rounded-2xl bg-background border border-border/30 flex items-center justify-center p-1.5 shadow-sm">
              <img src={storeCfg.logo} alt={storeName} className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-base font-bold truncate leading-tight">{storeName}</h1>
              <p className="text-[10px] text-muted-foreground font-medium">Delivered by ZIVO</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCart(!showCart)}
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
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder={storeCfg.placeholder}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-9 rounded-2xl bg-muted/30 border-border/20 h-11 text-sm focus:bg-muted/50 transition-colors"
            />
            {query && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => { setQuery(""); search(storeCfg.defaultQuery); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-muted/60 hover:bg-muted"
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
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="sticky top-[128px] z-20 mx-4 mb-4 bg-card/90 backdrop-blur-xl rounded-3xl border border-border/40 shadow-xl overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm">Cart ({cart.itemCount})</h3>
                {cart.items.length > 0 && (
                  <button onClick={cart.clearCart} className="text-[11px] text-destructive hover:underline font-medium">Clear</button>
                )}
              </div>

              {cart.items.length === 0 ? (
                <div className="text-center py-6">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 p-2.5 rounded-2xl bg-muted/30 border border-border/20">
                      {item.image && <img src={item.image} alt="" className="h-11 w-11 rounded-xl object-contain bg-white" referrerPolicy="no-referrer" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">${item.price.toFixed(2)} × {item.quantity} = <span className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</span></p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)} className="p-1.5 rounded-xl hover:bg-muted active:scale-95 transition-all"><Minus className="h-3 w-3" /></button>
                        <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)} className="p-1.5 rounded-xl hover:bg-muted active:scale-95 transition-all"><Plus className="h-3 w-3" /></button>
                        <button onClick={() => cart.removeItem(item.productId)} className="p-1.5 rounded-xl hover:bg-destructive/10 ml-0.5 active:scale-95 transition-all"><Trash2 className="h-3 w-3 text-destructive" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="flex justify-between text-sm font-bold mb-3">
                    <span>Total</span><span className="text-primary">${cart.total.toFixed(2)}</span>
                  </div>
                  <Button onClick={handleCheckout} className="w-full rounded-2xl h-11 font-bold active:scale-95 transition-transform">
                    <Package className="h-4 w-4 mr-2" />Place Order
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">A ZIVO driver will shop & deliver</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="px-4 py-4 grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-border/30 bg-card/60 backdrop-blur-sm overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-3.5 space-y-2.5">
                <Skeleton className="h-2.5 w-1/3 rounded-lg" />
                <Skeleton className="h-3.5 w-full rounded-lg" />
                <Skeleton className="h-3 w-2/3 rounded-lg" />
                <Skeleton className="h-9 w-full rounded-2xl mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="mx-4 mt-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">{error}</div>
      )}

      {/* Empty */}
      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {query.length >= 2 ? `No products found for "${query}"` : "No products available"}
          </p>
        </div>
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

      {/* Load more */}
      <div ref={sentinelRef} className="h-1" />
      {isLoadingMore && (
        <div className="flex justify-center py-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading more…</span>
          </div>
        </div>
      )}

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
