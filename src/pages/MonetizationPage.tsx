/**
 * MonetizationPage — ZIVO Signature Design (2026)
 * Real wallet data, complete program hub, creator tools
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, DollarSign, Crown, Gift, Heart, Sparkles,
  ChevronRight, TrendingUp, Zap, Star, Lock, Store,
  Video, Megaphone, ShieldCheck, BadgeCheck, Wallet,
  BookOpen, Users, Target, BarChart3, Headphones,
  PenTool, Package, Globe, Award, Mic, Camera,
  Palette, Music, Radio, Calendar, MessageCircle, ArrowRight,
  CheckCircle, Search, Filter, Eye, Play, Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";

type ProgramStatus = "join" | "explore" | "active" | "coming_soon";

interface Program {
  icon: any;
  label: string;
  description: string;
  status: ProgramStatus;
  programId: string;
  accent: string;
  badge?: string;
  lockInfo?: string;
}

const monetizationPrograms: Program[] = [
  { icon: Gift, label: "Creator Rewards", description: "Get Gifts for your top-performing videos and content.", status: "join", programId: "creator-rewards", accent: "hsl(340 75% 55%)" },
  { icon: Zap, label: "Service+", description: "Build connections with potential clients when you're LIVE.", status: "join", badge: "Recommended", programId: "service-plus", accent: "hsl(221 83% 53%)" },
  { icon: Crown, label: "Subscription", description: "Connect more closely with viewers through subscriber-only content.", status: "explore", lockInfo: "3/4", programId: "subscription", accent: "hsl(38 92% 50%)" },
  { icon: Heart, label: "Tips & Donations", description: "Let your audience show appreciation with direct tips.", status: "join", programId: "tips-donations", accent: "hsl(340 75% 55%)" },
  { icon: Video, label: "LIVE Gifts", description: "Receive virtual gifts from viewers during LIVE streams.", status: "join", programId: "live-gifts", accent: "hsl(263 70% 58%)" },
  { icon: Store, label: "ZIVO Shop", description: "Sell products directly to your audience.", status: "join", programId: "zivo-shop", accent: "hsl(142 71% 45%)" },
  { icon: Megaphone, label: "Brand Partnerships", description: "Get matched with brands for sponsored content.", status: "explore", badge: "New", programId: "brand-partnerships", accent: "hsl(25 95% 53%)" },
  { icon: Lock, label: "Locked Media", description: "Monetize exclusive photos and videos with pay-to-unlock.", status: "join", programId: "locked-media", accent: "hsl(263 70% 58%)" },
  { icon: PenTool, label: "Digital Products", description: "Sell e-books, courses, templates, and digital bundles.", status: "join", badge: "New", programId: "digital-products", accent: "hsl(300 70% 55%)" },
  { icon: Target, label: "Affiliate Marketing", description: "Earn commissions promoting ZIVO services.", status: "join", programId: "affiliate-marketing", accent: "hsl(172 66% 50%)" },
  { icon: Radio, label: "Audio Monetization", description: "Monetize live audio rooms with tickets and tips.", status: "explore", programId: "audio-monetization", accent: "hsl(263 70% 58%)" },
  { icon: Calendar, label: "Paid Events", description: "Host and sell tickets to events.", status: "explore", badge: "Soon", programId: "paid-events", accent: "hsl(199 89% 48%)" },
  { icon: BookOpen, label: "Course Builder", description: "Create and sell structured courses.", status: "join", programId: "course-builder", accent: "hsl(198 93% 59%)" },
  { icon: Palette, label: "Creator Marketplace", description: "Offer freelance services on ZIVO.", status: "explore", programId: "creator-marketplace", accent: "hsl(340 75% 55%)" },
  { icon: Music, label: "Sound Licensing", description: "License your original music to others.", status: "explore", programId: "sound-licensing", accent: "hsl(38 92% 50%)" },
  { icon: MessageCircle, label: "Paid DMs", description: "Charge for priority messages.", status: "explore", programId: "paid-dms", accent: "hsl(142 71% 45%)" },
  { icon: Camera, label: "Merch & Prints", description: "Sell physical products and merchandise.", status: "explore", badge: "Soon", programId: "merch-prints", accent: "hsl(340 75% 55%)" },
  { icon: Mic, label: "Podcast", description: "Monetize podcasts with premium episodes.", status: "explore", programId: "podcast", accent: "hsl(263 70% 58%)" },
];

const learningResources = [
  { title: "Getting started with Subscription", description: "Your key to deeper audience connections...", views: "7.7M views", icon: Crown, accent: "hsl(38 92% 50%)" },
  { title: "Going LIVE on ZIVO!", description: "Real-time fun, self-expression, and connecting...", views: "5.7M views", icon: Video, accent: "hsl(263 70% 58%)" },
  { title: "Unlocking LIVE monetization", description: "Explore all ways to monetize your streams...", views: "5.7M views", icon: DollarSign, accent: "hsl(142 71% 45%)" },
  { title: "Monetizing your content", description: "Turn views into real earnings...", views: "9.2M views", icon: TrendingUp, accent: "hsl(221 83% 53%)" },
  { title: "Building affiliate business", description: "Earn $10K+ monthly through referrals...", views: "3.1M views", icon: Target, accent: "hsl(172 66% 50%)" },
  { title: "Selling digital products", description: "Create and sell digital products...", views: "2.8M views", icon: PenTool, accent: "hsl(300 70% 55%)" },
];

const resourceTabs = ["Recommended", "Subscription", "LIVE rewards", "Creator Rewards", "Affiliate", "Digital Products"];

const quickActions = [
  { label: "Dashboard", icon: BarChart3, href: "/creator-dashboard", accent: "hsl(198 93% 59%)" },
  { label: "Analytics", icon: TrendingUp, href: "/creator-analytics", accent: "hsl(263 70% 58%)" },
  { label: "Affiliate", icon: Gift, href: "/affiliate-hub", accent: "hsl(172 66% 50%)" },
  { label: "Digital", icon: PenTool, href: "/digital-products", accent: "hsl(300 70% 55%)" },
  { label: "Shop", icon: Store, href: "/shop-dashboard", accent: "hsl(142 71% 45%)" },
  { label: "Wallet", icon: Wallet, href: "/wallet", accent: "hsl(38 92% 50%)" },
];

const programFilter = ["All", "Joined", "Available", "Coming Soon"] as const;

export default function MonetizationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeResTab, setActiveResTab] = useState(0);
  const [activeFilter, setActiveFilter] = useState<typeof programFilter[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Fetch user wallet balance
  const { data: walletData } = useQuery({
    queryKey: ["monetization-wallet", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user!.id)
        .maybeSingle() as any;
      return data as { balance: number } | null;
    },
    enabled: !!user,
  });

  // Fetch all user enrollments
  const { data: enrollments = [] } = useQuery({
    queryKey: ["program-enrollments", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("creator_program_enrollments")
        .select("program_id, status")
        .eq("user_id", user!.id) as any;
      return (data as any[]) || [];
    },
    enabled: !!user,
  });

  // Fetch referral count
  const { data: referralCount } = useQuery({
    queryKey: ["monetization-referrals", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("referrer_id", user!.id) as any;
      return (count as number) || 0;
    },
    enabled: !!user,
  });

  const enrolledIds = new Set(enrollments.map((e: any) => e.program_id));
  const enrolledCount = enrolledIds.size;
  const balance = walletData?.balance ?? 0;

  // Filter programs
  const filteredPrograms = monetizationPrograms.filter((prog) => {
    const matchesSearch = !searchQuery || 
      prog.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (activeFilter) {
      case "Joined": return enrolledIds.has(prog.programId);
      case "Available": return prog.status === "join" && !enrolledIds.has(prog.programId);
      case "Coming Soon": return prog.badge === "Soon";
      default: return true;
    }
  });

  return (
    <div className="min-h-dvh bg-background pb-24">
      <SEOHead title="Monetization – ZIVO" description="Earn money on ZIVO with subscriptions, tips, gifts, and creator rewards." />

      {/* Header */}
      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30 zivo-ribbon">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/more")} className="p-2 -ml-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          {searchOpen ? (
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programs..."
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground/50"
              onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
            />
          ) : (
            <h1 className="text-lg font-extrabold flex-1 tracking-tight">Monetization</h1>
          )}
          <button
            onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchQuery(""); }}
            className="p-2 -mr-1 rounded-full hover:bg-muted/50 touch-manipulation"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 zivo-aurora">
        {/* Earnings Hero — Real Data */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="zivo-card-organic p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="zivo-icon-pill w-10 h-10 rounded-xl" style={{ color: "hsl(142 71% 45%)", background: "hsl(142 71% 45% / 0.12)" }}>
                  <Wallet className="h-5 w-5" style={{ color: "hsl(142 71% 45%)" }} />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Wallet Balance</p>
                  <p className="text-xl font-extrabold">${(balance / 100).toFixed(2)}</p>
                </div>
              </div>
              <Link to="/creator-dashboard" className="zivo-btn-signature px-4 py-2 text-[11px] flex items-center gap-1 touch-manipulation">
                Dashboard <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Programs", value: String(enrolledCount) },
                { label: "Referrals", value: String(referralCount ?? 0) },
                { label: "Tips", value: "0" },
                { label: "Status", value: enrolledCount > 0 ? "Active" : "Start" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-muted/30 p-2 text-center border border-border/20">
                  <p className="text-xs font-bold">{stat.value}</p>
                  <p className="text-[8px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="font-bold text-[15px] mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action, i) => (
              <Link key={action.label} to={action.href}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="zivo-card-organic p-3 flex flex-col items-center gap-2 touch-manipulation"
                >
                  <div className="zivo-icon-pill w-10 h-10 rounded-xl" style={{ color: action.accent, background: `${action.accent}15` }}>
                    <action.icon className="w-5 h-5" style={{ color: action.accent }} />
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight">{action.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Programs with Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[15px] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Programs
            </h2>
            <span className="text-[11px] text-muted-foreground font-medium">{filteredPrograms.length} shown</span>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3 -mx-1 px-1">
            {programFilter.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === filter
                    ? "bg-foreground text-background"
                    : "bg-muted/60 text-muted-foreground"
                }`}
              >
                {filter}
                {filter === "Joined" && enrolledCount > 0 && (
                  <span className="ml-1 text-[10px]">({enrolledCount})</span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <AnimatePresence mode="popLayout">
              {filteredPrograms.map((prog, i) => {
                const isEnrolled = enrolledIds.has(prog.programId);
                return (
                  <motion.div
                    key={prog.programId}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <Link to={`/monetization/program/${prog.programId}`}>
                      <div className="zivo-card-organic flex items-start gap-3 p-3.5 touch-manipulation">
                        <div className="zivo-icon-pill w-9 h-9 rounded-xl shrink-0 mt-0.5" style={{ color: prog.accent, background: `${prog.accent}15` }}>
                          <prog.icon className="h-4 w-4" style={{ color: prog.accent }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-bold text-[13px]">{prog.label}</p>
                            {prog.badge && <span className="zivo-badge">{prog.badge}</span>}
                            {prog.lockInfo && (
                              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-lg bg-muted text-muted-foreground flex items-center gap-0.5">
                                <Lock className="w-2 h-2" /> {prog.lockInfo}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{prog.description}</p>
                        </div>
                        {isEnrolled ? (
                          <span className="shrink-0 mt-1 flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                            <CheckCircle className="w-3 h-3" /> Joined
                          </span>
                        ) : prog.status === "join" ? (
                          <span className="shrink-0 mt-1 zivo-btn-signature px-3.5 py-1.5 text-[11px]">
                            Join
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-2" />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredPrograms.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No programs match your filter</p>
                <button onClick={() => { setActiveFilter("All"); setSearchQuery(""); }} className="text-xs text-primary font-semibold mt-2">
                  Show all programs
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="zivo-divider" />

        {/* Learning Resources */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[15px] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Resources
            </h2>
            <button
              onClick={() => navigate("/monetization/articles")}
              className="text-xs text-primary font-semibold flex items-center gap-0.5 touch-manipulation"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-1 px-1">
            {resourceTabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveResTab(i)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  i === activeResTab
                    ? "bg-foreground text-background"
                    : "bg-muted/60 text-muted-foreground"
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
                onClick={() => navigate(`/monetization/articles/${res.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`)}
                className="w-full flex items-start gap-3 text-left touch-manipulation active:bg-muted/10 rounded-xl p-2 -mx-2 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] leading-tight mb-1">{res.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{res.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Eye className="w-3 h-3 text-muted-foreground/50" />
                    <p className="text-[10px] text-muted-foreground/60">{res.views}</p>
                  </div>
                </div>
                <div className="zivo-icon-pill w-14 h-14 rounded-2xl shrink-0" style={{ color: res.accent, background: `${res.accent}10` }}>
                  <res.icon className="w-6 h-6" style={{ color: res.accent }} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="zivo-divider" />

        {/* Creator Progress */}
        <div>
          <h2 className="font-bold text-[15px] mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Your Creator Journey
          </h2>
          <div className="zivo-card-organic p-4 space-y-4">
            {[
              { step: "Create Account", done: true },
              { step: "Complete Verification", done: false, href: "/account/verification" },
              { step: "Join First Program", done: enrolledCount > 0 },
              { step: "Earn Your First Dollar", done: balance > 0 },
              { step: "Reach 1K Followers", done: false },
            ].map((item, i) => (
              <button
                key={item.step}
                onClick={() => item.href && navigate(item.href)}
                className="flex items-center gap-3 w-full text-left touch-manipulation"
                disabled={!item.href && item.done}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  item.done ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
                }`}>
                  {item.done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <p className={`text-sm font-medium flex-1 ${item.done ? "line-through text-muted-foreground" : ""}`}>
                  {item.step}
                </p>
                {item.href && !item.done && <ChevronRight className="w-4 h-4 text-muted-foreground/40" />}
              </button>
            ))}
          </div>
        </div>

        <div className="zivo-divider" />

        {/* CTAs */}
        {[
          { icon: BadgeCheck, title: "Get Verified", desc: "Unlock payouts and build trust.", href: "/account/verification", accent: "hsl(221 83% 53%)" },
          { icon: ShieldCheck, title: "Community Guidelines", desc: "Standards for creating on ZIVO.", href: "/monetization/articles", accent: "hsl(142 71% 45%)" },
          { icon: Award, title: "Creator Academy", desc: "500+ guides and tutorials.", href: "/monetization/articles", accent: "hsl(25 95% 53%)" },
          { icon: Globe, title: "Partner Program", desc: "Exclusive partner benefits.", href: "/affiliate-hub", accent: "hsl(263 70% 58%)" },
        ].map((cta, i) => (
          <Link key={cta.title} to={cta.href}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="zivo-card-organic p-4 flex items-center gap-3 touch-manipulation"
            >
              <div className="zivo-icon-pill w-10 h-10 rounded-xl shrink-0" style={{ color: cta.accent, background: `${cta.accent}12` }}>
                <cta.icon className="h-5 w-5" style={{ color: cta.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[13px]">{cta.title}</p>
                <p className="text-[11px] text-muted-foreground">{cta.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
            </motion.div>
          </Link>
        ))}

        {/* Watermark */}
        <div className="flex justify-center pt-4">
          <span className="text-[10px] text-muted-foreground/30 font-semibold tracking-widest uppercase">ZIVO Monetization • 2026</span>
        </div>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
