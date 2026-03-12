/**
 * GroceryProductCard - Reusable product card for the grocery grid
 */
import { motion } from "framer-motion";
import { Plus, Minus, Star, Package } from "lucide-react";
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-2xl border border-border/50 bg-card overflow-hidden"
    >
      {/* Image */}
      <div className="aspect-square bg-white p-3 flex items-center justify-center relative">
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
        <Badge variant="secondary" className="absolute top-2 left-2 text-[9px] px-1.5 py-0.5">
          {product.store}
        </Badge>
      </div>

      {/* Info */}
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
          {product.rating != null && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {product.rating}
            </span>
          )}
        </div>

        {/* Actions */}
        {!product.inStock ? (
          <Badge variant="secondary" className="text-[10px]">Out of Stock</Badge>
        ) : cartItem ? (
          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={() => onUpdateQuantity(product.productId, cartItem.quantity - 1)}
              className="p-1.5 rounded-lg bg-muted hover:bg-muted/80"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-xs font-semibold w-6 text-center">{cartItem.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(product.productId, cartItem.quantity + 1)}
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
            onClick={() => onAdd(product)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add to Cart
          </Button>
        )}
      </div>
    </motion.div>
  );
}
