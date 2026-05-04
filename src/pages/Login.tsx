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
        className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-zinc-700 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md"
        aria-label="Remove account"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Avatar — Instagram-style circular ring with brand gradient on hover */}
      <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 shadow-md transition group-hover:scale-105">
        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-900 flex items-center justify-center">
          {account.avatarUrl ? (
            <img src={account.avatarUrl} alt={account.fullName} className="w-full h-full object-cover" />
          ) : (
            <span className="bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 bg-clip-text text-transparent font-bold text-lg">{initials}</span>
          )}
        </div>
      </div>

      {/* Name */}
      <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium text-center max-w-[72px] truncate">
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
    <div className="relative min-h-[100dvh] w-full overflow-hidden flex items-center justify-center px-5 py-8 bg-white dark:bg-black">
      <SEOHead title="Sign in to ZIVO" description="Sign in to your ZIVO account" />

      {/* Subtle gradient backdrop — IG keeps it minimal but ZIVO has a colorful brand */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-fuchsia-300/30 via-orange-200/30 to-rose-200/30 blur-3xl dark:from-fuchsia-600/20 dark:via-orange-600/20 dark:to-rose-600/20" />
        <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-amber-200/30 via-pink-200/30 to-purple-200/30 blur-3xl dark:from-amber-600/15 dark:via-pink-600/15 dark:to-purple-600/15" />
      </div>

      <div className="relative w-full max-w-sm flex flex-col items-stretch">
        {/* IG-style stack: card → "OR" → footer card */}

        {/* Main card */}
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-xl px-8 pt-10 pb-6 shadow-sm">
          {/* Brand wordmark — IG-style script logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 flex items-center justify-center mb-5 shadow-lg shadow-rose-500/20">
              <span className="text-white font-black text-3xl tracking-tight italic" style={{ fontFamily: "'Brush Script MT', cursive" }}>Z</span>
            </div>
            <h1 className="text-4xl font-light tracking-wider text-zinc-900 dark:text-white" style={{ fontFamily: "'Snell Roundhand', 'Brush Script MT', cursive", fontWeight: 600 }}>
              Zivo
            </h1>
          </div>

          {/* ── MODE: saved account picker ── */}
          {mode === "picker" && (
            <div className="space-y-4">
              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">Log in as</p>

              <div className="flex justify-center gap-5 flex-wrap">
                {accounts.slice(0, 4).map((acc) => (
                  <AccountCard
                    key={acc.email}
                    account={acc}
                    onSelect={handleSelectAccount}
                    onRemove={(email) => { remove(email); }}
                  />
                ))}

                <div
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                  onClick={handleAddAccount}
                >
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-center group-hover:border-rose-400 group-hover:bg-rose-50/50 dark:group-hover:border-rose-500 dark:group-hover:bg-rose-950/30 transition">
                    <UserPlus className="w-6 h-6 text-zinc-400 group-hover:text-rose-500 transition" />
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Add account</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddAccount}
                className="w-full text-center text-sm font-semibold text-rose-500 hover:text-rose-600 pt-2"
              >
                Log into another account
              </button>
            </div>
          )}

          {/* ── MODE: selected account — password only ── */}
          {mode === "password" && selectedAccount && (
            <form onSubmit={onSubmit} className="space-y-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition mb-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="flex flex-col items-center gap-2 pb-2">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 flex items-center justify-center ring-2 ring-zinc-200 dark:ring-zinc-700">
                  {selectedAccount.avatarUrl ? (
                    <img src={selectedAccount.avatarUrl} alt={selectedAccount.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-xl">
                      {selectedAccount.fullName ? selectedAccount.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : selectedAccount.email[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate max-w-full">{selectedAccount.fullName || selectedAccount.email.split("@")[0]}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-full">{selectedAccount.email}</p>
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  {...passwordKeyHandlers}
                  placeholder="Password"
                  disabled={submitting}
                  className="w-full h-11 px-3 pr-10 rounded-md bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {capsLockNotice}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full h-9 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 hover:opacity-95 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-md shadow-rose-500/20"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log in"}
              </button>

              <div className="text-center">
                <Link to="/forgot-password" className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white">
                  Forgot password?
                </Link>
              </div>
            </form>
          )}

          {/* ── MODE: full email + password form ── */}
          {mode === "full" && (
            <form onSubmit={onSubmit} className="space-y-2.5">
              {accounts.length > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition mb-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Saved accounts
                </button>
              )}

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
                placeholder="Phone number, username, or email"
                disabled={submitting}
                className="w-full h-11 px-3 rounded-md bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 transition"
              />

              <div className="relative">
                <input
                  id="login-password-full"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  {...passwordKeyHandlers}
                  placeholder="Password"
                  disabled={submitting}
                  className="w-full h-11 px-3 pr-10 rounded-md bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {capsLockNotice}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full h-9 mt-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 hover:opacity-95 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-md shadow-rose-500/20"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log in"}
              </button>

              {/* OR divider — Instagram signature */}
              <div className="flex items-center gap-4 py-3">
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">OR</span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
              </div>

              <div className="text-center">
                <Link to="/forgot-password" className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white">
                  Forgot password?
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footer card — IG-style "Don't have an account?" */}
        <div className="mt-3 bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-xl px-6 py-5 text-center shadow-sm">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Don't have an account?{" "}
            <Link
              to={`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
              className="font-semibold text-rose-500 hover:text-rose-600"
            >
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500 mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
};

export default Login;
