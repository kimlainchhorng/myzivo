/**
 * App More Screen — Quick Access only
 */
import { Fragment, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight, Settings, ShoppingBag, Wallet, MapPin, Handshake,
  Sparkles, Car, UtensilsCrossed, Store, Wrench, Building2, Truck, Shield,
  Copy, Share2, QrCode, Check, User, Plane, Hotel, DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAccess } from "@/hooks/useUserAccess";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getPublicOrigin, getProfileShareUrl } from "@/lib/getPublicOrigin";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const partnerOptions = [
  { icon: Car, label: "Become a Driver", description: "Earn money driving with ZIVO", href: "/partner-with-zivo?type=driver", color: "from-blue-500 to-blue-600" },
  { icon: UtensilsCrossed, label: "Become a Restaurant Partner", description: "List your restaurant on ZIVO", href: "/partner-with-zivo?type=restaurant", color: "from-orange-500 to-amber-500" },
  { icon: Store, label: "Become a Shop Partner", description: "Sell products through ZIVO", href: "/partner-with-zivo?type=store", color: "from-emerald-500 to-green-500" },
  { icon: Wrench, label: "Become an Auto Repair Partner", description: "Offer repair services on ZIVO", href: "/partner-with-zivo?type=auto-repair", color: "from-slate-500 to-slate-600" },
  { icon: Building2, label: "Become a Hotel Partner", description: "List your property on ZIVO", href: "/partner-with-zivo?type=hotel", color: "from-purple-500 to-purple-600" },
  { icon: Truck, label: "Become a Delivery Partner", description: "Deliver food & packages", href: "/partner-with-zivo?type=delivery", color: "from-rose-500 to-pink-500" },
];

const quickLinks = [
  { icon: Settings, label: "Settings", href: "/account/settings", description: "App settings & preferences", iconColor: "text-muted-foreground", iconBg: "bg-muted/60" },
  { icon: ShoppingBag, label: "My Orders", href: "/grocery/orders", description: "Order history & tracking", iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
  { icon: Wallet, label: "Wallet", href: "/wallet", description: "Balance & transactions", iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" },
  { icon: Sparkles, label: "Loyalty", href: "/account/loyalty", description: "Points & tier perks", iconColor: "text-amber-500", iconBg: "bg-amber-500/10" },
  { icon: MapPin, label: "Saved Addresses", href: "/account/addresses", description: "Delivery addresses", iconColor: "text-rose-500", iconBg: "bg-rose-500/10" },
  { icon: DollarSign, label: "Monetization", href: "/monetization", description: "Earn & grow revenue", iconColor: "text-primary", iconBg: "bg-primary/10" },
  { icon: Handshake, label: "Become Partner", href: "#partner", description: "Join ZIVO as partner", iconColor: "text-violet-500", iconBg: "bg-violet-500/10" },
];

const AppMore = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const { data: access } = useUserAccess(user?.id);
  const [showPartnerSheet, setShowPartnerSheet] = useState(false);
  const [showSwitchSheet, setShowSwitchSheet] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null; share_code: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  const ADMIN_EMAIL = "chhorngkimlain1@gmail.com";
  const isDesignatedAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  // Build role options dynamically
  const roleOptions = (() => {
    const options: { icon: typeof Shield; label: string; description: string; href: string; color: string }[] = [];
    options.push({ icon: User, label: "Personal", description: "Employees, Clock In & Out", href: "/personal-dashboard", color: "from-primary to-primary/80" });
    if (isDesignatedAdmin) {
      options.push({ icon: Shield, label: "Admin Dashboard", description: "Manage the platform", href: "/admin/analytics", color: "from-red-500 to-red-600" });
    }
    if (access?.isDriver) {
      options.push({ icon: Car, label: "Driver Dashboard", description: "Manage your rides", href: "/driver", color: "from-blue-500 to-blue-600" });
    }
    if (access?.isRestaurantOwner) {
      options.push({ icon: UtensilsCrossed, label: "Restaurant Dashboard", description: "Manage your restaurant", href: "/eats/restaurant-dashboard", color: "from-orange-500 to-amber-500" });
    }
    if (access?.isCarRentalOwner) {
      options.push({ icon: Car, label: "Car Rental Dashboard", description: "Manage your rentals", href: "/car-rental-dashboard", color: "from-emerald-500 to-green-500" });
    }
    if (access?.isHotelOwner) {
      options.push({ icon: Hotel, label: "Hotel Dashboard", description: "Manage your hotel", href: "/hotel-dashboard", color: "from-purple-500 to-purple-600" });
    }
    if (access?.isStoreOwner) {
      options.push({ icon: Store, label: "Shop Dashboard", description: "Manage your shop", href: access.storeId ? `/admin/stores/${access.storeId}` : "/shop-dashboard", color: "from-emerald-500 to-green-500" });
    }
    return options;
  })();

  const profileUrl = profile?.share_code
    ? getProfileShareUrl(profile.share_code)
    : `${getPublicOrigin()}/user/${user?.id ?? ""}`;

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("Profile link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareProfile = async () => {
    const name = profile?.full_name || user?.email?.split("@")[0] || "User";
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} on ZIVO`, text: `Check out ${name}'s profile on ZIVO`, url: profileUrl });
      } catch (err: any) {
        if (err.name !== "AbortError") copyProfileLink();
      }
    } else {
      copyProfileLink();
    }
  };

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data: byId } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, share_code")
        .eq("id", user.id)
        .maybeSingle();

      if (byId) {
        setProfile(byId as any);
        return;
      }

      const { data: byUserId } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, share_code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (byUserId) setProfile(byUserId as any);
    };

    void loadProfile();
  }, [user]);

  return (
    <AppLayout title="More" hideHeader>
      <div className="flex flex-col px-5 py-6 min-h-[70dvh]">
        {/* Account Card */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15 flex items-center gap-3"
          >
            <Avatar className="w-12 h-12 border-2 border-primary/20">
              <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary/25 to-primary/10 text-primary font-bold text-lg">
                {(profile?.full_name?.[0] || user.email?.[0] || "Z").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0]}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </div>
            <button
              onClick={() => setShowSwitchSheet(true)}
              className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold touch-manipulation active:scale-95 transition-transform"
            >
              Switch Account
            </button>
          </motion.div>
        )}

        {/* Profile Share Actions */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-5 flex gap-2"
          >
            <button
              onClick={copyProfileLink}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-border/40 bg-card text-sm font-semibold touch-manipulation active:scale-[0.97] transition-all shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={shareProfile}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-border/40 bg-card text-sm font-semibold touch-manipulation active:scale-[0.97] transition-all shadow-sm"
            >
              <Share2 className="w-4 h-4 text-muted-foreground" />
              Share
            </button>
            <button
              onClick={() => navigate("/qr-profile")}
              className="w-11 flex items-center justify-center rounded-2xl border border-border/40 bg-card touch-manipulation active:scale-[0.97] transition-all shadow-sm"
            >
              <QrCode className="w-4 h-4 text-muted-foreground" />
            </button>
          </motion.div>
        )}

        <h2 className="font-bold text-lg mb-4">Quick Access</h2>

        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((link, i) => {
            const isPartner = link.href === "#partner";
            const card = (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                whileTap={{ scale: 0.96 }}
                onClick={isPartner ? () => setShowPartnerSheet(true) : undefined}
                className="rounded-2xl bg-card border border-border/40 shadow-sm p-3 flex items-center gap-2.5 touch-manipulation cursor-pointer active:bg-muted/30 transition-colors"
              >
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", link.iconBg)}>
                  <link.icon className={cn("w-5 h-5", link.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13px] leading-tight">{link.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{link.description}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 ml-auto" />
              </motion.div>
            );

            if (isPartner) return <Fragment key={link.label}>{card}</Fragment>;
            return <Link key={link.label} to={link.href} className="contents">{card}</Link>;
          })}
        </div>

        {access?.isStoreOwner && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4">
            <h3 className="text-sm font-bold mb-2">Super App Add-ons</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/shop-dashboard/employees")}
                className="rounded-2xl bg-card border border-border/40 shadow-sm p-3 flex items-center gap-2.5 touch-manipulation active:bg-muted/30 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-indigo-500/10">
                  <Truck className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13px] leading-tight">Driver / Truck Mode</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Inventory + Offline Sales</p>
                </div>
              </button>
              <button
                onClick={() => navigate("/shop-dashboard/payroll")}
                className="rounded-2xl bg-card border border-border/40 shadow-sm p-3 flex items-center gap-2.5 touch-manipulation active:bg-muted/30 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/10">
                  <Wallet className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13px] leading-tight">Payroll + ROI</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Commission & Ad Return</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Admin Button */}
        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4">
            <Link to="/admin/analytics" className="contents">
              <div className="w-full py-3.5 rounded-2xl border border-primary/20 bg-primary/5 text-primary font-bold text-sm touch-manipulation active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </div>
            </Link>
          </motion.div>
        )}

        {/* Sign Out */}
        {user && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
            <button
              onClick={() => signOut()}
              className="w-full py-3.5 rounded-2xl border border-border/60 bg-card text-foreground font-bold text-sm touch-manipulation active:scale-[0.98] transition-all shadow-sm"
            >
              Sign out
            </button>
          </motion.div>
        )}

        {/* Close */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-3 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground text-sm font-medium touch-manipulation"
          >
            Close
          </button>
        </motion.div>
      </div>

      {/* Partner Sheet */}
      <Sheet open={showPartnerSheet} onOpenChange={setShowPartnerSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85dvh] overflow-auto pb-10">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-display">Become a Partner</SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            {partnerOptions.map((opt) => (
              <Link
                key={opt.label}
                to={opt.href}
                onClick={() => setShowPartnerSheet(false)}
                className="flex items-center gap-3 p-3 rounded-2xl border border-border/30 bg-card/60 hover:bg-card/90 transition-colors touch-manipulation active:scale-[0.98]"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center shadow-lg`}>
                  <opt.icon className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      {/* Switch Account Sheet */}
      <Sheet open={showSwitchSheet} onOpenChange={setShowSwitchSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85dvh] overflow-auto pb-10">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-display">Switch Account</SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            {roleOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  setShowSwitchSheet(false);
                  navigate(opt.href);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border/30 bg-card/60 hover:bg-card/90 transition-colors touch-manipulation active:scale-[0.98] text-left"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center shadow-lg`}>
                  <opt.icon className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
};

export default AppMore;
