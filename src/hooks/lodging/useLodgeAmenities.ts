/**
 * useLodgeAmenities - amenities flags + policies (single row per store).
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LodgeAmenities {
  id: string;
  store_id: string;
  amenities: Record<string, boolean>;
  policies: Record<string, string>;
  updated_at: string;
}

export function useLodgeAmenities(storeId: string) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["lodge-amenities", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lodge_amenities" as any)
        .select("*")
        .eq("store_id", storeId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as LodgeAmenities | null;
    },
    enabled: !!storeId,
  });

  const save = useMutation({
    mutationFn: async ({ amenities, policies }: { amenities: Record<string, boolean>; policies: Record<string, string> }) => {
      const { error } = await supabase
        .from("lodge_amenities" as any)
        .upsert({ store_id: storeId, amenities, policies } as any, { onConflict: "store_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lodge-amenities", storeId] }),
  });

  return { ...list, save };
}
