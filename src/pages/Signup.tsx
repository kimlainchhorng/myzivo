/**
 * ZIVO ID — Signup page (rebuilt clean v2026)
 * - Plain native <input> elements so iPhone Safari typing works.
 * - Emerald glassmorphic branding.
 * - Email + password + name. Email confirmation required.
 */
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, MailCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { LegalPreviewLink } from "@/components/legal/LegalPreviewSheet";

const Signup = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const { signUp, user, isLoading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) navigate(redirect, { replace: true });
  }, [authLoading, user, navigate, redirect]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter your first and last name.");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!agree) {
      toast.error("Please accept the Terms and Privacy Policy.");
      return;
    }

    setSubmitting(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const { error } = await signUp(email.trim(), password, fullName);
    setSubmitting(false);

    if (error) {
      toast.error(error.message || "Could not create account. Please try again.");
      return;
    }

    toast.success("Account created! Check your email for a 6-digit code.");
    navigate(`/verify-otp?mode=signup&email=${encodeURIComponent(email.trim())}${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ""}`);
    return;
  };

  // Post-signup confirmation screen (legacy, unused now)
  if (sentTo) {
    return (
      <div className="min-h-[100dvh] w-full bg-gradient-to-br from-emerald-950 via-background to-background flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 mb-4">
            <MailCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
          <p className="text-sm text-muted-foreground mt-2">
            We sent a confirmation link to <span className="font-semibold text-foreground">{sentTo}</span>.
            Click the link to activate your account, then come back to sign in.
          </p>
          <Button
            asChild
            className="mt-6 w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Link to={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}>
              Go to Sign In
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden flex items-center justify-center px-4 py-3 bg-[#04100d]">
      <SEOHead title="Create your ZIVO account" description="Sign up for ZIVO to search flights, hotels and more." />

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-90 [background:conic-gradient(from_180deg_at_50%_50%,#022c22_0deg,#064e3b_90deg,#0f766e_180deg,#022c22_270deg,#022c22_360deg)]" />
        <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-emerald-400/40 blur-[140px] animate-pulse" />
        <div className="absolute top-1/4 -right-40 w-[560px] h-[560px] rounded-full bg-teal-300/25 blur-[160px] animate-pulse" style={{ animationDelay: "1.4s" }} />
        <div className="absolute -bottom-48 left-1/3 w-[620px] h-[620px] rounded-full bg-emerald-700/35 blur-[180px] animate-pulse" style={{ animationDelay: "2.6s" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
      </div>

      <div className="relative w-full max-w-md animate-flip-in">
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_8px_32px_rgba(16,185,129,0.45)] mb-2 ring-1 ring-white/20">
            <MailCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-emerald-200 bg-clip-text text-transparent tracking-tight">ZIVO ID</h1>
          <p className="text-xs text-white/60 mt-0.5">
            Get Started Free — No credit card needed
          </p>
        </div>

        <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-emerald-400/50 via-emerald-500/10 to-transparent shadow-[0_30px_80px_-20px_rgba(16,185,129,0.45)]">
        <form
          onSubmit={onSubmit}
          className="rounded-2xl bg-[#0a1f1a]/85 backdrop-blur-2xl p-4 space-y-2.5"
        >
          {/* Names */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="su-first" className="text-sm font-medium text-foreground">First Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="su-first"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  disabled={submitting}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background/60 border border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none text-base text-foreground placeholder:text-muted-foreground transition"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="su-last" className="text-sm font-medium text-foreground">Last Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="su-last"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  disabled={submitting}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background/60 border border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none text-base text-foreground placeholder:text-muted-foreground transition"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="su-email" className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="su-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={submitting}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-background/60 border border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none text-base text-foreground placeholder:text-muted-foreground transition"
              />
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="su-pw" className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="su-pw"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8+ chars"
                  disabled={submitting}
                  className="w-full h-10 pl-9 pr-10 rounded-xl bg-background/60 border border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none text-base text-foreground placeholder:text-muted-foreground transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="su-pw2" className="text-sm font-medium text-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="su-pw2"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter"
                  disabled={submitting}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background/60 border border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none text-base text-foreground placeholder:text-muted-foreground transition"
                />
              </div>
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 select-none cursor-pointer">
            <Checkbox
              checked={agree}
              onCheckedChange={(v) => setAgree(!!v)}
              className="mt-0.5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
            />
            <span className="text-sm text-muted-foreground">
              I agree to the{" "}
              <LegalPreviewLink kind="terms" className="text-emerald-400 hover:text-emerald-300 font-medium underline-offset-2 hover:underline">Terms of Service</LegalPreviewLink>
              {" "}and{" "}
              <LegalPreviewLink kind="privacy" className="text-emerald-400 hover:text-emerald-300 font-medium underline-offset-2 hover:underline">Privacy Policy</LegalPreviewLink>
            </span>
          </label>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
              className="font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Log In
            </Link>
          </p>
        </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By signing up, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default Signup;
