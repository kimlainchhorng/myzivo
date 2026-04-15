import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowRight, RefreshCw, Mail, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import { getSafeRedirectTarget, withRedirectParam } from "@/lib/authRedirect";

const VerifyOTP = () => {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navState = location.state as { email?: string; redirectTo?: string; userId?: string } | null;
  
  const navEmail = navState?.email;
  const navUserId = navState?.userId;
  const redirectTo = getSafeRedirectTarget(searchParams.get("redirect") ?? navState?.redirectTo);

  // Persist email in sessionStorage so page refreshes don't lose it
  const [email, setEmail] = useState<string | undefined>(() => {
    if (navEmail) {
      sessionStorage.setItem("zivo_otp_email", navEmail);
      return navEmail;
    }
    return sessionStorage.getItem("zivo_otp_email") || undefined;
  });

  const [userId] = useState<string | undefined>(() => {
    if (navUserId) {
      sessionStorage.setItem("zivo_otp_userId", navUserId);
      return navUserId;
    }
    return sessionStorage.getItem("zivo_otp_userId") || undefined;
  });

  useEffect(() => {
    const hydrateEmail = async () => {
      if (email) return;
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        setEmail(data.user.email);
        sessionStorage.setItem("zivo_otp_email", data.user.email);
      }
    };

    void hydrateEmail();
  }, [email]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    setResendCooldown(60);
  }, []);

  const redirectAfterVerification = useCallback(async () => {
    // Clean up OTP session data
    sessionStorage.removeItem("zivo_otp_email");
    sessionStorage.removeItem("zivo_otp_userId");

    const { data: { session } } = await supabase.auth.getSession();
    const activeUser = session?.user;

    if (!activeUser) {
      if (email) {
        localStorage.setItem("zivo_saved_email", email);
      }
      navigate(withRedirectParam("/login?mode=login", redirectTo), { replace: true });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("setup_complete")
      .or(`user_id.eq.${activeUser.id},id.eq.${activeUser.id}`)
      .maybeSingle();

    const { data: isAdminUser } = await supabase.rpc("check_user_role", {
      _user_id: activeUser.id,
      _role: "admin",
    });

    if (isAdminUser) {
      navigate("/admin/analytics", { replace: true });
      return;
    }

    if (!profile?.setup_complete) {
      navigate(withRedirectParam("/setup", redirectTo), {
        replace: true,
        state: { redirectTo },
      });
      return;
    }

    navigate(redirectTo, { replace: true });
  }, [email, navigate, redirectTo]);

  const maskedEmail = email
    ? email.replace(/^(.{1,2})(.*)(@.*)$/, (_, start, middle, end) => 
        start + "*".repeat(Math.min(middle.length, 5)) + end
      )
    : "";

  const handleVerify = useCallback(async (otpCode: string) => {
    if (otpCode.length !== 6) return;
    
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp-code", {
        body: { email, code: otpCode }
      });

      if (error || !data?.success) {
        const errorMessage = data?.error || error?.message || "Verification failed";
        toast.error(errorMessage);
        
        if (data?.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        
        if (data?.code === "MAX_ATTEMPTS" || data?.code === "NO_VALID_CODE") {
          setCode("");
        }
        
        setIsVerifying(false);
        return;
      }

      toast.success("Email verified successfully!");
      await redirectAfterVerification();
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Something went wrong. Please try again.");
      setIsVerifying(false);
    }
  }, [email, navigate, redirectAfterVerification]);

  useEffect(() => {
    if (code.length === 6) {
      handleVerify(code);
    }
  }, [code, handleVerify]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setIsResending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp-email", {
        body: { email, userId }
      });

      if (error || !data?.success) {
        const errorMessage = data?.error || error?.message || "Failed to resend code";
        toast.error(errorMessage);
        
        if (data?.retryAfter) {
          setResendCooldown(Math.ceil(data.retryAfter / 60) * 60);
        }
      } else {
        toast.success("New verification code sent!");
        setResendCooldown(60);
        setCode("");
        setRemainingAttempts(null);
      }
    } catch (err) {
      console.error("Resend error:", err);
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    navigate(withRedirectParam("/login?mode=signup", redirectTo));
  };

  const handleGoHome = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4 safe-area-top safe-area-bottom">
        <div className="w-full max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card/80 backdrop-blur-2xl border border-border rounded-3xl shadow-2xl p-6 sm:p-8"
          >
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Session Expired</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your verification session has expired. Please sign up again to receive a new code.
            </p>
            <Button
              onClick={() => navigate("/login?mode=signup", { replace: true })}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold"
            >
              Back to Sign Up
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-6 sm:py-8 safe-area-top safe-area-bottom relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card/80 backdrop-blur-2xl border border-border rounded-3xl shadow-2xl p-6 sm:p-8"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              ZIVO ID
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Enter Verification Code
            </p>
          </div>

          {/* Email info */}
          <div className="flex items-center justify-center gap-2 bg-muted border border-border rounded-xl py-3 px-4 mb-6">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              Code sent to <span className="text-foreground font-medium">{maskedEmail}</span>
            </span>
          </div>

          {/* OTP Input */}
          <div className="flex justify-center mb-6">
            <InputOTP
              value={code}
              onChange={setCode}
              maxLength={6}
              disabled={isVerifying}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot 
                  index={0} 
                  className="w-12 h-14 text-xl bg-muted border-border text-foreground focus:border-primary focus:ring-primary"
                />
                <InputOTPSlot 
                  index={1} 
                  className="w-12 h-14 text-xl bg-muted border-border text-foreground focus:border-primary focus:ring-primary"
                />
                <InputOTPSlot 
                  index={2} 
                  className="w-12 h-14 text-xl bg-muted border-border text-foreground focus:border-primary focus:ring-primary"
                />
              </InputOTPGroup>
              <InputOTPSeparator className="text-muted-foreground" />
              <InputOTPGroup>
                <InputOTPSlot 
                  index={3} 
                  className="w-12 h-14 text-xl bg-muted border-border text-foreground focus:border-primary focus:ring-primary"
                />
                <InputOTPSlot 
                  index={4} 
                  className="w-12 h-14 text-xl bg-muted border-border text-foreground focus:border-primary focus:ring-primary"
                />
                <InputOTPSlot 
                  index={5} 
                  className="w-12 h-14 text-xl bg-muted border-border text-foreground focus:border-primary focus:ring-primary"
                />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Remaining attempts warning */}
          {remainingAttempts !== null && remainingAttempts <= 3 && (
            <div className="text-center mb-4">
              <p className="text-amber-500 text-sm">
                {remainingAttempts} attempt{remainingAttempts !== 1 ? "s" : ""} remaining
              </p>
            </div>
          )}

          {/* Verify button */}
          <Button
            onClick={() => handleVerify(code)}
            disabled={code.length !== 6 || isVerifying}
            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl touch-manipulation active:scale-[0.98] transition-all"
          >
            {isVerifying ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Verify Email
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          {/* Resend section */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isResending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {resendCooldown > 0 
                ? `Resend in ${resendCooldown}s` 
                : "Resend Code"
              }
            </button>
          </div>

          {/* Back to signup */}
          <div className="mt-6 pt-4 border-t border-border space-y-3">
            <button
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign Up
            </button>
            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <Home className="h-4 w-4" />
              Go to Home
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Code expires in 10 minutes · Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;