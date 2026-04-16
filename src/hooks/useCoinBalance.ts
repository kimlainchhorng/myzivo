/**
 * useCoinBalance — real Z Coin wallet hook backed by Supabase.
 *
 * - Reads the signed-in user's balance from `user_coin_balances`
 * - Subscribes via Realtime so the badge updates live when gifts are sent
 * - Exposes `recharge(amount)` and `refresh()` helpers
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useCoinBalance() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setBalance(0);
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any)
      .from("user_coin_balances")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    setBalance(data?.balance ?? 0);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
    if (!user?.id) return;
    const ch = supabase
      .channel(`coin-balance-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_coin_balances", filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          const next = payload.new?.balance;
          if (typeof next === "number") setBalance(next);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user?.id, refresh]);

  const recharge = useCallback(async (amount: number) => {
    const { data, error } = await (supabase as any).rpc("recharge_coins", { amount });
    if (error) throw error;
    if (typeof data === "number") setBalance(data);
    return data as number;
  }, []);

  return { balance, loading, recharge, refresh };
}
