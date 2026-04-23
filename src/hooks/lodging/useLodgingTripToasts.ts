import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLodgingTripToasts(reservationId: string | undefined) {
  const readyRef = useRef(false);
  const qc = useQueryClient();

  useEffect(() => {
    if (!reservationId) return;
    readyRef.current = false;
    const timer = window.setTimeout(() => {
      readyRef.current = true;
    }, 1200);

    const show = (kind: "success" | "error" | "info", title: string, description?: string) => {
      if (!readyRef.current) return;
      toast[kind](title, description ? { description } : undefined);
    };

    const channel = supabase
      .channel(`lodge-trip-toasts-${reservationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "lodge_reservation_receipts", filter: `reservation_id=eq.${reservationId}` }, () => {
        qc.invalidateQueries({ queryKey: ["lodge-receipt-history", reservationId] });
        show("success", "Receipt ready", "Your PDF receipt was generated and saved to history.");
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "lodge_reservation_change_requests", filter: `reservation_id=eq.${reservationId}` }, (payload) => {
        const row = payload.new as any;
        qc.invalidateQueries({ queryKey: ["lodge-change-requests", reservationId] });
        if (row.type === "addon" && row.status === "auto_approved") show("success", "Add-on charge successful", "Your reservation total has been updated.");
        if (row.type === "addon" && row.status === "failed") show("error", "Add-on charge failed", row.addon_payload?.failure_reason || "Your saved payment method was not charged.");
        if (row.type === "cancel") show("success", "Reservation cancelled", row.payment_status ? `Payment status: ${String(row.payment_status).replace(/_/g, " ")}` : undefined);
        if (row.type === "reschedule" && row.status === "auto_approved") show("success", "Dates updated", "Your new lodging dates are confirmed.");
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "lodge_reservation_change_requests", filter: `reservation_id=eq.${reservationId}` }, (payload) => {
        const row = payload.new as any;
        qc.invalidateQueries({ queryKey: ["lodge-change-requests", reservationId] });
        if (row.type === "reschedule" && row.status === "approved") show("success", "Date change approved", "Your lodging reservation has been updated.");
        if (row.type === "reschedule" && row.status === "declined") show("error", "Date change declined", row.host_response || "Your original dates are unchanged.");
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "lodge_reservations", filter: `id=eq.${reservationId}` }, (payload) => {
        const row = payload.new as any;
        qc.invalidateQueries({ queryKey: ["lodge-reservation-full", reservationId] });
        const status = String(row.payment_status || "");
        if (status === "refund_pending") show("info", "Refund pending", "The refund is being processed to the saved payment method.");
        if (status === "refunded") show("success", "Refund complete", "The saved payment method refund is complete.");
        if (status === "failed") show("error", "Payment update failed", "Please check your saved payment method.");
      })
      .subscribe();

    return () => {
      window.clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [reservationId, qc]);
}
