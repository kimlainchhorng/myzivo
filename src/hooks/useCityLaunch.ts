/**
 * City Launch Checklist Hooks
 * Data fetching and mutations for the P2P city launch system
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  LaunchCity,
  LaunchCityWithChecklist,
  LaunchChecklist,
  CitySupplyStats,
  ChecklistSectionStatus,
  CreateCityFormData,
  UpdateChecklistFormData,
  LaunchStatus,
} from "@/types/cityLaunch";

// Fetch all launch cities with their checklists
export function useLaunchCities() {
  return useQuery({
    queryKey: ["launchCities"],
    queryFn: async (): Promise<LaunchCityWithChecklist[]> => {
      const { data: cities, error: citiesError } = await supabase
        .from("p2p_launch_cities")
        .select("*")
        .order("name", { ascending: true });

      if (citiesError) throw citiesError;

      const { data: checklists, error: checklistsError } = await supabase
        .from("p2p_launch_checklists")
        .select("*");

      if (checklistsError) throw checklistsError;

      return (cities || []).map((city) => ({
        ...city,
        checklist: checklists?.find((c) => c.city_id === city.id) || null,
      }));
    },
  });
}

// Fetch single city with checklist
export function useCityChecklist(cityId: string | null) {
  return useQuery({
    queryKey: ["cityChecklist", cityId],
    queryFn: async (): Promise<LaunchCityWithChecklist | null> => {
      if (!cityId) return null;

      const { data: city, error: cityError } = await supabase
        .from("p2p_launch_cities")
        .select("*")
        .eq("id", cityId)
        .single();

      if (cityError) throw cityError;

      const { data: checklist, error: checklistError } = await supabase
        .from("p2p_launch_checklists")
        .select("*")
        .eq("city_id", cityId)
        .single();

      if (checklistError && checklistError.code !== "PGRST116") {
        throw checklistError;
      }

      return { ...city, checklist: checklist || null };
    },
    enabled: !!cityId,
  });
}

// Fetch supply stats for a city
export function useCitySupplyStats(cityName: string, state: string, minOwners = 5, minVehicles = 10) {
  return useQuery({
    queryKey: ["citySupplyStats", cityName, state],
    queryFn: async (): Promise<CitySupplyStats> => {
      // Count approved owners in this city
      const { count: ownersCount } = await supabase
        .from("car_owner_profiles")
        .select("*", { count: "exact", head: true })
        .ilike("city", `%${cityName}%`)
        .eq("state", state)
        .eq("status", "verified");

      // Count approved vehicles in this city
      const { count: vehiclesCount } = await supabase
        .from("p2p_vehicles")
        .select("*", { count: "exact", head: true })
        .ilike("location_city", `%${cityName}%`)
        .eq("location_state", state)
        .eq("approval_status", "approved");

      const approvedOwners = ownersCount || 0;
      const approvedVehicles = vehiclesCount || 0;

      return {
        approvedOwners,
        approvedVehicles,
        minOwners,
        minVehicles,
        ownersMet: approvedOwners >= minOwners,
        vehiclesMet: approvedVehicles >= minVehicles,
      };
    },
    enabled: !!cityName && !!state,
  });
}

// Calculate checklist section completion
export function calculateChecklistStatus(
  checklist: LaunchChecklist | null,
  supplyStats: CitySupplyStats | null
): ChecklistSectionStatus {
  if (!checklist) {
    return {
      legal: { complete: 0, total: 5, isComplete: false },
      insurance: { complete: 0, total: 1, isComplete: false },
      payments: { complete: 0, total: 4, isComplete: false },
      supply: { isComplete: false },
      operations: { complete: 0, total: 4, isComplete: false },
      support: { complete: 0, total: 1, isComplete: false },
      allComplete: false,
      sectionsComplete: 0,
      totalSections: 6,
    };
  }

  // Legal section (5 items)
  const legalItems = [
    checklist.legal_renter_terms,
    checklist.legal_owner_terms,
    checklist.legal_insurance_disclosure,
    checklist.legal_damage_policy,
    checklist.legal_privacy_policy,
  ];
  const legalComplete = legalItems.filter(Boolean).length;
  const legalIsComplete = legalComplete === 5;

  // Insurance section (1 required: insurance_active)
  const insuranceIsComplete = !!checklist.insurance_active;

  // Payments section (4 items)
  const paymentItems = [
    checklist.payments_stripe_active,
    checklist.payments_connect_enabled,
    checklist.payments_test_payment,
    checklist.payments_test_payout,
  ];
  const paymentComplete = paymentItems.filter(Boolean).length;
  const paymentIsComplete = paymentComplete === 4;

  // Supply section (from stats)
  const supplyIsComplete = supplyStats?.ownersMet && supplyStats?.vehiclesMet;

  // Operations section (4 items)
  const opsItems = [
    checklist.ops_dispute_tested,
    checklist.ops_damage_tested,
    checklist.ops_cancellation_tested,
    checklist.ops_payout_delay_tested,
  ];
  const opsComplete = opsItems.filter(Boolean).length;
  const opsIsComplete = opsComplete === 4;

  // Support section (1 required: support_confirmed)
  const supportIsComplete = !!checklist.support_confirmed;

  const sections = [
    legalIsComplete,
    insuranceIsComplete,
    paymentIsComplete,
    supplyIsComplete,
    opsIsComplete,
    supportIsComplete,
  ];
  const sectionsComplete = sections.filter(Boolean).length;

  return {
    legal: { complete: legalComplete, total: 5, isComplete: legalIsComplete },
    insurance: { complete: insuranceIsComplete ? 1 : 0, total: 1, isComplete: insuranceIsComplete },
    payments: { complete: paymentComplete, total: 4, isComplete: paymentIsComplete },
    supply: { isComplete: !!supplyIsComplete },
    operations: { complete: opsComplete, total: 4, isComplete: opsIsComplete },
    support: { complete: supportIsComplete ? 1 : 0, total: 1, isComplete: supportIsComplete },
    allComplete: sectionsComplete === 6,
    sectionsComplete,
    totalSections: 6,
  };
}

// Create new city
export function useCreateLaunchCity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateCityFormData): Promise<LaunchCity> => {
      const { data: city, error } = await supabase
        .from("p2p_launch_cities")
        .insert({
          name: data.name,
          state: data.state,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return city;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["launchCities"] });
      toast.success("City added successfully");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.error("This city already exists");
      } else {
        toast.error("Failed to add city");
      }
    },
  });
}

// Update checklist
export function useUpdateCityChecklist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      cityId,
      updates,
    }: {
      cityId: string;
      updates: UpdateChecklistFormData;
    }): Promise<LaunchChecklist> => {
      const { data, error } = await supabase
        .from("p2p_launch_checklists")
        .update({
          ...updates,
          updated_by: user?.id,
        })
        .eq("city_id", cityId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { cityId }) => {
      queryClient.invalidateQueries({ queryKey: ["launchCities"] });
      queryClient.invalidateQueries({ queryKey: ["cityChecklist", cityId] });
      toast.success("Checklist updated");
    },
    onError: () => {
      toast.error("Failed to update checklist");
    },
  });
}

// Update city launch status
export function useUpdateCityStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cityId,
      status,
    }: {
      cityId: string;
      status: LaunchStatus;
    }): Promise<LaunchCity> => {
      const updates: Partial<LaunchCity> = {
        launch_status: status,
      };

      if (status === "live") {
        updates.launched_at = new Date().toISOString();
        updates.paused_at = null;
      } else if (status === "paused") {
        updates.paused_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("p2p_launch_cities")
        .update(updates)
        .eq("id", cityId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["launchCities"] });
      queryClient.invalidateQueries({ queryKey: ["cityChecklist", data.id] });
      
      const statusMessages: Record<LaunchStatus, string> = {
        draft: "City returned to draft",
        ready: "City marked as ready",
        live: "🚀 City is now LIVE!",
        paused: "City has been paused",
      };
      toast.success(statusMessages[data.launch_status as LaunchStatus]);
    },
    onError: () => {
      toast.error("Failed to update city status");
    },
  });
}

// Delete city
export function useDeleteLaunchCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cityId: string): Promise<void> => {
      const { error } = await supabase
        .from("p2p_launch_cities")
        .delete()
        .eq("id", cityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["launchCities"] });
      toast.success("City deleted");
    },
    onError: () => {
      toast.error("Failed to delete city");
    },
  });
}
