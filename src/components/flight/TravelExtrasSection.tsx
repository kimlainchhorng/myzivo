import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Luggage,
  Shield,
  Car,
  Wifi,
  UtensilsCrossed,
  Crown,
  Bell,
  Gift,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TravelExtrasSectionProps {
  className?: string;
  destination?: string;
}

export default function TravelExtrasSection({ className, destination }: TravelExtrasSectionProps) {
  const extras = [
    {
      id: "baggage",
      title: "Extra Baggage",
      description: "Add checked bags to your booking",
      icon: Luggage,
      color: "sky",
      cta: "Add Bags",
    },
    {
      id: "insurance",
      title: "Travel Insurance",
      description: "Protect your trip with coverage",
      icon: Shield,
      color: "emerald",
      cta: "Get Quote",
    },
    {
      id: "transfer",
      title: "Airport Transfer",
      description: "Book rides to/from the airport",
      icon: Car,
      color: "violet",
      cta: "Book Transfer",
    },
    {
      id: "lounge",
      title: "Lounge Access",
      description: "Relax before your flight",
      icon: Crown,
      color: "amber",
      cta: "View Lounges",
    },
    {
      id: "wifi",
      title: "In-Flight WiFi",
      description: "Stay connected while flying",
      icon: Wifi,
      color: "blue",
      cta: "Pre-Order",
    },
    {
      id: "meals",
      title: "Special Meals",
      description: "Pre-order dietary requirements",
      icon: UtensilsCrossed,
      color: "orange",
      cta: "Select Meal",
    },
  ];

  const getColorClasses = (color: string) => ({
    bg: `bg-${color}-500/10`,
    text: `text-${color}-500`,
    border: `border-${color}-500/30`,
    hover: `hover:border-${color}-500/50`,
  });

  return (
    <section className={cn("py-12 border-t border-border/50", className)}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Gift className="w-3 h-3 mr-1" /> Optional Add-Ons
          </Badge>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Enhance Your Trip
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Customize your travel experience with these optional extras
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {extras.map((extra) => (
            <Card
              key={extra.id}
              className={cn(
                "group cursor-pointer transition-all duration-300 hover:shadow-lg",
                extra.color === "sky" && "border-sky-500/20 hover:border-sky-500/40",
                extra.color === "emerald" && "border-emerald-500/20 hover:border-emerald-500/40",
                extra.color === "violet" && "border-violet-500/20 hover:border-violet-500/40",
                extra.color === "amber" && "border-amber-500/20 hover:border-amber-500/40",
                extra.color === "blue" && "border-blue-500/20 hover:border-blue-500/40",
                extra.color === "orange" && "border-orange-500/20 hover:border-orange-500/40"
              )}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    extra.color === "sky" && "bg-sky-500/10",
                    extra.color === "emerald" && "bg-emerald-500/10",
                    extra.color === "violet" && "bg-violet-500/10",
                    extra.color === "amber" && "bg-amber-500/10",
                    extra.color === "blue" && "bg-blue-500/10",
                    extra.color === "orange" && "bg-orange-500/10"
                  )}
                >
                  <extra.icon
                    className={cn(
                      "w-6 h-6",
                      extra.color === "sky" && "text-sky-500",
                      extra.color === "emerald" && "text-emerald-500",
                      extra.color === "violet" && "text-violet-500",
                      extra.color === "amber" && "text-amber-500",
                      extra.color === "blue" && "text-blue-500",
                      extra.color === "orange" && "text-orange-500"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{extra.title}</h3>
                  <p className="text-xs text-muted-foreground">{extra.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Price Alerts & Notifications */}
        <div className="mt-8 max-w-3xl mx-auto">
          <Card className="bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-cyan-500/10 border-sky-500/20">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 flex items-center justify-center shrink-0">
                <Bell className="w-7 h-7 text-sky-500" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-lg mb-1">Get Price Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  We'll notify you when prices drop for your route. Never miss a deal!
                </p>
              </div>
              <Button className="bg-sky-500 hover:bg-sky-600 gap-2 shrink-0">
                <Bell className="w-4 h-4" />
                Set Alert
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
