/**
 * GroceryProductCard - 2026 Spatial UI product card
 */
import { motion } from "framer-motion";
import { Plus, Minus, Star, Package, Check } from "lucide-react";
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 260, damping: 20 }}
      className="group rounded-3xl border border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-square bg-white p-4 flex items-center justify-center relative overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <Package className={`h-12 w-12 text-muted-foreground/20 absolute ${product.image ? "hidden" : ""}`} />
        
        {/* Store badge */}
        <Badge variant="secondary" className="absolute top-2.5 left-2.5 text-[9px] px-2 py-0.5 bg-background/80 backdrop-blur-sm border-border/30 font-medium">
          {product.store}
        </Badge>

        {/* Cart indicator */}
        {cartItem && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <Check className="h-3.5 w-3.5 text-primary-foreground" />
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5 space-y-1.5">
        {product.brand && (
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium truncate">
            {product.brand}
          </p>
        )}
        <p className="text-sm font-semibold line-clamp-2 leading-snug">{product.name}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-base font-bold text-primary">
            ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
          </span>
          {product.rating != null && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-lg">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {product.rating}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="pt-1.5">
          {!product.inStock ? (
            <Badge variant="secondary" className="text-[10px] w-full justify-center py-1.5 rounded-xl">
              Out of Stock
            </Badge>
          ) : cartItem ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateQuantity(product.productId, cartItem.quantity - 1)}
                className="p-2 rounded-xl bg-muted/60 hover:bg-muted active:scale-95 transition-all duration-200"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-bold w-8 text-center">{cartItem.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(product.productId, cartItem.quantity + 1)}
                className="p-2 rounded-xl bg-muted/60 hover:bg-muted active:scale-95 transition-all duration-200"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              className="w-full rounded-2xl text-xs h-9 font-semibold active:scale-95 transition-transform duration-200"
              onClick={() => onAdd(product)}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
