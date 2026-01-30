import { useNavigate, useLocation } from "react-router-dom";
import { 
  Car, 
  Utensils, 
  Plane, 
  Building2, 
  Package, 
  Train, 
  Ticket, 
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const services = [
  { 
    id: "rides", 
    label: "Rides", 
    icon: Car, 
    href: "/ride",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-500",
    badge: null
  },
  { 
    id: "food", 
    label: "Food", 
    icon: Utensils, 
    href: "/food",
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-500",
    badge: null
  },
  { 
    id: "flights", 
    label: "Flights", 
    icon: Plane, 
    href: "/book-flight",
    color: "from-sky-500 to-blue-500",
    bgColor: "bg-sky-500/10",
    textColor: "text-sky-500",
    badge: "Hot"
  },
  { 
    id: "hotels", 
    label: "Hotels", 
    icon: Building2, 
    href: "/book-hotel",
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-500",
    badge: null
  },
  { 
    id: "cars", 
    label: "Cars", 
    icon: Car, 
    href: "/rent-car",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    textColor: "text-violet-500",
    badge: null
  },
  { 
    id: "packages", 
    label: "Packages", 
    icon: Package, 
    href: "/package-delivery",
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-500/10",
    textColor: "text-rose-500",
    badge: "New"
  },
  { 
    id: "transport", 
    label: "Transport", 
    icon: Train, 
    href: "/ground-transport",
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-500/10",
    textColor: "text-indigo-500",
    badge: null
  },
  { 
    id: "events", 
    label: "Events", 
    icon: Ticket, 
    href: "/events",
    color: "from-fuchsia-500 to-pink-500",
    bgColor: "bg-fuchsia-500/10",
    textColor: "text-fuchsia-500",
    badge: null
  },
  { 
    id: "insurance", 
    label: "Insurance", 
    icon: Shield, 
    href: "/travel-insurance",
    color: "from-cyan-500 to-teal-500",
    bgColor: "bg-cyan-500/10",
    textColor: "text-cyan-500",
    badge: null
  },
];

const ServiceQuickNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
        {services.map((service) => {
          const active = isActive(service.href);
          return (
            <button
              key={service.id}
              onClick={() => navigate(service.href)}
              className={cn(
                "group relative flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg transition-all duration-200",
                active 
                  ? "bg-primary/15 shadow-sm" 
                  : "hover:bg-muted/60 active:scale-95"
              )}
            >
              {/* Badge */}
              {service.badge && (
                <Badge className={cn(
                  "absolute -top-0.5 -right-0.5 text-[8px] px-1 py-0 h-3.5 font-semibold",
                  service.badge === "Hot" 
                    ? "bg-rose-500 text-white border-0" 
                    : "bg-emerald-500 text-white border-0"
                )}>
                  {service.badge}
                </Badge>
              )}

              {/* Icon */}
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                active 
                  ? `bg-gradient-to-br ${service.color} shadow-md` 
                  : service.bgColor
              )}>
                <service.icon className={cn(
                  "w-4 h-4",
                  active ? "text-white" : service.textColor
                )} />
              </div>

              {/* Label */}
              <span className={cn(
                "text-[10px] font-medium text-center leading-tight",
                active ? "text-foreground" : "text-muted-foreground"
              )}>
                {service.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceQuickNav;
