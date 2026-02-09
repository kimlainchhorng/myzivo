/**
 * useReorder Hook
 * Handles reordering past orders by adding items to cart
 */
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface OrderItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  imageUrl?: string;
}

interface PastOrder {
  id: string;
  restaurant_id: string;
  restaurants?: { name: string } | null;
  items: OrderItem[];
}

export function useReorder() {
  const navigate = useNavigate();
  const { rebuildFromOrder, items: cartItems } = useCart();
  const [isReordering, setIsReordering] = useState(false);

  const reorder = useCallback(
    async (order: PastOrder) => {
      setIsReordering(true);

      try {
        // Check if cart has items from a different restaurant
        if (
          cartItems.length > 0 &&
          cartItems[0].restaurantId !== order.restaurant_id
        ) {
          // Cart will be cleared automatically by rebuildFromOrder
          toast.info("Cart cleared for new restaurant");
        }

        // Rebuild cart from the order
        rebuildFromOrder({
          restaurant_id: order.restaurant_id,
          restaurants: order.restaurants,
          items: order.items,
        });

        toast.success("Items added to cart!");
        
        // Navigate to checkout
        navigate("/eats/checkout");
      } catch (error) {
        console.error("Reorder failed:", error);
        toast.error("Failed to reorder. Please try again.");
      } finally {
        setIsReordering(false);
      }
    },
    [rebuildFromOrder, cartItems, navigate]
  );

  return {
    reorder,
    isReordering,
  };
}
