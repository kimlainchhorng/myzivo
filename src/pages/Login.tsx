/**
 * ZIVO ID — Login page (rebuilt clean v2026)
 * - Plain native <input> elements (no custom wrappers) so iPhone Safari typing works.
 * - Emerald glassmorphic ZIVO branding.
 * - Email + password only.
 */
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const { signIn, user, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // If already signed in, leave the login page
  useEffect(() => {
    if (!authLoading && user) navigate(redirect, { replace: true });
  }, [authLoading, user, navigate, redirect]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Sign in failed. Please try again.");
      return;
    }
    toast.success("Welcome back!");
    navigate(redirect, { replace: true });
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[radial-gradient(ellipse_at_top,_hsl(var(--background))_0%,_#020a08_60%,_#000_100%)] flex items-center justify-center px-4 py-10">
      <SEOHead title="Sign in to ZIVO" description="Sign in to your ZIVO account" />

      {/* Aurora background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-emerald-500/30 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-[460px] h-[460px] rounded-full bg-teal-400/20 blur-[140px] animate-pulse" style={{ animationDelay: "1.2s" }} />
        <div className="absolute -bottom-40 left-1/4 w-[520px] h-[520px] rounded-full bg-emerald-700/25 blur-[160px] animate-pulse" style={{ animationDelay: "2.4s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)/0.6))]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(hsl(var(--foreground))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground))_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">ZIVO ID</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome Back — Zivo All in One Place</p>
        </div>

        {/* Glass card */}
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-emerald-500/20 bg-card/70 backdrop-blur-xl shadow-2xl p-6 space-y-5"
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={submitting}
                className="w-full h-12 pl-10 pr-3 rounded-xl bg-background/60 border border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none text-base text-foreground placeholder:text-muted-foreground transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                disabled={submitting}
                className="w-full h-12 pl-10 pr-11 rounded-xl bg-background/60 border border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none text-base text-foreground placeholder:text-muted-foreground transition"
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

          {/* Remember */}
          <label className="flex items-center gap-2 select-none cursor-pointer">
            <Checkbox
              checked={remember}
              onCheckedChange={(v) => setRemember(!!v)}
              className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
            />
            <span className="text-sm text-muted-foreground">Remember me on this device</span>
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
                Sign In <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to={`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
              className="font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Sign Up
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
};

export default Login;
