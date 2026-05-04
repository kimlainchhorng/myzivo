import { useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { withRedirectParam } from "@/lib/authRedirect";
import AccessDenied from "@/components/auth/AccessDenied";
import { supabase } from "@/integrations/supabase/client";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
  allowStoreOwner?: boolean;
};

const ProtectedRoute = ({ children, requireAdmin = false, allowStoreOwner = false }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();
  const { storeId } = useParams<{ storeId?: string }>();
  const ownerCheckKey = allowStoreOwner && storeId && user?.id ? `${user.id}:${storeId}` : "";
  const [ownerAccess, setOwnerAccess] = useState({ key: "", allowed: false, loading: false });

  useEffect(() => {
    if (!requireAdmin || !allowStoreOwner || !storeId || !user?.id || isAdmin) {
      setOwnerAccess({ key: ownerCheckKey, allowed: false, loading: false });
      return;
    }

    let cancelled = false;
    setOwnerAccess({ key: ownerCheckKey, allowed: false, loading: true });

    supabase
      .from("store_profiles")
      .select("id")
      .eq("id", storeId)
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        setOwnerAccess({ key: ownerCheckKey, allowed: !!data && !error, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [allowStoreOwner, isAdmin, ownerCheckKey, requireAdmin, storeId, user?.id]);

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
    const redirectTarget = `${location.pathname}${location.search ?? ""}${location.hash ?? ""}`;
    const loginUrl = withRedirectParam("/login", redirectTarget);
    return <Navigate to={loginUrl} state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    if (allowStoreOwner && storeId) {
      if (ownerAccess.loading || ownerAccess.key !== ownerCheckKey) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Checking access...</p>
            </div>
          </div>
        );
      }

      if (ownerAccess.allowed) return <>{children}</>;
    }

    return (
      <AccessDenied
        message="You don't have permission to access this page. Contact an administrator to request access."
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
