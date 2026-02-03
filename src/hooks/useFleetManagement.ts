/**
 * Fleet Management Hooks
 * Manage fleet profiles, teams, vehicles, and pricing rules
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FleetOwnerProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type: "sole_proprietor" | "llc" | "corporation" | "partnership";
  tax_id: string | null;
  business_license: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  status: "pending" | "approved" | "suspended" | "rejected";
  approved_at: string | null;
  rejection_reason: string | null;
  custom_commission_percent: number | null;
  stripe_account_id: string | null;
  stripe_payouts_enabled: boolean;
  default_daily_rate: number | null;
  default_min_rental_days: number;
  default_max_rental_days: number;
  default_deposit_amount: number;
  default_cancellation_policy: string;
  delivery_enabled_fleet_wide: boolean;
  total_vehicles: number;
  total_bookings: number;
  total_revenue: number;
  average_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface FleetTeamMember {
  id: string;
  fleet_id: string;
  user_id: string;
  role: "admin" | "manager" | "staff";
  invited_at: string;
  accepted_at: string | null;
  is_active: boolean;
  permissions: {
    vehicles: boolean;
    pricing: boolean;
    bookings: boolean;
    payouts: boolean;
    team: boolean;
  };
}

export interface FleetPricingRule {
  id: string;
  fleet_id: string;
  name: string;
  car_class: string | null;
  daily_rate: number | null;
  weekend_rate: number | null;
  weekly_discount_percent: number;
  monthly_discount_percent: number;
  is_corporate_rate: boolean;
  corporate_discount_percent: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  priority: number;
  created_at: string;
}

export interface FleetVehicle {
  id: string;
  fleet_id: string;
  make: string;
  model: string;
  year: number;
  car_class: string;
  daily_rate: number;
  status: string;
  total_bookings: number;
  total_revenue: number;
}

// Fetch current user's fleet profile
export function useFleetProfile() {
  return useQuery({
    queryKey: ["fleetProfile"],
    queryFn: async (): Promise<FleetOwnerProfile | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("fleet_owner_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as FleetOwnerProfile | null;
    },
  });
}

// Create fleet owner profile
export function useCreateFleetProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<FleetOwnerProfile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("fleet_owner_profiles")
        .insert([{
          user_id: user.id,
          business_name: profile.business_name || "",
          contact_name: profile.contact_name || "",
          contact_email: profile.contact_email || "",
          ...profile,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleetProfile"] });
      toast.success("Fleet account created! Pending approval.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create fleet account");
    },
  });
}

// Update fleet profile
export function useUpdateFleetProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fleetId,
      updates,
    }: {
      fleetId: string;
      updates: Partial<FleetOwnerProfile>;
    }) => {
      const { data, error } = await supabase
        .from("fleet_owner_profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", fleetId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleetProfile"] });
      toast.success("Fleet profile updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

// Fetch fleet team members
export function useFleetTeam(fleetId: string | undefined) {
  return useQuery({
    queryKey: ["fleetTeam", fleetId],
    queryFn: async (): Promise<FleetTeamMember[]> => {
      if (!fleetId) return [];

      const { data, error } = await supabase
        .from("fleet_team_members")
        .select("*")
        .eq("fleet_id", fleetId)
        .order("created_at");

      if (error) throw error;
      return (data || []).map((m) => ({
        ...m,
        permissions: (m.permissions || {}) as FleetTeamMember["permissions"],
      }));
    },
    enabled: !!fleetId,
  });
}

// Invite team member
export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fleetId,
      userId,
      role,
      permissions,
    }: {
      fleetId: string;
      userId: string;
      role: "admin" | "manager" | "staff";
      permissions: FleetTeamMember["permissions"];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("fleet_team_members")
        .insert({
          fleet_id: fleetId,
          user_id: userId,
          role,
          permissions,
          invited_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["fleetTeam", variables.fleetId] });
      toast.success("Team member invited");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to invite team member");
    },
  });
}

// Update team member
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      updates,
    }: {
      memberId: string;
      updates: Partial<FleetTeamMember>;
    }) => {
      const { data, error } = await supabase
        .from("fleet_team_members")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleetTeam"] });
      toast.success("Team member updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update team member");
    },
  });
}

// Fetch fleet pricing rules
export function useFleetPricingRules(fleetId: string | undefined) {
  return useQuery({
    queryKey: ["fleetPricingRules", fleetId],
    queryFn: async (): Promise<FleetPricingRule[]> => {
      if (!fleetId) return [];

      const { data, error } = await supabase
        .from("fleet_pricing_rules")
        .select("*")
        .eq("fleet_id", fleetId)
        .order("priority", { ascending: false });

      if (error) throw error;
      return (data || []) as FleetPricingRule[];
    },
    enabled: !!fleetId,
  });
}

// Create pricing rule
export function useCreatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Omit<FleetPricingRule, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("fleet_pricing_rules")
        .insert(rule)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["fleetPricingRules", variables.fleet_id] });
      toast.success("Pricing rule created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create pricing rule");
    },
  });
}

// Fetch fleet vehicles
export function useFleetVehicles(fleetId: string | undefined) {
  return useQuery({
    queryKey: ["fleetVehicles", fleetId],
    queryFn: async () => {
      if (!fleetId) return [];

      const { data, error } = await supabase
        .from("p2p_vehicles")
        .select("*")
        .eq("fleet_id", fleetId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!fleetId,
  });
}

// Bulk update fleet vehicles
export function useBulkUpdateVehicles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vehicleIds,
      updates,
    }: {
      vehicleIds: string[];
      updates: Record<string, unknown>;
    }) => {
      const { error } = await supabase
        .from("p2p_vehicles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .in("id", vehicleIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleetVehicles"] });
      toast.success("Vehicles updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update vehicles");
    },
  });
}

// Fleet analytics
export function useFleetAnalytics(fleetId: string | undefined) {
  return useQuery({
    queryKey: ["fleetAnalytics", fleetId],
    queryFn: async () => {
      if (!fleetId) return null;

      // Get vehicles with stats
      const { data: vehicles, error: vehiclesError } = await supabase
        .from("p2p_vehicles")
        .select("id, make, model, year, car_class, base_daily_rate, approval_status")
        .eq("fleet_id", fleetId);

      if (vehiclesError) throw vehiclesError;

      // Get bookings for these vehicles
      const vehicleIds = (vehicles || []).map((v) => v.id);
      
      if (vehicleIds.length === 0) {
        return {
          totalVehicles: 0,
          totalBookings: 0,
          totalRevenue: 0,
          occupancyRate: 0,
          revenueByVehicle: [],
          revenueByClass: [],
        };
      }

      const { data: bookings, error: bookingsError } = await supabase
        .from("p2p_bookings")
        .select("id, vehicle_id, total_amount, status, pickup_date, return_date")
        .in("vehicle_id", vehicleIds)
        .eq("status", "completed");

      if (bookingsError) throw bookingsError;

      // Calculate stats
      const totalRevenue = (bookings || []).reduce((sum, b) => sum + (b.total_amount || 0), 0);
      
      // Revenue by vehicle
      const revenueByVehicle = (vehicles || []).map((v) => {
        const vehicleBookings = (bookings || []).filter((b) => b.vehicle_id === v.id);
        const revenue = vehicleBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
        return {
          vehicleId: v.id,
          name: `${v.year} ${v.make} ${v.model}`,
          bookings: vehicleBookings.length,
          revenue,
        };
      });

      // Revenue by car class
      const classTotals: Record<string, { bookings: number; revenue: number }> = {};
      (vehicles || []).forEach((v) => {
        const vehicleBookings = (bookings || []).filter((b) => b.vehicle_id === v.id);
        const revenue = vehicleBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
        const carClass = v.car_class || "standard";
        if (!classTotals[carClass]) classTotals[carClass] = { bookings: 0, revenue: 0 };
        classTotals[carClass].bookings += vehicleBookings.length;
        classTotals[carClass].revenue += revenue;
      });

      return {
        totalVehicles: (vehicles || []).length,
        totalBookings: (bookings || []).length,
        totalRevenue,
        occupancyRate: 0, // Would need date calculations
        revenueByVehicle: revenueByVehicle.sort((a, b) => b.revenue - a.revenue),
        revenueByClass: Object.entries(classTotals).map(([carClass, stats]) => ({
          carClass,
          ...stats,
        })),
      };
    },
    enabled: !!fleetId,
  });
}
