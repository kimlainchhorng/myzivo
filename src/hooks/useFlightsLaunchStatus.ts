/**
 * Flights Launch Status Hooks
 * Read and update flights TEST/LIVE status with pre-launch checklist validation
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { 
  FlightsLaunchSettings, 
  FlightsLaunchChecklist,
  ChecklistItem,
  LAUNCH_CHECKLIST_ITEMS 
} from "@/types/flightsLaunch";

/**
 * Fetch current flights launch settings
 */
export function useFlightsLaunchSettings() {
  return useQuery({
    queryKey: ["flights-launch-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flights_launch_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;
      return data as unknown as FlightsLaunchSettings;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Check if current user can book flights
 * - Admins can always book (for testing)
 * - Public users can only book when status is 'live' AND not paused
 */
export function useFlightsCanBook() {
  const { data: settings, isLoading } = useFlightsLaunchSettings();
  const { isAdmin } = useAuth();

  const isTestMode = settings?.status === 'test';
  const isPaused = settings?.emergency_pause === true;
  
  // Admins can always book (for testing), public users only when live
  const canBook = (isAdmin || settings?.status === 'live') && !isPaused;

  return {
    canBook,
    isTestMode,
    isLiveMode: settings?.status === 'live',
    isPaused,
    pauseReason: settings?.emergency_pause_reason,
    isLoading,
    settings,
  };
}

/**
 * Update a checklist item
 */
export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      settingsId, 
      key, 
      value 
    }: { 
      settingsId: string; 
      key: keyof FlightsLaunchChecklist; 
      value: boolean;
    }) => {
      const { error } = await supabase
        .from("flights_launch_settings")
        .update({
          [key]: value,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settingsId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flights-launch-settings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update checklist");
    },
  });
}

/**
 * Go LIVE - switch from TEST to LIVE mode
 */
export function useGoLive() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (settingsId: string) => {
      const { error } = await supabase
        .from("flights_launch_settings")
        .update({
          status: 'live',
          status_changed_at: new Date().toISOString(),
          status_changed_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settingsId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flights-launch-settings"] });
      toast.success("🚀 ZIVO Flights is now LIVE!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to go live");
    },
  });
}

/**
 * Toggle emergency pause
 */
export function useEmergencyPause() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      settingsId, 
      pause, 
      reason 
    }: { 
      settingsId: string; 
      pause: boolean; 
      reason?: string;
    }) => {
      const { error } = await supabase
        .from("flights_launch_settings")
        .update({
          emergency_pause: pause,
          emergency_pause_reason: pause ? reason : null,
          emergency_pause_at: pause ? new Date().toISOString() : null,
          emergency_pause_by: pause ? user?.id : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settingsId);

      if (error) throw error;
    },
    onSuccess: (_, { pause }) => {
      queryClient.invalidateQueries({ queryKey: ["flights-launch-settings"] });
      toast[pause ? 'warning' : 'success'](
        pause ? "⚠️ Flight bookings paused" : "✅ Flight bookings resumed"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update pause status");
    },
  });
}

/**
 * Validate pre-launch checklist
 * Returns ready state and list of blockers
 */
export function validateLaunchChecklist(settings: FlightsLaunchSettings | undefined): {
  ready: boolean;
  checklist: { item: string; key: keyof FlightsLaunchChecklist; done: boolean }[];
  blockers: string[];
} {
  if (!settings) {
    return { ready: false, checklist: [], blockers: ['Settings not loaded'] };
  }

  const checklist: { item: string; key: keyof FlightsLaunchChecklist; done: boolean }[] = [
    { item: 'Seller of Travel page verified', key: 'seller_of_travel_verified', done: settings.seller_of_travel_verified },
    { item: 'Terms & Privacy linked', key: 'terms_privacy_linked', done: settings.terms_privacy_linked },
    { item: 'Support email configured', key: 'support_email_configured', done: settings.support_email_configured },
    { item: 'Stripe LIVE enabled', key: 'stripe_live_enabled', done: settings.stripe_live_enabled },
    { item: 'Duffel LIVE configured', key: 'duffel_live_configured', done: settings.duffel_live_configured },
  ];

  const blockers = checklist.filter(c => !c.done).map(c => c.item);

  return {
    ready: blockers.length === 0,
    checklist,
    blockers,
  };
}
