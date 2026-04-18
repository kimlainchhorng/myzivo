/**
 * VerifyOTP — passwordless email OTP confirmation page.
 * Flow: user enters email on /login → clicks "Email me a code" → lands here
 * with ?email=... → enters 6-digit code → Supabase signs them in.
 */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const RESEND_COOLDOWN = 30;

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") || "";
  const redirect = params.get("redirect") || "/";
  const mode = params.get("mode") === "signup" ? "signup" : "login";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      toast.error("Missing email. Please start again.");
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const submit = async (fullCode: string) => {
    if (submitting) return;
    setSubmitting(true);

    if (mode === "signup") {
      const { data, error } = await supabase.functions.invoke("verify-otp-code", {
        body: { email, code: fullCode },
      });
      setSubmitting(false);

      if (error || !data?.success) {
        toast.error(data?.error || error?.message || "Invalid or expired code.");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      toast.success("Email verified. Please sign in.");
      navigate(`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`, { replace: true });
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: fullCode,
      type: "email",
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Invalid or expired code.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      return;
    }
    toast.success("Signed in!");
    navigate(redirect, { replace: true });
  };

  const handleChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (next.every((c) => c) && next.join("").length === 6) submit(next.join(""));
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.padEnd(6, "").split("").slice(0, 6);
    setCode(next as string[]);
    if (pasted.length === 6) submit(pasted);
    else inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);

    if (mode === "signup") {
      const { error } = await supabase.functions.invoke("send-otp-email", {
        body: { email },
      });
      setResending(false);
      if (error) {
        toast.error(error.message || "Could not resend code.");
        return;
      }
      toast.success("New code sent!");
      setCooldown(RESEND_COOLDOWN);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({ email });
    setResending(false);
    if (error) {
      toast.error(error.message || "Could not resend code.");
      return;
    }
    toast.success("New code sent!");
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-emerald-950 via-background to-background flex items-center justify-center px-4 py-10">
      <SEOHead title="Verify your code" description="Enter the 6-digit code we emailed you." />

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 mb-3">
            <Mail className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Check your email</h1>
          <p className="text-sm text-muted-foreground mt-2">
            We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-card/70 backdrop-blur-xl shadow-2xl p-6 space-y-5">
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                autoComplete={idx === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={submitting}
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-background/60 border border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none text-foreground transition"
              />
            ))}
          </div>

          <Button
            type="button"
            onClick={() => submit(code.join(""))}
            disabled={submitting || code.some((c) => !c)}
            className="w-full h-12 rounded-xl text-base font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{mode === "signup" ? "Confirm Email" : "Verify"} <ArrowRight className="w-4 h-4 ml-1" /></>}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Didn't get it?{" "}
            <button
              type="button"
              onClick={resend}
              disabled={cooldown > 0 || resending}
              className="font-semibold text-emerald-400 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>

          <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
