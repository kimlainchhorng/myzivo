/**
 * Hook to check if current user has merchant role
 * Uses user_roles table (not profile) to avoid privilege escalation
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useMerchantRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["merchant-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return { isMerchant: false, restaurantId: null };

      // Check user_roles for merchant role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "merchant")
        .maybeSingle();

      if (roleError) {
        console.error("Error checking merchant role:", roleError);
        return { isMerchant: false, restaurantId: null };
      }

      const isMerchant = !!roleData;

      // If merchant, also get their restaurant ID
      let restaurantId: string | null = null;
      if (isMerchant) {
        const { data: restaurantData } = await supabase
          .from("restaurants")
          .select("id")
          .eq("owner_id", user.id)
          .maybeSingle();

        restaurantId = restaurantData?.id ?? null;
      }

      return { isMerchant, restaurantId };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
