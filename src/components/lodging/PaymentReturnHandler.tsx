/**
 * PaymentReturnHandler
 * --------------------
 * Mounted once at the app shell. Watches the URL for the redirect-back markers
 * dropped by create-lodging-paypal-order and create-lodging-square-checkout
 * (`?paypal_return=<reservation>` / `?square_return=<reservation>`).
 *
 *  - PayPal: invokes capture-lodging-paypal-order with the order_id (PayPal
 *    appends ?token=ORDER_ID to the return URL).
 *  - Square: realtime updates flow through the existing payment_status
 *    subscription on lodge_reservations once Square's webhook lands; this
 *    handler just clears the URL param and toasts a "verifying" status.
 *
 * The component renders nothing.
 */
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function PaymentReturnHandler() {
  const [params, setParams] = useSearchParams();
  const handledRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const paypalRes = params.get("paypal_return");
    const paypalCancelled = params.get("paypal_cancel");
    const paypalToken = params.get("token");
    const squareRes = params.get("square_return");

    if (paypalRes && paypalToken && !handledRef.current.has(paypalToken)) {
      handledRef.current.add(paypalToken);
      (async () => {
        const t = toast.loading("Confirming PayPal payment…");
        try {
          const { data, error } = await supabase.functions.invoke("capture-lodging-paypal-order", {
            body: { order_id: paypalToken },
          });
          if (error) throw error;
          if ((data as any)?.error) throw new Error((data as any).error);
          toast.success("Payment confirmed via PayPal", { id: t });
        } catch (e: any) {
          toast.error(e?.message || "PayPal capture failed", { id: t });
        } finally {
          // Clear the markers so a refresh doesn't retrigger.
          const next = new URLSearchParams(params);
          next.delete("paypal_return");
          next.delete("token");
          next.delete("PayerID");
          setParams(next, { replace: true });
        }
      })();
    }

    if (paypalCancelled && !handledRef.current.has(`cancel-${paypalCancelled}`)) {
      handledRef.current.add(`cancel-${paypalCancelled}`);
      toast.info("PayPal payment cancelled");
      const next = new URLSearchParams(params);
      next.delete("paypal_cancel");
      next.delete("token");
      setParams(next, { replace: true });
    }

    if (squareRes && !handledRef.current.has(`sq-${squareRes}`)) {
      handledRef.current.add(`sq-${squareRes}`);
      toast.info("Verifying Square payment…", { description: "We'll update your booking as soon as Square confirms." });
      const next = new URLSearchParams(params);
      next.delete("square_return");
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  return null;
}
