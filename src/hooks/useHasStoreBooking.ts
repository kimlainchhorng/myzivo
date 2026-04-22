/**
 * useHasStoreBooking
 * Returns true if the current authenticated user has at least one
 * confirmed/completed booking or order at the given store. Used to
 * gate customer-only contact actions (Call Store, Live Chat).
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const LODGE_OK = ["confirmed", "checked_in", "checked_out", "completed"];
const FOOD_OK = ["delivered", "completed", "ready", "preparing", "confirmed"];

export function useHasStoreBooking(storeId: string | undefined) {
  return useQuery({
    queryKey: ["has-store-booking", storeId],
    enabled: !!storeId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid || !storeId) return false;

      const [lodge, food] = await Promise.all([
        supabase
          .from("lodge_reservations")
          .select("id")
          .eq("store_id", storeId)
          .eq("guest_user_id", uid)
          .in("status", LODGE_OK as any)
          .limit(1)
          .maybeSingle(),
        supabase
          .from("food_orders")
          .select("id")
          .eq("store_id", storeId)
          .eq("user_id", uid)
          .in("status", FOOD_OK as any)
          .limit(1)
          .maybeSingle(),
      ]);

      return !!(lodge.data || food.data);
    },
  });
}
