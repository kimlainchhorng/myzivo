import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSetupStatus } from "@/hooks/useSetupStatus";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SetupRequiredRouteProps = {
  children: React.ReactNode;
};

const SetupRequiredRoute = ({ children }: SetupRequiredRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { data: setupStatus, isLoading: setupLoading } = useSetupStatus();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const otpTriggeredRef = useRef(false);

  const showLoading = authLoading || (user && setupLoading);
  const emailVerified = setupStatus?.profile?.email_verified === true;
  const shouldVerify = !!user && !!setupStatus && !emailVerified;

  // Enforce email verification for ALL users (including Google OAuth)
  useEffect(() => {
    const run = async () => {
      if (!user || !setupStatus) return;
      if (emailVerified) return;

      const email = user.email;
      if (!email) {
        navigate("/verify-email", { replace: true });
        return;
      }

      if (otpTriggeredRef.current) {
        navigate("/verify-otp", { state: { email, userId: user.id }, replace: true });
        return;
      }

      otpTriggeredRef.current = true;
      setIsSendingOtp(true);

      try {
        await supabase.functions.invoke("send-otp-email", {
          body: { email, userId: user.id },
        });
      } catch {
        // Even if OTP send fails, we still route to verification screen so user can retry.
      } finally {
        setIsSendingOtp(false);
        navigate("/verify-otp", { state: { email, userId: user.id }, replace: true });
      }
    };

    void run();
  }, [user, setupStatus, emailVerified, navigate]);

  // Show loading while checking auth or setup status
  if (showLoading) {
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

  // Block app access until verified (prevents bypass if OAuth redirects to '/')
  if (shouldVerify || isSendingOtp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Sending verification code…</p>
        </div>
      </div>
    );
  }

  // If setup is not complete, check onboarding first
  if (setupStatus && !setupStatus.isComplete) {
    const onboardingSeen = localStorage.getItem("hizovo-onboarding-seen");
    if (!onboardingSeen) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
};

export default SetupRequiredRoute;
