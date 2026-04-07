/**
 * PhoneRequiredGate
 * Blocks access to service pages (Rides, Flights, Hotels, etc.)
 * if the user hasn't added a phone number to their profile.
 * Redirects them to the profile page with a message.
 */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { withRedirectParam } from "@/lib/authRedirect";

interface PhoneRequiredGateProps {
  children: React.ReactNode;
}

const PhoneRequiredGate = ({ children }: PhoneRequiredGateProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const location = useLocation();
  const toastShown = useRef(false);

  const isLoading = authLoading || profileLoading;
  const hasPhone = !!profile?.phone?.trim();

  useEffect(() => {
    if (!isLoading && user && !hasPhone && !toastShown.current) {
      toastShown.current = true;
      toast.error("Phone number required", {
        description: "Please add your phone number to access this service.",
        duration: 5000,
      });
    }
  }, [isLoading, user, hasPhone]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in — let ProtectedRoute handle redirect
  if (!user) return <>{children}</>;

  // No phone — redirect to profile settings (not /setup to avoid loop if setup_complete)
  if (!hasPhone) {
    const redirectTarget = `${location.pathname}${location.search ?? ""}${location.hash ?? ""}`;
    const destination = profile?.setup_complete ? "/profile" : "/setup";
    return (
      <Navigate
        to={withRedirectParam(destination, redirectTarget)}
        state={{ from: location, phoneRequired: true, redirectTo: redirectTarget }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default PhoneRequiredGate;
