import { Home, Plane, Hotel, Car, User, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useI18n";

const navItemDefs = [
  { icon: Home, labelKey: "nav.home", path: "/" },
  { icon: Plane, labelKey: "nav.flights", path: "/book-flight" },
  { icon: Hotel, labelKey: "nav.hotels", path: "/book-hotel" },
  { icon: Car, labelKey: "nav.cars", path: "/rent-car" },
  { icon: User, labelKey: "nav.account", path: "/profile" },
];

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("common");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 py-2 px-2 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItemDefs.map((item) => {
          const isActive = location.pathname === item.path;
          const label = t(item.labelKey);
          return (
            <button
              key={item.labelKey}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-all touch-manipulation",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "text-primary"
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
