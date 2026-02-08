import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface CartItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  notes?: string;
}

interface OrderItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  deliveryAddress: string;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryAddress: (address: string) => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getRestaurantId: () => string | null;
  rebuildFromOrder: (order: {
    restaurant_id: string;
    restaurants?: { name: string } | null;
    items: OrderItem[];
  }) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "zivo-eats-cart";
const ADDRESS_STORAGE_KEY = "zivo-eats-address";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [deliveryAddress, setDeliveryAddressState] = useState<string>(() => {
    try {
      return localStorage.getItem(ADDRESS_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(ADDRESS_STORAGE_KEY, deliveryAddress);
  }, [deliveryAddress]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setItems((prev) => {
        // Check if cart has items from a different restaurant
        if (prev.length > 0 && prev[0].restaurantId !== item.restaurantId) {
          // Clear cart and start fresh with new restaurant
          return [{ ...item, quantity: item.quantity || 1 }];
        }

        // Check if item already exists
        const existingIndex = prev.findIndex((i) => i.id === item.id);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].quantity += item.quantity || 1;
          return updated;
        }

        return [...prev, { ...item, quantity: item.quantity || 1 }];
      });
    },
    []
  );

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const setDeliveryAddress = useCallback((address: string) => {
    setDeliveryAddressState(address);
  }, []);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const getRestaurantId = useCallback(() => {
    return items.length > 0 ? items[0].restaurantId : null;
  }, [items]);

  // Rebuild cart from a previous order (Order Again feature)
  const rebuildFromOrder = useCallback(
    (order: {
      restaurant_id: string;
      restaurants?: { name: string } | null;
      items: OrderItem[];
    }) => {
      // Clear current cart
      setItems([]);

      // Rebuild from order items
      const restaurantName = order.restaurants?.name || "Restaurant";
      const newItems: CartItem[] = order.items.map((item) => ({
        id: item.menu_item_id,
        restaurantId: order.restaurant_id,
        restaurantName,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes,
        imageUrl: item.imageUrl,
      }));

      setItems(newItems);
    },
    []
  );

  return (
    <CartContext.Provider
      value={{
        items,
        deliveryAddress,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setDeliveryAddress,
        getItemCount,
        getSubtotal,
        getRestaurantId,
        rebuildFromOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
