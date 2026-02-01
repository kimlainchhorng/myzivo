/**
 * App Bottom Navigation
 * Mobile-first tab bar: Home | Travel | Rides | Eats | More
 */
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Plane, Car, UtensilsCrossed, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "travel", label: "Travel", icon: Plane, path: "/travel" },
  { id: "rides", label: "Rides", icon: Car, path: "/rides" },
  { id: "eats", label: "Eats", icon: UtensilsCrossed, path: "/eats" },
  { id: "more", label: "More", icon: MoreHorizontal, path: "/more" },
];

const AppBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path.startsWith("/travel") || path.startsWith("/flights") || path.startsWith("/hotels") || path.startsWith("/book-flight") || path.startsWith("/book-hotel") || path.startsWith("/rent-car") || path.startsWith("/car-rental")) return "travel";
    if (path.startsWith("/ride") || path === "/rides") return "rides";
    if (path.startsWith("/eats") || path.startsWith("/food")) return "eats";
    if (path.startsWith("/more") || path.startsWith("/extras") || path.startsWith("/profile") || path.startsWith("/help") || path.startsWith("/contact")) return "more";
    return "home";
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom md:hidden">
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors touch-manipulation active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-10 h-7 rounded-full flex items-center justify-center transition-all",
                isActive && "bg-primary/15"
              )}>
                <tab.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "text-primary font-semibold"
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

export default AppBottomNav;
