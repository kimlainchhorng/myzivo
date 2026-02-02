/**
 * Owner Activity Hook
 * Fetches and unifies recent activity for car owners (bookings, payouts, reviews)
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { P2PBookingStatus, P2PPayoutStatus } from "@/types/p2p";

export type OwnerActivityType = 
  | "booking_request"
  | "booking_confirmed"
  | "trip_started"
  | "trip_completed"
  | "payout"
  | "review";

export interface OwnerActivityItem {
  id: string;
  type: OwnerActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    vehicleName?: string;
    amount?: number;
    rating?: number;
    bookingId?: string;
  };
}

function getActivityTypeFromBookingStatus(status: P2PBookingStatus): OwnerActivityType {
  switch (status) {
    case "pending":
      return "booking_request";
    case "confirmed":
      return "booking_confirmed";
    case "active":
      return "trip_started";
    case "completed":
      return "trip_completed";
    default:
      return "booking_request";
  }
}

function getActivityTitle(type: OwnerActivityType): string {
  switch (type) {
    case "booking_request":
      return "New booking request";
    case "booking_confirmed":
      return "Booking confirmed";
    case "trip_started":
      return "Trip started";
    case "trip_completed":
      return "Trip completed";
    case "payout":
      return "Payout received";
    case "review":
      return "New review received";
  }
}

export function useOwnerActivity(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["ownerActivity", ownerId],
    queryFn: async (): Promise<OwnerActivityItem[]> => {
      if (!ownerId) return [];

      // Fetch bookings, payouts, and reviews in parallel
      const [bookingsResult, payoutsResult, reviewsResult] = await Promise.all([
        supabase
          .from("p2p_bookings")
          .select(`
            id,
            status,
            created_at,
            updated_at,
            total_amount,
            vehicle:p2p_vehicles(make, model, year)
          `)
          .eq("owner_id", ownerId)
          .order("updated_at", { ascending: false })
          .limit(10),
        supabase
          .from("p2p_payouts")
          .select("id, amount, status, created_at, processed_at")
          .eq("owner_id", ownerId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("p2p_reviews")
          .select("id, rating, comment, created_at, review_type")
          .eq("reviewee_id", ownerId)
          .eq("review_type", "renter_to_owner")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const activities: OwnerActivityItem[] = [];

      // Transform bookings to activity items
      if (bookingsResult.data) {
        for (const booking of bookingsResult.data) {
          const vehicle = booking.vehicle as { make: string; model: string; year: number } | null;
          const vehicleName = vehicle
            ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
            : "Vehicle";

          const activityType = getActivityTypeFromBookingStatus(booking.status as P2PBookingStatus);
          
          activities.push({
            id: `booking-${booking.id}`,
            type: activityType,
            title: getActivityTitle(activityType),
            description: vehicleName,
            timestamp: booking.updated_at || booking.created_at,
            metadata: {
              vehicleName,
              amount: booking.total_amount,
              bookingId: booking.id,
            },
          });
        }
      }

      // Transform payouts to activity items
      if (payoutsResult.data) {
        for (const payout of payoutsResult.data) {
          if (payout.status === "completed" || payout.status === "processing") {
            activities.push({
              id: `payout-${payout.id}`,
              type: "payout",
              title: getActivityTitle("payout"),
              description: `$${payout.amount.toFixed(2)} ${payout.status === "processing" ? "(processing)" : "deposited"}`,
              timestamp: payout.processed_at || payout.created_at,
              metadata: {
                amount: payout.amount,
              },
            });
          }
        }
      }

      // Transform reviews to activity items
      if (reviewsResult.data) {
        for (const review of reviewsResult.data) {
          activities.push({
            id: `review-${review.id}`,
            type: "review",
            title: getActivityTitle("review"),
            description: `${review.rating} star${review.rating !== 1 ? "s" : ""}${review.comment ? ` - "${review.comment.slice(0, 50)}..."` : ""}`,
            timestamp: review.created_at,
            metadata: {
              rating: review.rating,
            },
          });
        }
      }

      // Sort all activities by timestamp DESC
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return activities.slice(0, 15); // Return top 15 most recent
    },
    enabled: !!ownerId,
  });
}
