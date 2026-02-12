/**
 * useDriverRatingAlerts Hook
 * Realtime low-rating detection and toast notifications for drivers
 */

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDriverRatingAlerts = (driverId?: string) => {
  const prevAvgRef = useRef<number | null>(null);

  useEffect(() => {
    if (!driverId) return;

    const channel = supabase
      .channel(`driver-rating-alerts-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trips",
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          const newData = payload.new as { rating?: number; status?: string };
          const oldData = payload.old as { rating?: number };

          // Only react when a rating is newly set
          if (newData.rating && !oldData.rating) {
            if (newData.rating === 5) {
              toast.success("⭐ You received a 5-star rating!", {
                description: "Keep up the great work!",
              });
            } else if (newData.rating <= 2) {
              toast.warning("Low rating received", {
                description: `A passenger rated you ${newData.rating} star${newData.rating > 1 ? "s" : ""}. Check your ratings dashboard for details.`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId]);
};
