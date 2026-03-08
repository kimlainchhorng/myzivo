/**
 * ZIVO Mobile Bottom Navigation — Premium 2026
 * Clean, modern 5-tab nav with ZIVO brand styling
 */
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, Briefcase, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { useHaptics } from "@/hooks/useHaptics";

interface NavTab {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
  badge?: number;
}

const ZivoMobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeAlertsCount } = usePriceAlerts();
  const { impact } = useHaptics();

  const tabs: NavTab[] = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "search", label: "Search", icon: Search, path: "/flights" },
    { id: "trips", label: "Trips", icon: Briefcase, path: "/my-trips" },
    { id: "alerts", label: "Alerts", icon: Bell, path: "/notifications", badge: activeAlertsCount },
    { id: "account", label: "Account", icon: User, path: "/profile" },
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
      {/* Clean background */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl border-t border-border/20" />

      <div className="relative flex items-stretch justify-around h-[68px] max-w-lg mx-auto px-2">
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
                "flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-200 touch-manipulation active:scale-90 relative min-w-[48px] min-h-[48px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div 
                className="relative flex items-center justify-center"
                whileTap={{ scale: 0.85 }}
              >
                {/* Active icon background pill */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute rounded-full bg-primary/12"
                      style={{ width: 48, height: 30, left: -14, top: -5 }}
                    />
                  )}
                </AnimatePresence>

                <tab.icon
                  className={cn(
                    "w-[22px] h-[22px] relative z-10 transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  fill={isActive && tab.id === "home" ? "currentColor" : "none"}
                />
                
                {/* Badge */}
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm z-20"
                  >
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </motion.span>
                )}
              </motion.div>
              
              <span className={cn(
                "text-[10px] leading-none transition-all duration-200",
                isActive ? "font-bold text-primary" : "font-medium text-muted-foreground"
              )}>
                {tab.label}
              </span>
              
              {/* Active dot */}
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute bottom-1.5 w-[5px] h-[5px] bg-primary rounded-full"
                    layoutId="nav-dot"
                  />
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default ZivoMobileNav;
