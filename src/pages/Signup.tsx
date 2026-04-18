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
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-emerald-950 via-background to-background flex items-center justify-center px-4 py-3">
      <SEOHead title="Create your ZIVO account" description="Sign up for ZIVO to search flights, hotels and more." />

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-3">
          <h1 className="text-2xl font-bold text-foreground">ZIVO ID</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Get Started Free — No credit card needed
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-emerald-500/20 bg-card/70 backdrop-blur-xl shadow-2xl p-4 space-y-2.5"
        >
          {/* Names */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
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
          <div className="space-y-1.5">
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
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
              <Link to="/terms" className="text-emerald-400 hover:text-emerald-300 font-medium">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300 font-medium">Privacy Policy</Link>
            </span>
          </label>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-xl text-base font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
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

        <p className="text-center text-xs text-muted-foreground mt-4">
          By signing up, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default Signup;
