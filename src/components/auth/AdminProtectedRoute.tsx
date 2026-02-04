/**
 * Admin Protected Route
 * Granular role-based protection for admin routes
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole, AdminRole } from "@/hooks/useAdminRole";
import { Loader2 } from "lucide-react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  /** 
   * Specific roles allowed to access this route.
   * If empty, any admin role can access.
   * Admin and super_admin always have access regardless of this setting.
   */
  allowedRoles?: AdminRole[];
  /** Custom access denied message */
  accessDeniedMessage?: string;
}

const AdminProtectedRoute = ({ 
  children, 
  allowedRoles = [],
  accessDeniedMessage = "You don't have permission to access this area."
}: AdminProtectedRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const { 
    isLoading: roleLoading, 
    hasAnyAdminRole, 
    isAdmin, 
    isSuperAdmin,
    roles 
  } = useAdminRole();

  const isLoading = authLoading || roleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to admin login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // No admin roles at all
  if (!hasAnyAdminRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have administrative access to this area.
          </p>
          <p className="text-sm text-muted-foreground">
            Contact a system administrator to request access.
          </p>
          <div className="pt-4">
            <a href="/" className="text-primary hover:underline">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Admin and super_admin always have access
  if (isAdmin || isSuperAdmin) {
    return <>{children}</>;
  }

  // If no specific roles required, any admin role is enough
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has any of the allowed roles
  const hasRequiredRole = allowedRoles.some((role) => roles.includes(role));

  if (!hasRequiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-warning/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-2xl font-bold">Insufficient Permissions</h1>
          <p className="text-muted-foreground">{accessDeniedMessage}</p>
          <p className="text-sm text-muted-foreground">
            Required roles: {allowedRoles.join(", ")}
          </p>
          <div className="pt-4">
            <a href="/admin" className="text-primary hover:underline">
              Return to Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
