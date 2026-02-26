/**
 * Verify Phone Page
 * Customer phone verification using Supabase Auth SMS OTP
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Phone, ShieldCheck, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Step = "phone" | "otp";

export default function VerifyPhonePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phoneE164, setPhoneE164] = useState("");
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

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
        _phone_e164: phoneE164,
      });

      if (rpcError) {
        if (rpcError.message?.includes("phone_already_in_use")) {
          setError("This phone number is already used by another account.");
          setIsSending(false);
          return;
        }
        throw rpcError;
      }

      // Step 2: Send OTP via Supabase Auth
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: phoneE164,
      });

      if (otpError) throw otpError;

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
    if (!otp || otp.length < 6) return;
    setError(null);
    setIsVerifying(true);

    try {
      // Step 1: Verify OTP with Supabase Auth
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: phoneE164,
        token: otp,
        type: "sms",
      });

      if (verifyError) throw verifyError;

      // Step 2: Sync verification status to profiles
      const { error: syncError } = await supabase.rpc("sync_customer_phone_verified" as any);

      if (syncError) {
        console.error("Sync error (non-fatal):", syncError);
      }

      toast.success("Phone verified successfully!");
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Verify error:", err);
      setError(err.message || "Invalid verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              {step === "phone" ? (
                <Phone className="h-7 w-7 text-primary" />
              ) : (
                <ShieldCheck className="h-7 w-7 text-primary" />
              )}
            </div>
            <CardTitle className="text-xl">
              {step === "phone" ? "Verify Your Phone" : "Enter Verification Code"}
            </CardTitle>
            <CardDescription>
              {step === "phone"
                ? "A verified phone number is required to request rides and deliveries."
                : `We sent a 6-digit code to ${phoneE164}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5"
                >
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <span className="text-sm text-destructive">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {step === "phone" ? (
              <motion.div
                key="phone-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (E.164)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+12125551234"
                    value={phoneE164}
                    onChange={(e) => {
                      setPhoneE164(e.target.value);
                      setError(null);
                    }}
                    className="h-12 text-base font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code, e.g. +1 for US
                  </p>
                </div>

                <Button
                  onClick={handleSendCode}
                  disabled={!isValidPhone || isSending || cooldown > 0}
                  className="w-full h-12 text-base font-semibold"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending…
                    </>
                  ) : cooldown > 0 ? (
                    `Resend in ${cooldown}s`
                  ) : (
                    "Send Code"
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
                  className="w-full h-12 text-base font-semibold"
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

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Standard messaging rates may apply. Max 5 SMS/day.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
