/**
 * ZIVO ID — Login page
 * - Facebook-style saved accounts: tap an avatar, enter password only
 * - Full email+password form for new/other accounts
 * - Remember me saves avatar/name to localStorage for quick re-login
 */
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Eye, EyeOff, UserPlus, X, ChevronLeft, AlertTriangle, MoreHorizontal, ExternalLink } from "lucide-react";
import { supabase, setRememberMePreference } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { useSavedAccounts, saveAccount, type SavedAccount } from "@/hooks/useSavedAccounts";

// ── Saved account avatar card ────────────────────────────────────────────────
// In `editing` mode the X delete button is shown on each avatar. In normal
// mode the avatar is a clean tap-to-switch target with no UI chrome — that's
// the Facebook/Instagram pattern (clean by default, edit on demand via "...").
function AccountCard({
  account,
  onSelect,
  onRemove,
  editing = false,
}: {
  account: SavedAccount;
  onSelect: (account: SavedAccount) => void;
  onRemove: (email: string) => void;
  editing?: boolean;
}) {
  const initials = account.fullName
    ? account.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : account.email[0].toUpperCase();

  const handleClick = () => {
    if (editing) return; // In edit mode, only the X is interactive
    onSelect(account);
  };

  return (
    <div
      className={`relative group flex flex-col items-center gap-2 ${editing ? "cursor-default" : "cursor-pointer"}`}
      onClick={handleClick}
    >
      {/* Remove button — only shown in edit mode, after the user taps "..." */}
      {editing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const name = account.fullName || account.email;
            toast(`Remove ${name}?`, {
              description: "You'll need to enter your email next time.",
              action: { label: "Remove", onClick: () => onRemove(account.email) },
              cancel: { label: "Cancel", onClick: () => {} },
            });
          }}
          className="absolute -top-1 -right-1 z-10 w-6 h-6 rounded-full bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center transition active:scale-90 shadow-md ring-2 ring-white dark:ring-zinc-900"
          aria-label={`Remove ${account.fullName || account.email}`}
          title="Remove this account"
        >
          <X className="w-3.5 h-3.5" strokeWidth={3} />
        </button>
      )}

      {/* Avatar — Instagram-style circular ring with brand gradient. The
          gentle wiggle in edit mode hints "tap the X to remove" without
          requiring any extra label. */}
      <div className={`w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 shadow-md transition ${editing ? "animate-pulse opacity-90" : "group-hover:scale-105 group-active:scale-95"}`}>
        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-900 flex items-center justify-center">
          {account.avatarUrl ? (
            <img src={account.avatarUrl} alt={account.fullName} className="w-full h-full object-cover" />
          ) : (
            <span className="bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 bg-clip-text text-transparent font-bold text-lg">{initials}</span>
          )}
        </div>
      </div>

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
  // Edit mode — toggled by the "..." button in picker, surfaces the X delete
  // buttons on each avatar. Default off so the picker feels clean (FB/IG).
  const [editingAccounts, setEditingAccounts] = useState(false);

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

  // When accounts change (e.g. all removed), fall back to full form and exit
  // edit mode so users don't get stuck staring at "Tap × to remove" with no
  // accounts left.
  useEffect(() => {
    if (accounts.length === 0) {
      setEditingAccounts(false);
      if (mode === "picker") setMode("full");
    }
  }, [accounts.length, mode]);

  const handleSelectAccount = async (account: SavedAccount) => {
    // Tap-to-sign-in flow with three escalating fallbacks so the user almost
    // never has to type a password again:
    //   1) Restore session via stored refresh_token   (instant — Facebook-style)
    //   2) If that fails, auto-email a 6-digit code   (one tap → /verify-otp)
    //   3) If even OTP send fails, show password mode (the security fallback)
    setSelectedAccount(account);
    setSubmitting(true);

    // ── Step 1: try one-tap session restore ──────────────────────────────
    // We use refreshSession() (not setSession()) because the stored access
    // token expires after 1 hour while the refresh token lives much longer
    // (~30 days). setSession({access_token, refresh_token}) installs the
    // expired access token locally and then any subsequent auth call returns
    // "Auth session missing!" — defeating the one-tap UX.
    //
    // refreshSession({refresh_token}) calls Supabase's token exchange
    // endpoint: server validates the refresh_token, returns a fresh pair, and
    // installs the live session client-side. This is exactly the FB / IG
    // "trusted device" flow.
    if (account.refreshToken) {
      try {
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: account.refreshToken,
        });
        if (!error && data?.session) {
          saveAccount({
            ...account,
            lastLoginAt: new Date().toISOString(),
            refreshToken: data.session.refresh_token ?? account.refreshToken,
            accessToken: data.session.access_token ?? account.accessToken,
            expiresAt: data.session.expires_at ?? null,
          });
          refresh();
          setSubmitting(false);
          toast.success(`Welcome back, ${account.fullName?.split(" ")[0] || ""}!`);
          navigate(redirect, { replace: true });
          return;
        }
      } catch {
        // fall through to password mode
      }
    }

    // ── Step 2: show password mode with both options ────────────────────
    // The stored token failed (signed out elsewhere, password rotated, etc.)
    // so we can't do silent one-tap. Drop the user on password mode where
    // they get TWO clear choices: type their password, OR tap "Email me &
    // open Gmail" to use the magic-link path. They stay in control.
    setSubmitting(false);
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

  // Webmail provider detection — used by the "Open Gmail/Outlook" button so
  // the secondary option goes straight to the user's inbox.
  const detectMailProvider = (addr: string): { name: string; url: string } | null => {
    const domain = addr.split("@")[1]?.toLowerCase() || "";
    if (!domain) return null;
    if (domain === "gmail.com" || domain === "googlemail.com") return { name: "Gmail", url: "https://mail.google.com/mail/u/0/#inbox" };
    if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live.com")) return { name: "Outlook", url: "https://outlook.live.com/mail/" };
    if (domain === "yahoo.com" || domain === "ymail.com") return { name: "Yahoo Mail", url: "https://mail.yahoo.com/" };
    if (domain === "icloud.com" || domain === "me.com" || domain === "mac.com") return { name: "iCloud Mail", url: "https://www.icloud.com/mail" };
    if (domain === "proton.me" || domain === "protonmail.com") return { name: "Proton Mail", url: "https://mail.proton.me/" };
    return null;
  };

  // Passwordless "Email me a code" — sends a 6-digit OTP to the given email
  // and routes to /verify-otp. Used as a fallback when the user can't remember
  // their password and doesn't want a full reset cycle.
  const sendEmailCode = async (targetEmail: string) => {
    const trimmed = targetEmail.trim().toLowerCase();
    if (!trimmed) {
      toast.error("Please enter your email first.");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({ email: trimmed });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Could not send sign-in code. Try again.");
      return;
    }
    toast.success("We sent a 6-digit code to your email.");
    navigate(`/verify-otp?email=${encodeURIComponent(trimmed)}&mode=login${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ""}`);
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

    // Precheck for better error messages. `auth_precheck_login` is a Postgres
    // RPC (not an edge fn) — calling it via functions.invoke 404'd on every
    // login attempt so we never got the "account exists" hint.
    let accountExists: boolean | null = null;
    try {
      const { data: precheck } = await (supabase as any).rpc("auth_precheck_login", {
        p_email: trimmedEmail,
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

    // Save account + session tokens for one-tap login next time.
    // We capture the live session so the next visit can call setSession()
    // and resume without a password — that's the FB/IG "tap to log in" feel.
    try {
      const [{ data: profile }, { data: sessionData }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, avatar_url, role")
          .eq("email", trimmedEmail)
          .maybeSingle(),
        supabase.auth.getSession(),
      ]);

      saveAccount({
        email: trimmedEmail,
        fullName: profile?.full_name || trimmedEmail.split("@")[0],
        avatarUrl: profile?.avatar_url ?? null,
        lastLoginAt: new Date().toISOString(),
        role: profile?.role ?? null,
        refreshToken: sessionData?.session?.refresh_token ?? null,
        accessToken: sessionData?.session?.access_token ?? null,
        expiresAt: sessionData?.session?.expires_at ?? null,
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
        <div className="relative bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-xl px-8 pt-10 pb-6 shadow-sm">
          {/* "..." More menu in picker mode — toggles edit mode for removing
              saved accounts. Hidden when there are no saved accounts. */}
          {mode === "picker" && accounts.length > 0 && (
            <button
              type="button"
              onClick={() => setEditingAccounts((v) => !v)}
              aria-label={editingAccounts ? "Done editing" : "More options"}
              title={editingAccounts ? "Done" : "Edit saved accounts"}
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition"
            >
              {editingAccounts ? (
                <span className="text-xs font-semibold text-rose-500">Done</span>
              ) : (
                <MoreHorizontal className="w-5 h-5" />
              )}
            </button>
          )}

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
            <div className="space-y-4 relative">
              {/* Inline spinner overlay shown when a tap-to-sign-in is in
                  flight (setSession or signInWithOtp). Avatars stay visible
                  but unclickable so the user gets visual feedback. */}
              {submitting && !editingAccounts && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-lg pointer-events-auto">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Signing in…</span>
                  </div>
                </div>
              )}
              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                {editingAccounts ? "Tap × to remove an account" : "Log in as"}
              </p>

              <div className="flex justify-center gap-5 flex-wrap">
                {accounts.slice(0, 4).map((acc) => (
                  <AccountCard
                    key={acc.email}
                    editing={editingAccounts}
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

          {/* ── MODE: selected account — password only ──
              Facebook-style "trusted" feel: avatar + name + tiny email, the
              browser fills the password from saved credentials, the user just
              taps "Log in". Hidden username field hints autofill which account
              to fill for. */}
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
                <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 shadow-md">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-900 flex items-center justify-center">
                    {selectedAccount.avatarUrl ? (
                      <img src={selectedAccount.avatarUrl} alt={selectedAccount.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 bg-clip-text text-transparent font-bold text-2xl">
                        {selectedAccount.fullName ? selectedAccount.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : selectedAccount.email[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-base font-semibold text-zinc-900 dark:text-white truncate max-w-full">{selectedAccount.fullName || selectedAccount.email.split("@")[0]}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-full">{selectedAccount.email}</p>
              </div>

              {/* Hidden email — tells the browser's password manager which
                  account this password belongs to, so autofill picks the right
                  saved credential without asking. */}
              <input
                type="email"
                name="email"
                autoComplete="username"
                value={selectedAccount.email}
                readOnly
                tabIndex={-1}
                aria-hidden="true"
                style={{ position: "absolute", left: "-10000px", width: "1px", height: "1px", opacity: 0 }}
              />

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

              {/* OR divider — separates the two clear sign-in options */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">OR</span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
              </div>

              {/* Option 2: passwordless via email link/code */}
              {(() => {
                const provider = detectMailProvider(selectedAccount.email);
                return (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await sendEmailCode(selectedAccount.email);
                        if (provider) window.open(provider.url, "_blank", "noopener,noreferrer");
                      }}
                      disabled={submitting}
                      className="w-full h-9 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 active:scale-[0.99] disabled:opacity-40 transition flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {provider ? `Email me & open ${provider.name}` : "Email me a sign-in link"}
                    </button>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between text-xs pt-1">
                <Link to="/forgot-password" className="font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white">
                  Forgot password?
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const name = selectedAccount.fullName || selectedAccount.email;
                    toast(`Remove ${name}?`, {
                      description: "You'll need to enter your email next time.",
                      action: {
                        label: "Remove",
                        onClick: () => {
                          remove(selectedAccount.email);
                          setSelectedAccount(null);
                          setPassword("");
                          setMode(accounts.length > 1 ? "picker" : "full");
                        },
                      },
                      cancel: { label: "Cancel", onClick: () => {} },
                    });
                  }}
                  className="font-medium text-rose-500 hover:text-rose-600"
                >
                  Remove this account
                </button>
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

              {/* Option 2: passwordless via email link/code */}
              {(() => {
                const provider = detectMailProvider(email);
                return (
                  <button
                    type="button"
                    onClick={async () => {
                      await sendEmailCode(email);
                      if (provider) window.open(provider.url, "_blank", "noopener,noreferrer");
                    }}
                    disabled={submitting || !email.trim()}
                    className="w-full h-9 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 active:scale-[0.99] disabled:opacity-40 transition flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {provider ? `Email me & open ${provider.name}` : "Email me a sign-in link"}
                  </button>
                );
              })()}

              <div className="text-center pt-2">
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
