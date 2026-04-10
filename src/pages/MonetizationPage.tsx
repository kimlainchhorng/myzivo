/**
 * MonetizationPage — Full monetization hub for ZIVO creators
 * Programs, earnings overview, and learning resources
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, DollarSign, Crown, Gift, Heart, Sparkles,
  ChevronRight, TrendingUp, Zap, Star, Lock, Store,
  Video, Megaphone, ShieldCheck, BadgeCheck, Wallet,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";

const monetizationPrograms = [
  {
    icon: Gift,
    label: "Creator Rewards",
    description: "Get Gifts for your top-performing videos and content.",
    status: "join" as const,
    href: "/creator-dashboard",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Zap,
    label: "Service+",
    description: "Build connections with potential clients when you're LIVE.",
    status: "join" as const,
    badge: "Recommended",
    href: "/creator-dashboard",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Crown,
    label: "Subscription",
    description: "Connect more closely with viewers through subscriber-only content and benefits.",
    status: "explore" as const,
    lockInfo: "3/4",
    href: "/creator-dashboard",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Heart,
    label: "Tips & Donations",
    description: "Let your audience show appreciation with direct tips during streams and posts.",
    status: "join" as const,
    href: "/creator-dashboard",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Video,
    label: "LIVE Gifts",
    description: "Receive virtual gifts from viewers during LIVE streams, redeemable for real earnings.",
    status: "join" as const,
    href: "/creator-dashboard",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Store,
    label: "ZIVO Shop",
    description: "Sell products directly to your audience through your ZIVO storefront.",
    status: "join" as const,
    href: "/shop-dashboard",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Megaphone,
    label: "Brand Partnerships",
    description: "Get matched with brands for sponsored content and collaborations.",
    status: "explore" as const,
    badge: "New",
    href: "/creator-dashboard",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Lock,
    label: "Locked Media",
    description: "Monetize exclusive photos and videos with pay-to-unlock content in chat.",
    status: "join" as const,
    href: "/creator-dashboard",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
];

const learningResources = [
  {
    title: "Getting started with Subscription",
    description: "Subscription is your key to unleashing your creativity and fostering deeper connections with your audience...",
    views: "7.7M views",
    icon: Crown,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    title: "Going LIVE on ZIVO!",
    description: "ZIVO LIVE is where the party's at – it's all about real-time fun, self-expression, and connecting...",
    views: "5.7M views",
    icon: Video,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    title: "Unlocking LIVE monetization",
    description: "Get more from your LIVEs! Explore all the ways you can monetize your streams and increase your earnings...",
    views: "5.7M views",
    icon: DollarSign,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    title: "Monetizing your content on ZIVO",
    description: "Ready to start collecting rewards for your creativity? Learn how to turn views into real earnings...",
    views: "9.2M views",
    icon: TrendingUp,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
];

const resourceTabs = ["Recommended", "Subscription", "LIVE rewards", "Creator Rewards"];

export default function MonetizationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-dvh bg-background pb-24">
      <SEOHead title="Monetization – ZIVO" description="Earn money on ZIVO with subscriptions, tips, gifts, and creator rewards." />

      {/* Header */}
      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold flex-1">Monetization</h1>
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Earnings Summary Card */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-primary/15 via-primary/8 to-transparent border border-primary/20 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Wallet className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Total Earnings</p>
                  <p className="text-lg font-bold text-foreground">$0.00</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/creator-dashboard")}
                className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold touch-manipulation active:scale-95 transition-transform"
              >
                Dashboard
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "This month", value: "$0.00" },
                { label: "Subscribers", value: "0" },
                { label: "Tips", value: "0" },
              ].map((stat) => (
                <div key={stat.label} className="bg-background/50 rounded-xl p-2 text-center">
                  <p className="text-xs font-bold text-foreground">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Programs */}
        <div>
          <h2 className="font-bold text-base mb-3">Programs</h2>
          <div className="space-y-2">
            {monetizationPrograms.map((prog, i) => (
              <motion.button
                key={prog.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(prog.href)}
                className="w-full flex items-start gap-3 p-3.5 rounded-2xl border border-border/40 bg-card text-left touch-manipulation active:scale-[0.98] transition-all"
              >
                <div className={`h-9 w-9 rounded-xl ${prog.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <prog.icon className={`h-4.5 w-4.5 ${prog.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-[13px]">{prog.label}</p>
                    {prog.badge && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-0.5">
                        <Sparkles className="w-2 h-2" /> {prog.badge}
                      </span>
                    )}
                    {prog.lockInfo && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-0.5">
                        <Lock className="w-2 h-2" /> {prog.lockInfo}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{prog.description}</p>
                </div>
                {prog.status === "join" ? (
                  <span className="shrink-0 mt-1 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                    Join
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-2" />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* Learning Resources */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base">Learning resources</h2>
            <button
              onClick={() => navigate("/monetization/articles")}
              className="text-xs text-primary font-semibold flex items-center gap-0.5 touch-manipulation"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
            {resourceTabs.map((tab, i) => (
              <button
                key={tab}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  i === 0
                    ? "bg-foreground text-background"
                    : "bg-muted/60 text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Resource Cards */}
          <div className="space-y-3">
            {learningResources.map((res, i) => (
              <motion.button
                key={res.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                onClick={() => navigate("/monetization/articles")}
                className="w-full flex items-start gap-3 text-left touch-manipulation"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] leading-tight mb-1">{res.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{res.description}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{res.views}</p>
                </div>
                <div className={`w-16 h-16 rounded-xl ${res.iconBg} shrink-0 flex items-center justify-center`}>
                  <res.icon className={`w-6 h-6 ${res.iconColor}`} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Verification CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border/40 bg-card p-4 flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <BadgeCheck className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[13px]">Get Verified</p>
            <p className="text-[11px] text-muted-foreground">Verify your identity to unlock payouts and build trust with your audience.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
        </motion.div>

        {/* Community Guidelines */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          onClick={() => navigate("/monetization/articles")}
          className="w-full rounded-2xl border border-border/40 bg-card p-4 flex items-center gap-3 text-left touch-manipulation active:scale-[0.98] transition-transform"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[13px]">Community Guidelines</p>
            <p className="text-[11px] text-muted-foreground">Understand the rules and standards for creating on ZIVO.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
        </motion.button>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
