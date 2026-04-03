import { useState, useRef, useCallback, useEffect, Fragment } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useCountry } from "@/hooks/useCountry";
import SEOHead from "@/components/SEOHead";
import {
  User, ArrowLeft, Loader2, Sparkles, Camera, ImagePlus, Check, X, MoveVertical,
  Shield, Star, ChevronRight, UserPlus, UserCheck,
  Wallet, Store, ExternalLink, Users, Globe, ChevronDown, Crown, MapPin, ShoppingBag,
  Settings, Handshake, Car, Wrench, UtensilsCrossed, Building2, Truck, Phone, AlertCircle, Bell, MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useUpdateUserProfile, useUploadAvatar } from "@/hooks/useUserProfile";
import { useMerchantRole } from "@/hooks/useMerchantRole";
import { useAffiliateAttribution } from "@/hooks/useAffiliateAttribution";
import { useZivoPlus } from "@/contexts/ZivoPlusContext";
import { MERCHANT_APP_URL } from "@/lib/eatsTables";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { openExternalUrl } from "@/lib/openExternalUrl";
import ProfileContentTabs from "@/components/profile/ProfileContentTabs";
import ProfileStories from "@/components/profile/ProfileStories";
import SocialListModal from "@/components/profile/SocialListModal";
import PullToRefresh from "@/components/shared/PullToRefresh";
import { useNotifications } from "@/hooks/useNotifications";

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
  const queryClient = useQueryClient();
  const location = useLocation();
  const { t, currentLanguage, changeLanguage } = useI18n();
  const { country, setCountry, countries } = useCountry();
  const { user, signOut, isAdmin } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: merchantData } = useMerchantRole();
  const { unreadCount: notifUnreadCount } = useNotifications(20);
  
  // Count pending friend requests + new followers
  const [socialCount, setSocialCount] = useState(0);
  useEffect(() => {
    if (!user) return;
    const fetchSocialCount = async () => {
      const { count: friendReqCount } = await (supabase as any)
        .from('friendships')
        .select('id', { count: 'exact', head: true })
        .eq('friend_id', user.id)
        .eq('status', 'pending');
      setSocialCount(friendReqCount || 0);
    };
    fetchSocialCount();
    
    // Listen for realtime changes
    const channel = supabase
      .channel('profile-social-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships', filter: `friend_id=eq.${user.id}` }, () => {
        fetchSocialCount();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);
  
  const totalNotifCount = notifUnreadCount + socialCount;
  const affiliateAttribution = useAffiliateAttribution();
  const { isPlus, plan } = useZivoPlus();
  const updateProfile = useUpdateUserProfile();
  const uploadAvatar = useUploadAvatar();
  const langTriggerRef = useRef<HTMLButtonElement>(null);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const profileCardRef = useRef<HTMLDivElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Cover photo state
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverRepositioning, setCoverRepositioning] = useState(false);
  const [coverPosition, setCoverPosition] = useState<number>(profile?.cover_position ?? 50);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const coverDragRef = useRef<{ startY: number; startPos: number } | null>(null);

  const profileTilt = use3DTilt(profileCardRef);

  // Friend & Follow state
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "accepted">("none");
  const [friendLoading, setFriendLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [friendCount, setFriendCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [socialModal, setSocialModal] = useState<{ open: boolean; tab: "friends" | "followers" | "following" }>({ open: false, tab: "friends" });

  // Load real friendship status, friend count & follower count
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      // Friend count (accepted friendships)
      const { count: fc } = await supabase
        .from("friendships" as any)
        .select("*", { count: "exact", head: true })
        .eq("status", "accepted")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
      setFriendCount(fc || 0);

      // Follower count (people following this user)
      const { count: flc } = await supabase
        .from("followers" as any)
        .select("*", { count: "exact", head: true })
        .eq("following_id", user.id);
      setFollowerCount(flc || 0);

      // Following count (people this user follows)
      const { count: fgc } = await supabase
        .from("followers" as any)
        .select("*", { count: "exact", head: true })
        .eq("follower_id", user.id);
      setFollowingCount(fgc || 0);

      // Check own friendship status (for own profile it stays "none" — used when viewing others)
      // Check if currently following self (shouldn't happen but keeps state correct)
    };
    load();
  }, [user?.id]);

  const handleAddFriend = async () => {
    if (!user?.id) return;
    setFriendLoading(true);
    try {
      if (friendStatus === "none") {
        // Send friend request (on own profile this is a demo — real usage is on other users' profiles)
        const { error } = await supabase
          .from("friendships" as any)
          .insert({ user_id: user.id, friend_id: user.id } as any);
        if (error && !error.message?.includes("no_self_friend")) {
          throw error;
        }
        // For demo on own profile, just show pending
        setFriendStatus("pending");
        toast.info("Friend request sent!");
      } else if (friendStatus === "pending") {
        // Cancel pending request
        await supabase
          .from("friendships" as any)
          .delete()
          .eq("user_id", user.id);
        setFriendStatus("none");
        toast.info("Friend request cancelled");
      } else if (friendStatus === "accepted") {
        // Unfriend
        await supabase
          .from("friendships" as any)
          .delete()
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
        setFriendStatus("none");
        setFriendCount((c) => Math.max(0, c - 1));
        toast.info("Unfriended");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update friendship");
    } finally {
      setFriendLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user?.id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from("followers" as any)
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", user.id);
        setIsFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
        toast.success("Unfollowed");
      } else {
        // Follow
        const { error } = await supabase
          .from("followers" as any)
          .insert({ follower_id: user.id, following_id: user.id } as any);
        if (error && !error.message?.includes("no_self_follow")) throw error;
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
        toast.success("Following!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update follow");
    } finally {
      setFollowLoading(false);
    }
  };

  const { scrollYProgress } = useScroll({ container: scrollRef });
  const headerY = useTransform(scrollYProgress, [0, 0.3], [0, -30]);
  const headerScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const bgParallax = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  // Cover photo upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Cover image must be under 10MB"); return; }
    setCoverUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/cover_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      await updateProfile.mutateAsync({ cover_url: publicUrl, cover_position: 50 });
      setCoverPosition(50);
      toast.success("Cover photo updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload cover");
    } finally {
      setCoverUploading(false);
    }
  };

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      await uploadAvatar.mutateAsync(file);
      setAvatarPreview(null);
    } catch { setAvatarPreview(null); }
  };

  // Cover repositioning handlers
  const handleCoverDragStart = (clientY: number) => {
    coverDragRef.current = { startY: clientY, startPos: coverPosition };
  };
  const handleCoverDragMove = (clientY: number) => {
    if (!coverDragRef.current) return;
    const delta = clientY - coverDragRef.current.startY;
    const newPos = Math.max(0, Math.min(100, coverDragRef.current.startPos + delta * 0.3));
    setCoverPosition(newPos);
  };
  const handleCoverDragEnd = () => { coverDragRef.current = null; };
  const saveCoverPosition = async () => {
    await updateProfile.mutateAsync({ cover_position: Math.round(coverPosition) });
    setCoverRepositioning(false);
    toast.success("Cover position saved!");
  };




  const currentLang = LANGS.find(l => l.code === currentLanguage) || LANGS[0];

  const handlePullRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
  }, [queryClient]);

  return (
    <PullToRefresh onRefresh={handlePullRefresh} className="min-h-screen bg-background relative overflow-hidden safe-area-top safe-area-bottom">
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

          {/* ── Language Selector & Notifications (compact pills) ── */}
          <ParallaxSection index={0}>
            <div className="relative mb-3 flex items-center gap-2">
              <motion.button
                ref={langTriggerRef}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLangPicker(prev => !prev)}
                className="relative z-20 flex min-h-[36px] items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold shadow-lg shadow-primary/25 touch-manipulation transition-all"
                style={{ perspective: "800px", transformStyle: "preserve-3d", transform: "translateZ(24px)" }}
              >
                <Globe className="w-3.5 h-3.5" />
                <img src={getFlagUrl(currentLang.cc)} alt="" className="w-4 h-3 rounded-[2px] object-cover shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <span>{currentLang.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showLangPicker ? "rotate-180" : ""}`} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifPanel(prev => !prev)}
                className={cn(
                  "relative z-20 flex min-h-[36px] items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold shadow-lg touch-manipulation transition-all",
                  showNotifPanel
                    ? "bg-primary text-primary-foreground shadow-primary/25"
                    : "bg-card/70 backdrop-blur-xl border border-border/30 shadow-primary/[0.05] hover:bg-card/90"
                )}
                style={{ perspective: "800px", transformStyle: "preserve-3d", transform: "translateZ(24px)" }}
              >
                <span className="relative">
                  <Bell className={cn("w-3.5 h-3.5", showNotifPanel ? "text-primary-foreground" : "text-destructive")} />
                  {totalNotifCount > 0 && !showNotifPanel && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground px-1 shadow-md shadow-destructive/30">
                      {totalNotifCount > 99 ? '99+' : totalNotifCount}
                    </span>
                  )}
                </span>
                <span className="ml-1">Notifications</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", showNotifPanel ? "rotate-180 text-primary-foreground/70" : "text-muted-foreground")} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/more")}
                className={cn(
                  "relative z-20 flex min-h-[36px] items-center gap-1.5 px-3 py-2 rounded-xl backdrop-blur-xl border text-[11px] font-bold shadow-lg touch-manipulation transition-all",
                  "bg-card/70 border-border/30 shadow-primary/[0.05] hover:bg-card/90"
                )}
                style={{ perspective: "800px", transformStyle: "preserve-3d", transform: "translateZ(24px)" }}
              >
                <MoreHorizontal className={cn("w-3.5 h-3.5", "text-muted-foreground")} />
                <span>More</span>
                <ChevronRight className={cn("w-3 h-3 text-muted-foreground")} />
              </motion.button>
            </div>

            {/* Inline Notifications Panel */}
            <AnimatePresence>
              {showNotifPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/40 shadow-xl shadow-primary/[0.04] p-3">
                    {/* Panel Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold">Notifications</span>
                        {totalNotifCount > 0 && (
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{totalNotifCount} new</Badge>
                        )}
                      </div>
                      <button
                        onClick={() => setShowNotifPanel(false)}
                        className="p-1.5 rounded-xl hover:bg-muted/50 transition-colors touch-manipulation active:scale-90"
                        aria-label="Close notifications"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Quick Notification Items */}
                    <div className="space-y-1.5 mb-3">
                      {totalNotifCount === 0 ? (
                        <div className="text-center py-4">
                          <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">No new notifications</p>
                        </div>
                      ) : (
                        <>
                          {socialCount > 0 && (
                            <button
                              onClick={() => { setShowNotifPanel(false); navigate('/notifications'); }}
                              className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-primary/5 border border-primary/15 hover:bg-primary/10 transition-colors text-left touch-manipulation"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                                <UserPlus className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold">Friend Requests</p>
                                <p className="text-[10px] text-muted-foreground">{socialCount} pending</p>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            </button>
                          )}
                          {notifUnreadCount > 0 && (
                            <button
                              onClick={() => { setShowNotifPanel(false); navigate('/notifications'); }}
                              className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left touch-manipulation"
                            >
                              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                                <Bell className="w-4 h-4 text-destructive" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold">Unread Alerts</p>
                                <p className="text-[10px] text-muted-foreground">{notifUnreadCount} notifications</p>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* View All + Close Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowNotifPanel(false); navigate('/notifications'); }}
                        className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold touch-manipulation active:scale-95 transition-transform"
                      >
                        View All
                      </button>
                      <button
                        onClick={() => setShowNotifPanel(false)}
                        className="px-4 py-2 rounded-xl bg-muted/50 text-muted-foreground text-xs font-bold touch-manipulation active:scale-95 transition-transform hover:bg-muted/70"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ParallaxSection>

          {/* ── Country Selector (compact cards) ── */}
          <ParallaxSection index={1}>
            <div className="flex items-center justify-center gap-2 mb-4">
              {countries.map((c) => (
                <motion.button
                  key={c.code}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setCountry(c.code)}
                  className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[12px] font-bold transition-all touch-manipulation overflow-hidden min-w-[120px] justify-center ${
                    country === c.code
                      ? "ring-2 ring-primary shadow-xl shadow-primary/20"
                      : "ring-1 ring-border/30 opacity-65 hover:opacity-100"
                  }`}
                >
                  <img src={CITY_BG[c.code]} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  <div className={`absolute inset-0 transition-colors duration-500 ${country === c.code ? "bg-primary/55" : "bg-foreground/40"}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />
                  <img src={getFlagUrl(c.code.toLowerCase())} alt={c.name} className="w-5 h-3.5 rounded-[2px] object-cover shadow-md border border-white/40 shrink-0 relative z-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
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
            <div className="space-y-4">
              {/* ── ZIVO+ Upgrade (compact) ── */}
              {!isPlus && (
                <ParallaxSection index={1.9}>
                  <Link to="/zivo-plus">
                    <motion.div whileTap={{ scale: 0.97 }}>
                      <div className="relative rounded-2xl overflow-hidden shadow-lg shadow-amber-500/10 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-400/15 backdrop-blur-2xl" />
                        <div className="absolute inset-0 bg-card/50" />
                        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-500/15" />
                        <div className="relative z-10 px-3.5 py-2.5">
                          <div className="flex items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                                <Crown className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-bold text-[12px]">{t("profile.upgrade_plus")}</p>
                                <p className="text-[10px] text-muted-foreground">{t("profile.upgrade_desc")}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-amber-500/50 shrink-0" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </ParallaxSection>
              )}

              {/* ── Phone Required Card ── */}
              {!profile?.phone?.trim() && (
                <ParallaxSection index={1.5}>
                  <div
                    className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => navigate("/setup")}
                  >
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">Phone number required</p>
                      <p className="text-xs text-muted-foreground">Add your phone number to access rides, flights & more</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-destructive/50 shrink-0" />
                  </div>
                </ParallaxSection>
              )}

              {/* ── Stories Row ── */}
              <ParallaxSection index={2}>
                <ProfileStories />
              </ParallaxSection>

              {/* ── Profile Card with Cover Photo ── */}
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
                  <GlassCard3D glow className="shadow-2xl shadow-primary/[0.08] overflow-hidden">
                    {/* Cover Photo */}
                    <div
                      className="relative h-44 w-full overflow-hidden select-none"
                      onMouseDown={coverRepositioning ? (e) => { e.preventDefault(); handleCoverDragStart(e.clientY); } : undefined}
                      onMouseMove={coverRepositioning ? (e) => handleCoverDragMove(e.clientY) : undefined}
                      onMouseUp={coverRepositioning ? handleCoverDragEnd : undefined}
                      onMouseLeave={coverRepositioning ? handleCoverDragEnd : undefined}
                      onTouchStart={coverRepositioning ? (e) => handleCoverDragStart(e.touches[0].clientY) : undefined}
                      onTouchMove={coverRepositioning ? (e) => handleCoverDragMove(e.touches[0].clientY) : undefined}
                      onTouchEnd={coverRepositioning ? handleCoverDragEnd : undefined}
                      style={{ cursor: coverRepositioning ? "ns-resize" : "default" }}
                    >
                      {profile?.cover_url ? (
                        <img
                          src={profile.cover_url}
                          alt="Cover"
                          className="absolute inset-0 w-full h-full object-cover transition-[object-position] duration-100"
                          style={{ objectPosition: `center ${coverPosition}%` }}
                          draggable={false}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5" />
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />

                      {/* Cover action buttons */}
                      {user && !coverRepositioning && (
                        <div className="absolute top-3 right-3 flex gap-2 z-20">
                          {profile?.cover_url && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => { setCoverPosition(profile?.cover_position ?? 50); setCoverRepositioning(true); }}
                              className="p-2 rounded-full bg-background/70 backdrop-blur-md text-foreground/80 hover:bg-background/90 shadow-lg border border-border/30"
                            >
                              <MoveVertical className="h-4 w-4" />
                            </motion.button>
                          )}
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => coverInputRef.current?.click()}
                            disabled={coverUploading}
                            className="p-2 rounded-full bg-background/70 backdrop-blur-md text-foreground/80 hover:bg-background/90 shadow-lg border border-border/30 disabled:opacity-50"
                          >
                            {coverUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                          </motion.button>
                        </div>
                      )}

                      {/* Repositioning controls */}
                      {coverRepositioning && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                          <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px]" />
                          <div className="relative flex items-center gap-3 bg-background/90 backdrop-blur-xl rounded-full px-4 py-2 shadow-xl border border-border/50">
                            <MoveVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground">Drag to reposition</span>
                            <button onClick={saveCoverPosition} className="p-1.5 rounded-full bg-primary text-primary-foreground">
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => { setCoverPosition(profile?.cover_position ?? 50); setCoverRepositioning(false); }} className="p-1.5 rounded-full bg-muted text-muted-foreground">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverUpload} className="hidden" />
                    </div>

                    {/* Avatar overlapping cover */}
                    <div className="relative px-6 -mt-14 z-10">
                      <div className="flex justify-center">
                        <motion.div
                          className="relative group/avatar"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="absolute -inset-2 bg-gradient-to-r from-primary via-primary/50 to-primary rounded-full blur-xl opacity-20 group-hover/avatar:opacity-40 transition-opacity" />
                          <Avatar className="relative h-24 w-24 ring-4 ring-card shadow-2xl shadow-primary/20">
                            <AvatarImage src={avatarPreview || profile?.avatar_url || undefined} alt="Profile" />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-2xl font-bold">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <motion.button
                            whileHover={{ scale: 1.15, rotate: 10 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={uploadAvatar.isPending}
                            className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/40 ring-2 ring-card disabled:opacity-50"
                          >
                            {uploadAvatar.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                          </motion.button>
                          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} className="hidden" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Name & status */}
                    <div className="text-center pt-3 pb-2 px-6">
                      <CardTitle className="flex items-center justify-center gap-2 text-xl font-bold">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {profile?.full_name || t("profile.set_name")}
                        {profile?.is_verified && (
                          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="hsl(var(--primary))" />
                            <path d="M8 12.5L10.5 15L16 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </CardTitle>
                      {/* Email hidden — only visible to account owner in settings */}
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

                      {/* Friend, Follower & Following stats — Facebook/TikTok style */}
                      <div className="flex items-center justify-center gap-0 mt-4 mb-1">
                        <button className="flex-1 text-center py-1 group" onClick={() => setSocialModal({ open: true, tab: "friends" })}>
                          <p className="text-lg font-black text-foreground group-hover:text-primary transition-colors">{friendCount}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">Friends</p>
                        </button>
                        <div className="w-px h-9 bg-border/40" />
                        <button className="flex-1 text-center py-1 group" onClick={() => setSocialModal({ open: true, tab: "followers" })}>
                          <p className="text-lg font-black text-foreground group-hover:text-primary transition-colors">{followerCount}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">Followers</p>
                        </button>
                        <div className="w-px h-9 bg-border/40" />
                        <button className="flex-1 text-center py-1 group" onClick={() => setSocialModal({ open: true, tab: "following" })}>
                          <p className="text-lg font-black text-foreground group-hover:text-primary transition-colors">{followingCount}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">Following</p>
                        </button>
                      </div>

                      {/* Social Links Row */}
                      {profile?.social_links_visible !== false && (() => {
                        const socials = [
                          { key: "social_facebook", name: "Facebook", color: "bg-[#1877F2]", icon: (
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          )},
                          { key: "social_instagram", name: "Instagram", color: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]", icon: (
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                          )},
                          { key: "social_tiktok", name: "TikTok", color: "bg-[#010101]", icon: (
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                          )},
                          { key: "social_snapchat", name: "Snapchat", color: "bg-[#FFFC00]", icon: (
                            <svg viewBox="0 0 512 512" className="w-5 h-5 fill-white" stroke="black" strokeWidth="18"><path d="M256 32c-60 0-104 26-131 76-18 34-14 88-11 128l1 12c-8-4-18-7-27-7-14 0-25 6-31 16-5 9-5 20-1 30 10 24 36 35 56 43l5 2c-4 14-10 27-20 40-20 26-46 45-72 55-10 4-16 13-15 23 1 9 7 16 12 20 17 11 37 17 55 21 5 1 10 3 13 5 5 4 7 11 11 18 3 7 8 15 16 22 9 8 22 12 37 12 10 0 20-2 30-4 18-5 34-9 56-9s38 4 56 9c10 3 20 4 30 4 15 0 28-4 37-12 8-7 13-15 16-22 4-7 6-14 11-18 3-2 8-4 13-5 18-4 38-10 55-21 5-4 11-11 12-20 1-10-5-19-15-23-26-10-52-29-72-55-10-13-16-26-20-40l5-2c20-8 46-19 56-43 4-10 4-21-1-30-6-10-17-16-31-16-9 0-19 3-27 7l1-12c3-40 7-94-11-128C360 58 316 32 256 32z"/></svg>
                          )},
                          { key: "social_x", name: "X", color: "bg-foreground", icon: (
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-background"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          )},
                          { key: "social_linkedin", name: "LinkedIn", color: "bg-[#0A66C2]", icon: (
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          )},
                          { key: "social_telegram", name: "Telegram", color: "bg-[#26A5E4]", icon: (
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                          )},
                        ].filter(s => (profile as any)?.[s.key]);

                        return socials.length > 0 ? (
                          <div className="flex items-center justify-center gap-3 mt-4">
                            {socials.map((social) => (
                              <motion.button
                                key={social.name}
                                whileTap={{ scale: 0.85 }}
                                whileHover={{ scale: 1.1, y: -2 }}
                                onClick={() => void openExternalUrl((profile as any)[social.key])}
                                title={social.name}
                                className={`w-10 h-10 rounded-full ${social.color} flex items-center justify-center shadow-md hover:shadow-lg transition-shadow`}
                              >
                                {social.icon}
                              </motion.button>
                            ))}
                          </div>
                        ) : null;
                      })()}

                      {/* Add Friend & Follow buttons — only shown when viewing other users' profiles */}
                    </div>

                    <CardContent className="pt-3 pb-6 px-6">
                    </CardContent>
                  </GlassCard3D>
                </motion.div>
              </ParallaxSection>

              {/* ── Social Content Tabs (Posts, Videos, Live, Status) ── */}
              <ParallaxSection index={2.5}>
                <ProfileContentTabs userId={user?.id} />
              </ParallaxSection>




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

      {/* ── Become Partner Bottom Sheet ── */}
      <AnimatePresence>
        {showPartnerSheet && createPortal(
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setShowPartnerSheet(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[61] bg-background rounded-t-3xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
              </div>
              <div className="px-5 pb-2">
                <h2 className="text-lg font-bold">Become a ZIVO Partner</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Choose how you'd like to partner with us</p>
              </div>
              <div className="px-4 pb-8 space-y-2">
                {partnerOptions.map((opt) => (
                  <motion.button
                    key={opt.label}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setShowPartnerSheet(false);
                      navigate(opt.href);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/40 hover:bg-accent/50 transition-colors text-left"
                  >
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${opt.color} flex items-center justify-center shrink-0 shadow-lg`}>
                      <opt.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[13px]">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>,
          document.body
        )}
      </AnimatePresence>
      <SocialListModal
        open={socialModal.open}
        onClose={() => setSocialModal({ ...socialModal, open: false })}
        initialTab={socialModal.tab}
        onCountsChange={(f, fl, fg) => {
          if (socialModal.tab === "friends") setFriendCount(f);
          if (socialModal.tab === "followers") setFollowerCount(fl);
          if (socialModal.tab === "following") setFollowingCount(fg);
        }}
      />
    </PullToRefresh>
  );
};

export default Profile;
