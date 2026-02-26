/**
 * ZIVO Mobile Bottom Navigation — Premium 2026
 * Travel-focused 5-tab nav with refined micro-interactions
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
      {/* Frosted glass background */}
      <div className="absolute inset-0 bg-card/92 backdrop-blur-2xl border-t border-border/30 shadow-[0_-4px_20px_-4px_hsl(var(--foreground)/0.05)]" />
      {/* Top highlight line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      <div className="relative flex items-stretch justify-around h-[64px] max-w-lg mx-auto">
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
                "flex flex-col items-center justify-center flex-1 gap-[3px] transition-colors duration-200 touch-manipulation active:scale-90 relative min-w-[48px] min-h-[48px]",
                isActive ? "text-primary" : "text-muted-foreground/60"
              )}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active pill background */}
              <motion.div 
                className="relative flex items-center justify-center"
                whileTap={{ scale: 0.8 }}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="absolute inset-0 -mx-2 -my-0.5 rounded-full bg-primary/12"
                      style={{ width: 44, height: 28, left: -12, top: -4 }}
                    />
                  )}
                </AnimatePresence>

                <tab.icon
                  className={cn(
                    "w-[20px] h-[20px] relative z-10 transition-transform duration-200",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.4 : 1.7}
                />
                
                {/* Badge */}
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm z-20"
                  >
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </motion.span>
                )}
              </motion.div>
              
              <span className={cn(
                "text-[10px] leading-none transition-all duration-200",
                isActive ? "font-bold text-primary" : "font-medium"
              )}>
                {tab.label}
              </span>
              
              {/* Active dot indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"
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
