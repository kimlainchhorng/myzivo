/** Cross-app auth stub */
import { useState } from "react";

export function useExchangeAuthToken() {
  const [isExchanging] = useState(false);
  const [error] = useState<string | null>(null);

  const exchangeToken = async (_token: string): Promise<string | null> => {
    return null;
  };

  return { exchangeToken, isExchanging, error };
}
