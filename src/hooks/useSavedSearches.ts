/**
 * Saved Searches Hook
 * Manages user saved searches with price alerts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SavedSearch, CreateSavedSearchInput, ServiceType } from "@/types/personalization";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

const QUERY_KEY = "saved-searches";

export function useSavedSearches(serviceType?: ServiceType) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch saved searches
  const { data: searches = [], isLoading } = useQuery({
    queryKey: [QUERY_KEY, user?.id, serviceType],
    queryFn: async (): Promise<SavedSearch[]> => {
      if (!user?.id) return [];

      let query = supabase
        .from("user_saved_searches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (serviceType) {
        query = query.eq("service_type", serviceType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching saved searches:", error);
        return [];
      }

      return (data || []).map((item) => ({
        id: item.id,
        user_id: item.user_id,
        service_type: item.service_type as ServiceType,
        title: item.title,
        search_params: item.search_params as SavedSearch["search_params"],
        price_alert_enabled: item.price_alert_enabled,
        target_price: item.target_price,
        current_price: item.current_price,
        last_price_check_at: item.last_price_check_at,
        notification_email: item.notification_email,
        notification_push: item.notification_push,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    },
    enabled: !!user?.id,
  });

  // Save a search
  const saveSearch = useMutation({
    mutationFn: async (input: CreateSavedSearchInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase.from("user_saved_searches").insert({
        user_id: user.id,
        service_type: input.service_type,
        title: input.title,
        search_params: input.search_params as unknown as Json,
        price_alert_enabled: input.price_alert_enabled ?? false,
        target_price: input.target_price,
        notification_email: input.notification_email ?? true,
        notification_push: input.notification_push ?? false,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Search saved");
    },
    onError: (error) => {
      console.error("Failed to save search:", error);
      toast.error("Failed to save search");
    },
  });

  // Delete a saved search
  const deleteSearch = useMutation({
    mutationFn: async (searchId: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_saved_searches")
        .delete()
        .eq("id", searchId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Search removed");
    },
    onError: (error) => {
      console.error("Failed to delete search:", error);
      toast.error("Failed to remove search");
    },
  });

  // Toggle price alert
  const togglePriceAlert = useMutation({
    mutationFn: async ({ searchId, enabled, targetPrice }: { 
      searchId: string; 
      enabled: boolean; 
      targetPrice?: number;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_saved_searches")
        .update({
          price_alert_enabled: enabled,
          target_price: targetPrice,
        })
        .eq("id", searchId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(enabled ? "Price alert enabled" : "Price alert disabled");
    },
    onError: (error) => {
      console.error("Failed to toggle alert:", error);
      toast.error("Failed to update alert");
    },
  });

  return {
    searches,
    isLoading,
    saveSearch: saveSearch.mutate,
    isSaving: saveSearch.isPending,
    deleteSearch: deleteSearch.mutate,
    isDeleting: deleteSearch.isPending,
    togglePriceAlert: togglePriceAlert.mutate,
    isTogglingAlert: togglePriceAlert.isPending,
  };
}
