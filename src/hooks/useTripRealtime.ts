import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TripStatus } from "./useTrips";

const statusMessages: Record<TripStatus, { title: string; description: string; type: "info" | "success" | "warning" }> = {
  requested: { title: "Trip Requested", description: "Looking for a driver...", type: "info" },
  accepted: { title: "Driver Found!", description: "A driver has accepted your trip", type: "success" },
  en_route: { title: "Driver On The Way", description: "Your driver is heading to pickup", type: "info" },
  arrived: { title: "Driver Arrived", description: "Your driver is waiting at pickup", type: "success" },
  in_progress: { title: "Trip Started", description: "You're on your way!", type: "info" },
  completed: { title: "Trip Completed", description: "Thanks for riding with us!", type: "success" },
  cancelled: { title: "Trip Cancelled", description: "Your trip has been cancelled", type: "warning" },
};

export const useTripRealtime = (tripId: string | undefined, enabled: boolean = true) => {
  const queryClient = useQueryClient();

  const showNotification = useCallback((status: TripStatus) => {
    const message = statusMessages[status];
    if (!message) return;

    switch (message.type) {
      case "success":
        toast.success(message.title, { description: message.description });
        break;
      case "warning":
        toast.warning(message.title, { description: message.description });
        break;
      default:
        toast.info(message.title, { description: message.description });
    }
  }, []);

  useEffect(() => {
    if (!tripId || !enabled) return;

    const channel = supabase
      .channel(`trip-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trips",
          filter: `id=eq.${tripId}`,
        },
        (payload) => {
          const newStatus = payload.new.status as TripStatus;
          const oldStatus = payload.old?.status as TripStatus | undefined;

          // Only notify if status actually changed
          if (newStatus && newStatus !== oldStatus) {
            showNotification(newStatus);
          }

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["active-rider-trip"] });
          queryClient.invalidateQueries({ queryKey: ["trips"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, enabled, queryClient, showNotification]);
};

export const useRiderTripRealtime = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`rider-trips-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trips",
          filter: `rider_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const newStatus = payload.new.status as TripStatus;
            const oldStatus = payload.old?.status as TripStatus | undefined;

            if (newStatus && newStatus !== oldStatus) {
              const message = statusMessages[newStatus];
              if (message) {
                switch (message.type) {
                  case "success":
                    toast.success(message.title, { description: message.description });
                    break;
                  case "warning":
                    toast.warning(message.title, { description: message.description });
                    break;
                  default:
                    toast.info(message.title, { description: message.description });
                }
              }
            }
          }

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["active-rider-trip"] });
          queryClient.invalidateQueries({ queryKey: ["trips"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};

export const useDriverTripRealtime = (driverId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!driverId) return;

    const channel = supabase
      .channel(`driver-trips-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trips",
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            toast.info("New Trip Request", { description: "You have a new trip assignment" });
          } else if (payload.eventType === "UPDATE") {
            const newStatus = payload.new.status as TripStatus;
            if (newStatus === "cancelled") {
              toast.warning("Trip Cancelled", { description: "The rider cancelled the trip" });
            }
          }

          queryClient.invalidateQueries({ queryKey: ["driver-trips"] });
          queryClient.invalidateQueries({ queryKey: ["trips"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId, queryClient]);
};

// Hook for admins to monitor all trip changes
export const useAllTripsRealtime = (enabled: boolean = true) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel("all-trips")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trips",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["trips"] });
          queryClient.invalidateQueries({ queryKey: ["trip-stats"] });
          queryClient.invalidateQueries({ queryKey: ["active-trips-locations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
};
