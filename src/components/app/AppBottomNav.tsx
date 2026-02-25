/**
 * App Bottom Navigation
 * Mobile-first tab bar: Home | Travel | Rides | Eats | More
 */
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Plane, Car, UtensilsCrossed, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavTab {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
  color?: string;
}

const tabs: NavTab[] = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "travel", label: "Travel", icon: Plane, path: "/travel", color: "text-flights" },
  { id: "rides", label: "Rides", icon: Car, path: "/rides", color: "text-rides" },
  { id: "eats", label: "Eats", icon: UtensilsCrossed, path: "/eats", color: "text-eats" },
  { id: "more", label: "More", icon: Menu, path: "/more" },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-xl border-t border-border/50 safe-area-bottom md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const activeColor = isActive && tab.color ? tab.color : isActive ? "text-primary" : "text-muted-foreground";
          
          return (
             <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 transition-all touch-manipulation active:scale-90 min-w-[48px] min-h-[48px]",
                activeColor
              )}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={cn(
                "w-10 h-7 rounded-full flex items-center justify-center transition-all",
                isActive && "bg-primary/15"
              )}>
                <tab.icon className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all",
                isActive && "font-bold"
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
