/**
 * DigitalProductsPage — Real Supabase data, ZIVO Signature Design
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  ArrowLeft, PenTool, BookOpen, Video, FileText, Image, Music,
  Download, DollarSign, Plus, ChevronRight, Star, Users, Eye,
  TrendingUp, Package, Zap, Lock, Globe, BarChart3, Palette, Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";

const productTypes = [
  { icon: BookOpen, title: "Online Course", desc: "Create video courses with chapters, quizzes, and certificates.", accent: "hsl(263 70% 58%)" },
  { icon: FileText, title: "E-Book / Guide", desc: "Sell PDF guides, checklists, and written content.", accent: "hsl(221 83% 53%)" },
  { icon: Palette, title: "Templates & Presets", desc: "Design templates, photo presets, and creative assets.", accent: "hsl(340 75% 55%)" },
  { icon: Video, title: "Video Tutorials", desc: "Premium video content with pay-per-view access.", accent: "hsl(0 84% 60%)" },
  { icon: Music, title: "Audio & Music", desc: "Sell beats, sound effects, podcasts, and audio courses.", accent: "hsl(38 92% 50%)" },
  { icon: Package, title: "Digital Bundle", desc: "Package multiple products together at a discounted rate.", accent: "hsl(142 71% 45%)" },
];

const features = [
  { icon: Lock, title: "Secure Delivery", desc: "Files encrypted and only accessible to paying customers.", accent: "hsl(0 84% 60%)" },
  { icon: Globe, title: "Global Reach", desc: "Sell worldwide with multi-currency support.", accent: "hsl(221 83% 53%)" },
  { icon: BarChart3, title: "Sales Analytics", desc: "Track revenue, conversions, and customer behavior.", accent: "hsl(263 70% 58%)" },
  { icon: Zap, title: "Instant Delivery", desc: "Automatic file delivery upon purchase.", accent: "hsl(38 92% 50%)" },
  { icon: Star, title: "Reviews & Ratings", desc: "Build trust with customer reviews.", accent: "hsl(340 75% 55%)" },
  { icon: TrendingUp, title: "Affiliate System", desc: "Let others promote your products.", accent: "hsl(142 71% 45%)" },
];

export default function DigitalProductsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["My Products", "Create New", "Analytics"];

  // Real creator data
  const { data: creator } = useQuery({
    queryKey: ["digital-creator-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("creator_profiles").select("total_earnings_cents").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ["digital-subs", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("creator_subscriptions").select("id").eq("creator_id", user!.id).eq("status", "active").limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const stats = [
    { label: "Total Revenue", value: `$${((creator?.total_earnings_cents || 0) / 100).toFixed(2)}`, icon: DollarSign, accent: "hsl(142 71% 45%)" },
    { label: "Products", value: "0", icon: Package, accent: "hsl(221 83% 53%)" },
    { label: "Customers", value: String(subscribers.length), icon: Users, accent: "hsl(263 70% 58%)" },
    { label: "Downloads", value: "0", icon: Download, accent: "hsl(38 92% 50%)" },
  ];

  return (
    <div className="min-h-dvh bg-background pb-24">
      <SEOHead title="Digital Products – ZIVO" description="Create and sell digital products on ZIVO." noIndex />

      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30 zivo-ribbon">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/more")} className="p-2 -ml-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-extrabold flex-1 tracking-tight">Digital Products</h1>
          <PenTool className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 zivo-aurora">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="zivo-card-organic p-3.5 text-center"
            >
              <div className="zivo-icon-pill mx-auto mb-1.5 w-9 h-9 rounded-xl" style={{ color: s.accent, background: `${s.accent}15` }}>
                <s.icon className="w-4 h-4" style={{ color: s.accent }} />
              </div>
              <p className="text-lg font-extrabold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors touch-manipulation ${
                i === activeTab ? "bg-foreground text-background" : "bg-muted/60 text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="zivo-card-organic p-8 text-center border-dashed"
          >
            <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="font-bold text-sm mb-1">No products yet</p>
            <p className="text-xs text-muted-foreground mb-4">Start selling by creating your first digital product.</p>
            <button
              onClick={() => setActiveTab(1)}
              className="zivo-btn-signature px-5 py-2.5 text-xs inline-flex items-center gap-1.5 touch-manipulation"
            >
              <Plus className="w-3 h-3" /> Create Product
            </button>
          </motion.div>
        )}

        {activeTab === 1 && (
          <div>
            <h2 className="font-bold text-[15px] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Choose Product Type
            </h2>
            <div className="space-y-1.5">
              {productTypes.map((type, i) => (
                <motion.button
                  key={type.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => toast.info(`${type.title} creation coming soon!`)}
                  className="w-full zivo-card-organic flex items-start gap-3 p-3.5 text-left touch-manipulation"
                >
                  <div className="zivo-icon-pill w-10 h-10 rounded-xl shrink-0" style={{ color: type.accent, background: `${type.accent}15` }}>
                    <type.icon className="w-5 h-5" style={{ color: type.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13px]">{type.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{type.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-2" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="zivo-card-organic p-6 text-center border-dashed"
          >
            <BarChart3 className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="font-bold text-sm mb-1">No data yet</p>
            <p className="text-xs text-muted-foreground">Create and sell products to see analytics here.</p>
          </motion.div>
        )}

        {/* Platform Features */}
        <div>
          <h2 className="font-bold text-[15px] mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Platform Features
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="zivo-card-organic p-3.5"
              >
                <div className="zivo-icon-pill w-8 h-8 rounded-lg mb-2" style={{ color: f.accent, background: `${f.accent}15` }}>
                  <f.icon className="w-4 h-4" style={{ color: f.accent }} />
                </div>
                <p className="font-bold text-[12px] mb-0.5">{f.title}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "Monetization", icon: DollarSign, href: "/monetization", accent: "hsl(142 71% 45%)" },
            { label: "Affiliate Hub", icon: TrendingUp, href: "/affiliate-hub", accent: "hsl(172 66% 50%)" },
            { label: "Dashboard", icon: BarChart3, href: "/creator-dashboard", accent: "hsl(198 93% 59%)" },
            { label: "ZIVO Shop", icon: Package, href: "/shop-dashboard", accent: "hsl(142 71% 45%)" },
          ].map((a) => (
            <Link key={a.label} to={a.href}>
              <div className="zivo-card-organic p-3.5 flex items-center gap-3 touch-manipulation">
                <div className="zivo-icon-pill w-9 h-9 rounded-xl" style={{ color: a.accent, background: `${a.accent}15` }}>
                  <a.icon className="w-4 h-4" style={{ color: a.accent }} />
                </div>
                <span className="text-xs font-bold">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <span className="text-[10px] text-muted-foreground/30 font-semibold tracking-widest uppercase">ZIVO Digital • 2026</span>
        </div>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
