/**
 * GroceryPage - Walmart product search & shopping cart
 * Allows customers to search, add items, and create shopping delivery orders
 */
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, ShoppingCart, Plus, Minus, Trash2,
  Loader2, Star, X, ChevronRight, Package, Store,
} from "lucide-react";
import { GroceryCheckoutDrawer } from "@/components/grocery/GroceryCheckoutDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { useWalmartSearch, type WalmartProduct } from "@/hooks/useWalmartSearch";
import { useGroceryCart } from "@/hooks/useGroceryCart";
import logoWalmart from "@/assets/brand-logos/walmart.png";

export default function GroceryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const { products, isLoading, error, search, clearResults } = useWalmartSearch();
  const cart = useGroceryCart();

  const handleSearch = useCallback(
    (val: string) => {
      setQuery(val);
      clearTimeout(debounceRef.current);
      if (val.trim().length < 2) {
        clearResults();
        return;
      }
      debounceRef.current = setTimeout(() => search(val), 500);
    },
    [search, clearResults]
  );

  const handleAdd = (p: WalmartProduct) => {
    cart.addItem({
      productId: p.productId,
      name: p.name,
      price: p.price,
      image: p.image,
      brand: p.brand,
    });
    toast.success("Added to cart");
  };

  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    if (cart.itemCount === 0) {
      toast.error("Your cart is empty");
      return;
    }
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
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src={logoWalmart} alt="Walmart" className="h-7 w-7 rounded-lg object-contain" />
            <h1 className="text-lg font-bold truncate">Grocery</h1>
          </div>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative p-2 rounded-xl hover:bg-muted"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold min-w-[18px] px-1">
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
              placeholder="Search Walmart products..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-8 rounded-xl bg-muted/50 border-border/50"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); clearResults(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
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
                  <button onClick={cart.clearCart} className="text-xs text-destructive hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              {cart.items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Your cart is empty</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 p-2 rounded-xl bg-muted/30">
                      {item.image && (
                        <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-contain bg-white" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 rounded-lg hover:bg-muted"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 rounded-lg hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => cart.removeItem(item.productId)}
                          className="p-1 rounded-lg hover:bg-destructive/10 ml-1"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex justify-between text-sm font-semibold mb-3">
                    <span>Total</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                  <Button onClick={handleCheckout} className="w-full rounded-xl" size="sm">
                    <Package className="h-4 w-4 mr-2" />
                    Place Shopping Order
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    A driver will purchase and deliver your items
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!query && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold mb-1">Search Walmart Products</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Search for groceries, household items, and more. A ZIVO driver will shop and deliver to your door.
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && products.length > 0 && (
        <div className="px-4 py-4 grid grid-cols-2 gap-3">
          {products.map((product, i) => {
            const inCart = cart.items.find((c) => c.productId === product.productId);
            return (
              <motion.div
                key={product.productId || i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-border/50 bg-card overflow-hidden"
              >
                <div className="aspect-square bg-white p-3 flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <Package className="h-10 w-10 text-muted-foreground/30" />
                  )}
                </div>
                <div className="p-3 space-y-1">
                  {product.brand && (
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">
                      {product.brand}
                    </p>
                  )}
                  <p className="text-xs font-medium line-clamp-2 leading-tight">{product.name}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-bold text-primary">
                      ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
                    </span>
                    {product.rating && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {product.rating}
                      </span>
                    )}
                  </div>
                  {!product.inStock ? (
                    <Badge variant="secondary" className="text-[10px]">
                      Out of Stock
                    </Badge>
                  ) : inCart ? (
                    <div className="flex items-center gap-1 pt-1">
                      <button
                        onClick={() => cart.updateQuantity(product.productId, inCart.quantity - 1)}
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted/80"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-semibold w-6 text-center">{inCart.quantity}</span>
                      <button
                        onClick={() => cart.updateQuantity(product.productId, inCart.quantity + 1)}
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted/80"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full rounded-xl text-xs h-8 mt-1"
                      onClick={() => handleAdd(product)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Debug: result count */}
      {!isLoading && query.length >= 2 && products.length > 0 && (
        <div className="mx-4 mb-2 px-3 py-1.5 rounded-lg bg-muted/60 text-[11px] text-muted-foreground font-mono">
          🐛 Debug: {products.length} products returned for "{query}"
        </div>
      )}

      {/* No results */}
      {!isLoading && query.length >= 2 && products.length === 0 && !error && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No Walmart products found for this query
        </div>
      )}

      {/* Checkout Drawer */}
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
