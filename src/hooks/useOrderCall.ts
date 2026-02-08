/**
 * useOrderCall Hook
 * Manages masked phone calling for Eats orders
 */
import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CallRole = "customer" | "driver" | "merchant";

interface CallSession {
  session_id: string;
  proxy_number: string;
  expires_at: string;
  participants: {
    customer: { has_phone: boolean };
    driver: { has_phone: boolean };
    merchant: { has_phone: boolean };
  };
}

interface UseOrderCallOptions {
  orderId: string | undefined;
  myRole: CallRole;
  enabled?: boolean;
}

export function useOrderCall({ orderId, myRole, enabled = true }: UseOrderCallOptions) {
  const queryClient = useQueryClient();
  const [lastCallTime, setLastCallTime] = useState<number>(0);

  // Fetch or create call session
  const sessionQuery = useQuery({
    queryKey: ["call-session", orderId],
    queryFn: async (): Promise<CallSession | null> => {
      if (!orderId) return null;

      const { data, error } = await supabase.functions.invoke("eats-call-session", {
        body: { order_id: orderId },
      });

      if (error) {
        console.error("Failed to get call session:", error);
        return null;
      }

      return data as CallSession;
    },
    enabled: enabled && !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Start call mutation
  const startCallMutation = useMutation({
    mutationFn: async (toRole: CallRole) => {
      if (!orderId) throw new Error("No order ID");

      // Local rate limit check (prevent rapid clicking)
      const now = Date.now();
      if (now - lastCallTime < 10000) {
        throw new Error("Please wait a few seconds before calling again");
      }
      setLastCallTime(now);

      const { data, error } = await supabase.functions.invoke("eats-call-start", {
        body: {
          order_id: orderId,
          from_role: myRole,
          to_role: toRole,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to start call");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Call initiated! You'll receive a call shortly.", {
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      const message = error.message;
      
      if (message.includes("Rate limit")) {
        toast.error("Too many calls. Please wait a few minutes.", {
          duration: 5000,
        });
      } else if (message.includes("phone number")) {
        toast.error(message, { duration: 5000 });
      } else {
        toast.error("Failed to start call. Please try again.", {
          duration: 4000,
        });
      }
    },
  });

  // Start call helper
  const startCall = useCallback(
    (toRole: CallRole) => {
      if (!sessionQuery.data) {
        toast.error("Call session not ready. Please try again.");
        return;
      }

      // Check if target has phone
      const targetHasPhone = sessionQuery.data.participants[toRole]?.has_phone;
      if (!targetHasPhone) {
        toast.error(`No phone number available for ${toRole}.`);
        return;
      }

      startCallMutation.mutate(toRole);
    },
    [sessionQuery.data, startCallMutation]
  );

  // Refresh session
  const refreshSession = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["call-session", orderId] });
  }, [queryClient, orderId]);

  return {
    session: sessionQuery.data,
    isLoading: sessionQuery.isLoading,
    isSessionError: sessionQuery.isError,
    
    startCall,
    isStartingCall: startCallMutation.isPending,
    
    canCallCustomer: sessionQuery.data?.participants.customer.has_phone ?? false,
    canCallDriver: sessionQuery.data?.participants.driver?.has_phone ?? false,
    canCallMerchant: sessionQuery.data?.participants.merchant.has_phone ?? false,
    
    refreshSession,
  };
}
