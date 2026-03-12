/**
 * GroceryStorePage - Product search for a specific store
 * Reads store slug from URL params, renders search + cart
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, ShoppingCart, Plus, Minus, Trash2,
  Loader2, X, Package, Store,
} from "lucide-react";
import { GroceryCheckoutDrawer } from "@/components/grocery/GroceryCheckoutDrawer";
import { GroceryProductCard } from "@/components/grocery/GroceryProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  const { products, isLoading, error, search, clearResults } = useStoreSearch(storeName);
  const cart = useGroceryCart();
  const hasLoadedDefaults = useRef(false);

  // Auto-fetch default products on mount
  useEffect(() => {
    if (storeCfg && !hasLoadedDefaults.current) {
      hasLoadedDefaults.current = true;
      search(storeCfg.defaultQuery);
    }
  }, [storeCfg, search]);

  // Fallback if slug doesn't match
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
      // Clear search → re-fetch defaults
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
    toast.success(`Added to cart`);
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/grocery")} className="p-1.5 rounded-xl hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src={storeCfg.logo} alt={storeName} className="h-7 w-7 rounded-lg object-contain" />
            <h1 className="text-lg font-bold truncate">{storeName}</h1>
          </div>
          <button onClick={() => setShowCart(!showCart)} className="relative p-2 rounded-xl hover:bg-muted">
            <ShoppingCart className="h-5 w-5" />
            {cart.itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold min-w-[18px] h-[18px] px-1">
                {cart.itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={storeCfg.placeholder}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-8 rounded-xl bg-muted/50 border-border/50"
            />
            {query && (
              <button onClick={() => { setQuery(""); search(storeCfg.defaultQuery); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sticky top-[120px] z-20 mx-4 mb-4 bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Shopping Cart ({cart.itemCount})</h3>
                {cart.items.length > 0 && (
                  <button onClick={cart.clearCart} className="text-xs text-destructive hover:underline">Clear all</button>
                )}
              </div>

              {cart.items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Your cart is empty</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 p-2 rounded-xl bg-muted/30">
                       {item.image && <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-contain bg-white" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} × {item.quantity} = <span className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</span></p>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{item.store}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)} className="p-1 rounded-lg hover:bg-muted"><Minus className="h-3 w-3" /></button>
                        <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)} className="p-1 rounded-lg hover:bg-muted"><Plus className="h-3 w-3" /></button>
                        <button onClick={() => cart.removeItem(item.productId)} className="p-1 rounded-lg hover:bg-destructive/10 ml-1"><Trash2 className="h-3 w-3 text-destructive" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex justify-between text-sm font-semibold mb-3">
                    <span>Total</span><span>${cart.total.toFixed(2)}</span>
                  </div>
                  <Button onClick={handleCheckout} className="w-full rounded-xl" size="sm">
                    <Package className="h-4 w-4 mr-2" />Place Shopping Order
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">A driver will purchase and deliver your items</p>
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
            <div key={i} className="rounded-2xl border border-border/50 bg-card overflow-hidden animate-pulse">
              <div className="aspect-square bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-2.5 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="h-8 bg-muted rounded-xl mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="mx-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm text-center">{error}</div>
      )}

      {/* Empty — only show if not loading and no products after fetch */}
      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          {query.length >= 2
            ? `No ${storeName} products found for "${query}"`
            : "No products available right now"}
        </div>
      )}

      {/* Debug banner */}
      {!isLoading && products.length > 0 && (
        <div className="mx-4 mt-3 mb-1 px-3 py-1.5 rounded-lg bg-muted/60 text-[11px] text-muted-foreground font-mono">
          🐛 {products.length} products from {storeName}{query ? ` for "${query}"` : ""}
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && products.length > 0 && (
        <div className="px-4 py-2 grid grid-cols-2 gap-3">
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
