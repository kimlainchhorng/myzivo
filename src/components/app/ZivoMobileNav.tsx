/**
 * ZIVO Mobile Bottom Navigation — iOS 2026 Style
 * Large icons, clean labels, subtle active glow with photographic backgrounds
 */
import { forwardRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Rss, MapPin, MessageCircle, User, Film, Newspaper, Radio } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { useHaptics } from "@/hooks/useHaptics";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useLiveActivityCount } from "@/hooks/useLiveActivityCount";
import { useChatPrefs } from "@/hooks/useChatPrefs";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import navHomeBg from "@/assets/nav-home-bg.jpg";
import navSearchBg from "@/assets/nav-search-bg.jpg";
import navTripsBg from "@/assets/nav-trips-bg.jpg";
import navAlertsBg from "@/assets/nav-alerts-bg.jpg";
import navAccountBg from "@/assets/nav-account-bg.jpg";

interface NavTab {
  id: string;
  labelKey: string;
  icon: typeof Home;
  path: string;
  badge?: number;
  bg: string;
  cssVar: string;
}

const ZivoMobileNav = forwardRef<HTMLElement, Record<string, never>>((_props, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeAlertsCount } = usePriceAlerts();
  const { impact } = useHaptics();
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const { unreadCount: notificationUnread } = useNotifications(20);
  const liveActivity = useLiveActivityCount();

  // Count distinct chats with unread direct messages (Telegram-style — one badge unit per chat).
  // (Was previously hitting the unrelated `messages` table, which has different columns —
  // the badge silently always returned 0.)
  const { data: unreadChatIds } = useQuery({
    queryKey: ["nav-chat-unread", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("direct_messages")
        .select("sender_id")
        .eq("receiver_id", user!.id)
        .eq("is_read", false);
      return new Set((data ?? []).map((r: { sender_id: string }) => r.sender_id));
    },
    enabled: !!user,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Manually marked-unread chats (localStorage-backed). Don't double-count chats that
  // already have real unread messages.
  const { prefs: chatPrefs } = useChatPrefs(user?.id);
  const chatUnread = (() => {
    const real = unreadChatIds ?? new Set<string>();
    let manualOnly = 0;
    for (const id of Object.keys(chatPrefs.unread)) {
      if (!real.has(id)) manualOnly++;
    }
    return real.size + manualOnly;
  })();

  const gated = (path: string) =>
    user ? path : `/login?redirect=${encodeURIComponent(path)}`;

  const tabs: NavTab[] = [
    { id: "live", labelKey: "nav.live", icon: Radio, path: gated("/live"), bg: navAlertsBg, cssVar: "var(--cars)" },
    { id: "feed", labelKey: "nav.feed", icon: Newspaper, path: gated("/feed"), bg: navSearchBg, cssVar: "var(--flights)" },
    { id: "reels", labelKey: "nav.reel", icon: Film, path: gated("/reels"), bg: navSearchBg, cssVar: "var(--flights)" },
    { id: "home", labelKey: "nav.home", icon: Home, path: "/", bg: navHomeBg, cssVar: "var(--primary)", badge: liveActivity.total },
    { id: "map", labelKey: "nav.map", icon: MapPin, path: gated("/store-map"), bg: navTripsBg, cssVar: "var(--hotels)" },
    { id: "chat", labelKey: "nav.chat", icon: MessageCircle, path: gated("/chat"), bg: navAlertsBg, cssVar: "var(--cars)", badge: chatUnread },
    { id: "account", labelKey: "nav.account", icon: User, path: gated("/profile"), bg: navAccountBg, cssVar: "var(--primary)", badge: notificationUnread },
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/" || path === "") return "home";
    if (path.startsWith("/reels")) return "reels";
    if (path.startsWith("/feed")) return "feed";
    if (path.startsWith("/store-map") || path.startsWith("/map")) return "map";
    if (path.startsWith("/live") || path.startsWith("/go-live")) return "live";
    if (path.startsWith("/chat")) return "chat";
    if (path.startsWith("/account") || path.startsWith("/profile") || path.startsWith("/user/") || path.startsWith("/more") || path.startsWith("/personal-dashboard") || path.startsWith("/personal/") || path.startsWith("/shop-dashboard")) return "account";
    return "home";
  };

  const activeTab = getActiveTab();

  const nav = (
    <nav
      ref={ref}
      data-zivo-mobile-nav
      className="fixed inset-x-0 bottom-0 z-[1401] lg:hidden pb-safe"
    >
      <div className="absolute inset-0 bg-card/90 backdrop-blur-2xl border-t border-border/30 shadow-[0_-6px_24px_hsl(var(--foreground)/0.08)]" />

      <div className="relative flex items-stretch justify-around h-[56px] max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "account" && activeTab === "account") {
                  impact("light");
                  const onMore = location.pathname.startsWith("/more");
                  navigate(onMore ? gated("/profile") : "/more");
                  return;
                }
                if (activeTab !== tab.id) {
                  impact("light");
                  navigate(tab.path);
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors duration-200 touch-manipulation active:scale-90 relative min-w-[44px] min-h-[44px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={tab.id === "live" ? "Live" : t(tab.labelKey)}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative flex items-center justify-center">
                {tab.id === "account" && user ? (
                  <Avatar
                    className={cn(
                      "h-[26px] w-[26px] transition-all duration-200",
                      isActive ? "ring-2 ring-primary" : ""
                    )}
                  >
                    <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url || undefined} alt="Account" className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-[11px] font-bold">
                      {(profile?.full_name?.[0] || user.email?.[0] || "Z").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <tab.icon
                    className={cn(
                      "relative z-10 transition-all duration-200 w-[22px] h-[22px]",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                    strokeWidth={isActive ? 2.2 : 1.4}
                    fill={isActive && tab.id === "home" ? "currentColor" : "none"}
                  />
                )}
                {typeof tab.badge === "number" && tab.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm z-20"
                  >
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </motion.span>
                )}
              </div>

              <span
                className={cn(
                  "text-[10px] leading-none transition-all duration-200",
                  isActive ? "font-semibold text-primary" : "font-medium text-muted-foreground"
                )}
              >
                {tab.id === "live" ? "Live" : t(tab.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  return typeof document !== "undefined" ? createPortal(nav, document.body) : nav;
});

ZivoMobileNav.displayName = "ZivoMobileNav";

export default ZivoMobileNav;