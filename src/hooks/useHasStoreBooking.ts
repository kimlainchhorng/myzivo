/**
 * useHasStoreBooking
 * Returns whether the current authenticated user has at least one
 * confirmed/completed booking or order at the given store.
 *
 * Match surface (any of):
 *   Lodge: guest_user_id = auth.uid()  OR  guest_email ILIKE auth.email
 *   Food:  user_id = auth.uid()        OR  customer_email ILIKE auth.email
 *
 * All branches run in parallel via Promise.allSettled so one failing
 * branch (schema drift) does not break the whole check.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const LODGE_OK = ["confirmed", "checked_in", "checked_out", "completed"];
const FOOD_OK = ["delivered", "completed", "ready", "preparing", "confirmed"];

export type StoreBookingSource =
  | "lodge_reservation"
  | "food_order"
  | null;

export interface HasStoreBookingResult {
  hasBooking: boolean;
  source: StoreBookingSource;
}

const ok = (r: PromiseSettledResult<any>) =>
  r.status === "fulfilled" && Array.isArray(r.value?.data) && r.value.data.length > 0;

export function useHasStoreBooking(storeId: string | undefined) {
  return useQuery<HasStoreBookingResult>({
    queryKey: ["has-store-booking", storeId],
    enabled: !!storeId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user || !storeId) return { hasBooking: false, source: null };
      const email = (user.email || "").toLowerCase();

      const sb: any = supabase;

      const lodgeByUser = sb
        .from("lodge_reservations")
        .select("id")
        .eq("store_id", storeId)
        .eq("guest_user_id", user.id)
        .in("status", LODGE_OK)
        .limit(1);

      const lodgeByEmail = email
        ? sb
            .from("lodge_reservations")
            .select("id")
            .eq("store_id", storeId)
            .ilike("guest_email", email)
            .in("status", LODGE_OK)
            .limit(1)
        : Promise.resolve({ data: [] });

      const foodByUser = sb
        .from("food_orders")
        .select("id")
        .eq("store_id", storeId)
        .eq("user_id", user.id)
        .in("status", FOOD_OK)
        .limit(1);

      const foodByEmail = email
        ? sb
            .from("food_orders")
            .select("id")
            .eq("store_id", storeId)
            .ilike("customer_email", email)
            .in("status", FOOD_OK)
            .limit(1)
        : Promise.resolve({ data: [] });

      const [lU, lE, fU, fE] = await Promise.allSettled([
        lodgeByUser,
        lodgeByEmail,
        foodByUser,
        foodByEmail,
      ]);

      if (ok(lU) || ok(lE)) return { hasBooking: true, source: "lodge_reservation" };
      if (ok(fU) || ok(fE)) return { hasBooking: true, source: "food_order" };
      return { hasBooking: false, source: null };
    },
  });
}
