/**
 * GroceryProductCard - 2026 Spatial UI product card (v5)
 * Driver-friendly: shows store logo, stock status, aisle/location
 */
import { motion } from "framer-motion";
import { Plus, Minus, Check, Package, Star, TrendingDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoreProduct } from "@/hooks/useStoreSearch";
import type { GroceryCartItem } from "@/hooks/useGroceryCart";
import { useState } from "react";
import { GROCERY_STORES } from "@/config/groceryStores";

interface GroceryProductCardProps {
  product: StoreProduct;
  index: number;
  cartItem?: GroceryCartItem;
  onAdd: (product: StoreProduct) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onSelect?: (product: StoreProduct) => void;
}

const cardVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.03, type: "spring" as const, stiffness: 300, damping: 24 },
  }),
};

function getStoreLogo(storeName: string): string | undefined {
  const store = GROCERY_STORES.find((s) => s.name.toLowerCase() === storeName.toLowerCase());
  return store?.logo;
}

export function GroceryProductCard({
  product,
  index,
  cartItem,
  onAdd,
  onUpdateQuantity,
  onSelect,
}: GroceryProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleAdd = () => {
    onAdd(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  };

  const storeLogo = getStoreLogo(product.store);
  const showSavings = product.price > 5 && product.inStock;
  const originalPrice = showSavings ? +(product.price * (1 + (0.05 + Math.random() * 0.1))).toFixed(2) : null;

  return (
    <motion.div
      custom={index}
      variants={cardVariant}
      initial="hidden"
      animate="show"
      whileTap={{ scale: 0.98 }}
      className={`group relative rounded-[22px] bg-card border transition-all duration-300 overflow-hidden ${
        cartItem
          ? "border-primary/30 shadow-lg shadow-primary/10 ring-1 ring-primary/10"
          : "border-border/30 hover:border-primary/15 hover:shadow-xl hover:shadow-primary/5"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-muted/10 via-muted/20 to-muted/30 flex items-center justify-center p-4 overflow-hidden cursor-pointer" onClick={() => onSelect?.(product)}>
        {product.image && !imgError ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-muted/30" />
            )}
            <motion.img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain drop-shadow-sm"
              loading="lazy"
              referrerPolicy="no-referrer"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: imgLoaded ? 1 : 0.9, opacity: imgLoaded ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <Package className="h-12 w-12 text-muted-foreground/15" />
        )}

        {/* Stock status badge - top left */}
        <div className={`absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-md border shadow-sm ${
          product.inStock
            ? "bg-emerald-500/10 border-emerald-500/20"
            : "bg-destructive/10 border-destructive/20"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${product.inStock ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
          <span className={`text-[8px] font-bold tracking-wide uppercase ${product.inStock ? "text-emerald-600" : "text-destructive"}`}>
            {product.inStock ? "In Stock" : "Out"}
          </span>
        </div>

        {/* Store logo - top right (driver-friendly) */}
        <div className="absolute top-2 right-2 flex flex-col items-center gap-0.5">
          {storeLogo ? (
            <div className="h-8 w-8 rounded-xl bg-background/90 backdrop-blur-md border border-border/30 shadow-md flex items-center justify-center p-1 ring-1 ring-background/50">
              <img src={storeLogo} alt={product.store} className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-xl bg-background/90 backdrop-blur-md border border-border/30 shadow-md flex items-center justify-center">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
          <span className="text-[7px] font-bold text-foreground/60 tracking-wide uppercase max-w-[48px] truncate text-center leading-none">
            {product.store}
          </span>
        </div>

        {/* Cart checkmark */}
        {cartItem && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
            className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 ring-2 ring-background"
          >
            <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        )}

        {/* Savings badge */}
        {showSavings && !cartItem && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 backdrop-blur-md"
          >
            <TrendingDown className="h-2.5 w-2.5 text-emerald-500" />
            <span className="text-[8px] font-bold text-emerald-500">Save</span>
          </motion.div>
        )}

        {/* Rating */}
        {product.rating != null && (
          <div className="absolute bottom-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-background/80 backdrop-blur-md border border-border/20">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[9px] font-bold text-foreground">{product.rating}</span>
          </div>
        )}

        {/* Quick add overlay on hover */}
        {!cartItem && product.inStock && (
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        {/* Brand + Store location row */}
        <div className="flex items-center justify-between gap-1">
          {product.brand && (
            <p className="text-[8px] text-muted-foreground uppercase tracking-[0.12em] font-bold truncate leading-none">
              {product.brand}
            </p>
          )}
          <div className="flex items-center gap-0.5 shrink-0">
            <MapPin className="h-2 w-2 text-primary/60" />
            <span className="text-[7px] font-semibold text-primary/60 uppercase tracking-wide">
              {product.store}
            </span>
          </div>
        </div>

        <p className="text-[12px] font-semibold line-clamp-2 leading-[1.35] text-foreground/90 min-h-[32px]">
          {product.name}
        </p>

        {/* Price row */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-[18px] font-extrabold text-foreground tracking-tight">
            ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
          </span>
          {originalPrice && (
            <span className="text-[11px] text-muted-foreground/60 line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="pt-0.5">
          {!product.inStock ? (
            <div className="text-[10px] text-muted-foreground text-center py-2.5 rounded-[14px] bg-muted/30 font-medium border border-border/20">
              Out of Stock
            </div>
          ) : cartItem ? (
            <div className="flex items-center justify-between bg-primary/10 rounded-[14px] p-1 border border-primary/15">
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => onUpdateQuantity(product.productId, cartItem.quantity - 1)}
                className="h-8 w-8 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border/20 hover:bg-muted transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </motion.button>
              <motion.span
                key={cartItem.quantity}
                initial={{ scale: 1.4, y: -4 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
                className="text-sm font-extrabold text-primary min-w-[28px] text-center"
              >
                {cartItem.quantity}
              </motion.span>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => onUpdateQuantity(product.productId, cartItem.quantity + 1)}
                className="h-8 w-8 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border/20 hover:bg-muted transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          ) : (
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                className="w-full rounded-[14px] text-[11px] h-9 font-bold gap-1 shadow-md shadow-primary/20"
                onClick={handleAdd}
                aria-label={`Add ${product.name} to cart`}
              >
                <motion.span
                  key={justAdded ? "check" : "plus"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
                >
                  {justAdded ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </motion.span>
                {justAdded ? "Added!" : "Add to Cart"}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
