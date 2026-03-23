import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useCountry } from "@/hooks/useCountry";
import SEOHead from "@/components/SEOHead";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, Camera, ArrowLeft, Mail, Phone, Loader2, Save, Sparkles,
  Shield, Star, Clock, ChevronRight, CreditCard, Bell, Lock, Gift,
  Wallet, Store, ExternalLink, Users, Globe, ChevronDown, Crown, MapPin, ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useUpdateUserProfile, useUploadAvatar } from "@/hooks/useUserProfile";
import { useMerchantRole } from "@/hooks/useMerchantRole";
import { useAffiliateAttribution } from "@/hooks/useAffiliateAttribution";
import { useZivoPlus } from "@/contexts/ZivoPlusContext";
import { MERCHANT_APP_URL } from "@/lib/eatsTables";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { CountryPhoneInput } from "@/components/auth/CountryPhoneInput";
import { motion, useScroll, useTransform } from "framer-motion";

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters").optional().or(z.literal("")),
  phone: z.string().trim().max(20, "Phone number too long").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

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

/* ── Parallax section wrapper ── */
const ParallaxSection = ({ children, index }: { children: React.ReactNode; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.97 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { t, currentLanguage, changeLanguage } = useI18n();
  const { country, setCountry, countries } = useCountry();
  const { user, signOut, isAdmin } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: merchantData } = useMerchantRole();
  const affiliateAttribution = useAffiliateAttribution();
  const { isPlus, plan } = useZivoPlus();
  const updateProfile = useUpdateUserProfile();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const profileCardRef = useRef<HTMLDivElement>(null);
  const countryCardRef = useRef<HTMLDivElement>(null);
  
  const profileTilt = use3DTilt(profileCardRef);

  // Parallax scroll values
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const headerY = useTransform(scrollYProgress, [0, 0.3], [0, -30]);
  const headerScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const bgParallax = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: "", phone: "" },
    values: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
    },
  });

  const handleAvatarClick = () => { fileInputRef.current?.click(); };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { setAvatarPreview(ev.target?.result as string); };
      reader.readAsDataURL(file);
      await uploadAvatar.mutateAsync(file);
      setAvatarPreview(null);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setAvatarPreview(null);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile.mutateAsync({
      full_name: data.full_name || null,
      phone: data.phone || null,
    });
  };

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  const quickLinks = [
    { icon: ShoppingBag, label: t("profile.my_orders"), href: "/grocery/orders", description: t("profile.orders_desc") },
    { icon: Wallet, label: t("profile.wallet"), href: "/wallet", description: t("profile.wallet_desc") },
    { icon: Sparkles, label: t("profile.loyalty"), href: "/account/loyalty", description: t("profile.loyalty_desc") },
    { icon: Gift, label: t("profile.gift_cards"), href: "/account/gift-cards", description: t("profile.gift_cards_desc") },
    { icon: CreditCard, label: t("profile.payment_methods"), href: "/payment-methods", description: t("profile.payment_desc") },
    { icon: MapPin, label: t("profile.saved_addresses"), href: "/account/addresses", description: t("profile.addresses_desc") },
    { icon: Bell, label: t("profile.notifications"), href: "/notifications", description: t("profile.notifications_desc") },
    { icon: Lock, label: t("profile.security"), href: "/account/security", description: t("profile.security_desc") },
    { icon: Globe, label: t("profile.preferences"), href: "/account/preferences", description: t("profile.preferences_desc") },
  ];

  const currentLang = LANGS.find(l => l.code === currentLanguage) || LANGS[0];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden safe-area-top safe-area-bottom">
      <SEOHead title="Profile Settings – ZIVO" description="Manage your ZIVO account, profile, and travel preferences." noIndex={true} />

      {/* Animated background layers */}
      <motion.div 
        style={{ y: bgParallax }}
        className="pointer-events-none fixed inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-primary/5" />
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-primary/3 blur-[80px]" />
      </motion.div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="relative z-10 h-screen overflow-y-auto pb-24 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
        <div className="px-4 pt-4 max-w-lg mx-auto">

          {/* ── Header with parallax ── */}
          <motion.div style={{ y: headerY, scale: headerScale }} className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-xl hover:bg-muted/50 -ml-2 touch-manipulation active:scale-95"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-xl font-bold">{t("profile.title")}</h1>
                <p className="text-muted-foreground text-xs">{t("profile.subtitle")}</p>
              </div>
            </div>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin/analytics")} className="gap-2">
                <Shield className="h-4 w-4" /> Admin Dashboard
              </Button>
            )}
          </motion.div>

          {/* ── Language Selector (3D pill) ── */}
          <ParallaxSection index={0}>
            <div className="relative mb-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowLangPicker(prev => !prev)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/25 touch-manipulation transition-all"
                style={{ perspective: "600px" }}
              >
                <Globe className="w-3.5 h-3.5" />
                <img src={getFlagUrl(currentLang.cc)} alt="" className="w-5 h-3.5 rounded-[2px] object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <span>{currentLang.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showLangPicker ? "rotate-180" : ""}`} />
              </motion.button>

              {showLangPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 top-full mt-2 z-50 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-1.5 min-w-[220px] max-h-[360px] overflow-y-auto"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {LANGS.map((lang, i) => (
                    <motion.button
                      key={lang.code}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.015, duration: 0.2 }}
                      onClick={() => { changeLanguage(lang.code); setShowLangPicker(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all touch-manipulation active:scale-[0.98] relative overflow-hidden group ${
                        currentLanguage === lang.code
                          ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                          : "text-foreground hover:bg-muted/80"
                      }`}
                    >
                      <img src={getFlagUrl(lang.cc)} alt="" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-7 rounded object-cover opacity-[0.06] pointer-events-none group-hover:opacity-[0.12] transition-opacity" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      <img src={getFlagUrl(lang.cc)} alt={lang.label} className="w-6 h-4 rounded-[3px] object-cover shadow-sm border border-border/30 relative z-10 shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      <span className="relative z-10">{lang.label}</span>
                      {currentLanguage === lang.code && <Star className="w-3 h-3 text-primary fill-primary ml-auto relative z-10" />}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </ParallaxSection>

          {/* ── Country Selector (3D cards with city backgrounds) ── */}
          <ParallaxSection index={1}>
            <div className="flex items-center justify-center gap-3 mb-5">
              {countries.map((c) => (
                <motion.button
                  key={c.code}
                  whileHover={{ scale: 1.04, rotateY: 3 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setCountry(c.code)}
                  className={`relative flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all touch-manipulation overflow-hidden min-w-[150px] justify-center ${
                    country === c.code
                      ? "ring-2 ring-primary shadow-xl shadow-primary/20"
                      : "ring-1 ring-border/40 opacity-70 hover:opacity-100"
                  }`}
                  style={{ perspective: "800px", transformStyle: "preserve-3d" }}
                >
                  <img src={CITY_BG[c.code]} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className={`absolute inset-0 transition-colors duration-300 ${country === c.code ? "bg-primary/55" : "bg-slate-900/45"}`} />
                  <img src={getFlagUrl(c.code.toLowerCase())} alt={c.name} className="w-6 h-4 rounded-[3px] object-cover shadow-sm border border-white/30 shrink-0 relative z-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span className="relative z-10 text-white drop-shadow-lg">{c.name}</span>
                </motion.button>
              ))}
            </div>
          </ParallaxSection>

          {profileLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* ── Profile Card (3D tilt) ── */}
              <ParallaxSection index={2}>
                <motion.div
                  ref={profileCardRef}
                  onMouseMove={profileTilt.handleMove as any}
                  onMouseLeave={profileTilt.handleLeave}
                  animate={{ rotateX: profileTilt.style.rotateX, rotateY: profileTilt.style.rotateY }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
                >
                  <Card className="relative border-0 bg-gradient-to-br from-card/95 to-card shadow-2xl overflow-hidden backdrop-blur-sm">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/3" />
                    {/* Glowing edge */}
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
                    
                    <CardHeader className="text-center pb-2 relative">
                      <div className="flex justify-center mb-4">
                        <motion.div 
                          className="relative group"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="absolute -inset-3 bg-gradient-to-r from-primary via-primary/60 to-primary rounded-full blur-xl opacity-25 group-hover:opacity-50 transition-opacity animate-pulse" />
                          <Avatar className="relative h-24 w-24 ring-4 ring-background shadow-2xl">
                            <AvatarImage src={avatarPreview || profile?.avatar_url || undefined} alt="Profile" />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-2xl font-bold">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleAvatarClick}
                            disabled={uploadAvatar.isPending}
                            className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity disabled:opacity-50 touch-manipulation"
                          >
                            {uploadAvatar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                          </motion.button>
                          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" capture={undefined} onChange={handleFileChange} className="hidden" />
                        </motion.div>
                      </div>
                      <CardTitle className="flex items-center justify-center gap-2 text-xl">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {profile?.full_name || t("profile.set_name")}
                      </CardTitle>
                      <CardDescription className="text-sm">{user?.email}</CardDescription>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
                          <Star className="w-3 h-3 mr-1 fill-primary" /> {profile?.status || t("profile.active_member")}
                        </Badge>
                        {isPlus && (
                          <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30 font-semibold">
                            <Crown className="w-3 h-3 mr-1" /> ZIVO+ {plan === "annual" ? "Annual" : "Monthly"}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-6 relative">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                          <FormField control={form.control} name="full_name" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 font-semibold"><User className="h-4 w-4 text-primary" />{t("profile.full_name")}</FormLabel>
                              <FormControl><Input placeholder={t("profile.full_name_placeholder")} className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10 transition-shadow" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold"><Mail className="h-4 w-4 text-primary" />{t("profile.email")}</label>
                            <Input value={user?.email || ""} disabled className="h-12 rounded-xl bg-muted/50 border-border/50 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{t("profile.email_note")}</p>
                          </div>

                          <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 font-semibold"><Phone className="h-4 w-4 text-primary" />{t("profile.phone")}</FormLabel>
                              <FormControl>
                                <CountryPhoneInput value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                            <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow" disabled={updateProfile.isPending || !form.formState.isDirty}>
                              {updateProfile.isPending ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />{t("profile.saving")}</> : <><Save className="h-5 w-5 mr-2" />{t("profile.save")}</>}
                            </Button>
                          </motion.div>

                          {user ? (
                            <Button type="button" variant="outline" className="w-full h-12 text-base font-semibold rounded-xl touch-manipulation active:scale-[0.98]" onClick={async () => { await signOut(); navigate("/"); }}>
                              {t("profile.sign_out")}
                            </Button>
                          ) : (
                            <div className="flex gap-3">
                              <Button type="button" variant="outline" className="flex-1 h-12 text-base font-semibold rounded-xl" onClick={() => navigate("/login")}>{t("profile.log_in")}</Button>
                              <Button type="button" variant="hero" className="flex-1 h-12 text-base font-semibold rounded-xl" onClick={() => navigate("/signup")}>{t("profile.sign_up")}</Button>
                            </div>
                          )}
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </motion.div>
              </ParallaxSection>

              {/* ── Quick Access Links (staggered 3D) ── */}
              <ParallaxSection index={3}>
                <h3 className="font-display font-bold text-base mb-3">{t("profile.quick_access")}</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {quickLinks.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, y: 20, rotateX: 10 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ perspective: "600px" }}
                    >
                      <Link to={link.href}>
                        <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all cursor-pointer group overflow-hidden">
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/15 transition-all shrink-0">
                              <link.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[13px] truncate">{link.label}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{link.description}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </ParallaxSection>

              {/* ── ZIVO+ Membership ── */}
              {!isPlus && (
                <ParallaxSection index={4}>
                  <Link to="/zivo-plus">
                    <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                      <Card className="relative border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-400/5 to-orange-400/5" />
                        <CardContent className="p-4 relative">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                <Crown className="w-5 h-5 text-primary-foreground" />
                              </motion.div>
                              <div>
                                <p className="font-semibold text-sm">{t("profile.upgrade_plus")}</p>
                                <p className="text-xs text-muted-foreground">{t("profile.upgrade_desc")}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </ParallaxSection>
              )}

              {/* ── Merchant Dashboard ── */}
              {merchantData?.isMerchant && (
                <ParallaxSection index={5}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => import("@/lib/openExternalUrl").then(({ openExternalUrl }) => openExternalUrl(MERCHANT_APP_URL))}
                    className="block w-full text-left"
                  >
                    <Card className="relative border-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group">
                      <CardContent className="p-4 relative">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                              <Store className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{t("profile.merchant_dashboard")}</p>
                              <p className="text-xs text-muted-foreground">{t("profile.merchant_desc")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-orange-500/15 text-orange-500 border-orange-500/20 font-semibold text-xs">{t("profile.partner")}</Badge>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.button>
                </ParallaxSection>
              )}

              {/* ── Account Status ── */}
              <ParallaxSection index={6}>
                <Card className="relative border-0 bg-card/80 backdrop-blur-sm shadow-xl overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5" />
                  <CardContent className="p-4 relative">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{t("profile.account_status")}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {t("profile.member_since")} {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "recently"}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-semibold text-xs">{t("profile.active")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </ParallaxSection>

              {/* ── Partner Attribution ── */}
              {affiliateAttribution.hasAffiliateAttribution && (
                <ParallaxSection index={7}>
                  <Card className="relative border-0 bg-card/80 backdrop-blur-sm shadow-xl overflow-hidden">
                    <CardContent className="p-4 relative">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-violet-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{t("profile.referred_by")}</p>
                          <p className="text-xs text-muted-foreground">{t("profile.joined_through")} {affiliateAttribution.partnerName}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ParallaxSection>
              )}

              {/* ── Delete Account ── */}
              <ParallaxSection index={8}>
                <div className="pt-2 pb-4">
                  <Button variant="ghost" className="w-full text-destructive/60 hover:text-destructive hover:bg-destructive/5 text-xs font-medium rounded-xl" onClick={() => navigate("/profile/delete-account")}>
                    {t("profile.delete_account")}
                  </Button>
                </div>
              </ParallaxSection>
            </div>
          )}
        </div>
      </div>

      <ZivoMobileNav />
    </div>
  );
};

export default Profile;
