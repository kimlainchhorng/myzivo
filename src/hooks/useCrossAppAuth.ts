/** Cross-app auth — exchanges tokens via edge function */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useExchangeAuthToken() {
  const [isExchanging, setIsExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exchangeToken = async (token: string): Promise<string | null> => {
    setIsExchanging(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("exchange-auth-token", {
        body: { token },
      });
      if (fnError) throw fnError;
      return data?.session_token || null;
    } catch (err: any) {
      setError(err.message || "Token exchange failed");
      return null;
    } finally {
      setIsExchanging(false);
    }
  };

  return { exchangeToken, isExchanging, error };
}
