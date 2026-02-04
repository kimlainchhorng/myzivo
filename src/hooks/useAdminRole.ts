/**
 * Admin Role Hook
 * Check user admin roles for granular access control
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AdminRole = "admin" | "super_admin" | "operations" | "finance" | "support";

export interface AdminRoleAccess {
  isLoading: boolean;
  hasAnyAdminRole: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isOperations: boolean;
  isFinance: boolean;
  isSupport: boolean;
  roles: AdminRole[];
  // Convenience access checks
  canAccessTravel: boolean;
  canAccessDrivers: boolean;
  canAccessSupport: boolean;
  canAccessPayouts: boolean;
  canAccessSettings: boolean;
  canAccessReports: boolean;
}

export function useAdminRole(): AdminRoleAccess {
  const { user } = useAuth();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["admin-roles", user?.id],
    queryFn: async (): Promise<AdminRole[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching admin roles:", error);
        return [];
      }

      // Filter to only admin-related roles
      const adminRoles: AdminRole[] = [];
      for (const row of data || []) {
        const role = row.role as string;
        if (["admin", "super_admin", "operations", "finance", "support"].includes(role)) {
          adminRoles.push(role as AdminRole);
        }
      }

      return adminRoles;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isAdmin = roles.includes("admin");
  const isSuperAdmin = roles.includes("super_admin");
  const isOperations = roles.includes("operations");
  const isFinance = roles.includes("finance");
  const isSupport = roles.includes("support");
  const hasAnyAdminRole = roles.length > 0;

  // Access convenience checks
  // Admin & super_admin have access to everything
  const fullAccess = isAdmin || isSuperAdmin;

  return {
    isLoading,
    hasAnyAdminRole,
    isAdmin,
    isSuperAdmin,
    isOperations,
    isFinance,
    isSupport,
    roles,
    // Travel: admin, operations
    canAccessTravel: fullAccess || isOperations,
    // Drivers: admin, operations
    canAccessDrivers: fullAccess || isOperations,
    // Support: admin, support
    canAccessSupport: fullAccess || isSupport,
    // Payouts: admin, finance
    canAccessPayouts: fullAccess || isFinance,
    // Settings: admin, super_admin only
    canAccessSettings: fullAccess,
    // Reports: admin, finance
    canAccessReports: fullAccess || isFinance,
  };
}

/**
 * Check if user has any of the specified roles
 */
export function useHasAnyRole(allowedRoles: AdminRole[]): { hasAccess: boolean; isLoading: boolean } {
  const { roles, isLoading, isAdmin, isSuperAdmin } = useAdminRole();
  
  // Admin and super_admin always have access
  if (isAdmin || isSuperAdmin) {
    return { hasAccess: true, isLoading };
  }

  const hasAccess = allowedRoles.some((role) => roles.includes(role));
  return { hasAccess, isLoading };
}
