/**
 * Menu Item Modal Component
 * Add items to cart with quantity and notes
 */
import { useState } from "react";
import { Minus, Plus, X, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import type { MenuItem } from "@/hooks/useEatsOrders";
import { toast } from "sonner";

interface MenuItemModalProps {
  item: MenuItem | null;
  restaurantId: string;
  restaurantName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuItemModal({
  item,
  restaurantId,
  restaurantName,
  open,
  onOpenChange,
}: MenuItemModalProps) {
  const { addItem, getRestaurantId } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const currentRestaurantId = getRestaurantId();

  const handleAdd = () => {
    if (!item) return;

    // Check if adding from different restaurant
    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      toast.warning("Cart cleared - adding from new restaurant", {
        description: "You can only order from one restaurant at a time",
      });
    }

    addItem({
      id: item.id,
      restaurantId,
      restaurantName,
      name: item.name,
      price: item.price,
      imageUrl: item.image_url || undefined,
      notes: notes.trim() || undefined,
      quantity,
    });

    toast.success(`${quantity}x ${item.name} added to cart`);
    onOpenChange(false);
    setQuantity(1);
    setNotes("");
  };

  if (!item) return null;

  const totalPrice = item.price * quantity;
  const isItemAvailable = item.is_available !== false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white p-0 overflow-hidden">
        {/* Image */}
        <div className={cn(
          "h-48 bg-gradient-to-br from-orange-500/20 to-zinc-800 flex items-center justify-center relative",
          !isItemAvailable && "grayscale"
        )}>
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <UtensilsCrossed className="w-16 h-16 text-orange-500/30" />
          )}
          {/* Out of Stock overlay */}
          {!isItemAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="bg-red-500/90 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                <X className="w-5 h-5" />
                Out of Stock
              </div>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {item.name}
            </DialogTitle>
            {item.description && (
              <p className="text-sm text-zinc-400 mt-2">{item.description}</p>
            )}
          </DialogHeader>

          {/* Out of Stock Warning */}
          {!isItemAvailable && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 font-medium text-sm">
                This item is currently out of stock and cannot be added to your cart.
              </p>
            </div>
          )}

          {/* Special Instructions - only show if available */}
          {isItemAvailable && (
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">
                Special Instructions (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., No onions, extra sauce..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 resize-none"
                rows={2}
              />
            </div>
          )}

          {/* Quantity Selector - only show if available */}
          {isItemAvailable && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Quantity</span>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAdd}
            disabled={!isItemAvailable}
            className={cn(
              "w-full h-14 rounded-xl font-bold text-lg",
              isItemAvailable 
                ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                : "bg-zinc-700 cursor-not-allowed"
            )}
          >
            {isItemAvailable ? `Add to Cart · $${totalPrice.toFixed(2)}` : "Out of Stock"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
