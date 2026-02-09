/**
 * useOrderEditing Hook
 * Provides mutation functions for editing orders within the grace window
 * All operations are validated by the backend edge function
 */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OrderItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  imageUrl?: string;
}

interface UpdateResult {
  success: boolean;
  error?: string;
  reason?: "expired" | "confirmed" | "invalid" | "min_items";
  order?: any;
}

interface UseOrderEditingResult {
  // Item mutations
  removeItem: (itemIndex: number) => Promise<boolean>;
  updateItemQuantity: (itemIndex: number, newQuantity: number) => Promise<boolean>;
  
  // Note mutation
  updateNote: (note: string) => Promise<boolean>;
  
  // Cancel mutation
  cancelOrder: (reason?: string) => Promise<boolean>;
  
  // States
  isUpdating: boolean;
  isCancelling: boolean;
  lastError: string | null;
}

export function useOrderEditing(
  orderId: string | undefined,
  currentItems?: OrderItem[]
): UseOrderEditingResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Generic call to edge function
  const callUpdateFunction = useCallback(async (
    action: string,
    payload: Record<string, any>
  ): Promise<UpdateResult> => {
    if (!orderId) {
      return { success: false, error: "No order ID" };
    }

    try {
      const { data, error } = await supabase.functions.invoke("update-eats-order", {
        body: {
          action,
          orderId,
          ...payload,
        },
      });

      if (error) {
        throw new Error(error.message || "Update failed");
      }

      return data as UpdateResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      return { success: false, error: message };
    }
  }, [orderId]);

  // Remove an item by index
  const removeItem = useCallback(async (itemIndex: number): Promise<boolean> => {
    if (!currentItems || currentItems.length === 0) {
      toast.error("No items to remove");
      return false;
    }

    // Prevent removing last item
    if (currentItems.length === 1) {
      toast.error("Order must have at least one item");
      return false;
    }

    setIsUpdating(true);
    setLastError(null);

    // Create new items array without the removed item
    const newItems = currentItems.filter((_, i) => i !== itemIndex);

    const result = await callUpdateFunction("update_items", { items: newItems });

    setIsUpdating(false);

    if (result.success) {
      toast.success("Item removed");
      return true;
    } else {
      const errorMsg = getErrorMessage(result);
      setLastError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
  }, [currentItems, callUpdateFunction]);

  // Update item quantity
  const updateItemQuantity = useCallback(async (
    itemIndex: number,
    newQuantity: number
  ): Promise<boolean> => {
    if (!currentItems || currentItems.length === 0) {
      toast.error("No items to update");
      return false;
    }

    // If reducing to 0, treat as remove
    if (newQuantity <= 0) {
      return removeItem(itemIndex);
    }

    setIsUpdating(true);
    setLastError(null);

    // Create new items array with updated quantity
    const newItems = currentItems.map((item, i) => 
      i === itemIndex ? { ...item, quantity: newQuantity } : item
    );

    const result = await callUpdateFunction("update_items", { items: newItems });

    setIsUpdating(false);

    if (result.success) {
      toast.success("Quantity updated");
      return true;
    } else {
      const errorMsg = getErrorMessage(result);
      setLastError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
  }, [currentItems, callUpdateFunction, removeItem]);

  // Update order note
  const updateNote = useCallback(async (note: string): Promise<boolean> => {
    setIsUpdating(true);
    setLastError(null);

    const result = await callUpdateFunction("update_note", { note });

    setIsUpdating(false);

    if (result.success) {
      toast.success("Note updated");
      return true;
    } else {
      const errorMsg = getErrorMessage(result);
      setLastError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
  }, [callUpdateFunction]);

  // Cancel order
  const cancelOrder = useCallback(async (reason?: string): Promise<boolean> => {
    setIsCancelling(true);
    setLastError(null);

    const result = await callUpdateFunction("cancel", { 
      cancellation_reason: reason 
    });

    setIsCancelling(false);

    if (result.success) {
      toast.success("Order cancelled");
      return true;
    } else {
      const errorMsg = getErrorMessage(result);
      setLastError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
  }, [callUpdateFunction]);

  return {
    removeItem,
    updateItemQuantity,
    updateNote,
    cancelOrder,
    isUpdating,
    isCancelling,
    lastError,
  };
}

// Helper to get user-friendly error message
function getErrorMessage(result: UpdateResult): string {
  if (result.reason === "expired") {
    return "Edit window has expired";
  }
  if (result.reason === "confirmed") {
    return "Order already confirmed by restaurant";
  }
  if (result.reason === "min_items") {
    return "Order must have at least one item";
  }
  return result.error || "Update failed";
}
