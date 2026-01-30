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
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlightQuickActionsProps {
  className?: string;
  onActionClick?: (action: string) => void;
}

export default function FlightQuickActions({ className, onActionClick }: FlightQuickActionsProps) {
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
    },
    {
      id: "gift-card",
      icon: Gift,
      label: "Gift Cards",
      description: "Give the gift of travel",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      hoverBg: "group-hover:bg-pink-500/20",
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
    },
    {
      id: "explore-map",
      icon: Globe,
      label: "Explore Map",
      description: "Find destinations",
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
      hoverBg: "group-hover:bg-teal-500/20",
    },
    {
      id: "flexible-dates",
      icon: Calendar,
      label: "Flexible Dates",
      description: "Find cheapest days",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      hoverBg: "group-hover:bg-orange-500/20",
    },
    {
      id: "manage-booking",
      icon: Ticket,
      label: "My Bookings",
      description: "View & manage trips",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      hoverBg: "group-hover:bg-indigo-500/20",
    },
    {
      id: "upgrade",
      icon: Crown,
      label: "Upgrade Bids",
      description: "Bid for upgrades",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      hoverBg: "group-hover:bg-amber-500/20",
    },
  ];

  return (
    <section className={cn("py-8", className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-500" />
            Quick Actions
          </h2>
          <Badge variant="secondary" className="text-xs">
            <Plane className="w-3 h-3 mr-1" />
            More ways to book
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {actions.map((action, index) => (
            <Card
              key={action.id}
              className={cn(
                "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border",
                action.borderColor,
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onActionClick?.(action.id)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all",
                  action.bgColor,
                  action.hoverBg
                )}>
                  <action.icon className={cn("w-6 h-6", action.color)} />
                </div>
                <h3 className="font-semibold text-sm mb-0.5">{action.label}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
