/** Order actions — cancel, resend confirmation via Supabase */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useOrderActions() {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const cancelOrder = useCallback(async (orderId: string) => {
    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from("food_orders")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() } as any)
        .eq("id", orderId);
      if (error) throw error;
      toast.success("Order cancelled");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  }, []);

  const resendConfirmation = useCallback(async (orderId: string) => {
    setIsResending(true);
    try {
      await supabase.functions.invoke("send-order-confirmation", {
        body: { order_id: orderId },
      });
      toast.success("Confirmation resent");
    } catch {
      toast.error("Failed to resend confirmation");
    } finally {
      setIsResending(false);
    }
  }, []);

  return { cancelOrder, isCancelling, resendConfirmation, isResending };
}
