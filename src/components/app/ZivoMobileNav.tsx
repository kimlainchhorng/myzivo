/**
 * ZIVO Mobile Bottom Navigation — iOS 2026 Style
 * Large icons, clean labels, subtle active glow with photographic backgrounds
 */
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Rss, MapPin, MessageCircle, User, Film, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { useHaptics } from "@/hooks/useHaptics";
import { useI18n } from "@/hooks/useI18n";
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

const ZivoMobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeAlertsCount } = usePriceAlerts();
  const { impact } = useHaptics();
  const { t } = useI18n();

  const tabs: NavTab[] = [
    { id: "home", labelKey: "nav.home", icon: Home, path: "/", bg: navHomeBg, cssVar: "var(--primary)" },
    { id: "feed", labelKey: "nav.feed", icon: Newspaper, path: "/feed", bg: navSearchBg, cssVar: "var(--flights)" },
    { id: "reel", labelKey: "nav.reel", icon: Film, path: "/reels", bg: navSearchBg, cssVar: "var(--flights)" },
    { id: "map", labelKey: "nav.map", icon: MapPin, path: "/store-map", bg: navTripsBg, cssVar: "var(--hotels)" },
    { id: "chat", labelKey: "nav.chat", icon: MessageCircle, path: "/chat", bg: navAlertsBg, cssVar: "var(--cars)" },
    { id: "account", labelKey: "nav.account", icon: User, path: "/profile", bg: navAccountBg, cssVar: "var(--primary)" },
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/" || path === "") return "home";
    if (path.startsWith("/feed")) return "feed";
    if (path.startsWith("/reels")) return "reel";
    if (path.startsWith("/store-map") || path.startsWith("/map")) return "map";
    if (path.startsWith("/chat")) return "chat";
    if (path.startsWith("/account") || path.startsWith("/profile") || path.startsWith("/more")) return "account";
    return "home";
  };

  const activeTab = getActiveTab();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* iOS-style frosted glass background */}
      <div className="absolute inset-0 bg-card/90 backdrop-blur-2xl border-t border-border/30" />

      <div className="relative flex items-stretch justify-around h-[56px] max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (activeTab !== tab.id) {
                  impact('light');
                  navigate(tab.path);
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors duration-200 touch-manipulation active:scale-90 relative min-w-[44px] min-h-[44px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={t(tab.labelKey)}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative flex items-center justify-center">
                <tab.icon
                  className={cn(
                    "relative z-10 transition-all duration-200 w-[22px] h-[22px]",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  strokeWidth={isActive ? 2.2 : 1.4}
                  fill={isActive && tab.id === "home" ? "currentColor" : "none"}
                />
                
                {/* Badge */}
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm z-20"
                  >
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </motion.span>
                )}
              </div>
              
              <span className={cn(
                "text-[10px] leading-none transition-all duration-200",
                isActive
                  ? "font-semibold text-primary"
                  : "font-medium text-muted-foreground"
              )}>
                {t(tab.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default ZivoMobileNav;
