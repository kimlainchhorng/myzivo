/**
 * useLodgePropertyProfile - CRUD for lodge_property_profile (resort-level metadata).
 * One row per store_id.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HouseRules {
  quiet_hours?: string; // "22:00 - 07:00"
  parties_allowed?: boolean;
  smoking_zones?: string;
  min_age?: number;
  id_at_checkin?: boolean;
  security_deposit_cents?: number;
}

export interface NearbyDistance {
  label: string; // "Beach", "Airport"
  minutes?: number;
  km?: number;
  mode?: "walk" | "drive" | "boat";
}

export interface LodgePropertyProfile {
  id: string;
  store_id: string;
  languages: string[];
  facilities: string[];
  meal_plans: string[];
  house_rules: HouseRules;
  accessibility: string[];
  sustainability: string[];
  hero_badges: string[];
  included_highlights: string[];
  nearby: NearbyDistance[];
  created_at: string;
  updated_at: string;
}

const EMPTY: Omit<LodgePropertyProfile, "id" | "created_at" | "updated_at" | "store_id"> = {
  languages: [],
  facilities: [],
  meal_plans: [],
  house_rules: {},
  accessibility: [],
  sustainability: [],
  hero_badges: [],
  included_highlights: [],
  nearby: [],
};

export function useLodgePropertyProfile(storeId: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["lodge-property-profile", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lodge_property_profile" as any)
        .select("*")
        .eq("store_id", storeId)
        .maybeSingle();
      if (error && (error as any).code !== "PGRST116") throw error;
      return (data || null) as unknown as LodgePropertyProfile | null;
    },
    enabled: !!storeId,
  });

  const upsert = useMutation({
    mutationFn: async (patch: Partial<LodgePropertyProfile>) => {
      const payload: any = { store_id: storeId, ...EMPTY, ...(query.data || {}), ...patch };
      delete payload.created_at;
      delete payload.updated_at;
      const { error } = await supabase
        .from("lodge_property_profile" as any)
        .upsert(payload, { onConflict: "store_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lodge-property-profile", storeId] }),
  });

  return { ...query, upsert, defaults: EMPTY };
}
