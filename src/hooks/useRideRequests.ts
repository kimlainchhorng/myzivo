import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type RideType = "standard" | "xl" | "premium";
export type RideRequestStatus = "new" | "contacted" | "assigned" | "en_route" | "completed" | "cancelled";

export interface RideRequest {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  pickup_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_address: string;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  ride_type: RideType;
  scheduled_at: string | null;
  notes: string | null;
  status: RideRequestStatus;
  assigned_driver_id: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  // Payment fields
  quoted_total: number | null;
  quoted_distance_miles: number | null;
  quoted_duration_minutes: number | null;
  stripe_payment_intent_id: string | null;
  payment_status: "pending" | "paid" | "failed" | null;
  refund_status: "requested" | "refunded" | null;
  refunded_at: string | null;
}

export interface CreateRideRequestInput {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  pickup_address: string;
  pickup_lat?: number | null;
  pickup_lng?: number | null;
  dropoff_address: string;
  dropoff_lat?: number | null;
  dropoff_lng?: number | null;
  ride_type: RideType;
  scheduled_at?: string | null;
  notes?: string | null;
}

const SUPABASE_URL = 'https://slirphzzwcogdbkeicff.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI';

// Hook for submitting a new ride request (public)
export function useCreateRideRequest() {
  return useMutation({
    mutationFn: async (input: CreateRideRequestInput) => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/ride_requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            customer_name: input.customer_name,
            customer_phone: input.customer_phone,
            customer_email: input.customer_email,
            pickup_address: input.pickup_address,
            pickup_lat: input.pickup_lat || null,
            pickup_lng: input.pickup_lng || null,
            dropoff_address: input.dropoff_address,
            dropoff_lat: input.dropoff_lat || null,
            dropoff_lng: input.dropoff_lng || null,
            ride_type: input.ride_type,
            scheduled_at: input.scheduled_at || null,
            notes: input.notes || null,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create ride request');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Ride request submitted successfully!");
    },
    onError: (error: Error) => {
      console.error("Error creating ride request:", error);
      toast.error("Failed to submit ride request. Please try again.");
    },
  });
}

// Hook for fetching all ride requests (admin only)
export function useRideRequests(statusFilter?: RideRequestStatus | "all") {
  return useQuery({
    queryKey: ["ride-requests", statusFilter],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      let url = `${SUPABASE_URL}/rest/v1/ride_requests?order=created_at.desc`;
      
      if (statusFilter && statusFilter !== "all") {
        url += `&status=eq.${statusFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ride requests');
      }

      return await response.json() as RideRequest[];
    },
  });
}

// Hook for updating a ride request (admin only)
export function useUpdateRideRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<RideRequest>;
    }) => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/ride_requests?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update ride request');
      }

      const data = await response.json();

      // Send driver notification if driver was assigned
      if (updates.assigned_driver_id && token) {
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/send-driver-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              driver_id: updates.assigned_driver_id,
              title: 'New Ride Assigned',
              body: 'You have a new ride request',
              data: { type: 'ride_request', ride_id: id },
            }),
          });
        } catch (e) {
          console.warn('Failed to send driver notification:', e);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ride-requests"] });
      toast.success("Ride request updated");
    },
    onError: (error: Error) => {
      console.error("Error updating ride request:", error);
      toast.error("Failed to update ride request");
    },
  });
}
