/**
 * MonetizationArticlesPage — Learning resources hub with categorized articles
 * Inspired by TikTok Creator Academy style with ZIVO branding
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, DollarSign, Crown, Gift, Heart, Star,
  Video, Store, Megaphone, ShieldCheck, Users, Sparkles,
  Lock, BadgeCheck, Settings, Eye, TrendingUp, BookOpen,
} from "lucide-react";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";

/* ─── Tab & Category Data ─── */
const TABS = [
  { id: "recommended", label: "Recommended" },
  { id: "getting-started", label: "Getting Started on ZIVO" },
  { id: "community", label: "Follow Community Guidelines" },
  { id: "tools", label: "How to Use Our Tools" },
];

interface Article {
  title: string;
  description: string;
  views: string;
  icon: typeof Star;
  iconBg: string;
  iconColor: string;
}

interface Section {
  heading: string;
  articles: Article[];
}

const RECOMMENDED_SECTIONS: Section[] = [
  {
    heading: "How to Monetize on ZIVO",
    articles: [
      { title: "Monetizing your content on ZIVO", description: "Ready to start collecting rewards for your creativity? Learn everything about turning views into earnings...", views: "9.2M views", icon: DollarSign, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Creator Monetization Center", description: "Are you a ZIVO creator looking to turn your passion into profit? Discover the tools at your fingertips...", views: "7.3M views", icon: TrendingUp, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "How to verify your identity to collect payouts", description: "Maintaining safety on ZIVO is our top priority. Learn how to verify and start earning...", views: "249.8K views", icon: BadgeCheck, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
      { title: "Getting your rewards from ZIVO", description: "We've made managing your ZIVO rewards simple. Track, withdraw, and manage your creator earnings...", views: "243.6K views", icon: Gift, iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
    ],
  },
  {
    heading: "Platform Pay",
    articles: [
      { title: "Creator Rewards Program", description: "If you're passionate about crafting high-quality content, the Creator Rewards Program is for you...", views: "14.4M views", icon: Crown, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Effect Creator Rewards", description: "Have you ever wondered what ZIVO's Effect Creator Rewards are all about? Discover how to earn...", views: "5.0M views", icon: Sparkles, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Winning rewards and boosting your creativity with contests", description: "Whether you're creating film & TV, sport, or lifestyle content, contests can supercharge your reach...", views: "203.1K views", icon: Star, iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
    ],
  },
  {
    heading: "User Pay",
    articles: [
      { title: "Series", description: "Series allows you to post groups of videos behind a paywall, creating premium episodic content...", views: "310.4K views", icon: Video, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Getting started with Subscription", description: "Subscription is your key to unleashing your creativity and fostering deeper audience connections...", views: "7.7M views", icon: Crown, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
    ],
  },
  {
    heading: "Branded Content",
    articles: [
      { title: "Creating branded content on ZIVO", description: "Whether you're participating in collaborations or building brand partnerships, learn the essentials...", views: "2.3M views", icon: Megaphone, iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
      { title: "Creating content brands will want to Spark", description: "Are you looking to land a brand deal and grow your creator business? Here's how to stand out...", views: "80.2K views", icon: Sparkles, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
      { title: "Building long-lasting brand partnerships", description: "ZIVO audiences crave authentic content. Learn how to build sustainable brand relationships...", views: "86.6K views", icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Monetize your content with brand deals on ZIVO", description: "If you're a creator, brand deals can help you earn while doing what you love...", views: "6,571 views", icon: DollarSign, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
    ],
  },
  {
    heading: "LIVE",
    articles: [
      { title: "Going LIVE!", description: "ZIVO LIVE is where the party's at – it's all about real-time fun, self-expression, and connecting...", views: "5.7M views", icon: Video, iconBg: "bg-red-500/10", iconColor: "text-red-500" },
      { title: "Unlocking LIVE monetization", description: "Get more from your LIVEs! Explore all the ways you can monetize your streams and increase earnings...", views: "5.7M views", icon: DollarSign, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Scaled LIVE rewards: Supercharging your LIVE journey", description: "We understand the dedication and effort you put into every LIVE session...", views: "544.7K views", icon: TrendingUp, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
    ],
  },
  {
    heading: "Shop",
    articles: [
      { title: "ZIVO Shop", description: "With ZIVO Shop, you can drive your audience from content to commerce seamlessly...", views: "6.8M views", icon: Store, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
    ],
  },
];

const GETTING_STARTED_SECTIONS: Section[] = [
  {
    heading: "Become a Creator",
    articles: [
      { title: "Navigating ZIVO as a beginner", description: "Welcome to ZIVO! Congratulations on taking the first step in your creative journey...", views: "3.0M views", icon: Star, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Getting started on ZIVO", description: "Are you looking for a place where you can share your passion and connect with others?", views: "1.8M views", icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "8 tips for becoming a successful ZIVO creator", description: "Endless laughs, jaw-dropping storytimes, and content that inspires millions...", views: "1.6M views", icon: Sparkles, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Kickstarting your ZIVO journey with content ideas", description: "Have you ever watched your favorite creators and wondered how they come up with ideas?", views: "419.6K views", icon: BookOpen, iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
    ],
  },
  {
    heading: "Account Management",
    articles: [
      { title: "How to personalize your ZIVO profile", description: "Once you've set up your ZIVO account, it's time to make your profile truly yours...", views: "1.1M views", icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Verification 101: how to get the Blue Check", description: "Ever noticed that little blue check mark next to some profiles? Learn how to get yours...", views: "775.2K views", icon: BadgeCheck, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
      { title: "Choosing the right account: Business vs. Personal", description: "Joining the ZIVO community can open up a world of possibilities...", views: "1.0M views", icon: Settings, iconBg: "bg-muted", iconColor: "text-muted-foreground" },
    ],
  },
];

const COMMUNITY_SECTIONS: Section[] = [
  {
    heading: "Understand the Rules",
    articles: [
      { title: "Community Guidelines", description: "ZIVO is where people discover things they love. Understanding our guidelines helps keep it safe...", views: "2.3M views", icon: ShieldCheck, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Creator code of conduct", description: "It's our priority to maintain a safe and welcoming environment for everyone on ZIVO...", views: "1.9M views", icon: Heart, iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
      { title: "Understanding ZIVO's Originality Policy", description: "At ZIVO, we're all about inspiring creativity and original content creation...", views: "371.6K views", icon: Sparkles, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
    ],
  },
  {
    heading: "Safety Settings & Tools",
    articles: [
      { title: "Safety tips", description: "ZIVO is a platform for creativity and inclusion. Here are tips to stay safe...", views: "559.9K views", icon: ShieldCheck, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Understanding ZIVO's policy on privacy and security", description: "Keeping your personal information safe is our top priority...", views: "5,873 views", icon: Lock, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
      { title: "Understanding ZIVO's policy on integrity and authenticity", description: "ZIVO is all about having authentic experiences and genuine connections...", views: "9,398 views", icon: BadgeCheck, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
    ],
  },
];

const TOOLS_SECTIONS: Section[] = [
  {
    heading: "Content Creation",
    articles: [
      { title: "How to create engaging Reels", description: "Master the art of short-form video content that captivates your audience...", views: "4.2M views", icon: Video, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Using ZIVO's editing tools", description: "From filters to effects, learn how to make your content stand out with built-in tools...", views: "2.1M views", icon: Sparkles, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
      { title: "Analytics & insights for creators", description: "Understanding your content performance is key to growing your audience...", views: "1.5M views", icon: TrendingUp, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
    ],
  },
  {
    heading: "Audience Growth",
    articles: [
      { title: "Growing your followers organically", description: "Learn proven strategies to build a genuine, engaged community on ZIVO...", views: "3.8M views", icon: Users, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Understanding the ZIVO algorithm", description: "How does content get discovered? Learn what makes content go viral on ZIVO...", views: "6.1M views", icon: Eye, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Collaborating with other creators", description: "Team up with fellow creators to reach new audiences and create memorable content...", views: "890K views", icon: Heart, iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
    ],
  },
];

const TAB_DATA: Record<string, { hero?: { title: string; description: string }; sections: Section[]; subtabs?: string[] }> = {
  recommended: {
    hero: { title: "How to Monetize on ZIVO", description: "Explore opportunities to get rewarded on ZIVO." },
    subtabs: ["Overview", "Creator Rewards Program", "Subscription"],
    sections: RECOMMENDED_SECTIONS,
  },
  "getting-started": {
    hero: { title: "Getting Started on ZIVO", description: "Everything you need to create a ZIVO account and set up your profile." },
    sections: GETTING_STARTED_SECTIONS,
  },
  community: {
    hero: { title: "Follow Community Guidelines", description: "Understand the rules and standards for using ZIVO to build a safe and trustworthy community together." },
    sections: COMMUNITY_SECTIONS,
  },
  tools: {
    hero: { title: "How to Use Our Tools", description: "Master ZIVO's creative and analytics tools to grow your audience." },
    sections: TOOLS_SECTIONS,
  },
};

export default function MonetizationArticlesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recommended");
  const tabData = TAB_DATA[activeTab];

  return (
    <div className="min-h-dvh bg-background pb-24">
      <SEOHead title="Articles – ZIVO Creator Academy" description="Learn how to monetize, grow, and create on ZIVO." />

      {/* Header */}
      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold flex-1 text-center">Articles</h1>
          <button className="p-2 -mr-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Top Tabs */}
        <div className="flex overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-5"
        >
          {/* Hero */}
          {tabData.hero && (
            <div className="mb-5">
              <h2 className="text-2xl font-bold leading-tight mb-2">{tabData.hero.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{tabData.hero.description}</p>

              {/* Subtabs */}
              {tabData.subtabs && (
                <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
                  {tabData.subtabs.map((sub, i) => (
                    <span
                      key={sub}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                        i === 0
                          ? "bg-foreground text-background"
                          : "bg-muted/60 text-muted-foreground"
                      }`}
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sections */}
          <div className="space-y-6">
            {tabData.sections.map((section) => (
              <div key={section.heading}>
                <h3 className="font-bold text-base mb-3">{section.heading}</h3>
                <div className="rounded-2xl border border-border/40 bg-card overflow-hidden divide-y divide-border/30">
                  {section.articles.map((article, ai) => (
                    <motion.button
                      key={article.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: ai * 0.03 }}
                      className="w-full flex items-start gap-3 p-4 text-left touch-manipulation active:bg-muted/20 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[13px] leading-snug mb-1">{article.title}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{article.description}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1.5">{article.views}</p>
                      </div>
                      <div className={`w-16 h-16 rounded-xl ${article.iconBg} shrink-0 flex items-center justify-center`}>
                        <article.icon className={`w-6 h-6 ${article.iconColor}`} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <ZivoMobileNav />
    </div>
  );
}
