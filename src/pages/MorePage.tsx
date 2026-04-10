/**
 * MorePage — ZIVO Signature Design (2026)
 * Unique organic layout with emerald identity, mesh cards, and aurora effects.
 * NOT copied from any other platform.
 */
import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, LogOut, Settings, ShoppingBag, Wallet, MapPin, Handshake,
  Sparkles, Car, UtensilsCrossed, Store, Wrench, Building2, Truck, Shield, DollarSign,
  Heart, Bell, HelpCircle, Lock, Users, Globe, Bookmark, Eye, FileText,
  Award, Briefcase, Palette, Music, Headphones, QrCode, BarChart3,
  Camera, Video, Megaphone, Gift, Crown, Zap, Star, Calendar, MessageCircle,
  BookOpen, Plane, Coffee, Radio, BadgeCheck, Smartphone, Download,
  TrendingUp, Target, Lightbulb, PenTool, Share2, Compass, ArrowRight,
  Gem, Rocket, Layers, CircleDot,
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

/* ============================================= */
/*  PARTNER OPTIONS                              */
/* ============================================= */
const partnerOptions = [
  { icon: Car, label: "Become a Driver", description: "Earn money driving with ZIVO", href: "/partner-with-zivo?type=driver", accent: "hsl(221 83% 53%)" },
  { icon: UtensilsCrossed, label: "Restaurant Partner", description: "List your restaurant on ZIVO", href: "/partner-with-zivo?type=restaurant", accent: "hsl(25 95% 53%)" },
  { icon: Store, label: "Shop Partner", description: "Sell products through ZIVO", href: "/partner-with-zivo?type=store", accent: "hsl(142 71% 45%)" },
  { icon: Wrench, label: "Auto Repair Partner", description: "Offer repair services on ZIVO", href: "/partner-with-zivo?type=auto-repair", accent: "hsl(215 16% 47%)" },
  { icon: Building2, label: "Hotel Partner", description: "List your property on ZIVO", href: "/partner-with-zivo?type=hotel", accent: "hsl(263 70% 58%)" },
  { icon: Truck, label: "Delivery Partner", description: "Deliver food & packages", href: "/partner-with-zivo?type=delivery", accent: "hsl(340 75% 55%)" },
];

/* ============================================= */
/*  SPOTLIGHT — featured top cards               */
/* ============================================= */
const spotlightCards = [
  { icon: Crown, label: "ZIVO Plus", desc: "Unlock premium perks", href: "/zivo-plus", gradient: "from-amber-500 via-yellow-400 to-orange-400" },
  { icon: Rocket, label: "Creator Hub", desc: "Grow & monetize", href: "/creator-dashboard", gradient: "from-violet-500 via-purple-500 to-fuchsia-500" },
  { icon: Gem, label: "Rewards", desc: "Earn points daily", href: "/rewards", gradient: "from-emerald-500 via-teal-400 to-cyan-400" },
];

/* ============================================= */
/*  LINK TYPES                                   */
/* ============================================= */
type QuickLink = {
  icon: any;
  label: string;
  href: string;
  description: string;
  accent: string; // HSL color string for the icon pill
  badge?: string;
};

const quickLinksMain: QuickLink[] = [
  { icon: Settings, label: "Settings", href: "/account/settings", description: "App preferences", accent: "hsl(var(--muted-foreground))" },
  { icon: ShoppingBag, label: "My Orders", href: "/grocery/orders", description: "Order history", accent: "hsl(221 83% 53%)" },
  { icon: Wallet, label: "Wallet", href: "/wallet", description: "Balance & pay", accent: "hsl(142 71% 45%)" },
  { icon: MapPin, label: "Saved Addresses", href: "/account/addresses", description: "Delivery spots", accent: "hsl(0 84% 60%)" },
  { icon: DollarSign, label: "Monetization", href: "/monetization", description: "Revenue hub", accent: "hsl(var(--primary))" },
  { icon: Handshake, label: "Become Partner", href: "#partner", description: "Join ZIVO", accent: "hsl(263 70% 58%)" },
  { icon: Heart, label: "Favorites", href: "/account/favorites", description: "Saved items", accent: "hsl(340 75% 55%)" },
  { icon: Award, label: "Badges", href: "/badges", description: "Achievements", accent: "hsl(38 92% 50%)" },
];

const quickLinksCreator: QuickLink[] = [
  { icon: BarChart3, label: "Creator Dashboard", href: "/creator-dashboard", description: "Earnings & stats", accent: "hsl(198 93% 59%)", badge: "Pro" },
  { icon: TrendingUp, label: "Analytics", href: "/creator-analytics", description: "Deep insights", accent: "hsl(263 70% 58%)", badge: "New" },
  { icon: Video, label: "Content Scheduler", href: "/content-scheduler", description: "Plan posts", accent: "hsl(270 95% 75%)" },
  { icon: BookOpen, label: "Creator Academy", href: "/monetization/articles", description: "500+ guides", accent: "hsl(25 95% 53%)" },
  { icon: Gift, label: "Affiliate Hub", href: "/affiliate-hub", description: "Referrals", accent: "hsl(172 66% 50%)", badge: "New" },
  { icon: PenTool, label: "Digital Products", href: "/digital-products", description: "Sell courses", accent: "hsl(300 70% 55%)" },
  { icon: Eye, label: "Content Analytics", href: "/content-analytics", description: "Performance", accent: "hsl(199 89% 48%)" },
  { icon: Target, label: "Drafts", href: "/drafts", description: "Unpublished", accent: "hsl(215 16% 47%)" },
];

const quickLinksTravel: QuickLink[] = [
  { icon: Plane, label: "My Trips", href: "/trips", description: "All journeys", accent: "hsl(199 89% 48%)" },
  { icon: Bookmark, label: "Saved Searches", href: "/saved-searches", description: "Alerts", accent: "hsl(38 92% 50%)" },
  { icon: Car, label: "Ride History", href: "/rides", description: "Receipts", accent: "hsl(221 83% 53%)" },
  { icon: Coffee, label: "Food Orders", href: "/eats/orders", description: "Past orders", accent: "hsl(25 95% 53%)" },
  { icon: Calendar, label: "Check-in", href: "/check-in", description: "Flight check-in", accent: "hsl(142 71% 45%)" },
  { icon: Compass, label: "Explore Nearby", href: "/nearby", description: "Around you", accent: "hsl(0 84% 60%)" },
  { icon: Globe, label: "AI Trip Planner", href: "/ai-trip-planner", description: "AI-powered", accent: "hsl(263 70% 58%)", badge: "AI" },
  { icon: Smartphone, label: "Booking Mgmt", href: "/booking-management", description: "Manage trips", accent: "hsl(198 93% 59%)" },
];

const quickLinksSocial: QuickLink[] = [
  { icon: Users, label: "Communities", href: "/communities", description: "Groups", accent: "hsl(263 70% 58%)" },
  { icon: Radio, label: "Audio Spaces", href: "/spaces", description: "Live rooms", accent: "hsl(300 70% 55%)" },
  { icon: Camera, label: "Reels Feed", href: "/reels", description: "Short videos", accent: "hsl(340 75% 55%)" },
  { icon: MessageCircle, label: "Chat Hub", href: "/chat", description: "Messages", accent: "hsl(221 83% 53%)" },
  { icon: Share2, label: "Share Profile", href: "/qr-profile", description: "QR & link", accent: "hsl(142 71% 45%)" },
  { icon: Megaphone, label: "Events", href: "/events", description: "Upcoming", accent: "hsl(38 92% 50%)" },
  { icon: Star, label: "Leaderboard", href: "/leaderboard", description: "Top creators", accent: "hsl(45 93% 58%)" },
  { icon: Music, label: "Sound Library", href: "/explore", description: "Trending", accent: "hsl(340 75% 55%)" },
];

const quickLinksBusiness: QuickLink[] = [
  { icon: Store, label: "Shop Dashboard", href: "/shop-dashboard", description: "Your store", accent: "hsl(142 71% 45%)" },
  { icon: Truck, label: "Driver Dashboard", href: "/drive", description: "Earnings", accent: "hsl(221 83% 53%)" },
  { icon: UtensilsCrossed, label: "Restaurant Dash", href: "/eats/restaurant-dashboard", description: "Food orders", accent: "hsl(25 95% 53%)" },
  { icon: Briefcase, label: "Business Account", href: "/business/account", description: "Corporate", accent: "hsl(215 16% 47%)" },
  { icon: Building2, label: "Store Map", href: "/store-map", description: "Map view", accent: "hsl(263 70% 58%)" },
  { icon: Wrench, label: "Store Setup", href: "/store/setup", description: "Configure", accent: "hsl(0 84% 60%)" },
];

const quickLinksAccount: QuickLink[] = [
  { icon: Bell, label: "Notifications", href: "/account/notifications", description: "Manage alerts", accent: "hsl(45 93% 58%)" },
  { icon: Lock, label: "Privacy", href: "/account/privacy", description: "Security", accent: "hsl(0 84% 60%)" },
  { icon: BadgeCheck, label: "Verification", href: "/account/verification", description: "Get verified", accent: "hsl(221 83% 53%)" },
  { icon: Globe, label: "Language", href: "/account/preferences", description: "Region", accent: "hsl(172 66% 50%)" },
  { icon: HelpCircle, label: "Help Center", href: "/help", description: "FAQ & support", accent: "hsl(var(--muted-foreground))" },
  { icon: FileText, label: "Legal", href: "/account/legal", description: "Terms", accent: "hsl(215 16% 47%)" },
  { icon: Download, label: "Get App", href: "/install", description: "Download", accent: "hsl(var(--primary))" },
  { icon: Lightbulb, label: "Feedback", href: "/feedback", description: "Ideas", accent: "hsl(45 93% 58%)" },
  { icon: Shield, label: "Safety Center", href: "/safety", description: "Reporting", accent: "hsl(0 84% 60%)" },
  { icon: Palette, label: "Appearance", href: "/account/settings", description: "Theme", accent: "hsl(263 70% 58%)" },
];

const sections = [
  { title: "Essentials", icon: Layers, links: quickLinksMain },
  { title: "Creator Studio", icon: Sparkles, links: quickLinksCreator },
  { title: "Travel & Orders", icon: Plane, links: quickLinksTravel },
  { title: "Social", icon: Users, links: quickLinksSocial },
  { title: "Business", icon: Briefcase, links: quickLinksBusiness },
  { title: "Account", icon: Settings, links: quickLinksAccount },
];

/* ============================================= */
/*  COMPONENT                                    */
/* ============================================= */
export default function MorePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const [showPartnerSheet, setShowPartnerSheet] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("Essentials");

  /* --- Spotlight Cards --- */
  const renderSpotlight = () => (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
      {spotlightCards.map((card, i) => (
        <Link key={card.label} to={card.href} className="flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "w-[130px] h-[100px] rounded-[20px] bg-gradient-to-br p-3.5 flex flex-col justify-between",
              "shadow-lg active:scale-95 transition-transform touch-manipulation",
              card.gradient
            )}
          >
            <card.icon className="w-6 h-6 text-white/90" />
            <div>
              <p className="text-white font-bold text-[13px] leading-tight">{card.label}</p>
              <p className="text-white/70 text-[10px] mt-0.5">{card.desc}</p>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );

  /* --- Link Row --- */
  const renderLink = (link: QuickLink, i: number) => {
    const isPartner = link.href === "#partner";

    const inner = (
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.025, duration: 0.25 }}
        whileTap={{ scale: 0.97 }}
        onClick={isPartner ? () => setShowPartnerSheet(true) : undefined}
        className="zivo-card-organic flex items-center gap-3.5 p-3 cursor-pointer"
      >
        {/* Icon Pill */}
        <div
          className="zivo-icon-pill"
          style={{ color: link.accent, background: `${link.accent}15` }}
        >
          <link.icon className="w-[20px] h-[20px]" style={{ color: link.accent }} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-[13px] leading-tight truncate">{link.label}</p>
            {link.badge && <span className="zivo-badge">{link.badge}</span>}
          </div>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{link.description}</p>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
      </motion.div>
    );

    if (isPartner) return <Fragment key={link.label}>{inner}</Fragment>;
    return <Link key={link.label} to={link.href} className="contents">{inner}</Link>;
  };

  /* --- Collapsible Section --- */
  const renderSection = (section: typeof sections[0], si: number) => {
    const isOpen = expandedSection === section.title;
    const SectionIcon = section.icon;

    return (
      <motion.div
        key={section.title}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: si * 0.06, duration: 0.35 }}
      >
        {/* Section Header */}
        <button
          onClick={() => setExpandedSection(isOpen ? null : section.title)}
          className="w-full flex items-center justify-between py-3 touch-manipulation"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
              <SectionIcon className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="font-bold text-[15px]">{section.title}</h2>
            <span className="text-[11px] text-muted-foreground font-medium">{section.links.length}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </motion.div>
        </button>

        {/* Section Links */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5 pb-2">
                {section.links.map((link, i) => renderLink(link, i))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {si < sections.length - 1 && <div className="zivo-divider" />}
      </motion.div>
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background safe-area-top safe-area-bottom">
      <SEOHead title="More – ZIVO" description="Quick access to all ZIVO features and settings." noIndex />

      <div className="hidden lg:block"><NavBar /></div>

      <div className="flex-1 lg:flex lg:pt-16">
        <FeedSidebar />

        <main className="flex-1 flex flex-col px-5 pb-28 pt-6 lg:pb-8 lg:max-w-3xl lg:mx-auto zivo-aurora">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5"
          >
            <h1 className="text-2xl font-extrabold tracking-tight">
              More
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Everything in one place</p>
          </motion.div>

          {/* Spotlight Cards */}
          <div className="mb-6">
            {renderSpotlight()}
          </div>

          {/* All Sections */}
          {sections.map((section, si) => renderSection(section, si))}

          {/* Admin */}
          {isAdmin && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4">
              <Link to="/admin" className="contents">
                <div className="w-full py-3 rounded-2xl zivo-ribbon bg-primary/5 border border-primary/15 text-primary font-bold text-sm touch-manipulation active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* Sign Out */}
          {user && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4">
              <button
                onClick={() => signOut()}
                className="w-full py-3 rounded-2xl border border-border/50 bg-card text-foreground font-semibold text-sm touch-manipulation active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </motion.div>
          )}

          {/* Close (mobile) */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-3 text-center lg:hidden">
            <button onClick={() => navigate(-1)} className="text-muted-foreground text-sm font-medium touch-manipulation">
              Close
            </button>
          </motion.div>

          {/* ZIVO Watermark */}
          <div className="relative mt-8 flex justify-center">
            <span className="text-[10px] text-muted-foreground/30 font-semibold tracking-widest uppercase">ZIVO • 2026</span>
          </div>
        </main>
      </div>

      {/* Partner Sheet */}
      <Sheet open={showPartnerSheet} onOpenChange={setShowPartnerSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85dvh] overflow-auto pb-10">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-bold">Become a Partner</SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            {partnerOptions.map((opt) => (
              <Link
                key={opt.label}
                to={opt.href}
                onClick={() => setShowPartnerSheet(false)}
                className="zivo-card-organic flex items-center gap-3 p-3 touch-manipulation"
              >
                <div
                  className="zivo-icon-pill"
                  style={{ color: opt.accent, background: `${opt.accent}15` }}
                >
                  <opt.icon className="w-5 h-5" style={{ color: opt.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground">{opt.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <ZivoMobileNav />
    </div>
  );
}
