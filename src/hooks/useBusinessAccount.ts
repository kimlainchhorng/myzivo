/**
 * Business Account Hooks
 * Manage corporate renter accounts and authorized drivers
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BusinessRenterAccount {
  id: string;
  user_id: string;
  company_name: string;
  company_size: "1-10" | "11-50" | "51-200" | "201-500" | "500+" | null;
  industry: string | null;
  tax_id: string | null;
  billing_contact_name: string;
  billing_contact_email: string;
  billing_contact_phone: string | null;
  billing_address: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_zip: string | null;
  status: "pending" | "approved" | "suspended";
  approved_at: string | null;
  payment_method: "card" | "invoice" | "monthly";
  credit_limit: number | null;
  payment_terms_days: number;
  total_bookings: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface AuthorizedDriver {
  id: string;
  business_account_id: string;
  driver_name: string;
  driver_email: string | null;
  driver_phone: string | null;
  license_number: string | null;
  license_state: string | null;
  license_expiry: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

// Fetch current user's business account
export function useBusinessAccount() {
  return useQuery({
    queryKey: ["businessAccount"],
    queryFn: async (): Promise<BusinessRenterAccount | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("business_renter_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as BusinessRenterAccount | null;
    },
  });
}

// Create business account
export function useCreateBusinessAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: Partial<BusinessRenterAccount>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("business_renter_accounts")
        .insert([{
          user_id: user.id,
          company_name: account.company_name || "",
          billing_contact_name: account.billing_contact_name || "",
          billing_contact_email: account.billing_contact_email || "",
          ...account,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessAccount"] });
      toast.success("Business account created! Pending approval.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create business account");
    },
  });
}

// Update business account
export function useUpdateBusinessAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      updates,
    }: {
      accountId: string;
      updates: Partial<BusinessRenterAccount>;
    }) => {
      const { data, error } = await supabase
        .from("business_renter_accounts")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", accountId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessAccount"] });
      toast.success("Business account updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update account");
    },
  });
}

// Fetch authorized drivers
export function useAuthorizedDrivers(accountId: string | undefined) {
  return useQuery({
    queryKey: ["authorizedDrivers", accountId],
    queryFn: async (): Promise<AuthorizedDriver[]> => {
      if (!accountId) return [];

      const { data, error } = await supabase
        .from("business_authorized_drivers")
        .select("*")
        .eq("business_account_id", accountId)
        .order("driver_name");

      if (error) throw error;
      return (data || []) as AuthorizedDriver[];
    },
    enabled: !!accountId,
  });
}

// Add authorized driver
export function useAddAuthorizedDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driver: {
      business_account_id: string;
      driver_name: string;
      driver_email?: string;
      driver_phone?: string;
      license_number?: string;
      license_state?: string;
      license_expiry?: string | null;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("business_authorized_drivers")
        .insert([{
          ...driver,
          is_verified: false,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["authorizedDrivers", variables.business_account_id] });
      toast.success("Driver added");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add driver");
    },
  });
}

// Update authorized driver
export function useUpdateAuthorizedDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      driverId,
      updates,
    }: {
      driverId: string;
      updates: Partial<AuthorizedDriver>;
    }) => {
      const { data, error } = await supabase
        .from("business_authorized_drivers")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", driverId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorizedDrivers"] });
      toast.success("Driver updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update driver");
    },
  });
}

// Remove authorized driver
export function useRemoveAuthorizedDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driverId: string) => {
      const { error } = await supabase
        .from("business_authorized_drivers")
        .delete()
        .eq("id", driverId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorizedDrivers"] });
      toast.success("Driver removed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove driver");
    },
  });
}
