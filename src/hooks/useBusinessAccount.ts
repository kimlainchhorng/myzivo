/**
 * Business Account Hook - Stub
 */
import { useQuery, useMutation } from "@tanstack/react-query";

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
  return useQuery({ queryKey: ["business-account"], queryFn: async () => null as any, enabled: false });
}

export function useAuthorizedDrivers(accountId?: string) {
  return useQuery({ queryKey: ["authorized-drivers", accountId], queryFn: async () => [] as AuthorizedDriver[], enabled: false });
}

export function useAddAuthorizedDriver() {
  return useMutation({ mutationFn: async (_data: any) => ({} as any) });
}

export function useRemoveAuthorizedDriver() {
  return useMutation({ mutationFn: async (_id: string) => ({} as any) });
}
