import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const LODGING_STORE_CATEGORIES = ["hotel", "resort", "guesthouse", "guesthouse / b&b", "b&b"];

export const isLodgingStoreCategory = (category?: string | null) =>
  LODGING_STORE_CATEGORIES.includes((category || "").toLowerCase().trim());

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
        .maybeSingle();
      if (error) throw error;
      return data ? { ...data, isLodging: isLodgingStoreCategory(data.category) } : null;
    },
    enabled: !!user,
  });
}