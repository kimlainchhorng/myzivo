/**
 * Verify Phone Page
 * Customer phone verification — required before using the app
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Phone, ShieldCheck, Loader2, ArrowLeft, AlertCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CountryPhoneInput } from "@/components/auth/CountryPhoneInput";
import MobileBottomNav from "@/components/shared/MobileBottomNav";

type Step = "phone" | "otp";

export default function VerifyPhonePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phoneE164, setPhoneE164] = useState("");
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Where to redirect after verification
  const from = (location.state as any)?.from?.pathname || "/";

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown > 0]);

  // Validate E.164 format
  const isValidPhone = /^\+[1-9]\d{6,14}$/.test(phoneE164);

  const handleSendCode = async () => {
    if (!user?.id || !isValidPhone) return;
    setError(null);
    setIsSending(true);

    try {
      // Step 1: Reserve the phone number via RPC
      const { error: rpcError } = await supabase.rpc("set_customer_phone" as any, {
        p_phone_e164: phoneE164,
      });

      if (rpcError) {
        if (rpcError.message?.includes("phone_already_in_use")) {
          setError("This phone number is already used by another account.");
          setIsSending(false);
          return;
        }
        throw rpcError;
      }

      // Step 2: Send OTP via edge function
      const { data, error: otpError } = await supabase.functions.invoke("send-otp-sms", {
        body: { phone_e164: phoneE164, user_id: user.id },
      });

      if (otpError) throw otpError;
      if (data && !data.success) throw new Error(data.error || "Failed to send code");

      toast.success("Verification code sent!");
      setCooldown(60);
      setStep("otp");
    } catch (err: any) {
      console.error("Send code error:", err);
      setError(err.message || "Failed to send verification code");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length < 6 || !user?.id) return;
    setError(null);
    setIsVerifying(true);

    try {
      const { data, error: verifyError } = await supabase.functions.invoke("verify-otp-sms", {
        body: { phone_e164: phoneE164, code: otp, user_id: user.id },
      });

      if (verifyError) throw verifyError;
      if (data && !data.success) throw new Error(data.error || "Verification failed");

      toast.success("Phone verified successfully! 🎉");
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Verify error:", err);
      setError(err.message || "Invalid verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-2xl border-b border-border/30">
        <div className="px-4 py-3 safe-area-top">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-lg font-bold">Verify Phone</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5"
        >
          {step === "phone" ? (
            <Smartphone className="w-8 h-8 text-primary" />
          ) : (
            <ShieldCheck className="w-8 h-8 text-primary" />
          )}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-2 mb-8"
        >
          <h2 className="text-xl font-bold text-foreground">
            {step === "phone" ? "Verify Your Phone Number" : "Enter Verification Code"}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            {step === "phone"
              ? "A verified phone number is required to use ZIVO. This ensures your account security."
              : `We sent a 6-digit code to ${phoneE164}`}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/5 mb-4 w-full max-w-sm"
            >
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <span className="text-sm text-destructive">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <CountryPhoneInput
                    value={phoneE164}
                    onChange={(val) => {
                      setPhoneE164(val);
                      setError(null);
                    }}
                    name="phone"
                  />
                </div>

                <Button
                  onClick={handleSendCode}
                  disabled={!isValidPhone || isSending || cooldown > 0}
                  className="w-full h-12 text-base font-semibold rounded-xl"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending…
                    </>
                  ) : cooldown > 0 ? (
                    `Resend in ${cooldown}s`
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      setError(null);
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={handleVerify}
                  disabled={otp.length < 6 || isVerifying}
                  className="w-full h-12 text-base font-semibold rounded-xl"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying…
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setError(null);
                    }}
                    className="gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Change number
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSendCode}
                    disabled={isSending || cooldown > 0}
                  >
                    {isSending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[11px] text-muted-foreground/60 mt-8 text-center max-w-xs"
        >
          Standard messaging rates may apply. Max 5 SMS/day. By verifying, you agree to receive SMS from ZIVO.
        </motion.p>
      </div>

      <MobileBottomNav />
    </div>
  );
}
