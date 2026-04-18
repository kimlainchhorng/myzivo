/**
 * GuestProfilePreview — shown on /profile when no user is signed in.
 * Lets guests browse public Account-tab content and sign in/up via clear CTAs,
 * instead of being hard-redirected to /login.
 */
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, LogIn, UserPlus, FileText, ShieldCheck, HelpCircle, Info, ChevronRight, Globe, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import NavBar from "@/components/home/NavBar";
import SEOHead from "@/components/SEOHead";

export default function GuestProfilePreview() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEOHead
        title="Account · ZIVO"
        description="Sign in to ZIVO to access your wallet, trips, social feed, and more."
      />
      <NavBar />

      <div className="max-w-md mx-auto px-4 pt-4 lg:pt-8">
        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 text-primary-foreground shadow-xl">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black mb-1">Welcome to ZIVO</h1>
            <p className="text-sm text-primary-foreground/80 mb-5 leading-relaxed">
              Sign in to like, follow, message, book rides, send gifts, and unlock your personal hub.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="secondary"
                className="h-11 rounded-xl font-bold gap-2 bg-white text-primary hover:bg-white/90"
                onClick={() => navigate("/login")}
              >
                <LogIn className="w-4 h-4" />
                Log in
              </Button>
              <Button
                className="h-11 rounded-xl font-bold gap-2 bg-foreground text-background hover:bg-foreground/90"
                onClick={() => navigate("/signup")}
              >
                <UserPlus className="w-4 h-4" />
                Sign up
              </Button>
            </div>
          </div>
        </div>

        {/* What you can do as guest */}
        <div className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2">
            Browse without an account
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <BrowseTile to="/feed" label="Feed" icon={Heart} />
            <BrowseTile to="/reels" label="Reels" icon={Sparkles} />
            <BrowseTile to="/live" label="Live" icon={Users} />
            <BrowseTile to="/store-map" label="Map" icon={Globe} />
            <BrowseTile to="/explore" label="Explore" icon={Globe} />
            <BrowseTile to="/leaderboard" label="Top" icon={Sparkles} />
          </div>
        </div>

        {/* Public links */}
        <div className="mt-5 rounded-2xl bg-card border border-border overflow-hidden">
          <PublicLink to="/account/legal" icon={FileText} label="Legal & Policies" />
          <PublicLink to="/safety" icon={ShieldCheck} label="Safety Center" />
          <PublicLink to="/support" icon={HelpCircle} label="Help & Support" />
          <PublicLink to="/about" icon={Info} label="About ZIVO" last />
        </div>

        <p className="text-center text-[11px] text-muted-foreground/60 mt-6 px-6">
          By signing up you agree to ZIVO's Terms and Privacy Policy.
        </p>
      </div>

      <ZivoMobileNav />
    </div>
  );
}

function BrowseTile({ to, label, icon: Icon }: { to: string; label: string; icon: any }) {
  return (
    <Link
      to={to}
      className="aspect-square rounded-2xl bg-card border border-border flex flex-col items-center justify-center gap-1.5 hover:bg-muted active:scale-[0.97] transition"
    >
      <Icon className="w-5 h-5 text-primary" />
      <span className="text-[11px] font-semibold">{label}</span>
    </Link>
  );
}

function PublicLink({ to, icon: Icon, label, last }: { to: string; icon: any; label: string; last?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted active:bg-muted/70 transition ${
        last ? "" : "border-b border-border"
      }`}
    >
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
        <Icon className="w-4 h-4 text-foreground" />
      </div>
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </Link>
  );
}
