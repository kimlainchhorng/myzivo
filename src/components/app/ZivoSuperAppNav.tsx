/**
 * ZIVO Super App Bottom Navigation
 * Unified 5-tab nav: Home | Travel | Rides | Eats | Move
 * Role-aware with dynamic icons based on user context
 */
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Plane, Car, UtensilsCrossed, Package, Menu, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAccess } from "@/hooks/useUserAccess";
import { motion, AnimatePresence } from "framer-motion";

interface NavTab {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
  color?: string;
  activeColor?: string;
}

// Customer tabs (default view)
const customerTabs: NavTab[] = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "travel", label: "Travel", icon: Plane, path: "/travel", color: "text-flights", activeColor: "bg-flights/15" },
  { id: "rides", label: "Rides", icon: Car, path: "/rides", color: "text-rides", activeColor: "bg-rides/15" },
  { id: "eats", label: "Eats", icon: UtensilsCrossed, path: "/eats", color: "text-eats", activeColor: "bg-eats/15" },
  { id: "more", label: "More", icon: Menu, path: "/more" },
];

// Driver tabs (when driver mode is active)
const driverTabs: NavTab[] = [
  { id: "home", label: "Jobs", icon: Home, path: "/driver" },
  { id: "earnings", label: "Earnings", icon: Package, path: "/driver/earnings", color: "text-green-500" },
  { id: "deliveries", label: "Deliveries", icon: Package, path: "/driver/deliveries", color: "text-amber-500" },
  { id: "profile", label: "Profile", icon: User, path: "/driver/profile" },
  { id: "settings", label: "Settings", icon: Settings, path: "/driver/settings" },
];

// Owner tabs (car rental owners)
const ownerTabs: NavTab[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/owner/dashboard" },
  { id: "vehicles", label: "Vehicles", icon: Car, path: "/owner/vehicles", color: "text-cars" },
  { id: "bookings", label: "Bookings", icon: Package, path: "/owner/bookings", color: "text-primary" },
  { id: "earnings", label: "Earnings", icon: Package, path: "/owner/earnings", color: "text-green-500" },
  { id: "profile", label: "Profile", icon: User, path: "/owner/profile" },
];

interface ZivoSuperAppNavProps {
  mode?: "customer" | "driver" | "owner" | "auto";
}

const ZivoSuperAppNav = ({ mode = "auto" }: ZivoSuperAppNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: access } = useUserAccess(user?.id);

  // Determine which tabs to show based on mode and URL
  const getTabs = (): NavTab[] => {
    if (mode !== "auto") {
      if (mode === "driver") return driverTabs;
      if (mode === "owner") return ownerTabs;
      return customerTabs;
    }

    // Auto-detect based on current path
    const path = location.pathname;
    if (path.startsWith("/driver")) return driverTabs;
    if (path.startsWith("/owner")) return ownerTabs;
    
    return customerTabs;
  };

  const tabs = getTabs();

  const getActiveTab = () => {
    const path = location.pathname;
    
    // Customer paths
    if (path === "/" || path === "") return "home";
    if (path.startsWith("/travel") || path.startsWith("/flights") || path.startsWith("/hotels") || 
        path.startsWith("/book-flight") || path.startsWith("/book-hotel") || 
        path.startsWith("/rent-car") || path.startsWith("/car-rental") || path.startsWith("/p2p")) return "travel";
    if (path.startsWith("/ride") || path === "/rides") return "rides";
    if (path.startsWith("/eats") || path.startsWith("/food")) return "eats";
    if (path.startsWith("/move") || path.startsWith("/package")) return "move";
    if (path.startsWith("/more") || path.startsWith("/extras") || path.startsWith("/profile") || 
        path.startsWith("/help") || path.startsWith("/contact") || path.startsWith("/wallet")) return "more";
    
    // Driver paths
    if (path === "/driver" || path === "/driver/") return "home";
    if (path.startsWith("/driver/earnings")) return "earnings";
    if (path.startsWith("/driver/deliveries")) return "deliveries";
    if (path.startsWith("/driver/profile")) return "profile";
    if (path.startsWith("/driver/settings")) return "settings";
    
    // Owner paths
    if (path === "/owner/dashboard") return "dashboard";
    if (path.startsWith("/owner/vehicles")) return "vehicles";
    if (path.startsWith("/owner/bookings")) return "bookings";
    if (path.startsWith("/owner/earnings")) return "earnings";
    if (path.startsWith("/owner/profile")) return "profile";
    
    return "home";
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom md:hidden">
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const activeColor = isActive && tab.color ? tab.color : isActive ? "text-primary" : "text-muted-foreground";
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors touch-manipulation active:scale-95",
                activeColor
              )}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div 
                className={cn(
                  "w-11 h-7 rounded-full flex items-center justify-center transition-all",
                  isActive && (tab.activeColor || "bg-primary/10")
                )}
                whileTap={{ scale: 0.9 }}
              >
                <tab.icon className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )} />
              </motion.div>
              <span className={cn(
                "text-[10px] font-medium transition-all",
                isActive && "font-bold"
              )}>
                {tab.label}
              </span>
              
              {/* Active indicator dot */}
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className={cn(
                      "absolute bottom-1 w-1 h-1 rounded-full",
                      tab.color ? tab.color.replace("text-", "bg-") : "bg-primary"
                    )} 
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

export default ZivoSuperAppNav;
