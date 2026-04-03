/**
 * ZIVO+ Subscription Context
 * Checks Stripe for active ZIVO+ membership and provides status across the app.
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ZivoPlusPlan = "monthly" | "chat" | "annual" | null;

interface ZivoPlusState {
  isPlus: boolean;
  plan: ZivoPlusPlan;
  subscriptionEnd: string | null;
  subscriptionId: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const ZivoPlusContext = createContext<ZivoPlusState>({
  isPlus: false,
  plan: null,
  subscriptionEnd: null,
  subscriptionId: null,
  isLoading: true,
  refresh: async () => {},
});

export const useZivoPlus = () => useContext(ZivoPlusContext);

export function ZivoPlusProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [isPlus, setIsPlus] = useState(false);
  const [plan, setPlan] = useState<ZivoPlusPlan>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!user || !session) {
      setIsPlus(false);
      setPlan(null);
      setSubscriptionEnd(null);
      setSubscriptionId(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-zivo-plus");
      if (error) throw error;

      setIsPlus(data?.subscribed ?? false);
      setPlan(data?.plan ?? null);
      setSubscriptionEnd(data?.subscription_end ?? null);
      setSubscriptionId(data?.subscription_id ?? null);
    } catch (err) {
      console.error("[ZivoPlus] Check failed:", err);
      setIsPlus(false);
      setPlan(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, session]);

  // Check on login and periodically
  useEffect(() => {
    checkSubscription();
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  return (
    <ZivoPlusContext.Provider
      value={{ isPlus, plan, subscriptionEnd, subscriptionId, isLoading, refresh: checkSubscription }}
    >
      {children}
    </ZivoPlusContext.Provider>
  );
}
