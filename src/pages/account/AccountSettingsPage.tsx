import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, Globe, UserCheck, Bell, CreditCard, Gift, ChevronRight,
  UserPen, Scale, BarChart3, ShieldCheck, Download, Clock, Search, X,
  Smartphone, Heart, Users, Palette, MapPin, Plane, Star, Tag, Crown, UserPlus,
  FileText, HelpCircle, MessageSquare, AlertTriangle, Send, Info, Sparkles, StarIcon, LogOut, Database,
  Briefcase, Tv, Video, Mic, DollarSign, ClipboardList, Stethoscope, Dumbbell, Activity,
  Rocket, Hash, BookOpen, PenTool, KeyRound, Languages, Eye, Lock, Fingerprint,
  Cookie, Wallet, Receipt, ShoppingBag, Bookmark, Target, Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUsername } from "@/hooks/useUsername";
import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import packageJson from "../../../package.json";

interface SettingItem {
  icon: typeof Shield;
  label: string;
  description: string;
  href: string;
  color: string;
  iconColor: string;
}

interface SettingsGroup {
  title: string;
  items: SettingItem[];
}

const settingsGroups: SettingsGroup[] = [
  {
    title: "Account",
    items: [
      { icon: UserPen, label: "Profile Information", description: "Name, email & phone", href: "/account/profile-edit", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
      { icon: Shield, label: "Security", description: "Password & 2FA", href: "/account/security", color: "bg-teal-500/15", iconColor: "text-teal-500" },
      { icon: KeyRound, label: "Passcode", description: "App lock code", href: "/chat/settings/passcode", color: "bg-teal-500/15", iconColor: "text-teal-500" },
      { icon: Fingerprint, label: "Biometrics", description: "Face ID & fingerprint", href: "/account/security", color: "bg-cyan-500/15", iconColor: "text-cyan-500" },
      { icon: Smartphone, label: "Linked Devices", description: "Sign in another device with QR", href: "/account/linked-devices", color: "bg-cyan-500/15", iconColor: "text-cyan-500" },
      { icon: UserCheck, label: "Account Status", description: "Manage your account", href: "/profile/delete-account", color: "bg-orange-500/15", iconColor: "text-orange-500" },
      { icon: ShieldCheck, label: "Verification", description: "Request verified badge", href: "/account/verification", color: "bg-blue-500/15", iconColor: "text-blue-500" },
      { icon: MapPin, label: "Saved Addresses", description: "Manage saved places & addresses", href: "/account/addresses", color: "bg-lime-500/15", iconColor: "text-lime-500" },
      { icon: Plane, label: "Traveler Profiles", description: "Manage travel profiles & preferences", href: "/account/travelers", color: "bg-violet-500/15", iconColor: "text-violet-500" },
      { icon: Hash, label: "Username", description: "Change your @handle", href: "/account/profile-edit", color: "bg-blue-500/15", iconColor: "text-blue-500" },
    ],
  },
  {
    title: "Privacy & Notifications",
    items: [
      { icon: Shield, label: "Privacy & Safety", description: "Blocks, mutes & visibility", href: "/account/privacy", color: "bg-rose-500/15", iconColor: "text-rose-500" },
      { icon: Database, label: "Data Rights", description: "GDPR/CCPA — access, delete, consents", href: "/account/data-rights", color: "bg-zinc-500/15", iconColor: "text-zinc-500" },
      { icon: Bell, label: "Notifications", description: "Preferences & alerts", href: "/account/notifications", color: "bg-sky-500/15", iconColor: "text-sky-500" },
      { icon: Globe, label: "Preferences", description: "Language & settings", href: "/account/preferences", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
      { icon: Eye, label: "Read Receipts", description: "Show when you read messages", href: "/account/privacy#receipts", color: "bg-rose-500/15", iconColor: "text-rose-500" },
      { icon: Lock, label: "Two-Step Verification", description: "Extra login security", href: "/chat/settings/two-step", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
      { icon: Bell, label: "Login Alerts", description: "New device notifications", href: "/chat/settings/login-alerts", color: "bg-sky-500/15", iconColor: "text-sky-500" },
      { icon: Cookie, label: "Cookie Settings", description: "Tracking preferences", href: "/account/data-rights#cookies", color: "bg-amber-500/15", iconColor: "text-amber-500" },
      { icon: Languages, label: "Auto-Translate", description: "Translate messages & posts", href: "/account/preferences#translation", color: "bg-teal-500/15", iconColor: "text-teal-500" },
    ],
  },
  {
    title: "Payments & Rewards",
    items: [
      { icon: CreditCard, label: "Payment Methods", description: "Manage cards & wallets", href: "/account/wallet", color: "bg-purple-500/15", iconColor: "text-purple-500" },
      { icon: Gift, label: "Gift Cards", description: "Buy, send, or redeem", href: "/account/gift-cards", color: "bg-pink-500/15", iconColor: "text-pink-500" },
      { icon: Heart, label: "Favorites", description: "Saved items & places", href: "/account/favorites", color: "bg-red-500/15", iconColor: "text-red-500" },
      { icon: Star, label: "Loyalty Rewards", description: "Points, rewards & tier status", href: "/account/loyalty", color: "bg-yellow-500/15", iconColor: "text-yellow-500" },
      { icon: Tag, label: "Promos & Offers", description: "Promo codes & special deals", href: "/account/promos", color: "bg-fuchsia-500/15", iconColor: "text-fuchsia-500" },
      { icon: Crown, label: "Membership", description: "ZIVO+ plans & benefits", href: "/account/membership", color: "bg-amber-600/15", iconColor: "text-amber-600" },
      { icon: UserPlus, label: "Referrals", description: "Invite friends & earn rewards", href: "/account/referrals", color: "bg-teal-600/15", iconColor: "text-teal-600" },
      { icon: FileText, label: "Invoices", description: "View & download business invoices", href: "/account/invoices", color: "bg-stone-500/15", iconColor: "text-stone-500" },
    ],
  },
  {
    title: "Creator & Monetization",
    items: [
      { icon: Rocket, label: "Creator Dashboard", description: "Earnings, stats & analytics", href: "/creator-dashboard", color: "bg-violet-500/15", iconColor: "text-violet-500" },
      { icon: DollarSign, label: "Monetization", description: "Revenue programs & payouts", href: "/monetization", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
      { icon: Activity, label: "Live Earnings", description: "Real-time tips & gifts", href: "/creator/live-earnings", color: "bg-pink-500/15", iconColor: "text-pink-500" },
      { icon: Hash, label: "My Channels", description: "Manage your channels", href: "/channels", color: "bg-blue-500/15", iconColor: "text-blue-500" },
      { icon: BarChart3, label: "Content Analytics", description: "Performance insights", href: "/content-analytics", color: "bg-cyan-500/15", iconColor: "text-cyan-500" },
      { icon: PenTool, label: "Digital Products", description: "Sell courses & files", href: "/digital-products", color: "bg-fuchsia-500/15", iconColor: "text-fuchsia-500" },
      { icon: BookOpen, label: "Creator Academy", description: "Guides & tutorials", href: "/monetization/articles", color: "bg-orange-500/15", iconColor: "text-orange-500" },
    ],
  },
  {
    title: "Jobs & Career",
    items: [
      { icon: Briefcase, label: "Jobs Hub", description: "Apply, track & manage", href: "/personal-dashboard", color: "bg-blue-500/15", iconColor: "text-blue-500" },
      { icon: Target, label: "Apply for Jobs", description: "Browse open positions", href: "/personal/apply-job", color: "bg-sky-500/15", iconColor: "text-sky-500" },
      { icon: ClipboardList, label: "My Applications", description: "Track application status", href: "/personal/my-applications", color: "bg-amber-500/15", iconColor: "text-amber-500" },
      { icon: FileText, label: "Resume / CV", description: "Build & manage CV", href: "/personal/create-cv", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
      { icon: UserPlus, label: "Find Employees", description: "Hire talent", href: "/personal/find-employee", color: "bg-violet-500/15", iconColor: "text-violet-500" },
      { icon: Bell, label: "Job Alerts", description: "Match notifications", href: "/personal/notifications", color: "bg-yellow-500/15", iconColor: "text-yellow-500" },
      { icon: Wallet, label: "Pay Stubs", description: "Payment history", href: "/personal/pay-stubs", color: "bg-green-500/15", iconColor: "text-green-500" },
    ],
  },
  {
    title: "Live & Streaming",
    items: [
      { icon: Tv, label: "Live Streams", description: "Watch live broadcasts", href: "/live", color: "bg-rose-500/15", iconColor: "text-rose-500" },
      { icon: Video, label: "Go Live", description: "Start broadcasting", href: "/go-live", color: "bg-red-500/15", iconColor: "text-red-500" },
      { icon: Mic, label: "Audio Spaces", description: "Voice rooms", href: "/spaces", color: "bg-purple-500/15", iconColor: "text-purple-500" },
      { icon: Hash, label: "Channels Directory", description: "Discover channels", href: "/channels", color: "bg-blue-500/15", iconColor: "text-blue-500" },
      { icon: Sparkles, label: "AR Filters", description: "Effects & filters", href: "/filters", color: "bg-fuchsia-500/15", iconColor: "text-fuchsia-500" },
      { icon: Bell, label: "Live Notifications", description: "Alerts when followed creators go live", href: "/account/notifications#live", color: "bg-amber-500/15", iconColor: "text-amber-500" },
    ],
  },
  {
    title: "Health & Wellness",
    items: [
      { icon: Activity, label: "Activity Tracker", description: "Daily stats & steps", href: "/wellness/activity", color: "bg-emerald-500/15", iconColor: "text-emerald-500" },
      { icon: Dumbbell, label: "Workouts", description: "Plans & guides", href: "/wellness/workouts", color: "bg-red-500/15", iconColor: "text-red-500" },
      { icon: Heart, label: "Health Vitals", description: "Heart rate, BP, sleep", href: "/wellness/vitals", color: "bg-pink-500/15", iconColor: "text-pink-500" },
      { icon: Stethoscope, label: "Telehealth", description: "Talk to a doctor", href: "/wellness/telehealth", color: "bg-blue-500/15", iconColor: "text-blue-500" },
      { icon: Trophy, label: "Wellness Goals", description: "Milestones & rewards", href: "/wellness/goals", color: "bg-yellow-500/15", iconColor: "text-yellow-500" },
      { icon: Bell, label: "Reminders", description: "Daily wellness reminders", href: "/account/notifications#wellness", color: "bg-sky-500/15", iconColor: "text-sky-500" },
    ],
  },
  {
    title: "Shopping & Orders",
    items: [
      { icon: ShoppingBag, label: "My Orders", description: "Order history", href: "/grocery/orders", color: "bg-amber-500/15", iconColor: "text-amber-500" },
      { icon: Receipt, label: "Receipts", description: "Past payments", href: "/account/invoices", color: "bg-stone-500/15", iconColor: "text-stone-500" },
      { icon: Bookmark, label: "Saved Items", description: "Wishlist", href: "/saved", color: "bg-violet-500/15", iconColor: "text-violet-500" },
      { icon: ClipboardList, label: "Subscriptions", description: "Plans & renewals", href: "/account/membership", color: "bg-purple-500/15", iconColor: "text-purple-500" },
    ],
  },
  {
    title: "Data & Activity",
    items: [
      { icon: BarChart3, label: "Analytics", description: "Profile stats & insights", href: "/account/analytics", color: "bg-cyan-500/15", iconColor: "text-cyan-500" },
      { icon: Download, label: "Export Data", description: "Download your data", href: "/account/export", color: "bg-green-500/15", iconColor: "text-green-500" },
      { icon: Clock, label: "Activity Log", description: "Login & action history", href: "/account/activity-log", color: "bg-amber-500/15", iconColor: "text-amber-500" },
      { icon: Database, label: "Storage", description: "Manage cache & files", href: "/chat/settings/storage", color: "bg-indigo-500/15", iconColor: "text-indigo-500" },
      { icon: Scale, label: "Legal & Policies", description: "Terms, privacy & policies", href: "/account/legal", color: "bg-slate-500/15", iconColor: "text-slate-500" },
    ],
  },
  {
    title: "Help & Support",
    items: [
      { icon: HelpCircle, label: "Help Center", description: "Browse articles & FAQs", href: "/help-center", color: "bg-blue-400/15", iconColor: "text-blue-400" },
      { icon: MessageSquare, label: "Contact Support", description: "Get help from our team", href: "/support", color: "bg-emerald-400/15", iconColor: "text-emerald-400" },
      { icon: AlertTriangle, label: "Report a Problem", description: "Tell us about a bug or issue", href: "/feedback?type=bug", color: "bg-orange-400/15", iconColor: "text-orange-400" },
      { icon: Send, label: "Send Feedback", description: "Share ideas & suggestions", href: "/feedback", color: "bg-violet-400/15", iconColor: "text-violet-400" },
    ],
  },
  {
    title: "About",
    items: [
      { icon: Info, label: "About ZIVO", description: "Our mission & story", href: "/about", color: "bg-slate-400/15", iconColor: "text-slate-400" },
      { icon: Sparkles, label: "What's New", description: "Latest features & updates", href: "/about#changelog", color: "bg-pink-400/15", iconColor: "text-pink-400" },
      { icon: StarIcon, label: "Rate the App", description: "Leave a rating in the store", href: "/about#rate", color: "bg-yellow-400/15", iconColor: "text-yellow-400" },
    ],
  },
];

const allItems = settingsGroups.flatMap(g => g.items);

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile } = useUserProfile();
  const { username } = useUsername();
  const { points } = useLoyaltyPoints();
  const [search, setSearch] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  // Followers / following counts
  const { data: socialStats } = useQuery({
    queryKey: ["account-settings-social", user?.id],
    queryFn: async () => {
      if (!user) return { followers: 0, following: 0 };
      const [{ count: followers }, { count: following }] = await Promise.all([
        (supabase as any).from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id),
        (supabase as any).from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id),
      ]);
      return { followers: followers || 0, following: following || 0 };
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return n.toLocaleString();
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return allItems.filter(
      i => i.label.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
    );
  }, [search]);

  const initials = useMemo(() => {
    if (profile?.full_name) return profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  }, [profile?.full_name, user?.email]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast.success("Signed out");
      navigate("/login");
    } catch (e: any) {
      toast.error(e?.message || "Failed to sign out");
      setSigningOut(false);
    }
  };

  const renderItem = (item: SettingItem, index: number) => (
    <motion.button
      key={item.label}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={() => navigate(item.href)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card border border-border/40 hover:bg-accent/50 transition-all text-left active:scale-[0.98]"
    >
      <div className={`h-9 w-9 min-w-9 rounded-full ${item.color} flex items-center justify-center`}>
        <item.icon className={`h-4 w-4 ${item.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground">{item.label}</p>
        <p className="text-[11px] text-muted-foreground">{item.description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 safe-area-top z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate("/more")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      {/* User profile header */}
      {user && (
        <motion.button
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => navigate("/account/profile-edit")}
          className="w-full mx-auto mt-3 flex items-center gap-3 px-3 py-3 rounded-2xl bg-card border border-border/40 hover:bg-accent/50 transition-all active:scale-[0.99] max-w-[calc(100%-1.5rem)]"
        >
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "Profile"} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-base font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-foreground truncate">
              {profile?.full_name || "Add your name"}
            </p>
            {username && (
              <p className="text-[11px] text-primary font-medium truncate">@{username}</p>
            )}
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] text-muted-foreground">View profile</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
          </div>
        </motion.button>
      )}

      {/* Quick stats bar */}
      {user && (
        <div className="mx-auto mt-2 max-w-[calc(100%-1.5rem)] grid grid-cols-3 gap-2 px-3">
          <button
            onClick={() => navigate("/profile?tab=followers")}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-card border border-border/40 hover:bg-accent/50 transition-all active:scale-[0.97]"
          >
            <span className="text-sm font-bold text-foreground tabular-nums">{formatCount(socialStats?.followers ?? 0)}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Followers</span>
          </button>
          <button
            onClick={() => navigate("/profile?tab=following")}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-card border border-border/40 hover:bg-accent/50 transition-all active:scale-[0.97]"
          >
            <span className="text-sm font-bold text-foreground tabular-nums">{formatCount(socialStats?.following ?? 0)}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Following</span>
          </button>
          <button
            onClick={() => navigate("/account/loyalty")}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-card border border-border/40 hover:bg-accent/50 transition-all active:scale-[0.97]"
          >
            <span className="text-sm font-bold text-primary tabular-nums">{formatCount(points?.points_balance ?? 0)}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Points</span>
          </button>
        </div>
      )}

      {/* Search */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search settings…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-9 h-10 rounded-xl bg-muted/50 border-border/40 text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-5">
        <AnimatePresence mode="wait">
          {filtered ? (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No settings found for "{search}"</p>
              ) : (
                filtered.map((item, i) => renderItem(item, i))
              )}
            </motion.div>
          ) : (
            <motion.div key="groups" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {settingsGroups.map((group) => (
                <div key={group.title}>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
                    {group.title}
                  </p>
                  <div className="space-y-1.5">
                    {group.items.map((item, i) => renderItem(item, i))}
                  </div>
                </div>
              ))}

              {/* Sign out */}
              {user && (
                <div>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full h-11 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {signingOut ? "Signing out…" : "Sign out"}
                  </Button>
                </div>
              )}

              {/* Version footer */}
              <p className="text-center text-[10px] text-muted-foreground/60 pt-2 pb-6">
                ZIVO v{packageJson.version}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
