// CSS animations used instead of framer-motion for mobile performance
import { useNavigate } from "react-router-dom";
import { 
  Car, 
  UtensilsCrossed, 
  Plane, 
  Hotel, 
  CarFront, 
  Package,
  Ticket,
  Shield,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
}

const quickActions: QuickAction[] = [
  { id: "ride", label: "Ride", icon: Car, href: "/ride", color: "text-primary", bgColor: "bg-primary/15" },
  { id: "food", label: "Food", icon: UtensilsCrossed, href: "/food", color: "text-eats", bgColor: "bg-eats/15" },
  { id: "flights", label: "Flights", icon: Plane, href: "/book-flight", color: "text-sky-400", bgColor: "bg-sky-500/15" },
  { id: "hotels", label: "Hotels", icon: Hotel, href: "/book-hotel", color: "text-amber-400", bgColor: "bg-amber-500/15" },
  { id: "cars", label: "Cars", icon: CarFront, href: "/rent-car", color: "text-emerald-400", bgColor: "bg-emerald-500/15" },
  { id: "package", label: "Delivery", icon: Package, href: "/package-delivery", color: "text-violet-400", bgColor: "bg-violet-500/15" },
  { id: "events", label: "Events", icon: Ticket, href: "/events", color: "text-pink-400", bgColor: "bg-pink-500/15" },
  { id: "insurance", label: "Insurance", icon: Shield, href: "/travel-insurance", color: "text-blue-400", bgColor: "bg-blue-500/15" },
];

const MobileQuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <h2 className="font-display font-bold text-lg mb-4">Services</h2>
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => navigate(action.href)}
            className="flex flex-col items-center gap-2 touch-manipulation active:scale-[0.88] transition-all duration-200 animate-in fade-in zoom-in-95 duration-300 min-w-[60px] min-h-[72px]"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm",
              action.bgColor
            )}>
              <action.icon className={cn("w-6 h-6", action.color)} />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileQuickActions;
