import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SetupStatus = {
  isComplete: boolean;
  profile: {
    id: string;
    full_name: string | null;
    phone: string | null;
    setup_complete: boolean;
    email_verified: boolean | null;
  } | null;
};

export const useSetupStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["setupStatus", user?.id],
    queryFn: async (): Promise<SetupStatus> => {
      if (!user?.id) {
        return { isComplete: false, profile: null };
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, setup_complete, email_verified")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching setup status:", error);
        throw error;
      }

      // If no profile exists yet, setup is not complete
      if (!data) {
        return { isComplete: false, profile: null };
      }

      return {
        isComplete: data.setup_complete === true,
        profile: data,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
