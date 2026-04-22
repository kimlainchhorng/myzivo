/**
 * useHasStoreBooking
 * Returns true if the current authenticated user has at least one
 * confirmed/completed booking or order at the given store. Used to
 * gate customer-only contact actions (Call Store, Live Chat).
 *
 * Lodging match: lodge_reservations.guest_email = auth user email
 * Food match:    food_orders.user_id = auth user id
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
      const user = auth.user;
      if (!user || !storeId) return false;
      const email = (user.email || "").toLowerCase();

      const lodgeP = email
        ? (supabase as any)
            .from("lodge_reservations")
            .select("id")
            .eq("store_id", storeId)
            .ilike("guest_email", email)
            .in("status", LODGE_OK)
            .limit(1)
        : Promise.resolve({ data: null });

      const foodP = (supabase as any)
        .from("food_orders")
        .select("id")
        .eq("store_id", storeId)
        .eq("user_id", user.id)
        .in("status", FOOD_OK)
        .limit(1);

      const [lodge, food] = await Promise.all([lodgeP, foodP]);
      return !!((lodge?.data && lodge.data.length) || (food?.data && food.data.length));
    },
  });
}
