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
      whileTap={{ scale: 0.97 }}
      className={`group relative rounded-2xl bg-card border transition-all duration-300 overflow-hidden ${
        cartItem
          ? "border-primary/30 shadow-md shadow-primary/10 ring-1 ring-primary/10"
          : "border-border/30 hover:border-primary/15 hover:shadow-lg hover:shadow-primary/5"
      }`}
    >
      {/* Image */}
      <div
        className="relative aspect-square bg-gradient-to-br from-muted/10 to-muted/25 flex items-center justify-center p-2.5 overflow-hidden cursor-pointer"
        onClick={() => onSelect?.(product)}
      >
        {product.image && !imgError ? (
          <>
            {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-muted/30" />}
            <motion.img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain"
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
          <Package className="h-8 w-8 text-muted-foreground/15" />
        )}

        {/* Stock dot - top left */}
        <span className={`absolute top-1.5 left-1.5 h-2 w-2 rounded-full border border-background shadow-sm ${
          product.inStock ? "bg-emerald-500" : "bg-destructive"
        }`} />

        {/* Store logo - top right */}
        {storeLogo && (
          <div className="absolute top-1 right-1 h-5 w-5 rounded-md bg-background/90 backdrop-blur-sm border border-border/30 flex items-center justify-center p-0.5">
            <img src={storeLogo} alt={product.store} className="h-full w-full object-contain" />
          </div>
        )}

        {/* Cart check */}
        {cartItem && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center ring-1.5 ring-background"
          >
            <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        )}

        {/* Rating */}
        {product.rating != null && (
          <div className="absolute bottom-1 left-1 flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-background/80 backdrop-blur-sm">
            <Star className="h-2 w-2 fill-amber-400 text-amber-400" />
            <span className="text-[7px] font-bold text-foreground">{product.rating}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 space-y-0.5">
        <p
          className="text-[10px] font-semibold line-clamp-2 leading-[1.3] text-foreground/90 min-h-[26px] cursor-pointer"
          onClick={() => onSelect?.(product)}
        >
          {product.name}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-[13px] font-extrabold text-foreground tracking-tight">
            ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
          </span>
        </div>

        {/* CTA */}
        {!product.inStock ? (
          <div className="text-[8px] text-muted-foreground text-center py-1.5 rounded-lg bg-muted/30 font-medium">
            Out of Stock
          </div>
        ) : cartItem ? (
          <div className="flex items-center justify-between bg-primary/10 rounded-lg p-0.5 border border-primary/15">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => onUpdateQuantity(product.productId, cartItem.quantity - 1)}
              className="h-6 w-6 rounded-md bg-background flex items-center justify-center border border-border/20"
              aria-label="Decrease"
            >
              <Minus className="h-2.5 w-2.5" />
            </motion.button>
            <span className="text-[11px] font-extrabold text-primary min-w-[18px] text-center">
              {cartItem.quantity}
            </span>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => onUpdateQuantity(product.productId, cartItem.quantity + 1)}
              className="h-6 w-6 rounded-md bg-background flex items-center justify-center border border-border/20"
              aria-label="Increase"
            >
              <Plus className="h-2.5 w-2.5" />
            </motion.button>
          </div>
        ) : (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              className="w-full rounded-lg text-[9px] h-7 font-bold gap-0.5 shadow-sm"
              onClick={handleAdd}
              aria-label={`Add ${product.name}`}
            >
              {justAdded ? (
                <Check className="h-2.5 w-2.5" />
              ) : (
                <Plus className="h-2.5 w-2.5" />
              )}
              {justAdded ? "Added!" : "Add"}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
