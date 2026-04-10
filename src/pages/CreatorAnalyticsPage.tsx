/**
 * CreatorAnalyticsPage — Deep content analytics for ZIVO creators
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, TrendingUp, Eye, Heart, MessageCircle, Share2, Users,
  BarChart3, Clock, Globe, Smartphone, Monitor, Play, Image,
  FileText, Zap, Target, Award, Calendar, ChevronRight, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";

const timeRanges = ["7 days", "30 days", "90 days", "1 year", "All time"];

const overviewStats = [
  { label: "Total Views", value: "0", change: "+0%", icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10", up: true },
  { label: "Engagement Rate", value: "0%", change: "+0%", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10", up: true },
  { label: "Followers", value: "0", change: "+0", icon: Users, color: "text-violet-500", bg: "bg-violet-500/10", up: true },
  { label: "Avg Watch Time", value: "0s", change: "+0%", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", up: true },
  { label: "Profile Visits", value: "0", change: "+0%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", up: true },
  { label: "Shares", value: "0", change: "+0%", icon: Share2, color: "text-cyan-500", bg: "bg-cyan-500/10", up: true },
];

const contentBreakdown = [
  { type: "Videos", icon: Play, count: 0, views: 0, engagement: "0%", color: "text-purple-500", bg: "bg-purple-500/10" },
  { type: "Photos", icon: Image, count: 0, views: 0, engagement: "0%", color: "text-pink-500", bg: "bg-pink-500/10" },
  { type: "Stories", icon: Zap, count: 0, views: 0, engagement: "0%", color: "text-amber-500", bg: "bg-amber-500/10" },
  { type: "LIVE", icon: Play, count: 0, views: 0, engagement: "0%", color: "text-red-500", bg: "bg-red-500/10" },
  { type: "Articles", icon: FileText, count: 0, views: 0, engagement: "0%", color: "text-blue-500", bg: "bg-blue-500/10" },
];

const audienceDemographics = [
  { label: "Age 18-24", pct: 0 },
  { label: "Age 25-34", pct: 0 },
  { label: "Age 35-44", pct: 0 },
  { label: "Age 45-54", pct: 0 },
  { label: "Age 55+", pct: 0 },
];

const topCountries = [
  { name: "United States", pct: 0, flag: "🇺🇸" },
  { name: "Cambodia", pct: 0, flag: "🇰🇭" },
  { name: "Thailand", pct: 0, flag: "🇹🇭" },
  { name: "Vietnam", pct: 0, flag: "🇻🇳" },
  { name: "Japan", pct: 0, flag: "🇯🇵" },
];

const bestPostingTimes = [
  { day: "Mon", hours: [9, 12, 18, 21] },
  { day: "Tue", hours: [10, 13, 19, 22] },
  { day: "Wed", hours: [8, 11, 17, 20] },
  { day: "Thu", hours: [9, 12, 18, 21] },
  { day: "Fri", hours: [10, 14, 19, 23] },
  { day: "Sat", hours: [11, 15, 20, 22] },
  { day: "Sun", hours: [10, 14, 18, 21] },
];

export default function CreatorAnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeRange, setActiveRange] = useState(1);

  return (
    <div className="min-h-dvh bg-background pb-24">
      <SEOHead title="Creator Analytics – ZIVO" description="Deep content analytics and audience insights for ZIVO creators." noIndex />

      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold flex-1">Creator Analytics</h1>
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Time Range Selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {timeRanges.map((range, i) => (
            <button
              key={range}
              onClick={() => setActiveRange(i)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                i === activeRange ? "bg-foreground text-background" : "bg-muted/60 text-muted-foreground"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Overview Stats */}
        <div>
          <h2 className="font-bold text-base mb-3">Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            {overviewStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border/40 bg-card p-3.5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${stat.up ? "text-emerald-500" : "text-red-500"}`}>
                    {stat.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Content Performance */}
        <div>
          <h2 className="font-bold text-base mb-3">Content Performance</h2>
          <div className="space-y-2">
            {contentBreakdown.map((item, i) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-2xl border border-border/40 bg-card"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{item.type}</p>
                  <p className="text-[10px] text-muted-foreground">{item.count} posts · {item.views} views</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{item.engagement}</p>
                  <p className="text-[9px] text-muted-foreground">Engagement</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Audience Demographics */}
        <div>
          <h2 className="font-bold text-base mb-3">Audience Demographics</h2>
          <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-semibold">Age Distribution</span>
            </div>
            {audienceDemographics.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground w-16 shrink-0">{d.label}</span>
                <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="text-[11px] font-semibold w-10 text-right">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div>
          <h2 className="font-bold text-base mb-3">Top Countries</h2>
          <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-2.5">
            {topCountries.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-lg">{c.flag}</span>
                <span className="text-sm font-medium flex-1">{c.name}</span>
                <span className="text-sm font-bold">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Best Posting Times */}
        <div>
          <h2 className="font-bold text-base mb-3">Best Posting Times</h2>
          <div className="rounded-2xl border border-border/40 bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold">Optimal engagement windows</span>
            </div>
            <div className="space-y-2">
              {bestPostingTimes.map((d) => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold w-8">{d.day}</span>
                  <div className="flex gap-1.5 flex-1">
                    {d.hours.map((h) => (
                      <span key={h} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-semibold">
                        {h > 12 ? `${h - 12}PM` : `${h}AM`}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth Tips */}
        <div>
          <h2 className="font-bold text-base mb-3">Growth Insights</h2>
          <div className="space-y-2">
            {[
              { icon: Target, title: "Consistency is Key", desc: "Post at least 3 times per week to maintain algorithmic reach.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { icon: Zap, title: "Go LIVE More", desc: "Creators who go LIVE weekly see 40% more follower growth.", color: "text-amber-500", bg: "bg-amber-500/10" },
              { icon: Award, title: "Engage Your Audience", desc: "Reply to comments within 1 hour for 2x engagement boost.", color: "text-blue-500", bg: "bg-blue-500/10" },
              { icon: TrendingUp, title: "Use Trending Audio", desc: "Videos with trending sounds get 60% more distribution.", color: "text-pink-500", bg: "bg-pink-500/10" },
            ].map((tip, i) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-2xl border border-border/40 bg-card"
              >
                <div className={`w-9 h-9 rounded-xl ${tip.bg} flex items-center justify-center shrink-0`}>
                  <tip.icon className={`w-4 h-4 ${tip.color}`} />
                </div>
                <div>
                  <p className="font-bold text-[13px]">{tip.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{tip.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Schedule Post", icon: Calendar, href: "/content-scheduler", color: "text-purple-500", bg: "bg-purple-500/10" },
            { label: "View Dashboard", icon: BarChart3, href: "/creator-dashboard", color: "text-cyan-500", bg: "bg-cyan-500/10" },
            { label: "Monetize", icon: TrendingUp, href: "/monetization", color: "text-primary", bg: "bg-primary/10" },
            { label: "Creator Academy", icon: Award, href: "/monetization/articles", color: "text-orange-500", bg: "bg-orange-500/10" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.href)}
              className="rounded-2xl border border-border/40 bg-card p-3.5 flex items-center gap-3 touch-manipulation active:scale-[0.98] transition-transform"
            >
              <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center`}>
                <action.icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <span className="text-xs font-bold">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
