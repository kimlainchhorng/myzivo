/**
 * Category Pricing Hooks
 * Hooks for managing P2P vehicle category pricing recommendations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CategoryPricing {
  id: string;
  category: string;
  min_daily_price: number;
  suggested_daily_price: number;
  max_daily_price: number;
  city: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch pricing for a specific category
export function useCategoryPricing(category: string, city?: string) {
  return useQuery({
    queryKey: ["categoryPricing", category, city],
    queryFn: async (): Promise<CategoryPricing | null> => {
      // First try city-specific, fall back to default (null city)
      const { data, error } = await supabase
        .from("p2p_category_pricing")
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .or(city ? `city.eq.${city},city.is.null` : "city.is.null")
        .order("city", { ascending: false, nullsFirst: false })
        .limit(1);

      if (error) throw error;
      return (data?.[0] as CategoryPricing) || null;
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Fetch all category pricing (admin)
export function useAllCategoryPricing() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ["allCategoryPricing"],
    queryFn: async (): Promise<CategoryPricing[]> => {
      const { data, error } = await supabase
        .from("p2p_category_pricing")
        .select("*")
        .order("category")
        .order("city", { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data as CategoryPricing[];
    },
    enabled: isAdmin,
  });
}

// Admin: Update category pricing
export function useUpdateCategoryPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<CategoryPricing, "id" | "created_at">>;
    }) => {
      // Validate price range
      if (updates.min_daily_price !== undefined && updates.max_daily_price !== undefined) {
        if (updates.min_daily_price > updates.max_daily_price) {
          throw new Error("Minimum price cannot exceed maximum price");
        }
      }
      if (updates.suggested_daily_price !== undefined) {
        if (
          (updates.min_daily_price !== undefined && updates.suggested_daily_price < updates.min_daily_price) ||
          (updates.max_daily_price !== undefined && updates.suggested_daily_price > updates.max_daily_price)
        ) {
          throw new Error("Suggested price must be between min and max");
        }
      }

      const { data, error } = await supabase
        .from("p2p_category_pricing")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoryPricing"] });
      queryClient.invalidateQueries({ queryKey: ["allCategoryPricing"] });
      toast.success("Pricing updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update pricing");
    },
  });
}

// Admin: Create category pricing (for city-specific overrides)
export function useCreateCategoryPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pricing: {
      category: string;
      min_daily_price: number;
      suggested_daily_price: number;
      max_daily_price: number;
      city?: string;
      is_active?: boolean;
    }) => {
      // Validate price range
      if (pricing.min_daily_price > pricing.max_daily_price) {
        throw new Error("Minimum price cannot exceed maximum price");
      }
      if (
        pricing.suggested_daily_price < pricing.min_daily_price ||
        pricing.suggested_daily_price > pricing.max_daily_price
      ) {
        throw new Error("Suggested price must be between min and max");
      }

      const { data, error } = await supabase
        .from("p2p_category_pricing")
        .insert({
          ...pricing,
          is_active: pricing.is_active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoryPricing"] });
      queryClient.invalidateQueries({ queryKey: ["allCategoryPricing"] });
      toast.success("Pricing created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create pricing");
    },
  });
}

// Admin: Delete category pricing
export function useDeleteCategoryPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("p2p_category_pricing")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoryPricing"] });
      queryClient.invalidateQueries({ queryKey: ["allCategoryPricing"] });
      toast.success("Pricing deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete pricing");
    },
  });
}

// Check if price suggestions are enabled
export function usePriceSuggestionsEnabled() {
  return useQuery({
    queryKey: ["priceSuggestionsEnabled"],
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "p2p_price_suggestions_enabled")
        .maybeSingle();

      if (error) throw error;
      return data?.value === "true" || data?.value === true;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Calculate owner earnings helper
export function calculateOwnerEarnings(
  dailyRate: number,
  days: number,
  commissionPct: number = 20
): { subtotal: number; platformFee: number; earnings: number } {
  const subtotal = dailyRate * days;
  const platformFee = subtotal * (commissionPct / 100);
  const earnings = subtotal - platformFee;

  return { subtotal, platformFee, earnings };
}
