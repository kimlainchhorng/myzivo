import { useState, useRef, useCallback, useEffect, Fragment } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";

import SEOHead from "@/components/SEOHead";
import {
  User, ArrowLeft, Loader2, Sparkles, Camera, ImagePlus, Check, X, MoveVertical,
  Shield, Star, ChevronRight, UserPlus, BadgeCheck,
  Wallet, Store, ExternalLink, Users, Globe, ChevronDown, Crown, MapPin, ShoppingBag,
  Settings, Handshake, Car, Wrench, UtensilsCrossed, Building2, Truck, Phone, AlertCircle, Bell, MoreHorizontal,
  Pencil, RotateCcw,
} from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";
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
import NavBar from "@/components/home/NavBar";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { openExternalUrl } from "@/lib/openExternalUrl";
import { assessLinkSync } from "@/hooks/useLinkRisk";
import ExternalLinkWarning from "@/components/security/ExternalLinkWarning";
import { stripTrackingParams } from "@/lib/linkSafetyExtras";
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

import VerifiedBadge from "@/components/VerifiedBadge";
import { formatCount } from "@/lib/social/formatCount";

const BlueVerifiedBadge = ({ className = "h-5 w-5" }: { className?: string }) => (
  <VerifiedBadge className={className} />
);

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
  
  const { user, isAdmin } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: merchantData } = useMerchantRole();
  const { unreadCount: notifUnreadCount, notifications } = useNotifications(20);
  const { data: latestVerificationRequest } = useQuery({
    queryKey: ["verification-request", user?.id, "latest"],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await (supabase as any)
        .from("verification_requests")
        .select("id, status, rejection_reason, created_at, reviewed_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; status: string | null; rejection_reason: string | null; created_at: string; reviewed_at?: string | null } | null;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!user?.id) return;

    const refreshBlueVerified = () => {
      queryClient.invalidateQueries({ queryKey: ["verification-request", user.id, "latest"] });
      queryClient.invalidateQueries({ queryKey: ["verification-request", user.id] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", user.id] });
    };

    const channel = supabase
      .channel(`blue-verified-status-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "verification_requests", filter: `user_id=eq.${user.id}` }, refreshBlueVerified)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` }, refreshBlueVerified)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `id=eq.${user.id}` }, refreshBlueVerified)
      .subscribe();

    // Fallback: re-check when tab regains focus or network reconnects
    window.addEventListener("focus", refreshBlueVerified);
    window.addEventListener("online", refreshBlueVerified);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", refreshBlueVerified);
      window.removeEventListener("online", refreshBlueVerified);
    };
  }, [queryClient, user?.id]);
  
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
  const { impact, selectionChanged } = useHaptics();
  const [showNotifPanel, setShowNotifPanel] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return sessionStorage.getItem("zivo:profile:notif-panel") === "1"; } catch { return false; }
  });
  useEffect(() => {
    try { sessionStorage.setItem("zivo:profile:notif-panel", showNotifPanel ? "1" : "0"); } catch {}
  }, [showNotifPanel]);
  useEffect(() => {
    const restore = () => {
      try {
        const v = sessionStorage.getItem("zivo:profile:notif-panel") === "1";
        setShowNotifPanel(v);
      } catch {}
    };
    window.addEventListener("orientationchange", restore);
    document.addEventListener("visibilitychange", restore);
    return () => {
      window.removeEventListener("orientationchange", restore);
      document.removeEventListener("visibilitychange", restore);
    };
  }, []);
  const handleBack = useCallback(() => { impact("light"); navigate(-1); }, [impact, navigate]);
  const handleToggleNotif = useCallback(() => { selectionChanged(); setShowNotifPanel(p => !p); }, [selectionChanged]);
  const handleResetCover = useCallback(() => { impact("light"); setCoverPosition(50); }, [impact]);
  
  const [showLangPicker, setShowLangPicker] = useState(false);
  const profileCardRef = useRef<HTMLDivElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Cover photo state
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverRepositioning, setCoverRepositioning] = useState(false);
  const [coverPosition, setCoverPosition] = useState<number>(profile?.cover_position ?? 50);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bioDraft, setBioDraft] = useState("");
  const [bioEditing, setBioEditing] = useState(false);
  const [safeLinkPrompt, setSafeLinkPrompt] = useState<string | null>(null);
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

  useEffect(() => {
    setBioDraft(profile?.bio ?? "");
  }, [profile?.bio]);

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

  // Scroll to top on mount/navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const { scrollYProgress, scrollY } = useScroll();
  const bgParallax = useTransform(scrollYProgress, [0, 1], [0, -80]);
  // Mobile sticky compact header (Facebook-style)
  const stickyOpacity = useTransform(scrollY, [96, 156], [0, 1]);
  const stickyTranslate = useTransform(scrollY, [96, 156], [-18, 0]);
  // Mobile cover parallax + rubber-band
  const coverY = useTransform(scrollY, [0, 240], [0, -60]);
  const coverScale = useTransform(scrollY, [-100, 0], [1.15, 1]);
  const [isStickyHeaderVisible, setIsStickyHeaderVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsStickyHeaderVisible((prev) => (prev ? latest > 84 : latest > 118));
  });

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

      {/* Desktop NavBar */}
      <div className="hidden lg:block">
        <NavBar />
      </div>

      {/* ── Background: clean Facebook-style on mobile, parallax on desktop ── */}
      <motion.div style={{ y: bgParallax }} className="pointer-events-none fixed inset-0 z-0 hidden lg:block">
        {/* Base gradient (desktop only) */}
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

      {/* ── Mobile sticky compact header (Facebook-style) ──
          Portaled to <body> so the position:fixed element escapes the
          PullToRefresh transformed ancestor (which would otherwise re-anchor
          fixed positioning and hide the header). */}
      {typeof document !== "undefined" && createPortal(
        <motion.header
          role="banner"
          aria-label="Profile quick navigation"
          data-testid="profile-sticky-header"
          style={{
            opacity: stickyOpacity,
            y: stickyTranslate,
            paddingTop: "var(--zivo-safe-top-sticky)",
            height: "calc(var(--zivo-safe-top-sticky) + 3rem)",
            pointerEvents: isStickyHeaderVisible ? "auto" : "none",
          }}
          className={cn(
            "lg:hidden fixed top-0 inset-x-0 z-40 px-3 flex items-center gap-3 bg-background/85 backdrop-blur-xl border-b border-border/40 transition-shadow duration-200",
            isStickyHeaderVisible ? "shadow-sm shadow-background/20" : "shadow-none"
          )}
        >
          <motion.button
            onClick={handleBack}
            aria-label="Go back"
            whileTap={{ scale: 0.86 }}
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="h-9 w-9 -ml-1 flex items-center justify-center rounded-full hover:bg-muted/60 active:bg-muted/70 transition focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </motion.button>
          <span aria-hidden="true">
            <Avatar className="h-8 w-8 ring-1 ring-border/60">
              <AvatarImage src={profile?.avatar_url || undefined} alt="" />
              <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
            </Avatar>
          </span>
          <div className="flex items-center gap-1 min-w-0 flex-1" aria-live="polite">
            <span className="font-semibold text-sm text-foreground truncate">
              {profile?.full_name || "Profile"}
            </span>
            {profile?.is_verified && <VerifiedBadge size={14} />}
          </div>
          <motion.button
            onClick={handleToggleNotif}
            aria-label={showNotifPanel ? "Close notifications" : "Open notifications"}
            aria-pressed={showNotifPanel}
            aria-expanded={showNotifPanel}
            aria-controls="profile-notif-panel"
            whileTap={{ scale: 0.86 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className={cn(
              "relative h-9 w-9 flex items-center justify-center rounded-full transition focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              showNotifPanel ? "bg-primary text-primary-foreground" : "hover:bg-muted/60 text-foreground"
            )}
          >
            <Bell className="h-5 w-5" />
            {totalNotifCount > 0 && !showNotifPanel && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground shadow-sm">
                {totalNotifCount > 99 ? "99+" : totalNotifCount}
              </span>
            )}
          </motion.button>
          <motion.button
            onClick={() => navigate("/more")}
            aria-label="More account options"
            whileTap={{ scale: 0.86 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="h-9 w-9 -mr-1 flex items-center justify-center rounded-full hover:bg-muted/60 text-foreground transition focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <MoreHorizontal className="h-5 w-5" />
          </motion.button>
        </motion.header>,
        document.body
      )}


      {/* ── Scrollable content ── */}
      <div className="relative z-10 min-h-screen pb-24 scroll-smooth bg-background" style={{ scrollbarWidth: 'none' }}>
        {/* Mobile: edge-to-edge full-screen (Facebook-style). Desktop: centered card. */}
        <div className="px-0 lg:px-4 pt-0 lg:pt-20 max-w-none lg:max-w-3xl mx-auto">

          {profileLoading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="h-8 w-8 text-primary" />
              </motion.div>
            </div>
          ) : (
            <div className="space-y-2.5 pt-0 lg:pt-1">
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
                  {/* Mobile: edge-to-edge plain surface (Facebook). Desktop: glass card. */}
                  <div className="relative bg-card lg:rounded-3xl lg:overflow-hidden lg:shadow-2xl lg:shadow-primary/[0.08]">
                    <div className="hidden lg:block absolute inset-0 bg-card/70 backdrop-blur-2xl rounded-3xl" />
                    <div className="hidden lg:block absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02] rounded-3xl" />
                    <div className="hidden lg:block pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]" />
                    <div className="relative z-10">
                    {/* Cover Photo — full-bleed on mobile, taller like Facebook.
                        On mobile, the cover extends behind the iOS/Android status bar.
                        We add safe-area top padding + a subtle status-bar scrim so
                        the system clock/battery stay legible over any cover image. */}
                    <div
                      className="relative h-48 sm:h-56 md:h-60 lg:h-52 w-full overflow-hidden select-none"

                      onMouseDown={coverRepositioning ? (e) => { e.preventDefault(); handleCoverDragStart(e.clientY); } : undefined}
                      onMouseMove={coverRepositioning ? (e) => handleCoverDragMove(e.clientY) : undefined}
                      onMouseUp={coverRepositioning ? handleCoverDragEnd : undefined}
                      onMouseLeave={coverRepositioning ? handleCoverDragEnd : undefined}
                      onTouchStart={coverRepositioning ? (e) => handleCoverDragStart(e.touches[0].clientY) : undefined}
                      onTouchMove={coverRepositioning ? (e) => handleCoverDragMove(e.touches[0].clientY) : undefined}
                      onTouchEnd={coverRepositioning ? handleCoverDragEnd : undefined}
                      onDoubleClick={coverRepositioning ? () => { impact("medium"); setCoverPosition(50); } : undefined}
                      style={{
                        cursor: coverRepositioning ? "ns-resize" : "default",
                        paddingTop: "var(--zivo-safe-top, 0px)",
                      }}
                    >
                      {/* Status-bar legibility scrim (mobile only) */}
                      <div
                        aria-hidden="true"
                        className="lg:hidden pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/45 via-black/15 to-transparent"
                        style={{ height: "calc(var(--zivo-safe-top, 0px) + 16px)" }}
                      />
                      <motion.div
                        className="absolute inset-0 lg:!translate-y-0 lg:!scale-100"
                        style={coverRepositioning ? undefined : { y: coverY, scale: coverScale }}
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
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/15 to-accent/20">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary)/0.25),transparent_70%)]" />
                          <div className="absolute bottom-3 right-4 text-primary/20 text-[11px] font-medium flex items-center gap-1">
                            <ImagePlus className="w-3.5 h-3.5" /> Add cover photo
                          </div>
                        </div>
                      )}
                      {/* Gradient overlay (subtle on mobile so cover stays vivid like Facebook) */}
                      <div className="absolute inset-0 bg-gradient-to-t from-card/40 via-transparent to-transparent lg:from-card/90 lg:via-card/20" />
                      </motion.div>

                      {/* Cover action buttons — kept minimal: reposition + change.
                          Notifications and "more" live in the sticky header / bottom nav. */}
                      {user && !coverRepositioning && (
                        <div
                          className="absolute right-2 z-20 flex gap-1.5"
                          style={{ top: "calc(var(--zivo-safe-top, 0px) + 0.5rem)" }}
                        >
                          {profile?.cover_url && (
                            <motion.button
                              whileTap={{ scale: 0.88 }}
                              onClick={() => { setCoverPosition(profile?.cover_position ?? 50); setCoverRepositioning(true); }}
                              aria-label="Reposition cover photo"
                              className="h-9 w-9 flex items-center justify-center rounded-full bg-background/65 backdrop-blur-md text-foreground/85 hover:bg-background/90 shadow-md border border-border/25 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none"
                            >
                              <MoveVertical className="h-3.5 w-3.5" />
                            </motion.button>
                          )}
                          <motion.button
                            whileTap={{ scale: 0.88 }}
                            onClick={() => coverInputRef.current?.click()}
                            disabled={coverUploading}
                            aria-label="Change cover photo"
                            className="h-9 w-9 flex items-center justify-center rounded-full bg-background/65 backdrop-blur-md text-foreground/85 hover:bg-background/90 shadow-md border border-border/25 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none"
                          >
                            {coverUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
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
                            <button onClick={saveCoverPosition} aria-label="Save cover position" className="p-1.5 rounded-full bg-primary text-primary-foreground transition active:scale-90 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none">
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={handleResetCover} aria-label="Reset cover position to center" className="p-1.5 rounded-full bg-muted/70 text-foreground hover:bg-muted transition active:scale-90 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none">
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => { setCoverPosition(profile?.cover_position ?? 50); setCoverRepositioning(false); }} aria-label="Cancel cover repositioning" className="p-1.5 rounded-full bg-muted text-muted-foreground transition active:scale-90 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverUpload} className="hidden" />
                    </div>

                    {/* Avatar overlapping cover */}
                    <div className="relative z-10 -mt-11 px-6">
                      <div className="flex justify-start">
                        <motion.div
                          className="relative group/avatar"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="absolute -inset-2 bg-gradient-to-r from-primary via-primary/50 to-primary rounded-full blur-xl opacity-20 group-hover/avatar:opacity-40 transition-opacity" />
                          <Avatar className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 ring-4 ring-card shadow-2xl shadow-primary/20">
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
                            aria-label="Change profile photo"
                            className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/40 ring-2 ring-card disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none"
                          >
                            {uploadAvatar.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                          </motion.button>
                          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} className="hidden" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Name & status */}
                    <div className="px-6 pb-1.5 pt-2 text-left">
                      <CardTitle className="flex items-center justify-start gap-2 text-2xl font-bold tracking-tight">
                        <span>{profile?.full_name || t("profile.set_name")}</span>
                        {profile?.is_verified && <VerifiedBadge size={28} />}
                      </CardTitle>
                      {/* Email hidden — only visible to account owner in settings */}
                      <div className="flex flex-wrap items-center justify-start gap-2 mt-3">
                        {isPlus && (
                          <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30 font-semibold rounded-full px-3 py-1 shadow-sm">
                            <Crown className="w-3 h-3 mr-1" /> ZIVO+ {plan === "annual" ? "Annual" : "Monthly"}
                          </Badge>
                        )}
                      </div>

                      {!profile?.is_verified && (
                        <button
                          type="button"
                          onClick={() => navigate("/account/verification")}
                          className={cn(
                            "group mt-3 inline-flex min-h-[36px] items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold shadow-sm transition-all duration-200 active:scale-95 hover:shadow-md hover:-translate-y-0.5",
                            latestVerificationRequest?.status === "pending"
                              ? "border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-amber-500/5 text-amber-600"
                              : latestVerificationRequest?.status === "rejected"
                                ? "border-destructive/25 bg-destructive/5 text-destructive"
                                : "border-[hsl(var(--flights)/0.35)] bg-gradient-to-r from-[hsl(var(--flights)/0.14)] via-[hsl(var(--flights)/0.06)] to-[hsl(var(--flights)/0.14)] text-[hsl(var(--flights))] shadow-[0_4px_14px_-6px_hsl(var(--flights)/0.5)]"
                          )}
                        >
                          {latestVerificationRequest?.status === "pending" ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verification pending
                            </>
                          ) : latestVerificationRequest?.status === "rejected" ? (
                            <>
                              <AlertCircle className="h-3.5 w-3.5" /> Reapply for blue verified
                            </>
                          ) : (
                            <>
                              <BlueVerifiedBadge className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" /> Get blue verified
                            </>
                          )}
                        </button>
                      )}

                      {/* Bio */}
                      <div className="mt-2 max-w-sm">
                        {profile?.bio && !bioEditing ? (
                          <div className="flex items-start gap-2">
                            <p className="flex-1 text-xs text-foreground/85 whitespace-pre-wrap break-words">{profile.bio}</p>
                            <button
                              type="button"
                              onClick={() => { setBioDraft(profile.bio ?? ""); setBioEditing(true); }}
                              aria-label="Edit bio"
                              className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : !profile?.bio && !bioEditing ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => { setBioDraft(""); setBioEditing(true); }}
                              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none transition-colors"
                            >
                              <Pencil className="h-3 w-3" />
                              Add bio
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate("/account/profile-edit")}
                              className="lg:hidden inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none transition-colors"
                            >
                              <Pencil className="h-3 w-3" />
                              Edit profile
                            </button>
                          </div>
                        ) : (
                          <>
                            <textarea
                              value={bioDraft}
                              onChange={(e) => setBioDraft(e.target.value)}
                              placeholder="Add a short bio so people know who you are."
                              maxLength={160}
                              rows={2}
                              autoFocus
                              aria-label="Bio"
                              className="w-full resize-none rounded-2xl border border-border/50 bg-background/80 px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                            />
                            <div className="mt-2 flex items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  updateProfile.mutate(
                                    { bio: bioDraft.trim() || null },
                                    { onSuccess: () => setBioEditing(false) }
                                  );
                                }}
                                disabled={updateProfile.isPending}
                                className="rounded-full px-4"
                              >
                                {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save bio"}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => { setBioDraft(profile?.bio ?? ""); setBioEditing(false); }}
                                className="rounded-full px-3 text-muted-foreground"
                              >
                                Cancel
                              </Button>
                            </div>
                          </>
                        )}

                      </div>

                      {/* Facebook-style inline stats row */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
                        <button
                          type="button"
                          aria-label={`View ${followerCount} followers`}
                          onClick={() => setSocialModal({ open: true, tab: "followers" })}
                          className="inline-flex items-baseline gap-1 rounded-md px-1 -mx-1 py-0.5 hover:underline focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none"
                        >
                          <span className="font-bold text-foreground">{formatCount(followerCount) ?? "0"}</span>
                          <span className="font-medium text-muted-foreground">followers</span>
                        </button>
                        <span aria-hidden="true" className="text-muted-foreground/70">·</span>
                        <button
                          type="button"
                          aria-label={`View ${followingCount} following`}
                          onClick={() => setSocialModal({ open: true, tab: "following" })}
                          className="inline-flex items-baseline gap-1 rounded-md px-1 -mx-1 py-0.5 hover:underline focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none"
                        >
                          <span className="font-bold text-foreground">{formatCount(followingCount) ?? "0"}</span>
                          <span className="font-medium text-muted-foreground">following</span>
                        </button>
                        <span aria-hidden="true" className="text-muted-foreground/70">·</span>
                        <button
                          type="button"
                          aria-label={`View ${friendCount} friends`}
                          onClick={() => setSocialModal({ open: true, tab: "friends" })}
                          className="inline-flex items-baseline gap-1 rounded-md px-1 -mx-1 py-0.5 hover:underline focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none"
                        >
                          <span className="font-bold text-foreground">{formatCount(friendCount) ?? "0"}</span>
                          <span className="font-medium text-muted-foreground">friends</span>
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
                                onClick={() => {
                                  const raw = (profile as any)[social.key];
                                  if (!raw) return;
                                  const cleaned = stripTrackingParams(raw);
                                  const r = assessLinkSync(cleaned);
                                  if (r.level === "blocked") {
                                    toast.error("This link looks unsafe and was blocked.");
                                    return;
                                  }
                                  if (r.level === "trusted") { void openExternalUrl(cleaned); return; }
                                  setSafeLinkPrompt(cleaned);
                                }}
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

                    <CardContent className="px-6 pb-4 pt-2">
                    </CardContent>
                    </div>
                  </div>

                </motion.div>
              </ParallaxSection>

              {/* ZIVO+ upgrade moved to /more page */}

              {/* ── Phone Required Card ── */}
              {!profile?.phone?.trim() && (
                <ParallaxSection index={1.5}>
                  <div
                    className="mx-3 lg:mx-0 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => navigate("/account/profile-edit?focus=phone")}
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

          {/* Translate moved to /more page */}
          <ParallaxSection index={2.1}>
            <div className="relative mb-2">

              <AnimatePresence>
                {showNotifPanel && (
                  <motion.div
                    id="profile-notif-panel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 rounded-2xl border border-border/40 bg-card/90 p-2.5 shadow-xl shadow-primary/[0.04] backdrop-blur-xl">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-bold">Notifications</span>
                          {totalNotifCount > 0 && <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{totalNotifCount} new</Badge>}
                        </div>
                        <button onClick={() => setShowNotifPanel(false)} className="rounded-xl p-1.5 transition-colors hover:bg-muted/50" aria-label="Close notifications">
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>

                      <div className="mb-2 max-h-[220px] space-y-1.5 overflow-y-auto pr-1">
                        {totalNotifCount === 0 ? (
                          <div className="py-3 text-center">
                            <Bell className="mx-auto mb-1.5 h-6 w-6 text-muted-foreground/30" />
                            <p className="text-xs text-muted-foreground">No new notifications</p>
                          </div>
                        ) : (
                          <>
                            {socialCount > 0 && (
                              <button onClick={() => { setShowNotifPanel(false); navigate('/notifications'); }} className="flex w-full items-center gap-2.5 rounded-xl border border-primary/15 bg-primary/5 p-2 text-left transition-colors hover:bg-primary/10">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15"><UserPlus className="h-3.5 w-3.5 text-primary" /></div>
                                <div className="min-w-0 flex-1"><p className="text-xs font-semibold">Friend Requests</p><p className="text-[10px] text-muted-foreground">{socialCount} pending</p></div>
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              </button>
                            )}
                            {notifications.filter(n => !n.is_read).slice(0, 4).map((n) => (
                              <button key={n.id} onClick={() => { setShowNotifPanel(false); navigate('/notifications'); }} className="flex w-full items-center gap-2.5 rounded-xl bg-muted/35 p-2 text-left transition-colors hover:bg-muted/55">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10"><Bell className="h-3.5 w-3.5 text-primary" /></div>
                                <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{n.title || 'Notification'}</p><p className="truncate text-[10px] text-muted-foreground">{n.body || n.template || 'New update'}</p></div>
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              </button>
                            ))}
                          </>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => { setShowNotifPanel(false); navigate('/notifications'); }} className="flex-1 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground transition-transform active:scale-95">View All</button>
                        <button onClick={() => setShowNotifPanel(false)} className="rounded-xl bg-muted/50 px-4 py-2 text-xs font-bold text-muted-foreground transition-transform active:scale-95 hover:bg-muted/70">Close</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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

      <ExternalLinkWarning
        url={safeLinkPrompt}
        open={!!safeLinkPrompt}
        onOpenChange={(o) => { if (!o) setSafeLinkPrompt(null); }}
        onConfirm={(u) => { void openExternalUrl(u); setSafeLinkPrompt(null); }}
      />

      {/* Language picker moved to /more page (TranslateButton component) */}



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
