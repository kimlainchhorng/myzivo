/**
 * ZIVO ID — Login page
 * - Facebook-style saved accounts: tap an avatar, enter password only
 * - Full email+password form for new/other accounts
 * - Remember me saves avatar/name to localStorage for quick re-login
 */
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, UserPlus, X, ChevronLeft, Car, AlertTriangle } from "lucide-react";
import { supabase, setRememberMePreference } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { useSavedAccounts, saveAccount, type SavedAccount } from "@/hooks/useSavedAccounts";

// ── Saved account avatar card ────────────────────────────────────────────────
function AccountCard({
  account,
  onSelect,
  onRemove,
}: {
  account: SavedAccount;
  onSelect: (account: SavedAccount) => void;
  onRemove: (email: string) => void;
}) {
  const initials = account.fullName
    ? account.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : account.email[0].toUpperCase();

  return (
    <div className="relative group flex flex-col items-center gap-2 cursor-pointer" onClick={() => onSelect(account)}>
      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(account.email); }}
        className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
        aria-label="Remove account"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Avatar */}
      <div className="w-16 h-16 rounded-2xl ring-2 ring-white/10 overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg group-hover:ring-emerald-400/60 transition">
        {account.avatarUrl ? (
          <img src={account.avatarUrl} alt={account.fullName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-bold text-lg">{initials}</span>
        )}
      </div>

      {/* Name */}
      <span className="text-xs text-white/80 font-medium text-center max-w-[72px] truncate">
        {account.fullName || account.email.split("@")[0]}
      </span>
    </div>
  );
}

// ── Main login page ──────────────────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const { signIn, user, isLoading: authLoading } = useAuth();
  const { accounts, remove, refresh } = useSavedAccounts();

  // "picker" = show saved accounts, "password" = selected an account (email locked),
  // "full" = show email+password form for a new account
  type Mode = "picker" | "password" | "full";
  const [mode, setMode] = useState<Mode>(() => (accounts.length > 0 ? "picker" : "full"));
  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    !submitting &&
    password.length > 0 &&
    (mode === "password" ? !!selectedAccount : email.trim().length > 0);

  const passwordKeyHandlers = {
    onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) =>
      setCapsLockOn(e.getModifierState("CapsLock")),
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) =>
      setCapsLockOn(e.getModifierState("CapsLock")),
    onBlur: () => setCapsLockOn(false),
  };

  const capsLockNotice = capsLockOn ? (
    <p role="alert" className="flex items-center gap-1.5 text-xs text-amber-400 mt-1">
      <AlertTriangle className="w-3.5 h-3.5" />
      Caps Lock is on
    </p>
  ) : null;

  useEffect(() => {
    if (!authLoading && user) navigate(redirect, { replace: true });
  }, [authLoading, user, navigate, redirect]);

  // When accounts change (e.g. all removed), fall back to full form
  useEffect(() => {
    if (accounts.length === 0 && mode === "picker") setMode("full");
  }, [accounts.length, mode]);

  const handleSelectAccount = (account: SavedAccount) => {
    setSelectedAccount(account);
    setEmail(account.email);
    setPassword("");
    setMode("password");
  };

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setEmail("");
    setPassword("");
    setMode("full");
  };

  const handleBack = () => {
    setPassword("");
    setMode(accounts.length > 0 ? "picker" : "full");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const trimmedEmail = (mode === "password" ? selectedAccount!.email : email).trim();
    if (!trimmedEmail || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setSubmitting(true);

    // Precheck for better error messages
    let accountExists: boolean | null = null;
    try {
      const { data: precheck } = await supabase.functions.invoke("auth_precheck_login", {
        body: { email: trimmedEmail },
      });
      if (precheck && typeof precheck.exists === "boolean") accountExists = precheck.exists;
    } catch {}

    setRememberMePreference(true);
    const { error } = await signIn(trimmedEmail, password);

    if (error) {
      setSubmitting(false);
      if (error.message === "DRIVER_ACCOUNT") {
        toast.error("This is a ZIVO Driver account. Please use the ZIVO Driver app to sign in.", {
          duration: 6000,
          description: "Driver accounts cannot access the passenger app.",
          action: {
            label: "Driver App",
            onClick: () => window.open("https://apps.apple.com/us/app/zivodrivers/id6759507131", "_blank", "noopener"),
          },
        });
        return;
      }
      const msg = (error.message || "").toLowerCase();
      const badCreds = msg.includes("invalid login") || msg.includes("invalid credentials") || msg.includes("user not found");

      if (accountExists === false || msg.includes("user not found")) {
        toast.error("No account found for this email.", {
          action: { label: "Sign Up", onClick: () => navigate(`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`) },
        });
      } else if (accountExists === true || badCreds) {
        toast.error("Wrong password — please try again.", {
          action: { label: "Forgot?", onClick: () => navigate("/forgot-password") },
        });
      } else {
        toast.error(error.message || "Sign in failed. Please try again.");
      }
      return;
    }

    // Save account for next time
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, role")
        .eq("email", trimmedEmail)
        .maybeSingle();

      saveAccount({
        email: trimmedEmail,
        fullName: profile?.full_name || trimmedEmail.split("@")[0],
        avatarUrl: profile?.avatar_url ?? null,
        lastLoginAt: new Date().toISOString(),
        role: profile?.role ?? null,
      });
      refresh();
    } catch {}

    setSubmitting(false);
    toast.success("Welcome back!");
    navigate(redirect, { replace: true });
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden flex items-center justify-center px-4 py-10 bg-[#04100d]">
      <SEOHead title="Sign in to ZIVO" description="Sign in to your ZIVO account" />

      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-90 [background:conic-gradient(from_180deg_at_50%_50%,#022c22_0deg,#064e3b_90deg,#0f766e_180deg,#022c22_270deg,#022c22_360deg)]" />
        <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-emerald-400/40 blur-[140px] animate-pulse" />
        <div className="absolute top-1/4 -right-40 w-[560px] h-[560px] rounded-full bg-teal-300/25 blur-[160px] animate-pulse" style={{ animationDelay: "1.4s" }} />
        <div className="absolute -bottom-48 left-1/3 w-[620px] h-[620px] rounded-full bg-emerald-700/35 blur-[180px] animate-pulse" style={{ animationDelay: "2.6s" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
      </div>

      <div className="relative w-full max-w-md animate-flip-in">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_8px_32px_rgba(16,185,129,0.45)] mb-3 ring-1 ring-white/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-b from-white to-emerald-200 bg-clip-text text-transparent tracking-tight">ZIVO ID</h1>
          <p className="text-sm text-white/60 mt-1">Welcome Back — Zivo All in One Place</p>
        </div>

        <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-emerald-400/50 via-emerald-500/10 to-transparent shadow-[0_30px_80px_-20px_rgba(16,185,129,0.45)]">
          <div className="rounded-2xl bg-[#0a1f1a]/85 backdrop-blur-2xl p-6">

            {/* ── MODE: saved account picker ── */}
            {mode === "picker" && (
              <div className="space-y-5">
                <p className="text-sm font-medium text-white/70 text-center">Continue as</p>

                {/* Account grid */}
                <div className="flex flex-wrap justify-center gap-4">
                  {accounts.map((acc) => (
                    <AccountCard
                      key={acc.email}
                      account={acc}
                      onSelect={handleSelectAccount}
                      onRemove={(email) => { remove(email); }}
                    />
                  ))}

                  {/* Add account tile */}
                  <div
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                    onClick={handleAddAccount}
                  >
                    <div className="w-16 h-16 rounded-2xl ring-2 ring-white/10 bg-white/5 flex items-center justify-center group-hover:ring-emerald-400/60 group-hover:bg-white/10 transition">
                      <UserPlus className="w-6 h-6 text-white/50 group-hover:text-emerald-400 transition" />
                    </div>
                    <span className="text-xs text-white/50 font-medium">Add account</span>
                  </div>
                </div>

                <p className="text-center text-xs text-muted-foreground pt-1">
                  Don't have an account?{" "}
                  <Link
                    to={`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
                    className="font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            )}

            {/* ── MODE: selected account — password only ── */}
            {mode === "password" && selectedAccount && (
              <form onSubmit={onSubmit} className="space-y-5">
                {/* Back */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {/* Selected account banner */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center flex-shrink-0">
                    {selectedAccount.avatarUrl ? (
                      <img src={selectedAccount.avatarUrl} alt={selectedAccount.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {selectedAccount.fullName ? selectedAccount.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : selectedAccount.email[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{selectedAccount.fullName || selectedAccount.email.split("@")[0]}</p>
                    <p className="text-xs text-white/50 truncate">{selectedAccount.email}</p>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="login-password" className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      {...passwordKeyHandlers}
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
                  {capsLockNotice}
                  <div className="text-right">
                    <Link to="/forgot-password" className="text-xs font-medium text-emerald-400 hover:text-emerald-300">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full h-12 rounded-xl text-base font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4 ml-1" /></>}
                </Button>
              </form>
            )}

            {/* ── MODE: full email + password form ── */}
            {mode === "full" && (
              <form onSubmit={onSubmit} className="space-y-5">
                {/* Back to accounts if any saved */}
                {accounts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition"
                  >
                    <ChevronLeft className="w-4 h-4" /> Saved accounts
                  </button>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="text-sm font-medium text-foreground">Email</label>
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
                    <label htmlFor="login-password-full" className="text-sm font-medium text-foreground">Password</label>
                    <Link to="/forgot-password" className="text-xs font-medium text-emerald-400 hover:text-emerald-300">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="login-password-full"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      {...passwordKeyHandlers}
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
                  {capsLockNotice}
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full h-12 rounded-xl text-base font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4 ml-1" /></>}
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
            )}

          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
};

export default Login;
