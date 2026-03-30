/**
 * Business Account Hook — reads from business_accounts table
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface AuthorizedDriver {
  id: string;
  name: string;
  email: string;
  status: string;
  driver_name?: string;
  driver_email?: string;
  license_number?: string;
  license_state?: string;
  is_verified?: boolean;
}

export function useBusinessAccount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["business-account", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("business_accounts")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAuthorizedDrivers(accountId?: string) {
  return useQuery({
    queryKey: ["authorized-drivers", accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const { data, error } = await (supabase as any)
        .from("business_authorized_drivers")
        .select("*")
        .eq("business_id", accountId)
        .order("created_at", { ascending: false });
      if (error) return [];
      return (data || []) as AuthorizedDriver[];
    },
    enabled: !!accountId,
  });
}

export function useAddAuthorizedDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { business_id: string; name: string; email: string }) => {
      const { error } = await (supabase as any)
        .from("business_authorized_drivers")
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorized-drivers"] });
      toast.success("Driver added");
    },
  });
}

export function useRemoveAuthorizedDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("business_authorized_drivers")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorized-drivers"] });
      toast.success("Driver removed");
    },
  });
}
