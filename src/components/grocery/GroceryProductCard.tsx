/**
 * GroceryProductCard - 2026 Spatial UI product card (v2)
 */
import { motion } from "framer-motion";
import { Plus, Minus, Star, Package, Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StoreProduct } from "@/hooks/useStoreSearch";
import type { GroceryCartItem } from "@/hooks/useGroceryCart";

interface GroceryProductCardProps {
  product: StoreProduct;
  index: number;
  cartItem?: GroceryCartItem;
  onAdd: (product: StoreProduct) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export function GroceryProductCard({
  product,
  index,
  cartItem,
  onAdd,
  onUpdateQuantity,
}: GroceryProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 280, damping: 22 }}
      className={`group relative rounded-[20px] bg-card border transition-all duration-300 overflow-hidden ${
        cartItem
          ? "border-primary/30 shadow-md shadow-primary/10"
          : "border-border/40 hover:border-primary/15 hover:shadow-lg hover:shadow-primary/5"
      }`}
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] bg-gradient-to-b from-muted/20 to-muted/40 flex items-center justify-center p-5 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-sm"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <Package className={`h-10 w-10 text-muted-foreground/15 absolute ${product.image ? "hidden" : ""}`} />

        {/* Store badge - top left pill */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur-md border border-border/20 shadow-sm">
          <ShoppingBag className="h-2.5 w-2.5 text-muted-foreground" />
          <span className="text-[9px] font-semibold text-muted-foreground tracking-wide">{product.store}</span>
        </div>

        {/* Cart indicator - animated checkmark */}
        {cartItem && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 ring-2 ring-background"
          >
            <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        )}

        {/* Rating pill - bottom right */}
        {product.rating != null && (
          <div className="absolute bottom-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-background/90 backdrop-blur-md border border-border/20">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-bold text-foreground">{product.rating}</span>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-3 space-y-1">
        {product.brand && (
          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.1em] font-semibold truncate">
            {product.brand}
          </p>
        )}
        <p className="text-[13px] font-semibold line-clamp-2 leading-[1.3] text-foreground/90">
          {product.name}
        </p>
        
        {/* Price */}
        <div className="pt-0.5">
          <span className="text-lg font-extrabold text-primary tracking-tight">
            ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
          </span>
        </div>

        {/* Actions */}
        <div className="pt-1">
          {!product.inStock ? (
            <div className="text-[10px] text-muted-foreground text-center py-2 rounded-xl bg-muted/40 font-medium">
              Out of Stock
            </div>
          ) : cartItem ? (
            <div className="flex items-center justify-between bg-primary/10 rounded-[14px] p-1">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => onUpdateQuantity(product.productId, cartItem.quantity - 1)}
                className="h-8 w-8 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border/30 hover:bg-muted transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </motion.button>
              <motion.span
                key={cartItem.quantity}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-sm font-extrabold text-primary min-w-[28px] text-center"
              >
                {cartItem.quantity}
              </motion.span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => onUpdateQuantity(product.productId, cartItem.quantity + 1)}
                className="h-8 w-8 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border/30 hover:bg-muted transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          ) : (
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                size="sm"
                className="w-full rounded-[14px] text-xs h-9 font-bold gap-1.5 shadow-sm shadow-primary/20"
                onClick={() => onAdd(product)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add to Cart
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
