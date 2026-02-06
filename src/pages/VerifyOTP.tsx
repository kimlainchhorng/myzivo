import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowRight, RefreshCw, Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const VerifyOTP = () => {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state
  const email = (location.state as { email?: string })?.email;
  const userId = (location.state as { userId?: string })?.userId;

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate("/login?mode=signup", { replace: true });
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Start initial cooldown
  useEffect(() => {
    setResendCooldown(60);
  }, []);

  // Mask email for display (j***@example.com)
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
      
      // Navigate to setup page
      navigate("/setup", { replace: true });
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Something went wrong. Please try again.");
      setIsVerifying(false);
    }
  }, [email, navigate]);

  // Auto-submit when 6 digits entered
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
          setResendCooldown(Math.ceil(data.retryAfter / 60) * 60); // Round up to next minute
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
    navigate("/login?mode=signup");
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black px-4 py-6 sm:py-8 safe-area-top safe-area-bottom relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              ZIVO ID
            </h1>
            <p className="text-zinc-400 mt-2 text-sm sm:text-base">
              Enter Verification Code
            </p>
          </div>

          {/* Email info */}
          <div className="flex items-center justify-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 mb-6">
            <Mail className="w-4 h-4 text-zinc-500" />
            <span className="text-zinc-400 text-sm">
              Code sent to <span className="text-white font-medium">{maskedEmail}</span>
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
                  className="w-12 h-14 text-xl bg-zinc-950 border-zinc-700 text-white focus:border-blue-500 focus:ring-blue-500"
                />
                <InputOTPSlot 
                  index={1} 
                  className="w-12 h-14 text-xl bg-zinc-950 border-zinc-700 text-white focus:border-blue-500 focus:ring-blue-500"
                />
                <InputOTPSlot 
                  index={2} 
                  className="w-12 h-14 text-xl bg-zinc-950 border-zinc-700 text-white focus:border-blue-500 focus:ring-blue-500"
                />
              </InputOTPGroup>
              <InputOTPSeparator className="text-zinc-600" />
              <InputOTPGroup>
                <InputOTPSlot 
                  index={3} 
                  className="w-12 h-14 text-xl bg-zinc-950 border-zinc-700 text-white focus:border-blue-500 focus:ring-blue-500"
                />
                <InputOTPSlot 
                  index={4} 
                  className="w-12 h-14 text-xl bg-zinc-950 border-zinc-700 text-white focus:border-blue-500 focus:ring-blue-500"
                />
                <InputOTPSlot 
                  index={5} 
                  className="w-12 h-14 text-xl bg-zinc-950 border-zinc-700 text-white focus:border-blue-500 focus:ring-blue-500"
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
            className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl touch-manipulation active:scale-[0.98] transition-all"
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
            <p className="text-zinc-500 text-sm mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
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
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <button
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign Up
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-600">
          Code expires in 10 minutes • Protected by enterprise-grade security 🔒
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
