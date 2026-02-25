/** Create order stub */
import { useState, useCallback } from "react";

export interface HolderInfo {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  [key: string]: any;
}

export function useCreateOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(async (..._args: any[]) => {
    setIsLoading(true);
    try {
      throw new Error("Order creation not implemented");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createOrder, isLoading, error };
}
