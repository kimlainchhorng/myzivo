import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceFingerprint, getDeviceName } from "@/lib/security/deviceFingerprint";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, ArrowLeft, Home, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const CODE_LENGTH = 6;

const VerifyNewDevice = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get state passed from login
  const navEmail = (location.state as any)?.email as string | undefined;
  const navUserId = (location.state as any)?.userId as string | undefined;
  const navRedirectTo = (location.state as any)?.redirectTo as string | undefined;

  const [email] = useState<string | undefined>(() => {
    if (navEmail) {
      sessionStorage.setItem("zivo_device_otp_email", navEmail);
      return navEmail;
    }
    return sessionStorage.getItem("zivo_device_otp_email") || undefined;
  });

  const [userId] = useState<string | undefined>(() => {
    if (navUserId) {
      sessionStorage.setItem("zivo_device_otp_userid", navUserId);
      return navUserId;
    }
    return sessionStorage.getItem("zivo_device_otp_userid") || undefined;
  });

  const [redirectTo] = useState<string>(navRedirectTo || "/");

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Redirect if no email/userId
  useEffect(() => {
    if (!email || !userId) {
      navigate("/login", { replace: true });
    }
  }, [email, userId, navigate]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newCode.every((d) => d !== "") && newCode.join("").length === CODE_LENGTH) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (pasted.length === CODE_LENGTH) {
      const newCode = pasted.split("");
      setCode(newCode);
      inputRefs.current[CODE_LENGTH - 1]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = useCallback(async (otp: string) => {
    if (!email || !userId || isVerifying) return;
    setIsVerifying(true);

    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { email, otp, userId },
      });

      if (error || !data?.valid) {
        toast.error(data?.error || "Invalid verification code. Please try again.");
        setCode(Array(CODE_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        setIsVerifying(false);
        return;
      }

      // OTP valid — register this device as trusted
      const fingerprint = getDeviceFingerprint();
      const deviceName = getDeviceName();

      await supabase.rpc("register_trusted_device", {
        _user_id: userId,
        _device_fingerprint: fingerprint,
        _device_name: deviceName,
      });

      // Clean up session storage
      sessionStorage.removeItem("zivo_device_otp_email");
      sessionStorage.removeItem("zivo_device_otp_userid");

      toast.success("Device verified! You're signed in.", { icon: "🔐" });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error("Verification failed. Please try again.");
      setIsVerifying(false);
    }
  }, [email, userId, isVerifying, navigate, redirectTo]);

  const handleResend = async () => {
    if (!email || !userId || countdown > 0) return;
    setIsResending(true);
    try {
      await supabase.functions.invoke("send-otp-email", {
        body: { email, userId },
      });
      toast.success("New verification code sent!");
      setCountdown(60);
    } catch {
      toast.error("Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 5)) + c)
    : "";

  if (!email || !userId) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">New Device Detected</h1>
            <p className="text-sm text-muted-foreground mt-1">
              We sent a verification code to
            </p>
            <p className="text-sm font-medium text-foreground mt-0.5">
              {maskedEmail}
            </p>
          </div>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <span key={i} className="contents">
                <input
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-13 text-center text-lg font-bold bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  disabled={isVerifying}
                />
                {i === 2 && <span className="flex items-center text-muted-foreground font-bold">·</span>}
              </span>
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={() => handleVerify(code.join(""))}
            disabled={isVerifying || code.some((d) => !d)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-xl font-semibold"
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            Verify Device →
          </Button>

          {/* Resend */}
          <div className="text-center mt-4 space-y-1">
            <p className="text-xs text-muted-foreground">Didn't receive the code?</p>
            {countdown > 0 ? (
              <p className="text-xs text-muted-foreground">Resend in {countdown}s</p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-xs text-primary font-medium hover:underline"
              >
                {isResending ? "Sending..." : "Resend Code"}
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border/50 mt-5 pt-4 flex flex-col items-center gap-2">
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </div>

          {/* Security note */}
          <p className="text-[10px] text-muted-foreground text-center mt-4">
            This extra step keeps your account safe when signing in from a new device.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyNewDevice;
