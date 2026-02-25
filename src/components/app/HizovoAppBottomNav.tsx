/**
 * Hizovo Travel App Bottom Navigation
 * Travel-only tabs: Home | Flights | Hotels | Cars | Trips
 */
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Plane, Hotel, CarFront, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavTab {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
  color?: string;
}

const tabs: NavTab[] = [
  { id: "home", label: "Home", icon: Home, path: "/app" },
  { id: "flights", label: "Flights", icon: Plane, path: "/app/flights", color: "text-flights" },
  { id: "hotels", label: "Hotels", icon: Hotel, path: "/app/hotels", color: "text-hotels" },
  { id: "cars", label: "Cars", icon: CarFront, path: "/app/cars", color: "text-cars" },
  { id: "trips", label: "Trips", icon: Briefcase, path: "/app/trips" },
];

const HizovoAppBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/app" || path === "/app/") return "home";
    if (path.startsWith("/app/flights")) return "flights";
    if (path.startsWith("/app/hotels")) return "hotels";
    if (path.startsWith("/app/cars")) return "cars";
    if (path.startsWith("/app/trips")) return "trips";
    return "home";
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-xl border-t border-border/50 safe-area-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const activeColor = isActive && tab.color ? tab.color : isActive ? "text-primary" : "text-muted-foreground";
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 transition-colors touch-manipulation active:scale-95",
                activeColor
              )}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={cn(
                "w-10 h-7 rounded-full flex items-center justify-center transition-all",
                isActive && "bg-primary/10"
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

export default HizovoAppBottomNav;
