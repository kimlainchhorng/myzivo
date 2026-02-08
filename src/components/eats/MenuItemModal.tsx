/**
 * Menu Item Modal Component
 * Add items to cart with quantity and notes
 */
import { useState } from "react";
import { Minus, Plus, X, UtensilsCrossed } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white p-0 overflow-hidden">
        {/* Image */}
        <div className="h-48 bg-gradient-to-br from-orange-500/20 to-zinc-800 flex items-center justify-center">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <UtensilsCrossed className="w-16 h-16 text-orange-500/30" />
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

          {/* Special Instructions */}
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

          {/* Quantity Selector */}
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

          {/* Add to Cart Button */}
          <Button
            onClick={handleAdd}
            className="w-full h-14 rounded-xl font-bold text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            Add to Cart · ${totalPrice.toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
