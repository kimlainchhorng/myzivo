import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, Briefcase, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface NavTab {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
  badge?: number;
}

const RideBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: NavTab[] = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "search", label: "Search", icon: Search, path: "/search" },
    { id: "trips", label: "Trips", icon: Briefcase, path: "/trips" },
    { id: "alerts", label: "Alerts", icon: Bell, path: "/alerts", badge: 3 },
    { id: "account", label: "Account", icon: User, path: "/account" },
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/" || path === "") return "home";
    if (path.startsWith("/search") || path.startsWith("/ride")) return "search";
    if (path.startsWith("/trips")) return "trips";
    if (path.startsWith("/alerts")) return "alerts";
    if (path.startsWith("/account")) return "account";
    return "home";
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/98 backdrop-blur-xl border-t border-white/10 safe-area-bottom md:hidden">
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-0.5 transition-all touch-manipulation active:scale-95 relative",
                isActive ? "text-primary" : "text-white/50"
              )}
              aria-label={tab.label}
            >
              <motion.div
                className={cn(
                  "w-12 h-8 rounded-full flex items-center justify-center transition-all relative",
                  isActive && "bg-primary/10"
                )}
                whileTap={{ scale: 0.9 }}
              >
                <tab.icon
                  className={cn(
                    "w-5 h-5 transition-transform",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </motion.div>

              <span
                className={cn(
                  "text-[10px] transition-all",
                  isActive ? "font-bold" : "font-medium"
                )}
              >
                {tab.label}
              </span>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"
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

export default RideBottomNav;
