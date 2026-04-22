/**
 * useLodgeRooms - CRUD for lodge_rooms (room types & rates).
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LodgeRoom {
  id: string;
  store_id: string;
  name: string;
  room_type: string | null;
  beds: string | null;
  max_guests: number;
  size_sqm: number | null;
  units_total: number;
  base_rate_cents: number;
  weekend_rate_cents: number;
  weekly_discount_pct: number;
  monthly_discount_pct: number;
  breakfast_included: boolean;
  amenities: string[];
  photos: any[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useLodgeRooms(storeId: string) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["lodge-rooms", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lodge_rooms" as any)
        .select("*")
        .eq("store_id", storeId)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as LodgeRoom[];
    },
    enabled: !!storeId,
  });

  const upsert = useMutation({
    mutationFn: async (room: Partial<LodgeRoom> & { store_id: string; name: string }) => {
      const payload: any = { ...room };
      if (payload.id) {
        const { error } = await supabase.from("lodge_rooms" as any).update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("lodge_rooms" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lodge-rooms", storeId] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lodge_rooms" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lodge-rooms", storeId] }),
  });

  return { ...list, upsert, remove };
}
