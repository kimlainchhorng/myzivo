import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const LODGING_STORE_CATEGORIES = ["hotel", "hotels", "resort", "resorts", "guesthouse", "guest house", "guesthouse / b&b", "bed and breakfast", "b&b"];

export const isLodgingStoreCategory = (category?: string | null) =>
  LODGING_STORE_CATEGORIES.includes((category || "").toLowerCase().replace(/\s+/g, " ").trim());

export function useOwnerStoreProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["owner-store-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("store_profiles")
        .select("id, name, category, logo_url, setup_complete, owner_id")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const stores = (data || []).map((store) => ({ ...store, isLodging: isLodgingStoreCategory(store.category) }));
      return stores.find((store) => store.isLodging) || stores[0] || null;
    },
    enabled: !!user,
  });
}