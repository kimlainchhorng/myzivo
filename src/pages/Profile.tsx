import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useCountry } from "@/hooks/useCountry";
import SEOHead from "@/components/SEOHead";
import {
  User, ArrowLeft, Loader2, Sparkles,
  Shield, Star, ChevronRight,
  Wallet, Store, ExternalLink, Users, Globe, ChevronDown, Crown, MapPin, ShoppingBag,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useMerchantRole } from "@/hooks/useMerchantRole";
import { useAffiliateAttribution } from "@/hooks/useAffiliateAttribution";
import { useZivoPlus } from "@/contexts/ZivoPlusContext";
import { MERCHANT_APP_URL } from "@/lib/eatsTables";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { motion, useScroll, useTransform } from "framer-motion";

const LANGS = [
  { code: "en", label: "English", cc: "us" },
  { code: "km", label: "ខ្មែរ", cc: "kh" },
  { code: "zh", label: "中文", cc: "cn" },
  { code: "ko", label: "한국어", cc: "kr" },
  { code: "ja", label: "日本語", cc: "jp" },
  { code: "vi", label: "Tiếng Việt", cc: "vn" },
  { code: "th", label: "ไทย", cc: "th" },
  { code: "es", label: "Español", cc: "es" },
  { code: "fr", label: "Français", cc: "fr" },
  { code: "de", label: "Deutsch", cc: "de" },
  { code: "it", label: "Italiano", cc: "it" },
  { code: "pt", label: "Português", cc: "pt" },
  { code: "nl", label: "Nederlands", cc: "nl" },
  { code: "pl", label: "Polski", cc: "pl" },
  { code: "sv", label: "Svenska", cc: "se" },
  { code: "da", label: "Dansk", cc: "dk" },
  { code: "fi", label: "Suomi", cc: "fi" },
  { code: "el", label: "Ελληνικά", cc: "gr" },
  { code: "cs", label: "Čeština", cc: "cz" },
  { code: "ro", label: "Română", cc: "ro" },
  { code: "hu", label: "Magyar", cc: "hu" },
  { code: "hr", label: "Hrvatski", cc: "hr" },
  { code: "bg", label: "Български", cc: "bg" },
  { code: "sk", label: "Slovenčina", cc: "sk" },
  { code: "lt", label: "Lietuvių", cc: "lt" },
  { code: "no", label: "Norsk", cc: "no" },
  { code: "ru", label: "Русский", cc: "ru" },
  { code: "uk", label: "Українська", cc: "ua" },
  { code: "tr", label: "Türkçe", cc: "tr" },
  { code: "ar", label: "العربية", cc: "sa" },
  { code: "id", label: "Bahasa Indonesia", cc: "id" },
];

const getFlagUrl = (cc: string) => `/flags/${cc}.svg`;
const CITY_BG: Record<string, string> = {
  US: "/flags/city-us.jpg",
  KH: "/flags/city-kh.jpg",
};

/* ── 3D tilt hook ── */
function use3DTilt(ref: React.RefObject<HTMLElement | null>, intensity = 8) {
  const [style, setStyle] = useState({ rotateX: 0, rotateY: 0 });

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    setStyle({ rotateX: -y * intensity, rotateY: x * intensity });
  }, [ref, intensity]);

  const handleLeave = useCallback(() => setStyle({ rotateX: 0, rotateY: 0 }), []);

  return { style, handleMove, handleLeave };
}

/* ── Animated bokeh particle ── */
const BokehParticle = ({ delay, size, x, y, color }: { delay: number; size: number; x: string; y: string; color: string }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, left: x, top: y, background: color, filter: `blur(${size * 0.4}px)` }}
    animate={{ opacity: [0.15, 0.4, 0.15], scale: [0.8, 1.2, 0.8], y: [0, -20, 0] }}
    transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

/* ── Parallax section wrapper ── */
const ParallaxSection = ({ children, index }: { children: React.ReactNode; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, rotateX: 8 }}
    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
    viewport={{ once: true, margin: "-30px" }}
    transition={{ duration: 0.6, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    style={{ perspective: "1200px" }}
  >
    {children}
  </motion.div>
);

/* ── 3D Glass Card wrapper ── */
const GlassCard3D = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <div className={`relative rounded-3xl overflow-hidden ${className}`}>
    {/* Glassmorphism layers */}
    <div className="absolute inset-0 bg-card/70 backdrop-blur-2xl" />
    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02]" />
    <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]" />
    {glow && <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
    <div className="relative z-10">{children}</div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, currentLanguage, changeLanguage } = useI18n();
  const { country, setCountry, countries } = useCountry();
  const { user, signOut, isAdmin } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: merchantData } = useMerchantRole();
  const affiliateAttribution = useAffiliateAttribution();
  const { isPlus, plan } = useZivoPlus();
  const langTriggerRef = useRef<HTMLButtonElement>(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const profileCardRef = useRef<HTMLDivElement>(null);

  const profileTilt = use3DTilt(profileCardRef);

  const { scrollYProgress } = useScroll({ container: scrollRef });
  const headerY = useTransform(scrollYProgress, [0, 0.3], [0, -30]);
  const headerScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const bgParallax = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  const quickLinks = [
    { icon: Settings, label: "Settings", href: "/account/settings", description: "App settings & preferences", color: "from-gray-500/15 to-gray-600/10", iconColor: "text-muted-foreground" },
    { icon: ShoppingBag, label: t("profile.my_orders"), href: "/grocery/orders", description: t("profile.orders_desc"), color: "from-blue-500/15 to-blue-600/10", iconColor: "text-blue-500" },
    { icon: Wallet, label: t("profile.wallet"), href: "/wallet", description: t("profile.wallet_desc"), color: "from-emerald-500/15 to-emerald-600/10", iconColor: "text-emerald-500" },
    { icon: Sparkles, label: t("profile.loyalty"), href: "/account/loyalty", description: t("profile.loyalty_desc"), color: "from-amber-500/15 to-amber-600/10", iconColor: "text-amber-500" },
    { icon: MapPin, label: t("profile.saved_addresses"), href: "/account/addresses", description: t("profile.addresses_desc"), color: "from-rose-500/15 to-rose-600/10", iconColor: "text-rose-500" },
  ];

  const currentLang = LANGS.find(l => l.code === currentLanguage) || LANGS[0];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden safe-area-top safe-area-bottom">
      <SEOHead title="Profile Settings – ZIVO" description="Manage your ZIVO account, profile, and travel preferences." noIndex={true} />

      {/* ── Deep 3D Background with multiple parallax layers ── */}
      <motion.div style={{ y: bgParallax }} className="pointer-events-none fixed inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] via-background to-primary/[0.04]" />
        {/* Radial glows */}
        <div className="absolute top-[-25%] right-[-15%] w-[70vw] h-[70vw] rounded-full bg-primary/[0.07] blur-[120px]" />
        <div className="absolute bottom-[5%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-primary/[0.05] blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[40vw] h-[40vw] rounded-full bg-primary/[0.03] blur-[80px]" />
        {/* Bokeh particles */}
        <BokehParticle delay={0} size={60} x="10%" y="15%" color="hsl(var(--primary) / 0.08)" />
        <BokehParticle delay={1.5} size={40} x="75%" y="25%" color="hsl(var(--primary) / 0.06)" />
        <BokehParticle delay={2.8} size={80} x="85%" y="60%" color="hsl(var(--primary) / 0.05)" />
        <BokehParticle delay={0.8} size={35} x="20%" y="70%" color="hsl(var(--primary) / 0.07)" />
        <BokehParticle delay={3.5} size={50} x="55%" y="85%" color="hsl(var(--primary) / 0.04)" />
        <BokehParticle delay={1.2} size={45} x="40%" y="10%" color="hsl(var(--primary) / 0.06)" />
      </motion.div>

      {/* ── Scrollable content ── */}
      <div ref={scrollRef} className="relative z-10 h-screen overflow-y-auto pb-24 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
        <div className="px-4 pt-4 max-w-lg mx-auto">

          {/* ── Header with 3D parallax ── */}
          <motion.div style={{ y: headerY, scale: headerScale }} className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.1, rotateY: 10 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 shadow-lg shadow-primary/[0.05] hover:bg-card/80 -ml-2 touch-manipulation active:scale-95"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </motion.div>
              <div>
                <h1 className="font-display text-xl font-bold">{t("profile.title")}</h1>
                <p className="text-muted-foreground text-xs">{t("profile.subtitle")}</p>
              </div>
            </div>
            {isAdmin && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" onClick={() => navigate("/admin/analytics")} className="gap-2 rounded-2xl backdrop-blur-xl bg-card/60 border-border/30 shadow-lg">
                  <Shield className="h-4 w-4" /> Admin Dashboard
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* ── Language Selector (3D floating pill) ── */}
          <ParallaxSection index={0}>
            <div className="relative mb-4">
              <motion.button
                ref={langTriggerRef}
                whileHover={{ scale: 1.05, y: -2, rotateX: 3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLangPicker(prev => !prev)}
                className="relative z-20 flex min-h-12 items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-xl shadow-primary/30 touch-manipulation transition-all"
                style={{ perspective: "800px", transformStyle: "preserve-3d", transform: "translateZ(24px)" }}
              >
                <Globe className="w-4 h-4" />
                <img src={getFlagUrl(currentLang.cc)} alt="" className="w-5 h-3.5 rounded-[3px] object-cover shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <span>{currentLang.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showLangPicker ? "rotate-180" : ""}`} />
              </motion.button>
            </div>
          </ParallaxSection>

          {/* ── Country Selector (3D photo cards with depth) ── */}
          <ParallaxSection index={1}>
            <div className="flex items-center justify-center gap-3 mb-5">
              {countries.map((c) => (
                <motion.button
                  key={c.code}
                  whileHover={{ scale: 1.06, rotateY: 5, z: 20 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setCountry(c.code)}
                  className={`relative flex items-center gap-2 px-5 py-4 rounded-3xl text-sm font-bold transition-all touch-manipulation overflow-hidden min-w-[150px] justify-center ${
                    country === c.code
                      ? "ring-2 ring-primary shadow-2xl shadow-primary/25"
                      : "ring-1 ring-border/30 opacity-65 hover:opacity-100"
                  }`}
                  style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
                >
                  <img src={CITY_BG[c.code]} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  <div className={`absolute inset-0 transition-colors duration-500 ${country === c.code ? "bg-primary/55" : "bg-foreground/40"}`} />
                  {/* Depth shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />
                  <img src={getFlagUrl(c.code.toLowerCase())} alt={c.name} className="w-6 h-4 rounded-[3px] object-cover shadow-md border border-white/40 shrink-0 relative z-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span className="relative z-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">{c.name}</span>
                </motion.button>
              ))}
            </div>
          </ParallaxSection>

          {profileLoading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="h-8 w-8 text-primary" />
              </motion.div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* ── Profile Card (3D tilt + glassmorphism) ── */}
              <ParallaxSection index={2}>
                <motion.div
                  ref={profileCardRef}
                  onMouseMove={profileTilt.handleMove as any}
                  onMouseLeave={profileTilt.handleLeave}
                  animate={{ rotateX: profileTilt.style.rotateX, rotateY: profileTilt.style.rotateY }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
                  className="group"
                >
                  <GlassCard3D glow className="shadow-2xl shadow-primary/[0.08]">
                    <CardHeader className="text-center pb-2 pt-8">
                      <div className="flex justify-center mb-4">
                        <motion.div
                          className="relative group/avatar"
                          whileHover={{ scale: 1.08, rotateY: 10 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          {/* Multi-layer glow ring */}
                          <div className="absolute -inset-4 bg-gradient-to-r from-primary via-primary/50 to-primary rounded-full blur-2xl opacity-20 group-hover/avatar:opacity-45 transition-opacity animate-pulse" />
                          <div className="absolute -inset-2 bg-gradient-to-br from-primary/40 to-primary/20 rounded-full blur-md opacity-30" />
                          <Avatar className="relative h-24 w-24 ring-[3px] ring-primary/30 shadow-2xl shadow-primary/20">
                            <AvatarImage src={avatarPreview || profile?.avatar_url || undefined} alt="Profile" />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-2xl font-bold">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <motion.button
                            whileHover={{ scale: 1.2, rotate: 15 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={handleAvatarClick}
                            disabled={uploadAvatar.isPending}
                            className="absolute bottom-0 right-0 p-2.5 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/40 hover:opacity-90 transition-opacity disabled:opacity-50 touch-manipulation ring-2 ring-background"
                          >
                            {uploadAvatar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                          </motion.button>
                          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" capture={undefined} onChange={handleFileChange} className="hidden" />
                        </motion.div>
                      </div>
                      <CardTitle className="flex items-center justify-center gap-2 text-xl font-bold">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {profile?.full_name || t("profile.set_name")}
                      </CardTitle>
                      <CardDescription className="text-sm">{user?.email}</CardDescription>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <Badge className="bg-primary/12 text-primary border-primary/25 font-semibold rounded-full px-3 py-1 shadow-sm">
                          <Star className="w-3 h-3 mr-1 fill-primary" /> {profile?.status || t("profile.active_member")}
                        </Badge>
                        {isPlus && (
                          <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30 font-semibold rounded-full px-3 py-1 shadow-sm">
                            <Crown className="w-3 h-3 mr-1" /> ZIVO+ {plan === "annual" ? "Annual" : "Monthly"}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 pb-6 px-6">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          variant="outline"
                          className="w-full h-12 rounded-2xl font-semibold text-sm border-border/30 bg-muted/10"
                          onClick={() => navigate("/account/profile-edit")}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Edit Profile Information
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                      </motion.div>
                    </CardContent>
                  </GlassCard3D>
                </motion.div>
              </ParallaxSection>

              {/* ── Quick Access Links (3D floating glass tiles) ── */}
              <ParallaxSection index={3}>
                <h3 className="font-display font-bold text-base mb-3">{t("profile.quick_access")}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickLinks.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, y: 30, rotateX: 12 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ scale: 1.04, y: -4, rotateY: 3 }}
                      whileTap={{ scale: 0.96 }}
                      style={{ perspective: "800px", transformStyle: "preserve-3d" }}
                    >
                      <Link to={link.href}>
                        <GlassCard3D className="shadow-lg hover:shadow-2xl hover:shadow-primary/[0.06] transition-shadow duration-500 group">
                          <div className="p-3.5 flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-inner`}>
                              <link.icon className={`w-5 h-5 ${link.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[13px] truncate">{link.label}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{link.description}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                          </div>
                        </GlassCard3D>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </ParallaxSection>

              {/* ── ZIVO+ Membership (3D premium card) ── */}
              {!isPlus && (
                <ParallaxSection index={4}>
                  <Link to="/zivo-plus">
                    <motion.div
                      whileHover={{ scale: 1.03, y: -3, rotateX: 2 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ perspective: "800px" }}
                    >
                      <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/15 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-400/15 backdrop-blur-2xl" />
                        <div className="absolute inset-0 bg-card/50" />
                        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-amber-500/15" />
                        {/* Animated shimmer */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                        />
                        <div className="relative z-10 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <motion.div
                                animate={{ rotateY: [0, 360] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30"
                                style={{ transformStyle: "preserve-3d" }}
                              >
                                <Crown className="w-6 h-6 text-white" />
                              </motion.div>
                              <div>
                                <p className="font-bold text-sm">{t("profile.upgrade_plus")}</p>
                                <p className="text-xs text-muted-foreground">{t("profile.upgrade_desc")}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-amber-500/60 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </ParallaxSection>
              )}

              {/* ── Merchant Dashboard (3D card) ── */}
              {merchantData?.isMerchant && (
                <ParallaxSection index={5}>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => import("@/lib/openExternalUrl").then(({ openExternalUrl }) => openExternalUrl(MERCHANT_APP_URL))}
                    className="block w-full text-left"
                    style={{ perspective: "800px" }}
                  >
                    <GlassCard3D className="shadow-xl hover:shadow-2xl transition-shadow duration-500 group">
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-xl shadow-orange-500/25">
                              <Store className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{t("profile.merchant_dashboard")}</p>
                              <p className="text-xs text-muted-foreground">{t("profile.merchant_desc")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-orange-500/12 text-orange-500 border-orange-500/20 font-semibold text-xs rounded-full">{t("profile.partner")}</Badge>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </GlassCard3D>
                  </motion.button>
                </ParallaxSection>
              )}

              {/* ── Partner Attribution (3D glass) ── */}
              {affiliateAttribution.hasAffiliateAttribution && (
                <ParallaxSection index={6}>
                  <GlassCard3D className="shadow-xl">
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/15 to-violet-600/10 flex items-center justify-center shadow-inner">
                          <Users className="w-5 h-5 text-violet-500" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{t("profile.referred_by")}</p>
                          <p className="text-xs text-muted-foreground">{t("profile.joined_through")} {affiliateAttribution.partnerName}</p>
                        </div>
                      </div>
                    </div>
                  </GlassCard3D>
                </ParallaxSection>
              )}

              {/* ── Sign Out (bottom) ── */}
              {user && (
                <ParallaxSection index={7}>
                  <div className="pt-2 pb-4">
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-13 text-base font-semibold rounded-2xl backdrop-blur-xl bg-card/50 border-border/40 shadow-lg shadow-foreground/[0.03] hover:shadow-xl hover:bg-card/70 transition-all duration-300 touch-manipulation"
                        onClick={async () => { await signOut(); navigate("/"); }}
                      >
                        {t("profile.sign_out")}
                      </Button>
                    </motion.div>
                  </div>
                </ParallaxSection>
              )}
            </div>
          )}
        </div>
      </div>

      <ZivoMobileNav />

      {showLangPicker && langTriggerRef.current && createPortal(
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setShowLangPicker(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[100] bg-card/95 backdrop-blur-2xl border border-border/40 rounded-3xl shadow-2xl shadow-primary/10 p-2 min-w-[230px] max-h-[360px] overflow-y-auto"
            style={{
              left: Math.max(16, Math.min(langTriggerRef.current.getBoundingClientRect().left, window.innerWidth - 246)),
              top: langTriggerRef.current.getBoundingClientRect().bottom + 8,
              scrollbarWidth: 'thin',
            }}
          >
            {LANGS.map((lang, i) => (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.012, duration: 0.2 }}
                onClick={() => { changeLanguage(lang.code); setShowLangPicker(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all touch-manipulation active:scale-[0.97] relative overflow-hidden group ${
                  currentLanguage === lang.code
                    ? "bg-primary/12 text-primary ring-1 ring-primary/25"
                    : "text-foreground hover:bg-muted/70"
                }`}
              >
                <img src={getFlagUrl(lang.cc)} alt="" className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-8 rounded object-cover opacity-[0.05] pointer-events-none group-hover:opacity-[0.12] transition-opacity" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <img src={getFlagUrl(lang.cc)} alt={lang.label} className="w-6 h-4 rounded-[3px] object-cover shadow-sm border border-border/30 relative z-10 shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <span className="relative z-10">{lang.label}</span>
                {currentLanguage === lang.code && <Star className="w-3 h-3 text-primary fill-primary ml-auto relative z-10" />}
              </motion.button>
            ))}
          </motion.div>
        </>,
        document.body
      )}
      {/* Phone Verification Dialog */}
      {pendingProfileData?.phone && (
        <PhoneVerificationDialog
          open={showPhoneVerify}
          onOpenChange={setShowPhoneVerify}
          phoneNumber={pendingProfileData.phone}
          onVerified={handlePhoneVerified}
        />
      )}
    </div>
  );
};

export default Profile;
