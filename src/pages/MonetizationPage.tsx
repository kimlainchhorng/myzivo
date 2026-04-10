/**
 * MonetizationPage — Full monetization hub for ZIVO creators
 * Programs, earnings overview, and learning resources
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, DollarSign, Crown, Gift, Heart, Sparkles,
  ChevronRight, TrendingUp, Zap, Star, Lock, Store,
  Video, Megaphone, ShieldCheck, BadgeCheck, Wallet,
  BookOpen, Users, Target, BarChart3, Headphones,
  PenTool, Package, Globe, Award, Mic, Camera,
  Palette, Music, Radio, Calendar, MessageCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";

type ProgramStatus = "join" | "explore" | "active" | "coming_soon";

interface Program {
  icon: any;
  label: string;
  description: string;
  status: ProgramStatus;
  href: string;
  color: string;
  bg: string;
  badge?: string;
  lockInfo?: string;
}

const monetizationPrograms: Program[] = [
  { icon: Gift, label: "Creator Rewards", description: "Get Gifts for your top-performing videos and content.", status: "join", href: "/creator-dashboard", color: "text-rose-500", bg: "bg-rose-500/10" },
  { icon: Zap, label: "Service+", description: "Build connections with potential clients when you're LIVE.", status: "join", badge: "Recommended", href: "/creator-dashboard", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Crown, label: "Subscription", description: "Connect more closely with viewers through subscriber-only content and benefits.", status: "explore", lockInfo: "3/4", href: "/creator-dashboard", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Heart, label: "Tips & Donations", description: "Let your audience show appreciation with direct tips during streams and posts.", status: "join", href: "/creator-dashboard", color: "text-pink-500", bg: "bg-pink-500/10" },
  { icon: Video, label: "LIVE Gifts", description: "Receive virtual gifts from viewers during LIVE streams, redeemable for real earnings.", status: "join", href: "/creator-dashboard", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Store, label: "ZIVO Shop", description: "Sell products directly to your audience through your ZIVO storefront.", status: "join", href: "/shop-dashboard", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: Megaphone, label: "Brand Partnerships", description: "Get matched with brands for sponsored content and collaborations.", status: "explore", badge: "New", href: "/creator-dashboard", color: "text-orange-500", bg: "bg-orange-500/10" },
  { icon: Lock, label: "Locked Media", description: "Monetize exclusive photos and videos with pay-to-unlock content in chat.", status: "join", href: "/creator-dashboard", color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { icon: PenTool, label: "Digital Products", description: "Sell e-books, courses, templates, presets, and digital bundles.", status: "join", badge: "New", href: "/digital-products", color: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
  { icon: Target, label: "Affiliate Marketing", description: "Earn commissions by promoting ZIVO services and partner products.", status: "join", href: "/affiliate-hub", color: "text-teal-500", bg: "bg-teal-500/10" },
  { icon: Radio, label: "Audio Spaces Monetization", description: "Monetize live audio rooms with tickets, tips, and paid Q&A sessions.", status: "explore", href: "/audio-spaces", color: "text-violet-500", bg: "bg-violet-500/10" },
  { icon: Calendar, label: "Paid Events", description: "Host and sell tickets to virtual and in-person events on ZIVO.", status: "explore", badge: "Coming Soon", href: "/events", color: "text-sky-500", bg: "bg-sky-500/10" },
  { icon: BookOpen, label: "Course Builder", description: "Create and sell structured courses with chapters, quizzes, and certificates.", status: "join", href: "/digital-products", color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { icon: Palette, label: "Creator Marketplace", description: "Offer freelance services — design, video editing, consulting — directly on ZIVO.", status: "explore", href: "/marketplace", color: "text-rose-500", bg: "bg-rose-500/10" },
  { icon: Music, label: "Sound & Music Licensing", description: "License your original music and sound effects to other creators.", status: "explore", href: "/creator-dashboard", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: MessageCircle, label: "Paid DMs", description: "Charge for priority messages and one-on-one consultations.", status: "explore", href: "/creator-dashboard", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: Camera, label: "Photo Prints & Merch", description: "Sell physical prints, merchandise, and branded products.", status: "explore", badge: "Coming Soon", href: "/creator-dashboard", color: "text-pink-500", bg: "bg-pink-500/10" },
  { icon: Mic, label: "Podcast Monetization", description: "Monetize podcasts with ads, sponsorships, and premium episodes.", status: "explore", href: "/creator-dashboard", color: "text-indigo-500", bg: "bg-indigo-500/10" },
];

const learningResources = [
  { title: "Getting started with Subscription", description: "Subscription is your key to unleashing your creativity and fostering deeper connections with your audience...", views: "7.7M views", icon: Crown, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
  { title: "Going LIVE on ZIVO!", description: "ZIVO LIVE is where the party's at – it's all about real-time fun, self-expression, and connecting...", views: "5.7M views", icon: Video, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
  { title: "Unlocking LIVE monetization", description: "Get more from your LIVEs! Explore all the ways you can monetize your streams and increase your earnings...", views: "5.7M views", icon: DollarSign, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
  { title: "Monetizing your content on ZIVO", description: "Ready to start collecting rewards for your creativity? Learn how to turn views into real earnings...", views: "9.2M views", icon: TrendingUp, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
  { title: "Building your affiliate business", description: "Learn how top creators earn $10K+ monthly through ZIVO's affiliate and referral programs...", views: "3.1M views", icon: Target, iconBg: "bg-teal-500/10", iconColor: "text-teal-500" },
  { title: "Selling digital products", description: "From e-books to courses — discover how to create and sell digital products to your audience...", views: "2.8M views", icon: PenTool, iconBg: "bg-fuchsia-500/10", iconColor: "text-fuchsia-500" },
];

const resourceTabs = ["Recommended", "Subscription", "LIVE rewards", "Creator Rewards", "Affiliate", "Digital Products"];

const quickActions = [
  { label: "Creator Dashboard", icon: BarChart3, href: "/creator-dashboard", color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { label: "Analytics", icon: TrendingUp, href: "/creator-analytics", color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { label: "Affiliate Hub", icon: Gift, href: "/affiliate-hub", color: "text-teal-500", bg: "bg-teal-500/10" },
  { label: "Digital Products", icon: PenTool, href: "/digital-products", color: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
  { label: "ZIVO Shop", icon: Store, href: "/shop-dashboard", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Wallet", icon: Wallet, href: "/wallet", color: "text-primary", bg: "bg-primary/10" },
];

export default function MonetizationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeResTab, setActiveResTab] = useState(0);

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
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "This month", value: "$0.00" },
                { label: "Subscribers", value: "0" },
                { label: "Tips", value: "0" },
                { label: "Affiliates", value: "0" },
              ].map((stat) => (
                <div key={stat.label} className="bg-background/50 rounded-xl p-2 text-center">
                  <p className="text-xs font-bold text-foreground">{stat.value}</p>
                  <p className="text-[8px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="font-bold text-base mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(action.href)}
                className="rounded-2xl border border-border/40 bg-card p-3 flex flex-col items-center gap-2 touch-manipulation active:scale-[0.96] transition-transform"
              >
                <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center`}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="text-[10px] font-bold text-center leading-tight">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Programs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base">Programs ({monetizationPrograms.length})</h2>
          </div>
          <div className="space-y-2">
            {monetizationPrograms.map((prog, i) => (
              <motion.button
                key={prog.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
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

          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
            {resourceTabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveResTab(i)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  i === activeResTab ? "bg-foreground text-background" : "bg-muted/60 text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

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

        {/* Verification & Guidelines CTAs */}
        {[
          { icon: BadgeCheck, title: "Get Verified", desc: "Verify your identity to unlock payouts and build trust with your audience.", href: "/account/verify", color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: ShieldCheck, title: "Community Guidelines", desc: "Understand the rules and standards for creating on ZIVO.", href: "/monetization/articles", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { icon: Award, title: "Creator Academy", desc: "500+ articles, guides, and tutorials to help you grow on ZIVO.", href: "/monetization/articles", color: "text-orange-500", bg: "bg-orange-500/10" },
          { icon: Globe, title: "ZIVO Partner Program", desc: "Apply for exclusive partner benefits, higher commissions, and priority support.", href: "/affiliate-hub", color: "text-violet-500", bg: "bg-violet-500/10" },
        ].map((cta, i) => (
          <motion.button
            key={cta.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            onClick={() => navigate(cta.href)}
            className="w-full rounded-2xl border border-border/40 bg-card p-4 flex items-center gap-3 text-left touch-manipulation active:scale-[0.98] transition-transform"
          >
            <div className={`h-10 w-10 rounded-xl ${cta.bg} flex items-center justify-center shrink-0`}>
              <cta.icon className={`h-5 w-5 ${cta.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[13px]">{cta.title}</p>
              <p className="text-[11px] text-muted-foreground">{cta.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
          </motion.button>
        ))}
      </div>

      <ZivoMobileNav />
    </div>
  );
}
