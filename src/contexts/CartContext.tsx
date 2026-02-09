import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { DeliveryStop } from "@/lib/multiStopDeliveryFee";

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

// Re-export for convenience
export type { DeliveryStop };

interface CartContextType {
  items: CartItem[];
  // Backward compatibility - first stop's address
  deliveryAddress: string;
  // Multi-stop support
  deliveryStops: DeliveryStop[];
  addDeliveryStop: (stop: Omit<DeliveryStop, "id">) => void;
  updateDeliveryStop: (id: string, updates: Partial<DeliveryStop>) => void;
  removeDeliveryStop: (id: string) => void;
  reorderDeliveryStops: (stopIds: string[]) => void;
  clearDeliveryStops: () => void;
  // Cart item methods
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
const STOPS_STORAGE_KEY = "zivo-eats-delivery-stops";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [deliveryStops, setDeliveryStops] = useState<DeliveryStop[]>(() => {
    try {
      const stored = localStorage.getItem(STOPS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Legacy address state (for backward compatibility)
  const [deliveryAddressLegacy, setDeliveryAddressLegacy] = useState<string>(() => {
    try {
      return localStorage.getItem(ADDRESS_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });

  // Computed: first stop's address or legacy address
  const deliveryAddress = deliveryStops.length > 0 
    ? deliveryStops[0].address 
    : deliveryAddressLegacy;

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(ADDRESS_STORAGE_KEY, deliveryAddress);
  }, [deliveryAddress]);

  // Persist delivery stops to localStorage
  useEffect(() => {
    localStorage.setItem(STOPS_STORAGE_KEY, JSON.stringify(deliveryStops));
  }, [deliveryStops]);

  // Multi-stop management methods
  const addDeliveryStop = useCallback((stop: Omit<DeliveryStop, "id">) => {
    setDeliveryStops((prev) => [
      ...prev,
      { ...stop, id: crypto.randomUUID() },
    ]);
  }, []);

  const updateDeliveryStop = useCallback(
    (id: string, updates: Partial<DeliveryStop>) => {
      setDeliveryStops((prev) =>
        prev.map((stop) => (stop.id === id ? { ...stop, ...updates } : stop))
      );
    },
    []
  );

  const removeDeliveryStop = useCallback((id: string) => {
    setDeliveryStops((prev) => prev.filter((stop) => stop.id !== id));
  }, []);

  const reorderDeliveryStops = useCallback((stopIds: string[]) => {
    setDeliveryStops((prev) => {
      const stopMap = new Map(prev.map((s) => [s.id, s]));
      return stopIds.map((id) => stopMap.get(id)).filter(Boolean) as DeliveryStop[];
    });
  }, []);

  const clearDeliveryStops = useCallback(() => {
    setDeliveryStops([]);
  }, []);

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
    setDeliveryAddressLegacy(address);
    // Also update first stop if exists
    if (deliveryStops.length > 0) {
      setDeliveryStops((prev) =>
        prev.map((stop, i) => (i === 0 ? { ...stop, address } : stop))
      );
    }
  }, [deliveryStops.length]);

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
        deliveryStops,
        addDeliveryStop,
        updateDeliveryStop,
        removeDeliveryStop,
        reorderDeliveryStops,
        clearDeliveryStops,
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
