/**
 * DigitalProductsPage — Sell courses, guides, templates, and digital assets on ZIVO
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, PenTool, BookOpen, Video, FileText, Image, Music,
  Download, DollarSign, Plus, ChevronRight, Star, Users, Eye,
  TrendingUp, Package, Zap, Lock, Globe, BarChart3, Palette,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";

const productTypes = [
  { icon: BookOpen, title: "Online Course", desc: "Create video courses with chapters, quizzes, and certificates.", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: FileText, title: "E-Book / Guide", desc: "Sell PDF guides, checklists, and written content.", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Palette, title: "Templates & Presets", desc: "Design templates, photo presets, and creative assets.", color: "text-pink-500", bg: "bg-pink-500/10" },
  { icon: Video, title: "Video Tutorials", desc: "Premium video content with pay-per-view access.", color: "text-red-500", bg: "bg-red-500/10" },
  { icon: Music, title: "Audio & Music", desc: "Sell beats, sound effects, podcasts, and audio courses.", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Package, title: "Digital Bundle", desc: "Package multiple products together at a discounted rate.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

const myProducts: any[] = [];

const stats = [
  { label: "Total Revenue", value: "$0.00", icon: DollarSign, color: "text-emerald-500" },
  { label: "Products", value: "0", icon: Package, color: "text-blue-500" },
  { label: "Customers", value: "0", icon: Users, color: "text-violet-500" },
  { label: "Downloads", value: "0", icon: Download, color: "text-amber-500" },
];

const features = [
  { icon: Lock, title: "Secure Delivery", desc: "Files are encrypted and only accessible to paying customers." },
  { icon: Globe, title: "Global Reach", desc: "Sell to customers worldwide with multi-currency support." },
  { icon: BarChart3, title: "Sales Analytics", desc: "Track revenue, conversions, and customer behavior in real-time." },
  { icon: Zap, title: "Instant Delivery", desc: "Automatic file delivery upon purchase — no manual work needed." },
  { icon: Star, title: "Reviews & Ratings", desc: "Build trust with customer reviews and social proof." },
  { icon: TrendingUp, title: "Affiliate System", desc: "Let others promote your products and earn commissions." },
];

export default function DigitalProductsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["My Products", "Create New", "Analytics"];

  return (
    <div className="min-h-dvh bg-background pb-24">
      <SEOHead title="Digital Products – ZIVO" description="Create and sell digital products on ZIVO." noIndex />

      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold flex-1">Digital Products</h1>
          <PenTool className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
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

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                i === activeTab ? "bg-foreground text-background" : "bg-muted/60 text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <>
            {myProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-dashed border-border/60 bg-card/50 p-8 text-center"
              >
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-bold text-sm mb-1">No products yet</p>
                <p className="text-xs text-muted-foreground mb-4">Start selling by creating your first digital product.</p>
                <button
                  onClick={() => setActiveTab(1)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold touch-manipulation active:scale-95 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" /> Create Product
                </button>
              </motion.div>
            ) : null}
          </>
        )}

        {activeTab === 1 && (
          <div>
            <h2 className="font-bold text-base mb-3">Choose Product Type</h2>
            <div className="space-y-2">
              {productTypes.map((type, i) => (
                <motion.button
                  key={type.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => toast.info(`${type.title} creation coming soon!`)}
                  className="w-full flex items-start gap-3 p-3.5 rounded-2xl border border-border/40 bg-card text-left touch-manipulation active:scale-[0.98] transition-transform"
                >
                  <div className={`w-10 h-10 rounded-xl ${type.bg} flex items-center justify-center shrink-0`}>
                    <type.icon className={`w-5 h-5 ${type.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13px]">{type.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{type.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-2" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/40 bg-card p-6 text-center"
          >
            <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-bold text-sm mb-1">No data yet</p>
            <p className="text-xs text-muted-foreground">Create and sell products to see analytics here.</p>
          </motion.div>
        )}

        {/* Platform Features */}
        <div>
          <h2 className="font-bold text-base mb-3">Platform Features</h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="rounded-2xl border border-border/40 bg-card p-3.5"
              >
                <f.icon className="w-5 h-5 text-primary mb-2" />
                <p className="font-bold text-[12px] mb-0.5">{f.title}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Monetization", icon: DollarSign, href: "/monetization" },
            { label: "Affiliate Hub", icon: TrendingUp, href: "/affiliate-hub" },
            { label: "Creator Dashboard", icon: BarChart3, href: "/creator-dashboard" },
            { label: "ZIVO Shop", icon: Package, href: "/shop-dashboard" },
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
