// CSS animations used instead of framer-motion for mobile performance
import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Car, 
  UtensilsCrossed, 
  User, 
  Bell,
  Plane,
  Hotel,
  CarFront,
  Package,
  X,
  ChevronRight,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import ZivoLogo from "./ZivoLogo";

interface MobileAppShellProps {
  children: ReactNode;
  hideNavigation?: boolean;
  hideHeader?: boolean;
  headerTitle?: string;
  headerAction?: ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const navItems = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "ride", label: "Ride", icon: Car, href: "/ride" },
  { id: "food", label: "Eats", icon: UtensilsCrossed, href: "/food" },
  { id: "activity", label: "Activity", icon: Clock, href: "/dashboard" },
  { id: "account", label: "Account", icon: User, href: "/profile" },
];

const moreServices = [
  { id: "flights", label: "Flights", icon: Plane, href: "/book-flight", color: "text-sky-400", bg: "bg-sky-500/20" },
  { id: "hotels", label: "Hotels", icon: Hotel, href: "/book-hotel", color: "text-amber-400", bg: "bg-amber-500/20" },
  { id: "cars", label: "Car Rental", icon: CarFront, href: "/rent-car", color: "text-primary", bg: "bg-primary/20" },
  { id: "package", label: "Delivery", icon: Package, href: "/package-delivery", color: "text-violet-400", bg: "bg-violet-500/20" },
];

const MobileAppShell = ({ 
  children, 
  hideNavigation = false,
  hideHeader = false,
  headerTitle,
  headerAction,
  showBackButton = false,
  onBackClick
}: MobileAppShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path.includes("/ride")) return "ride";
    if (path.includes("/food")) return "food";
    if (path.includes("/dashboard") || path.includes("/trips")) return "activity";
    if (path.includes("/profile")) return "account";
    return "";
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile App Header */}
      {!hideHeader && (
        <header 
          className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-200 safe-area-top",
            isScrolled 
              ? "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg" 
              : "bg-transparent"
          )}
        >
          <div className="flex items-center justify-between h-14 px-4">
            {/* Left: Logo or Back */}
            {showBackButton ? (
              <button
                onClick={onBackClick || (() => navigate(-1))}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors -ml-1 active:scale-90 touch-manipulation"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            ) : (
              <div 
                onClick={() => navigate("/")}
                className="cursor-pointer active:scale-95 transition-transform touch-manipulation"
              >
                <ZivoLogo size="sm" />
              </div>
            )}

            {/* Center: Title */}
            {headerTitle && (
              <h1 className="font-display font-bold text-lg absolute left-1/2 -translate-x-1/2">
                {headerTitle}
              </h1>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              {headerAction || (
                <>
                  <button
                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors relative active:scale-90 touch-manipulation"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-eats rounded-full" />
                  </button>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1",
        !hideHeader && "pt-14",
        !hideNavigation && "pb-20"
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideNavigation && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
          <div className="flex items-stretch justify-around h-16">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors touch-manipulation active:scale-90",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "w-10 h-7 rounded-full flex items-center justify-center transition-all",
                    isActive && "bg-primary/15"
                  )}>
                    <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium",
                    isActive && "text-primary font-semibold"
                  )}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* More Services Overlay */}
      {showMoreMenu && (
        <>
          <div
            onClick={() => setShowMoreMenu(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border/50 safe-area-bottom animate-in slide-in-from-bottom duration-300"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg">All Services</h3>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform touch-manipulation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {moreServices.map((service, index) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      navigate(service.href);
                      setShowMoreMenu(false);
                    }}
                    className="flex flex-col items-center gap-2 touch-manipulation active:scale-95 transition-transform animate-in fade-in zoom-in-95 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center",
                      service.bg
                    )}>
                      <service.icon className={cn("w-6 h-6", service.color)} />
                    </div>
                    <span className="text-xs font-medium text-center">{service.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileAppShell;
