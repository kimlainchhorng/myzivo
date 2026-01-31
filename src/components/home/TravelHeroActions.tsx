import { Link } from "react-router-dom";
import { Plane, Hotel, CarFront, ArrowRight, Sparkles, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const travelActions = [
  {
    id: "flights",
    title: "Compare Flights",
    description: "Search 500+ airlines",
    icon: Plane,
    href: "/flights",
    gradient: "from-sky-500 to-blue-600",
    bgGradient: "from-sky-500/20 to-blue-600/10",
    borderColor: "border-sky-500/30",
    iconColor: "text-sky-400",
    hoverShadow: "hover:shadow-sky-500/20",
    badge: "Live Prices",
  },
  {
    id: "hotels",
    title: "Find Hotels",
    description: "Best rates worldwide",
    icon: Hotel,
    href: "/hotels",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/20 to-orange-500/10",
    borderColor: "border-amber-500/30",
    iconColor: "text-amber-400",
    hoverShadow: "hover:shadow-amber-500/20",
    badge: "Top Deals",
  },
  {
    id: "cars",
    title: "Rent a Car",
    description: "Compare rental prices",
    icon: CarFront,
    href: "/car-rental",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/20 to-teal-500/10",
    borderColor: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    hoverShadow: "hover:shadow-emerald-500/20",
    badge: "No Fees",
  },
];

const trustPoints = [
  { icon: Shield, text: "Secure booking with partners" },
  { icon: Clock, text: "24/7 customer support" },
];

export default function TravelHeroActions() {
  return (
    <section className="py-12 sm:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Travel with confidence</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Compare prices from{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              trusted travel partners
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Search flights, hotels, and car rentals. No booking fees on ZIVO.
          </p>
        </div>

        {/* Travel Action Cards */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-10">
          {travelActions.map((action, index) => (
            <Link
              key={action.id}
              to={action.href}
              className={cn(
                "group relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300",
                "hover:-translate-y-2 hover:shadow-2xl",
                `bg-gradient-to-br ${action.bgGradient}`,
                action.borderColor,
                action.hoverShadow
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Badge */}
              <div className={cn(
                "absolute -top-2.5 right-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg",
                `bg-gradient-to-r ${action.gradient}`
              )}>
                {action.badge}
              </div>

              {/* Icon */}
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                `bg-gradient-to-br ${action.gradient}`
              )}>
                <action.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="font-display font-bold text-xl mb-1 group-hover:text-foreground transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {action.description}
              </p>

              {/* CTA */}
              <div className={cn(
                "flex items-center gap-2 text-sm font-semibold transition-colors",
                action.iconColor
              )}>
                <span>Search now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Trust Points */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {trustPoints.map((point) => (
            <div key={point.text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <point.icon className="w-4 h-4 text-primary" />
              </div>
              <span>{point.text}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
            <span className="text-xs text-muted-foreground">No hidden fees</span>
            <span className="text-primary font-bold text-xs">✓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
