import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { usePhoneVerificationGate } from "@/hooks/usePhoneVerificationGate";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
  skipPhoneCheck?: boolean;
};

/** Routes where phone verification is NOT enforced */
const PHONE_EXEMPT_ROUTES = [
  "/verify-phone",
  "/profile",
  "/profile/delete-account",
  "/account/security",
  "/account/privacy",
  "/account/notifications",
];

const ProtectedRoute = ({ children, requireAdmin = false, skipPhoneCheck = false }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();
  const isExempt = skipPhoneCheck || PHONE_EXEMPT_ROUTES.some(r => location.pathname.startsWith(r));
  const { isChecking: phoneChecking, isVerified: phoneVerified } = usePhoneVerificationGate(!isExempt);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
          <p className="text-sm text-muted-foreground">Contact an administrator to request access.</p>
        </div>
      </div>
    );
  }

  // Phone verification gate — redirect to /verify-phone if not verified
  if (!isExempt) {
    if (phoneChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (!phoneVerified) {
      return <Navigate to="/verify-phone" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
