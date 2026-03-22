/**
 * ZIVO Mobile Bottom Navigation — iOS 2026 Style
 * Large icons, clean labels, subtle active glow with photographic backgrounds
 */
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, Briefcase, Bell, User } from "lucide-react";
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
    { id: "search", labelKey: "nav.search", icon: Search, path: "/flights", bg: navSearchBg, cssVar: "var(--flights)" },
    { id: "trips", labelKey: "nav.trips", icon: Briefcase, path: "/my-trips", bg: navTripsBg, cssVar: "var(--hotels)" },
    { id: "alerts", labelKey: "nav.alerts", icon: Bell, path: "/notifications", badge: activeAlertsCount, bg: navAlertsBg, cssVar: "var(--cars)" },
    { id: "account", labelKey: "nav.account", icon: User, path: "/profile", bg: navAccountBg, cssVar: "var(--primary)" },
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/" || path === "") return "home";
    if (path.startsWith("/search") || 
        path.startsWith("/flights") || 
        path.startsWith("/hotels") || 
        path.startsWith("/rent-car") ||
        path.startsWith("/car-rental")) return "search";
    if (path.startsWith("/trips") || path.startsWith("/my-trips") || path.startsWith("/my-orders")) return "trips";
    if (path.startsWith("/alerts") || path.startsWith("/price-alerts") || path.startsWith("/notifications")) return "alerts";
    if (path.startsWith("/account") || path.startsWith("/profile")) return "account";
    return "home";
  };

  const activeTab = getActiveTab();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* iOS-style frosted glass background */}
      <div className="absolute inset-0 bg-card/90 backdrop-blur-2xl border-t border-border/30" />

      <div className="relative flex items-stretch justify-around h-[76px] max-w-lg mx-auto">
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
                "flex flex-col items-center justify-center flex-1 gap-1.5 transition-colors duration-200 touch-manipulation active:scale-90 relative min-w-[48px] min-h-[48px]",
                isActive ? "text-primary-foreground" : "text-muted-foreground"
              )}
              aria-label={t(tab.labelKey)}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative flex items-center justify-center">
                {/* Photo background orb behind active icon */}
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute w-12 h-12 rounded-full overflow-hidden"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  >
                    <img
                      src={tab.bg}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ opacity: 0.7 }}
                    />
                    <span
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(circle, hsl(${tab.cssVar} / 0.5) 0%, hsl(${tab.cssVar} / 0.35) 60%, hsl(${tab.cssVar} / 0.2) 100%)`,
                        boxShadow: `0 0 20px 4px hsl(${tab.cssVar} / 0.2)`,
                      }}
                    />
                  </motion.div>
                )}
                <tab.icon
                  className={cn(
                    "relative z-10 transition-all duration-200",
                    isActive
                      ? "w-[28px] h-[28px] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                      : "w-7 h-7 text-muted-foreground"
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
                "text-[11px] leading-none transition-all duration-200",
                isActive
                  ? "font-semibold"
                  : "font-medium text-muted-foreground"
              )}
              style={isActive ? { color: `hsl(${tab.cssVar})`, textShadow: `0 0 8px hsl(${tab.cssVar} / 0.3)` } : undefined}
              >
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
