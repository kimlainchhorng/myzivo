import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  Hotel, 
  Car, 
  Ticket, 
  Wifi, 
  ArrowRight, 
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PLAN YOUR TRIP - Homepage Section
 * Clean 4-6 card layout for main travel services
 * Links to dedicated pages, not direct affiliate redirects
 */

const tripServices = [
  {
    id: "flights",
    title: "Flights",
    description: "Compare 500+ airlines",
    icon: Plane,
    href: "/flights",
    gradient: "from-sky-500 to-blue-600",
    bgGradient: "from-sky-500/20 via-blue-500/10 to-blue-500/20",
    borderColor: "border-sky-500/30 hover:border-sky-500/60",
    badge: "Popular",
    badgeColor: "bg-sky-500",
  },
  {
    id: "hotels",
    title: "Hotels",
    description: "2M+ accommodations",
    icon: Hotel,
    href: "/book-hotel",
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-500/20 via-orange-500/10 to-orange-500/20",
    borderColor: "border-amber-500/30 hover:border-amber-500/60",
    badge: null,
    badgeColor: null,
  },
  {
    id: "cars",
    title: "Car Rental",
    description: "500+ providers worldwide",
    icon: Car,
    href: "/rent-car",
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-500/20 via-purple-500/10 to-purple-500/20",
    borderColor: "border-violet-500/30 hover:border-violet-500/60",
    badge: null,
    badgeColor: null,
  },
  {
    id: "activities",
    title: "Things To Do",
    description: "Tours & attractions",
    icon: Ticket,
    href: "/things-to-do",
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-500/20 via-teal-500/10 to-teal-500/20",
    borderColor: "border-emerald-500/30 hover:border-emerald-500/60",
    badge: "New",
    badgeColor: "bg-emerald-500",
  },
  {
    id: "transfers",
    title: "Transfers",
    description: "Airport rides & shuttles",
    icon: Car,
    href: "/extras",
    gradient: "from-amber-500 to-yellow-600",
    bgGradient: "from-amber-500/20 via-yellow-500/10 to-yellow-500/20",
    borderColor: "border-amber-500/30 hover:border-amber-500/60",
    badge: null,
    badgeColor: null,
  },
  {
    id: "esim",
    title: "Travel eSIM",
    description: "Stay connected abroad",
    icon: Wifi,
    href: "/extras",
    gradient: "from-cyan-500 to-teal-600",
    bgGradient: "from-cyan-500/20 via-teal-500/10 to-teal-500/20",
    borderColor: "border-cyan-500/30 hover:border-cyan-500/60",
    badge: null,
    badgeColor: null,
  },
];

export default function PlanYourTrip() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Plan Your Entire Trip</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Everything You Need in{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              One Place
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Flights, hotels, cars, activities, and more - compare and save
          </p>
        </div>

        {/* Services Grid - 6 cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {tripServices.map((service, index) => (
            <Link
              key={service.id}
              to={service.href}
              className="group animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <Card
                className={cn(
                  "h-full border transition-all duration-200",
                  "hover:-translate-y-2 hover:shadow-xl",
                  `bg-gradient-to-br ${service.bgGradient}`,
                  service.borderColor
                )}
              >
                <CardContent className="p-4 text-center relative">
                  {/* Badge */}
                  {service.badge && (
                    <Badge
                      className={cn(
                        "absolute -top-2 right-2 text-[10px] text-white border-0 px-1.5",
                        service.badgeColor
                      )}
                    >
                      {service.badge}
                    </Badge>
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white group-hover:scale-110 transition-transform bg-gradient-to-br",
                      service.gradient
                    )}
                  >
                    <service.icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-sm mb-1">{service.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link 
            to="/extras" 
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View all travel extras
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
