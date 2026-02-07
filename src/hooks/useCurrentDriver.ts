/**
 * useCurrentDriver Hook
 * Get the current authenticated user's driver profile
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CurrentDriver {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  is_online: boolean;
  is_verified: boolean;
  current_lat: number | null;
  current_lng: number | null;
  region_id: string | null;
}

export function useCurrentDriver() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["current-driver", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("drivers")
        .select("id, user_id, full_name, phone, email, is_online, is_verified, current_lat, current_lng, region_id")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }

      return data as CurrentDriver;
    },
    enabled: !!user?.id,
  });

  return {
    driver: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
