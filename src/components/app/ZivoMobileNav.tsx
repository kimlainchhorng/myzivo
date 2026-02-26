/**
 * ZIVO Mobile Bottom Navigation — Premium 2026
 * Travel-focused 5-tab nav: Home | Search | Trips | Alerts | Account
 * Frosted glass, refined active states, haptic feedback
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
      <div className="absolute inset-0 bg-card/85 backdrop-blur-2xl border-t border-border/30" />
      {/* Top highlight line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

      <div className="relative flex items-stretch justify-around h-[62px] max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => { impact('light'); navigate(tab.path); }}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 transition-all touch-manipulation active:scale-90 relative min-w-[48px] min-h-[48px]",
                isActive ? "text-primary" : "text-muted-foreground/70"
              )}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div 
                className={cn(
                  "w-11 h-7 rounded-full flex items-center justify-center transition-all relative",
                  isActive && "bg-primary/12"
                )}
                whileTap={{ scale: 0.85 }}
                layout
              >
                <tab.icon className={cn(
                  "w-[20px] h-[20px] transition-all",
                  isActive && "scale-105"
                )} strokeWidth={isActive ? 2.5 : 1.8} />
                
                {/* Badge for alerts */}
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm"
                  >
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </motion.span>
                )}
              </motion.div>
              
              <span className={cn(
                "text-[10px] leading-none transition-all",
                isActive ? "font-bold text-primary" : "font-medium"
              )}>
                {tab.label}
              </span>
              
              {/* Active indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    className="absolute -bottom-0.5 w-5 h-[2px] bg-primary rounded-full"
                    layoutId="nav-indicator"
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