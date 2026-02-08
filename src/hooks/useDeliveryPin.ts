/**
 * Delivery PIN Hook
 * Verify delivery PIN with attempt tracking and fraud signal logging
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VerifyPinParams {
  orderId: string;
  driverId: string;
  pin: string;
}

interface VerifyPinResult {
  success: boolean;
  error_message: string | null;
  attempts_remaining: number;
}

export function useDeliveryPin() {
  const queryClient = useQueryClient();

  const verifyPin = useMutation({
    mutationFn: async ({ orderId, driverId, pin }: VerifyPinParams): Promise<VerifyPinResult> => {
      // Call the RPC function to verify PIN
      const { data, error } = await supabase.rpc("verify_delivery_pin", {
        p_order_id: orderId,
        p_driver_id: driverId,
        p_pin: pin,
      });

      if (error) {
        throw new Error(error.message);
      }

      // The RPC returns an array, get the first result
      const result = data?.[0] || { success: false, error_message: "Unknown error", attempts_remaining: 0 };
      
      return {
        success: result.success,
        error_message: result.error_message,
        attempts_remaining: result.attempts_remaining,
      };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Delivery confirmed! Great job!");
        queryClient.invalidateQueries({ queryKey: ["driver-eats-orders"] });
      }
    },
    onError: (error) => {
      toast.error(`Verification failed: ${error.message}`);
    },
  });

  return { verifyPin };
}
