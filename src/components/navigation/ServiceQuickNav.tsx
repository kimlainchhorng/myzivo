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
  Sparkles,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const services = [
  { 
    id: "rides", 
    label: "Rides", 
    description: "Book a ride",
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
    description: "Order food",
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
    description: "Search flights",
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
    description: "Find hotels",
    icon: Building2, 
    href: "/book-hotel",
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-500",
    badge: null
  },
  { 
    id: "cars", 
    label: "Car Rental", 
    description: "Rent a car",
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
    description: "Send packages",
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
    description: "Bus & Train",
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
    description: "Get tickets",
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
    description: "Travel protection",
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
    <div className="w-full bg-card/60 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Quick Access</h3>
              <p className="text-xs text-muted-foreground">Select a service to get started</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs">
            All Services Available
          </Badge>
        </div>

        {/* Desktop: Horizontal scrollable cards */}
        <div className="hidden md:block overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-1">
            {services.map((service) => {
              const active = isActive(service.href);
              return (
                <button
                  key={service.id}
                  onClick={() => navigate(service.href)}
                  className={cn(
                    "group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 min-w-[160px]",
                    active 
                      ? "bg-primary/10 border-primary/50 shadow-lg shadow-primary/10" 
                      : "bg-card/80 border-border/50 hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  {/* Radio indicator */}
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                    active 
                      ? "border-primary bg-primary" 
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                  )}>
                    {active && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Icon */}
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all",
                    active 
                      ? `bg-gradient-to-br ${service.color} shadow-lg` 
                      : service.bgColor
                  )}>
                    <service.icon className={cn(
                      "w-4 h-4 transition-colors",
                      active ? "text-white" : service.textColor
                    )} />
                  </div>

                  {/* Text */}
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-sm font-medium truncate",
                        active ? "text-foreground" : "text-foreground/80"
                      )}>
                        {service.label}
                      </span>
                      {service.badge && (
                        <Badge className={cn(
                          "text-[10px] px-1.5 py-0 h-4",
                          service.badge === "Hot" 
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/30" 
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                        )}>
                          {service.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate block">
                      {service.description}
                    </span>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className={cn(
                    "w-4 h-4 ml-auto shrink-0 transition-all",
                    active 
                      ? "text-primary opacity-100" 
                      : "text-muted-foreground/50 opacity-0 group-hover:opacity-100"
                  )} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile: Grid of compact cards */}
        <div className="md:hidden grid grid-cols-3 gap-2">
          {services.slice(0, 6).map((service) => {
            const active = isActive(service.href);
            return (
              <button
                key={service.id}
                onClick={() => navigate(service.href)}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300",
                  active 
                    ? "bg-primary/10 border-primary/50" 
                    : "bg-card/80 border-border/50 active:scale-95"
                )}
              >
                {/* Badge */}
                {service.badge && (
                  <Badge className={cn(
                    "absolute -top-1.5 -right-1.5 text-[9px] px-1.5 py-0 h-4",
                    service.badge === "Hot" 
                      ? "bg-rose-500 text-white border-0" 
                      : "bg-emerald-500 text-white border-0"
                  )}>
                    {service.badge}
                  </Badge>
                )}

                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  active 
                    ? `bg-gradient-to-br ${service.color}` 
                    : service.bgColor
                )}>
                  <service.icon className={cn(
                    "w-5 h-5",
                    active ? "text-white" : service.textColor
                  )} />
                </div>

                {/* Label */}
                <span className={cn(
                  "text-xs font-medium text-center",
                  active ? "text-foreground" : "text-muted-foreground"
                )}>
                  {service.label}
                </span>

                {/* Active indicator */}
                {active && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile: See more link */}
        <div className="md:hidden flex justify-center mt-2">
          <button className="text-xs text-primary font-medium flex items-center gap-1">
            View all services
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceQuickNav;
