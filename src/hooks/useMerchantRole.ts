/** Merchant role — checks if user owns a restaurant */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useMerchantRole() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["merchant-role", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return {
    isMerchant: !!query.data,
    isLoading: query.isLoading,
    merchantId: query.data?.id || null,
    data: query.data,
  };
}
