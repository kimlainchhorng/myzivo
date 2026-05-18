/**
 * ZIVO Mobile Bottom Navigation — glass-blur capsule.
 * Backdrop-blurred translucent background with a sliding pill behind the
 * active tab (motion layoutId), tactile active-press scale, subtle ring
 * elevation. Matches the reels-rail / reel-tabs design language.
 */
import { forwardRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, MessageCircle, User, Film, Newspaper, Plus } from "lucide-react";
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
import { SOCIAL_ROUTE_PATHS } from "@/lib/socialRoutes";

interface NavTab {
  id: string;
  labelKey: string;
  icon: typeof Home;
  path: string;
  badge?: number;
  /** Lucide icons that render well with `fill="currentColor"` when active. */
  fillable?: boolean;
  isCreate?: boolean;
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
    { id: "feed", labelKey: "nav.feed", icon: Newspaper, path: SOCIAL_ROUTE_PATHS.feed },
    { id: "reels", labelKey: "nav.reel", icon: Film, path: SOCIAL_ROUTE_PATHS.reels },
    { id: "create", labelKey: "nav.create", icon: Plus, path: gated(`${SOCIAL_ROUTE_PATHS.feed}?compose=post`), isCreate: true },
    { id: "chat", labelKey: "nav.chat", icon: MessageCircle, path: gated(SOCIAL_ROUTE_PATHS.chat), badge: chatUnread, fillable: true },
    { id: "account", labelKey: "nav.account", icon: User, path: gated(SOCIAL_ROUTE_PATHS.profile), badge: notificationUnread },
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/" || path === "") return "home";
    if (path.startsWith(SOCIAL_ROUTE_PATHS.reels)) return "reels";
    if (path.startsWith(SOCIAL_ROUTE_PATHS.feed)) return "feed";
    if (path.startsWith(SOCIAL_ROUTE_PATHS.chat)) return "chat";
    if (
      path.startsWith("/account") ||
      path.startsWith(SOCIAL_ROUTE_PATHS.profile) ||
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
      className="fixed inset-x-0 bottom-0 z-[1401] lg:hidden pb-safe bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-[0_-10px_28px_-16px_rgba(0,0,0,0.22)]"
    >
      <div className="relative flex items-stretch justify-around h-[62px] max-w-xl mx-auto px-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const label = t(tab.labelKey);

          return (
            <button type="button"
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
                if (tab.id === "create") {
                  impact("medium");
                  navigate(tab.path);
                  return;
                }
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
                "flex flex-col items-center justify-center flex-1 gap-0.5 transition-all duration-200 touch-manipulation relative min-w-[44px] min-h-[50px] active:scale-[0.92]",
                tab.isCreate
                  ? "text-primary-foreground"
                  : isActive
                  ? "text-foreground"
                  : "text-foreground/48 hover:text-foreground/75"
              )}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative flex items-center justify-center">
                {isActive && !tab.isCreate && (
                  <motion.span
                    layoutId="zivo-bottom-nav-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    aria-hidden
                    className="absolute -inset-x-3 -inset-y-1 rounded-full bg-foreground/[0.07] ring-1 ring-foreground/10"
                  />
                )}
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
                  <span
                    className={cn(
                      "relative z-10 flex items-center justify-center transition-all",
                      tab.isCreate
                        ? "h-10 w-10 rounded-full bg-foreground text-background shadow-[0_10px_24px_-12px_rgba(0,0,0,0.55)] ring-1 ring-foreground/10"
                        : "h-7 w-7"
                    )}
                  >
                    <tab.icon
                      className={cn("relative z-10", tab.isCreate ? "h-5 w-5" : "h-[23px] w-[23px]")}
                      strokeWidth={tab.isCreate ? 2.6 : isActive ? 2.35 : 1.7}
                      fill={isActive && tab.fillable ? "currentColor" : "none"}
                    />
                  </span>
                )}
                {typeof tab.badge === "number" && tab.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center z-20 ring-2 ring-background"
                  >
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </motion.span>
                )}
              </div>
              {!tab.isCreate && (
                <span className={cn(
                  "relative z-10 max-w-[48px] truncate text-[10px] font-semibold leading-none",
                  isActive ? "text-foreground" : "text-foreground/55"
                )}>
                  {label}
                </span>
              )}
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
