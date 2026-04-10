/**
 * MonetizationPage — Monetization hub for creators: subscriptions, tips, gifts, and learning resources
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, DollarSign, Crown, Gift, Heart, Sparkles,
  ChevronRight, Users, TrendingUp, Zap, Star, Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/seo/SEOHead";

const monetizationPrograms = [
  {
    icon: Gift,
    label: "Creator Rewards",
    description: "Get Gifts for your top-performing videos.",
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
    description: "Let your audience show appreciation with direct tips during streams.",
    status: "join" as const,
    href: "/creator-dashboard",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
];

const learningResources = [
  {
    title: "Getting started with Subscription",
    description: "Subscription is your key to unleashing your creativity and fostering deeper connections wit...",
    views: "7.7M views",
  },
  {
    title: "Going LIVE!",
    description: "ZIVO LIVE is where the party's at – it's all about real-time fun, self-expression, and letting your...",
    views: "5.7M views",
  },
  {
    title: "Unlocking LIVE monetization",
    description: "Get more from your LIVEs! Explore all the ways you can monetize your streams and increase y...",
    views: "5.7M views",
  },
];

const resourceTabs = ["Recommended", "Subscription", "LIVE rewards", "Creator Re..."];

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
        {/* Programs */}
        <div className="space-y-3">
          {monetizationPrograms.map((prog, i) => (
            <motion.button
              key={prog.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => navigate(prog.href)}
              className="w-full flex items-start gap-3 p-4 rounded-2xl border border-border/40 bg-card text-left touch-manipulation active:scale-[0.98] transition-all"
            >
              <div className={`h-10 w-10 rounded-xl ${prog.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <prog.icon className={`h-5 w-5 ${prog.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold text-sm">{prog.label}</p>
                  {prog.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> {prog.badge}
                    </span>
                  )}
                  {prog.lockInfo && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> {prog.lockInfo}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{prog.description}</p>
              </div>
              {prog.status === "join" ? (
                <span className="shrink-0 mt-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  Join
                </span>
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-2" />
              )}
            </motion.button>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* Learning Resources */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base">Learning resources</h2>
            <button className="text-xs text-primary font-semibold flex items-center gap-0.5">
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
              <motion.div
                key={res.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-tight mb-1">{res.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{res.description}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{res.views}</p>
                </div>
                <div className="w-20 h-14 rounded-xl bg-gradient-to-br from-muted to-muted/60 shrink-0 flex items-center justify-center">
                  <Star className="w-5 h-5 text-muted-foreground/40" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Stats CTA */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold">Your Creator Stats</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Track earnings, subscribers, and tips in your Creator Dashboard.
            </p>
            <button
              onClick={() => navigate("/creator-dashboard")}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold touch-manipulation active:scale-[0.98] transition-transform"
            >
              Open Creator Dashboard
            </button>
          </motion.div>
        )}
      </div>

      <ZivoMobileNav />
    </div>
  );
}
