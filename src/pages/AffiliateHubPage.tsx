/**
 * AffiliateHubPage — ZIVO Affiliate & Referral earnings hub
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Gift, DollarSign, Users, Link2, Copy, Share2,
  TrendingUp, ChevronRight, ExternalLink, BarChart3, Target,
  Award, Zap, Clock, CheckCircle, Star, Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";

const programs = [
  {
    title: "ZIVO Rides Referral",
    desc: "Earn $5 for every new rider you refer. They get $3 off their first ride.",
    commission: "$5 per signup",
    icon: "🚗",
    status: "active",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "ZIVO Eats Referral",
    desc: "Share food delivery. You earn $3, they save $5 on first order.",
    commission: "$3 per order",
    icon: "🍔",
    status: "active",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "ZIVO Shop Affiliate",
    desc: "Promote shop products. Earn 5% commission on every sale through your link.",
    commission: "5% per sale",
    icon: "🛍️",
    status: "active",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "ZIVO Flights Affiliate",
    desc: "Share flight deals. Earn $2 for every booking made through your link.",
    commission: "$2 per booking",
    icon: "✈️",
    status: "active",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    title: "ZIVO Hotels Affiliate",
    desc: "Recommend hotels. Earn 3% of booking value for each referral.",
    commission: "3% per booking",
    icon: "🏨",
    status: "coming_soon",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Creator Program",
    desc: "Top creators get custom commission rates and dedicated account support.",
    commission: "Custom rates",
    icon: "⭐",
    status: "invite_only",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

const stats = [
  { label: "Total Earnings", value: "$0.00", icon: DollarSign, color: "text-emerald-500" },
  { label: "Total Referrals", value: "0", icon: Users, color: "text-blue-500" },
  { label: "Conversion Rate", value: "0%", icon: Target, color: "text-amber-500" },
  { label: "Pending Payout", value: "$0.00", icon: Clock, color: "text-purple-500" },
];

export default function AffiliateHubPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const referralCode = user?.id?.slice(0, 8) || "ZIVO2026";

  const copyLink = () => {
    navigator.clipboard.writeText(`https://hizivo.com/ref/${referralCode}`);
    toast.success("Referral link copied!");
  };

  return (
    <div className="min-h-dvh bg-background pb-24">
      <SEOHead title="Affiliate Hub – ZIVO" description="Earn money through ZIVO referrals and affiliate programs." noIndex />

      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold flex-1">Affiliate Hub</h1>
          <Gift className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Referral Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-primary/15 via-primary/8 to-transparent border border-primary/20 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary">Your Referral Link</span>
          </div>
          <div className="flex items-center gap-2 bg-background/60 rounded-xl p-3 mb-3">
            <span className="text-xs text-muted-foreground flex-1 truncate font-mono">
              hizivo.com/ref/{referralCode}
            </span>
            <button onClick={copyLink} className="p-1.5 rounded-lg bg-primary/10 touch-manipulation active:scale-95">
              <Copy className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={copyLink} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold touch-manipulation active:scale-95 flex items-center justify-center gap-1.5">
              <Copy className="w-3 h-3" /> Copy Link
            </button>
            <button
              onClick={() => {
                if (navigator.share) navigator.share({ url: `https://hizivo.com/ref/${referralCode}`, title: "Join ZIVO" });
                else copyLink();
              }}
              className="flex-1 py-2 rounded-xl bg-muted text-foreground text-xs font-bold touch-manipulation active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3 h-3" /> Share
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border/40 bg-card p-3.5 text-center"
            >
              <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1.5`} />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Programs */}
        <div>
          <h2 className="font-bold text-base mb-3">Affiliate Programs</h2>
          <div className="space-y-2">
            {programs.map((prog, i) => (
              <motion.div
                key={prog.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="flex items-start gap-3 p-3.5 rounded-2xl border border-border/40 bg-card"
              >
                <div className={`w-10 h-10 rounded-xl ${prog.bg} flex items-center justify-center text-lg shrink-0`}>
                  {prog.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-[13px]">{prog.title}</p>
                    {prog.status === "coming_soon" && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Coming Soon</span>
                    )}
                    {prog.status === "invite_only" && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500">Invite Only</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{prog.desc}</p>
                  <p className="text-[11px] font-bold text-primary mt-1">{prog.commission}</p>
                </div>
                {prog.status === "active" ? (
                  <span className="shrink-0 mt-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    Join
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div>
          <h2 className="font-bold text-base mb-3">How It Works</h2>
          <div className="space-y-2">
            {[
              { step: "1", title: "Share Your Link", desc: "Copy your unique referral link and share it with friends, on social media, or in your content." },
              { step: "2", title: "Friends Sign Up", desc: "When someone uses your link to create an account or make a purchase, it's tracked automatically." },
              { step: "3", title: "Earn Commission", desc: "You earn a commission for every successful referral. Earnings are added to your ZIVO Wallet." },
              { step: "4", title: "Cash Out", desc: "Withdraw your earnings anytime via bank transfer or ABA/KHQR when you reach the $5 minimum." },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-2xl border border-border/40 bg-card"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{s.step}</span>
                </div>
                <div>
                  <p className="font-bold text-[13px]">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "View Wallet", icon: DollarSign, href: "/wallet" },
            { label: "Referral Program", icon: Users, href: "/referral" },
            { label: "Creator Dashboard", icon: BarChart3, href: "/creator-dashboard" },
            { label: "Monetization", icon: TrendingUp, href: "/monetization" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.href)}
              className="rounded-2xl border border-border/40 bg-card p-3 flex items-center gap-2.5 touch-manipulation active:scale-[0.98] transition-transform"
            >
              <a.icon className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
