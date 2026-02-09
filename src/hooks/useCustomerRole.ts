import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to check if the current user has the 'customer' role
 * Used for role-based access control in customer-facing features
 */
export function useCustomerRole() {
  const { user } = useAuth();

  const { data: isCustomer, isLoading } = useQuery({
    queryKey: ["customer-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "customer",
      });
      if (error) {
        console.error("Error checking customer role:", error);
        return false;
      }
      return data ?? false;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return { isCustomer: isCustomer ?? false, isLoading };
}
