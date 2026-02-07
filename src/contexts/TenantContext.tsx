/**
 * Tenant Context
 * Multi-tenant state management with permissions
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type TenantRole = "owner" | "admin" | "dispatcher" | "support" | "finance" | "merchant_manager" | "viewer";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  role: TenantRole;
  isActive: boolean;
}

interface TenantContextValue {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  permissions: string[];
  isLoading: boolean;
  switchTenant: (tenantId: string) => void;
  hasPermission: (key: string) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
  refetch: () => void;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin: isPlatformAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(() => {
    return localStorage.getItem("zivo_current_tenant");
  });

  // Fetch user's tenants
  const { data: tenantsData, isLoading: tenantsLoading, refetch } = useQuery({
    queryKey: ["my-tenants", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_my_tenants");
      if (error) throw error;
      return (data || []).map((t: any) => ({
        id: t.tenant_id,
        name: t.tenant_name,
        slug: t.tenant_slug,
        logoUrl: t.tenant_logo,
        role: t.user_role as TenantRole,
        isActive: t.is_active,
      }));
    },
    enabled: !!user?.id,
  });

  const tenants = tenantsData || [];

  // Auto-select first tenant if none selected
  useEffect(() => {
    if (tenants.length > 0 && !currentTenantId) {
      setCurrentTenantId(tenants[0].id);
      localStorage.setItem("zivo_current_tenant", tenants[0].id);
    }
  }, [tenants, currentTenantId]);

  const currentTenant = tenants.find((t) => t.id === currentTenantId) || null;

  // Fetch permissions for current tenant
  const { data: permissions = [] } = useQuery({
    queryKey: ["tenant-permissions", currentTenantId, user?.id],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const { data, error } = await supabase.rpc("get_my_tenant_permissions", {
        p_tenant_id: currentTenantId,
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenantId && !!user?.id,
  });

  const switchTenant = useCallback((tenantId: string) => {
    setCurrentTenantId(tenantId);
    localStorage.setItem("zivo_current_tenant", tenantId);
    queryClient.invalidateQueries({ queryKey: ["tenant-permissions"] });
  }, [queryClient]);

  const hasPermission = useCallback((key: string) => {
    if (isPlatformAdmin) return true;
    if (currentTenant?.role === "owner") return true;
    return permissions.includes(key);
  }, [isPlatformAdmin, currentTenant, permissions]);

  const value: TenantContextValue = {
    currentTenant,
    tenants,
    permissions,
    isLoading: tenantsLoading,
    switchTenant,
    hasPermission,
    isOwner: currentTenant?.role === "owner",
    isAdmin: currentTenant?.role === "admin" || currentTenant?.role === "owner",
    refetch,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

// Optional hook for components outside TenantProvider
export function useTenantOptional() {
  return useContext(TenantContext);
}
