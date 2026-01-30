import { useNavigate, useLocation } from "react-router-dom";
import { 
  Car, 
  Utensils, 
  Plane, 
  Building2, 
  Package, 
  Train, 
  Ticket, 
  Shield,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
  { 
    id: "rides", 
    label: "Rides", 
    icon: Car, 
    href: "/ride",
    gradient: "from-emerald-500 to-teal-500",
    activeGlow: "shadow-emerald-500/30"
  },
  { 
    id: "food", 
    label: "Food", 
    icon: Utensils, 
    href: "/food",
    gradient: "from-orange-500 to-amber-500",
    activeGlow: "shadow-orange-500/30"
  },
  { 
    id: "flights", 
    label: "Flights", 
    icon: Plane, 
    href: "/book-flight",
    gradient: "from-sky-500 to-blue-500",
    activeGlow: "shadow-sky-500/30"
  },
  { 
    id: "hotels", 
    label: "Hotels", 
    icon: Building2, 
    href: "/book-hotel",
    gradient: "from-amber-500 to-yellow-500",
    activeGlow: "shadow-amber-500/30"
  },
  { 
    id: "cars", 
    label: "Car Rental", 
    icon: Car, 
    href: "/rent-car",
    gradient: "from-violet-500 to-purple-500",
    activeGlow: "shadow-violet-500/30"
  },
  { 
    id: "packages", 
    label: "Packages", 
    icon: Package, 
    href: "/package-delivery",
    gradient: "from-rose-500 to-pink-500",
    activeGlow: "shadow-rose-500/30"
  },
  { 
    id: "transport", 
    label: "Transport", 
    icon: Train, 
    href: "/ground-transport",
    gradient: "from-indigo-500 to-blue-500",
    activeGlow: "shadow-indigo-500/30"
  },
  { 
    id: "events", 
    label: "Events", 
    icon: Ticket, 
    href: "/events",
    gradient: "from-fuchsia-500 to-pink-500",
    activeGlow: "shadow-fuchsia-500/30"
  },
  { 
    id: "insurance", 
    label: "Insurance", 
    icon: Shield, 
    href: "/travel-insurance",
    gradient: "from-cyan-500 to-teal-500",
    activeGlow: "shadow-cyan-500/30"
  },
];

const ServiceQuickNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <div className="w-full bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center gap-1 py-2">
          <div className="flex items-center gap-1 mr-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Quick Access</span>
          </div>
          
          {services.map((service) => {
            const active = isActive(service.href);
            return (
              <button
                key={service.id}
                onClick={() => navigate(service.href)}
                className={cn(
                  "group relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                  active 
                    ? `bg-gradient-to-r ${service.gradient} text-white shadow-lg ${service.activeGlow}` 
                    : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                )}
              >
                <service.icon className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  active ? "scale-110" : "group-hover:scale-110"
                )} />
                <span className="text-sm font-medium whitespace-nowrap">{service.label}</span>
                
                {/* Active indicator dot */}
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Navigation - Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto scrollbar-hide py-3">
          <div className="flex items-center gap-2 px-1 min-w-max">
            {services.map((service) => {
              const active = isActive(service.href);
              return (
                <button
                  key={service.id}
                  onClick={() => navigate(service.href)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-[70px]",
                    active 
                      ? `bg-gradient-to-br ${service.gradient} text-white shadow-lg ${service.activeGlow}` 
                      : "bg-muted/40 text-muted-foreground active:scale-95"
                  )}
                >
                  <service.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium whitespace-nowrap">{service.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceQuickNav;
