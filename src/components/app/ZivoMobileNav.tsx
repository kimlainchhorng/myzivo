/**
 * ZIVO Mobile Bottom Navigation — 3D Premium Style
 * Custom 3D rendered icons, clean labels, subtle active glow
 */
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { useHaptics } from "@/hooks/useHaptics";

import navHome from "@/assets/nav-home.png";
import navSearch from "@/assets/nav-search.png";
import navTrips from "@/assets/nav-trips.png";
import navAlerts from "@/assets/nav-alerts.png";
import navAccount from "@/assets/nav-account.png";

interface NavTab {
  id: string;
  label: string;
  image: string;
  path: string;
  badge?: number;
}

const ZivoMobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeAlertsCount } = usePriceAlerts();
  const { impact } = useHaptics();

  const tabs: NavTab[] = [
    { id: "home", label: "Home", image: navHome, path: "/" },
    { id: "search", label: "Search", image: navSearch, path: "/flights" },
    { id: "trips", label: "Trips", image: navTrips, path: "/my-trips" },
    { id: "alerts", label: "Alerts", image: navAlerts, path: "/notifications", badge: activeAlertsCount },
    { id: "account", label: "Account", image: navAccount, path: "/profile" },
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
      <div className="absolute inset-0 bg-card/90 backdrop-blur-2xl border-t border-border/30" />
      
      {/* Subtle gradient glow behind active tab */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute bottom-0 h-full w-1/5 bg-gradient-to-t from-primary/8 to-transparent"
          animate={{
            left: `${tabs.findIndex(t => t.id === activeTab) * 20}%`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

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
                "flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-200 touch-manipulation active:scale-90 relative min-w-[48px] min-h-[48px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative flex items-center justify-center">
                <motion.img
                  src={tab.image}
                  alt={tab.label}
                  className={cn(
                    "w-8 h-8 object-contain transition-all duration-200",
                    isActive ? "scale-110 drop-shadow-lg" : "opacity-60 grayscale-[30%]"
                  )}
                  animate={isActive ? { y: -2 } : { y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
                isActive ? "font-semibold text-primary" : "font-medium text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default ZivoMobileNav;
