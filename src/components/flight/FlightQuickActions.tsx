import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  Users, 
  Building2, 
  Gift,
  Bell,
  CreditCard,
  Map,
  Calendar,
  Ticket,
  Globe,
  Crown,
  Sparkles,
  Percent,
  HeartHandshake,
  Compass,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface FlightQuickActionsProps {
  className?: string;
  onActionClick?: (action: string) => void;
}

export default function FlightQuickActions({ className, onActionClick }: FlightQuickActionsProps) {
  const navigate = useNavigate();

  const actions = [
    {
      id: "multi-city",
      icon: Map,
      label: "Multi-City",
      description: "Plan complex trips",
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
      hoverBg: "group-hover:bg-sky-500/20",
      gradient: "from-sky-500/20 to-blue-500/10",
    },
    {
      id: "group-booking",
      icon: Users,
      label: "Group Booking",
      description: "10+ travelers",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      hoverBg: "group-hover:bg-emerald-500/20",
      gradient: "from-emerald-500/20 to-green-500/10",
    },
    {
      id: "corporate",
      icon: Building2,
      label: "Corporate",
      description: "Business travel",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      hoverBg: "group-hover:bg-blue-500/20",
      gradient: "from-blue-500/20 to-indigo-500/10",
    },
    {
      id: "deals",
      icon: Percent,
      label: "Flash Deals",
      description: "Up to 40% off",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      hoverBg: "group-hover:bg-red-500/20",
      gradient: "from-red-500/20 to-pink-500/10",
      badge: "HOT",
    },
    {
      id: "price-alert",
      icon: Bell,
      label: "Price Alerts",
      description: "Track fare changes",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      hoverBg: "group-hover:bg-amber-500/20",
      gradient: "from-amber-500/20 to-orange-500/10",
    },
    {
      id: "pay-later",
      icon: CreditCard,
      label: "Pay Later",
      description: "Flexible payments",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      hoverBg: "group-hover:bg-purple-500/20",
      gradient: "from-purple-500/20 to-violet-500/10",
    },
    {
      id: "explore-map",
      icon: Compass,
      label: "Explore",
      description: "Find destinations",
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
      hoverBg: "group-hover:bg-teal-500/20",
      gradient: "from-teal-500/20 to-cyan-500/10",
    },
    {
      id: "flexible-dates",
      icon: Calendar,
      label: "Flex Dates",
      description: "Find cheapest days",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      hoverBg: "group-hover:bg-orange-500/20",
      gradient: "from-orange-500/20 to-yellow-500/10",
    },
    {
      id: "manage-booking",
      icon: Ticket,
      label: "My Trips",
      description: "View & manage",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      hoverBg: "group-hover:bg-indigo-500/20",
      gradient: "from-indigo-500/20 to-purple-500/10",
    },
    {
      id: "insurance",
      icon: Shield,
      label: "Insurance",
      description: "Travel protection",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      hoverBg: "group-hover:bg-cyan-500/20",
      gradient: "from-cyan-500/20 to-sky-500/10",
    },
  ];

  const handleClick = (actionId: string) => {
    if (onActionClick) {
      onActionClick(actionId);
    }
    // Navigate for specific actions
    if (actionId === "manage-booking") {
      navigate("/my-trips");
    }
  };

  return (
    <section className={cn("py-10", className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge className="mb-2 bg-sky-500/20 text-sky-500 border-sky-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Quick Access
            </Badge>
            <h2 className="font-display text-2xl font-bold">More Ways to Book</h2>
          </div>
          <Badge variant="secondary" className="hidden sm:flex gap-1">
            <Plane className="w-3 h-3" />
            Explore all features
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {actions.map((action, index) => (
            <Card
              key={action.id}
              className={cn(
                "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border overflow-hidden relative",
                action.borderColor,
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleClick(action.id)}
            >
              {/* Gradient Background */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                action.gradient
              )} />
              
              <CardContent className="p-4 flex flex-col items-center text-center relative">
                {action.badge && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5">
                    {action.badge}
                  </Badge>
                )}
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 shadow-lg",
                  action.bgColor,
                  action.hoverBg,
                  "group-hover:scale-110 group-hover:shadow-xl"
                )}>
                  <action.icon className={cn("w-7 h-7 transition-transform group-hover:scale-110", action.color)} />
                </div>
                <h3 className="font-bold text-sm mb-0.5">{action.label}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}