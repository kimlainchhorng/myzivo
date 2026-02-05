import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSetupStatus } from "@/hooks/useSetupStatus";
import { Loader2 } from "lucide-react";

type SetupRequiredRouteProps = {
  children: React.ReactNode;
};

const SetupRequiredRoute = ({ children }: SetupRequiredRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { data: setupStatus, isLoading: setupLoading } = useSetupStatus();
  const location = useLocation();

  // Show loading while checking auth or setup status
  if (authLoading || (user && setupLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If setup is not complete, redirect to setup page
  if (setupStatus && !setupStatus.isComplete) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
};

export default SetupRequiredRoute;
