/**
 * ZIVO Mobile Bottom Navigation — Instagram style
 * Icon-only, outline-by-default / solid-on-active.
 * Solid background, hairline top border, no glow.
 */
import { forwardRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, MessageCircle, User, Film, Newspaper } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useHaptics } from "@/hooks/useHaptics";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useLiveActivityCount } from "@/hooks/useLiveActivityCount";
import { useChatPrefs } from "@/hooks/useChatPrefs";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRoutePrefetch } from "@/components/shared/RoutePrefetcher";

interface NavTab {
  id: string;
  labelKey: string;
  icon: typeof Home;
  path: string;
  badge?: number;
  /** Lucide icons that render well with `fill="currentColor"` when active. */
  fillable?: boolean;
}

const ZivoMobileNav = forwardRef<HTMLElement, Record<string, never>>((_props, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { impact } = useHaptics();
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const { unreadCount: notificationUnread } = useNotifications(20);
  const liveActivity = useLiveActivityCount();

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

  // Prefetch tab chunks on touch-down so navigation feels instant (chunk
  // arrives in memory while the finger is still on the screen).
  const { prefetch } = useRoutePrefetch();

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
    { id: "home", labelKey: "nav.home", icon: Home, path: "/", badge: liveActivity.total, fillable: true },
    { id: "feed", labelKey: "nav.feed", icon: Newspaper, path: gated("/feed") },
    { id: "reels", labelKey: "nav.reel", icon: Film, path: gated("/reels"), fillable: true },
    { id: "chat", labelKey: "nav.chat", icon: MessageCircle, path: gated("/chat"), badge: chatUnread, fillable: true },
    { id: "account", labelKey: "nav.account", icon: User, path: gated("/profile"), badge: notificationUnread },
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/" || path === "") return "home";
    if (path.startsWith("/reels")) return "reels";
    if (path.startsWith("/feed")) return "feed";
    if (path.startsWith("/chat")) return "chat";
    if (
      path.startsWith("/account") ||
      path.startsWith("/profile") ||
      path.startsWith("/user/") ||
      path.startsWith("/more") ||
      path.startsWith("/personal-dashboard") ||
      path.startsWith("/personal/") ||
      path.startsWith("/shop-dashboard")
    )
      return "account";
    return "home";
  };

  const activeTab = getActiveTab();

  const nav = (
    <nav
      ref={ref}
      data-zivo-mobile-nav
      className="fixed inset-x-0 bottom-0 z-[1401] lg:hidden pb-safe bg-background border-t border-border"
    >
      <div className="relative flex items-stretch justify-around h-[48px] max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onPointerDown={() => {
                // Strip `/login?redirect=...` wrapper so prefetch hits the
                // actual destination chunk, not the login chunk.
                const target = tab.path.startsWith("/login")
                  ? decodeURIComponent(tab.path.split("redirect=")[1] || "")
                  : tab.path;
                if (target && activeTab !== tab.id) prefetch(target);
              }}
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
                "flex items-center justify-center flex-1 transition-opacity duration-150 touch-manipulation active:opacity-60 relative min-w-[44px] min-h-[44px]",
                isActive ? "text-foreground" : "text-foreground/70"
              )}
              aria-label={tab.id === "live" ? "Live" : t(tab.labelKey)}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative flex items-center justify-center">
                {tab.id === "account" && user ? (
                  <Avatar
                    className={cn(
                      "h-[26px] w-[26px] transition-all duration-150",
                      isActive ? "ring-[1.5px] ring-foreground ring-offset-2 ring-offset-background" : ""
                    )}
                  >
                    <AvatarImage
                      src={profile?.avatar_url || user.user_metadata?.avatar_url || undefined}
                      alt="Account"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-muted text-foreground text-[11px] font-semibold">
                      {(profile?.full_name?.[0] || user.email?.[0] || "Z").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <tab.icon
                    className="relative z-10 w-[24px] h-[24px]"
                    strokeWidth={isActive ? 2.4 : 1.6}
                    fill={isActive && tab.fillable ? "currentColor" : "none"}
                  />
                )}
                {typeof tab.badge === "number" && tab.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center z-20"
                  >
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </motion.span>
                )}
              </div>
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
