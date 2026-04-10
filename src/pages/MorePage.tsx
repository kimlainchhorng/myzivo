/**
 * MorePage - Comprehensive Quick Access hub with all ZIVO features.
 */
import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight, LogOut, Settings, ShoppingBag, Wallet, MapPin, Handshake,
  Sparkles, Car, UtensilsCrossed, Store, Wrench, Building2, Truck, Shield, DollarSign,
  Heart, Bell, HelpCircle, Lock, Users, Globe, Bookmark, Eye, FileText,
  Award, Briefcase, Palette, Music, Headphones, QrCode, BarChart3,
  Camera, Video, Megaphone, Gift, Crown, Zap, Star, Calendar, MessageCircle,
  BookOpen, Plane, Coffee, Radio, BadgeCheck, Smartphone, Download,
  TrendingUp, Target, Lightbulb, PenTool, Share2, Compass,
} from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";
import FeedSidebar from "@/components/social/FeedSidebar";
import NavBar from "@/components/home/NavBar";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

const partnerOptions = [
  { icon: Car, label: "Become a Driver", description: "Earn money driving with ZIVO", href: "/partner-with-zivo?type=driver", color: "from-blue-500 to-blue-600" },
  { icon: UtensilsCrossed, label: "Become a Restaurant Partner", description: "List your restaurant on ZIVO", href: "/partner-with-zivo?type=restaurant", color: "from-orange-500 to-amber-500" },
  { icon: Store, label: "Become a Shop Partner", description: "Sell products through ZIVO", href: "/partner-with-zivo?type=store", color: "from-emerald-500 to-green-500" },
  { icon: Wrench, label: "Become an Auto Repair Partner", description: "Offer repair services on ZIVO", href: "/partner-with-zivo?type=auto-repair", color: "from-slate-500 to-slate-600" },
  { icon: Building2, label: "Become a Hotel Partner", description: "List your property on ZIVO", href: "/partner-with-zivo?type=hotel", color: "from-purple-500 to-purple-600" },
  { icon: Truck, label: "Become a Delivery Partner", description: "Deliver food & packages", href: "/partner-with-zivo?type=delivery", color: "from-rose-500 to-pink-500" },
];

type QuickLink = {
  icon: any;
  label: string;
  href: string;
  description: string;
  iconColor: string;
  iconBg: string;
  badge?: string;
};

const quickLinksMain: QuickLink[] = [
  { icon: Settings, label: "Settings", href: "/account/settings", description: "App settings & preferences", iconColor: "text-muted-foreground", iconBg: "bg-muted/60" },
  { icon: ShoppingBag, label: "My Orders", href: "/grocery/orders", description: "Order history & tracking", iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
  { icon: Wallet, label: "Wallet", href: "/wallet", description: "Balance & transactions", iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" },
  { icon: Sparkles, label: "Loyalty & Rewards", href: "/rewards", description: "Points & tier perks", iconColor: "text-amber-500", iconBg: "bg-amber-500/10" },
  { icon: MapPin, label: "Saved Addresses", href: "/account/addresses", description: "Delivery addresses", iconColor: "text-rose-500", iconBg: "bg-rose-500/10" },
  { icon: DollarSign, label: "Monetization", href: "/monetization", description: "Earn & grow revenue", iconColor: "text-primary", iconBg: "bg-primary/10" },
  { icon: Handshake, label: "Become Partner", href: "#partner", description: "Join ZIVO as partner", iconColor: "text-violet-500", iconBg: "bg-violet-500/10" },
  { icon: Heart, label: "Favorites", href: "/account/favorites", description: "Saved items & places", iconColor: "text-pink-500", iconBg: "bg-pink-500/10" },
  { icon: Crown, label: "ZIVO Plus", href: "/zivo-plus", description: "Premium membership", iconColor: "text-amber-500", iconBg: "bg-amber-500/10", badge: "PRO" },
  { icon: Award, label: "Badges & Achievements", href: "/badges", description: "Your earned badges", iconColor: "text-indigo-500", iconBg: "bg-indigo-500/10" },
];

const quickLinksCreator: QuickLink[] = [
  { icon: BarChart3, label: "Creator Dashboard", href: "/creator-dashboard", description: "Earnings & analytics", iconColor: "text-cyan-500", iconBg: "bg-cyan-500/10", badge: "Pro" },
  { icon: TrendingUp, label: "Creator Analytics", href: "/creator-analytics", description: "Deep content insights", iconColor: "text-indigo-500", iconBg: "bg-indigo-500/10", badge: "New" },
  { icon: Video, label: "Content Scheduler", href: "/content-scheduler", description: "Plan & schedule posts", iconColor: "text-purple-500", iconBg: "bg-purple-500/10" },
  { icon: BookOpen, label: "Creator Academy", href: "/monetization/articles", description: "500+ guides & tutorials", iconColor: "text-orange-500", iconBg: "bg-orange-500/10" },
  { icon: Gift, label: "Affiliate Hub", href: "/affiliate-hub", description: "Referral earnings", iconColor: "text-teal-500", iconBg: "bg-teal-500/10", badge: "New" },
  { icon: PenTool, label: "Digital Products", href: "/digital-products", description: "Sell courses & guides", iconColor: "text-fuchsia-500", iconBg: "bg-fuchsia-500/10" },
  { icon: Eye, label: "Content Analytics", href: "/content-analytics", description: "Performance & reach", iconColor: "text-sky-500", iconBg: "bg-sky-500/10" },
  { icon: Target, label: "Content Drafts", href: "/drafts", description: "Unpublished content", iconColor: "text-slate-500", iconBg: "bg-slate-500/10" },
];

const quickLinksTravel: QuickLink[] = [
  { icon: Plane, label: "My Trips", href: "/trips", description: "Upcoming & past trips", iconColor: "text-sky-500", iconBg: "bg-sky-500/10" },
  { icon: Bookmark, label: "Saved Searches", href: "/saved-searches", description: "Flight & hotel alerts", iconColor: "text-amber-500", iconBg: "bg-amber-500/10" },
  { icon: Car, label: "Ride History", href: "/rides", description: "Past rides & receipts", iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
  { icon: Coffee, label: "Food Orders", href: "/eats/orders", description: "Order history", iconColor: "text-orange-500", iconBg: "bg-orange-500/10" },
  { icon: Calendar, label: "Check-in", href: "/check-in", description: "Flight check-in", iconColor: "text-green-500", iconBg: "bg-green-500/10" },
  { icon: Compass, label: "Explore Nearby", href: "/nearby", description: "Discover around you", iconColor: "text-rose-500", iconBg: "bg-rose-500/10" },
  { icon: Globe, label: "AI Trip Planner", href: "/ai-trip-planner", description: "Plan trips with AI", iconColor: "text-violet-500", iconBg: "bg-violet-500/10", badge: "AI" },
  { icon: Smartphone, label: "Booking Management", href: "/booking-management", description: "Manage bookings", iconColor: "text-cyan-500", iconBg: "bg-cyan-500/10" },
];

const quickLinksSocial: QuickLink[] = [
  { icon: Users, label: "Communities", href: "/communities", description: "Join & create groups", iconColor: "text-violet-500", iconBg: "bg-violet-500/10" },
  { icon: Radio, label: "Audio Spaces", href: "/spaces", description: "Live audio rooms", iconColor: "text-fuchsia-500", iconBg: "bg-fuchsia-500/10" },
  { icon: Camera, label: "Reels Feed", href: "/reels", description: "Short videos", iconColor: "text-pink-500", iconBg: "bg-pink-500/10" },
  { icon: MessageCircle, label: "Chat Hub", href: "/chat", description: "Messages & DMs", iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
  { icon: Share2, label: "Share Profile", href: "/qr-profile", description: "QR code & link", iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" },
  { icon: Megaphone, label: "Events", href: "/events", description: "Upcoming events", iconColor: "text-amber-500", iconBg: "bg-amber-500/10" },
  { icon: Star, label: "Leaderboard", href: "/leaderboard", description: "Top creators", iconColor: "text-yellow-500", iconBg: "bg-yellow-500/10" },
  { icon: Music, label: "Sound Library", href: "/sound/trending", description: "Trending sounds", iconColor: "text-pink-500", iconBg: "bg-pink-500/10" },
];

const quickLinksBusiness: QuickLink[] = [
  { icon: Store, label: "Shop Dashboard", href: "/shop-dashboard", description: "Manage your store", iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" },
  { icon: Truck, label: "Delivery Dashboard", href: "/drive", description: "Driver earnings", iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
  { icon: UtensilsCrossed, label: "Restaurant Dashboard", href: "/eats/restaurant-dashboard", description: "Manage food orders", iconColor: "text-orange-500", iconBg: "bg-orange-500/10" },
  { icon: Briefcase, label: "Business Account", href: "/business/account", description: "Corporate features", iconColor: "text-slate-500", iconBg: "bg-slate-500/10" },
  { icon: Building2, label: "Store Map", href: "/store-map", description: "Your store on map", iconColor: "text-purple-500", iconBg: "bg-purple-500/10" },
  { icon: Wrench, label: "Store Setup", href: "/store/setup", description: "Configure your store", iconColor: "text-rose-500", iconBg: "bg-rose-500/10" },
];

const quickLinksAccount: QuickLink[] = [
  { icon: Bell, label: "Notifications", href: "/account/notifications", description: "Manage alerts", iconColor: "text-yellow-500", iconBg: "bg-yellow-500/10" },
  { icon: Lock, label: "Privacy & Security", href: "/account/privacy", description: "Data & security settings", iconColor: "text-red-500", iconBg: "bg-red-500/10" },
  { icon: BadgeCheck, label: "Verification", href: "/account/verification", description: "Get verified badge", iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
  { icon: Globe, label: "Language & Region", href: "/account/preferences", description: "Language & currency", iconColor: "text-teal-500", iconBg: "bg-teal-500/10" },
  { icon: HelpCircle, label: "Help Center", href: "/help", description: "FAQ & support", iconColor: "text-muted-foreground", iconBg: "bg-muted/60" },
  { icon: FileText, label: "Legal & Policies", href: "/account/legal", description: "Terms & privacy", iconColor: "text-slate-500", iconBg: "bg-slate-500/10" },
  { icon: Download, label: "Get the App", href: "/install", description: "Download ZIVO app", iconColor: "text-primary", iconBg: "bg-primary/10" },
  { icon: Lightbulb, label: "Feedback", href: "/feedback", description: "Share your ideas", iconColor: "text-yellow-500", iconBg: "bg-yellow-500/10" },
  { icon: Shield, label: "Safety Center", href: "/safety", description: "Reporting & safety", iconColor: "text-red-500", iconBg: "bg-red-500/10" },
  { icon: Palette, label: "Appearance", href: "/account/settings", description: "Theme & display", iconColor: "text-purple-500", iconBg: "bg-purple-500/10" },
];

const sections = [
  { title: "Quick Access", links: quickLinksMain },
  { title: "Creator Tools", links: quickLinksCreator },
  { title: "Travel & Orders", links: quickLinksTravel },
  { title: "Social & Community", links: quickLinksSocial },
  { title: "Account & Support", links: quickLinksAccount },
];

export default function MorePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const [showPartnerSheet, setShowPartnerSheet] = useState(false);

  const renderLinks = (links: QuickLink[]) => (
    <div className="grid grid-cols-2 gap-3">
      {links.map((link, i) => {
        const isPartner = link.href === "#partner";
        const card = (
          <motion.div
            key={link.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            whileTap={{ scale: 0.96 }}
            onClick={isPartner ? () => setShowPartnerSheet(true) : undefined}
            className="rounded-2xl bg-card border border-border/40 shadow-sm p-3.5 flex items-center gap-3 touch-manipulation cursor-pointer active:bg-muted/30 transition-colors"
          >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", link.iconBg)}>
              <link.icon className={cn("w-5 h-5", link.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-semibold text-sm leading-tight truncate">{link.label}</p>
                {link.badge && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{link.badge}</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{link.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
          </motion.div>
        );

        if (isPartner) return <Fragment key={link.label}>{card}</Fragment>;
        return <Link key={link.label} to={link.href} className="contents">{card}</Link>;
      })}
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background safe-area-top safe-area-bottom">
      <SEOHead title="More – ZIVO" description="Quick access to ZIVO settings and features." noIndex />

      <div className="hidden lg:block"><NavBar /></div>

      <div className="flex-1 lg:flex lg:pt-16">
        <FeedSidebar />

        <main className="flex-1 flex flex-col px-5 pb-28 pt-8 lg:pb-8 lg:max-w-3xl lg:mx-auto">
          {sections.map((section, si) => (
            <div key={section.title} className={si > 0 ? "mt-6" : ""}>
              <h2 className="font-bold text-lg mb-3">{section.title}</h2>
              {renderLinks(section.links)}
            </div>
          ))}

          {/* Admin Button */}
          {isAdmin && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6">
              <Link to="/admin" className="contents">
                <div className="w-full py-3.5 rounded-2xl border border-primary/20 bg-primary/5 text-primary font-bold text-sm touch-manipulation active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </div>
              </Link>
            </motion.div>
          )}

          {user && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
              <button
                onClick={() => signOut()}
                className="w-full py-3.5 rounded-2xl border border-border/60 bg-card text-foreground font-bold text-sm touch-manipulation active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-3 text-center lg:hidden">
            <button onClick={() => navigate(-1)} className="text-muted-foreground text-sm font-medium touch-manipulation">
              Close
            </button>
          </motion.div>
        </main>
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

      <ZivoMobileNav />
    </div>
  );
}
