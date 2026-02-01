import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, CarFront, Car, UtensilsCrossed, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
  {
    id: "flights",
    title: "Flights",
    description: "Compare prices from 500+ airlines worldwide",
    icon: Plane,
    href: "/book-flight",
    gradient: "from-sky-500 to-blue-600",
    bgGradient: "from-sky-500/15 to-blue-600/10",
    borderColor: "border-sky-500/30 hover:border-sky-500/60",
    iconColor: "text-sky-400",
    image: "✈️",
  },
  {
    id: "hotels",
    title: "Hotels",
    description: "Best rates on hotels, resorts & vacation stays",
    icon: Hotel,
    href: "/book-hotel",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/15 to-orange-500/10",
    borderColor: "border-amber-500/30 hover:border-amber-500/60",
    iconColor: "text-amber-400",
    image: "🏨",
  },
  {
    id: "cars",
    title: "Car Rental",
    description: "Compare rental prices from trusted partners",
    icon: CarFront,
    href: "/rent-car",
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-500/15 to-purple-500/10",
    borderColor: "border-violet-500/30 hover:border-violet-500/60",
    iconColor: "text-violet-400",
    image: "🚗",
  },
  {
    id: "rides",
    title: "Rides",
    description: "Request a ride in your local area",
    icon: Car,
    href: "/rides",
    gradient: "from-primary to-teal-500",
    bgGradient: "from-primary/15 to-teal-500/10",
    borderColor: "border-primary/30 hover:border-primary/60",
    iconColor: "text-primary",
    image: "🚖",
  },
  {
    id: "eats",
    title: "Eats",
    description: "Order food from local restaurants",
    icon: UtensilsCrossed,
    href: "/eats",
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-500/15 to-red-500/10",
    borderColor: "border-orange-500/30 hover:border-orange-500/60",
    iconColor: "text-orange-400",
    image: "🍔",
  },
  {
    id: "extras",
    title: "Extras",
    description: "Airport transfers, insurance & more",
    icon: Sparkles,
    href: "/extras",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-500/15 to-rose-500/10",
    borderColor: "border-pink-500/30 hover:border-pink-500/60",
    iconColor: "text-pink-400",
    image: "✨",
  },
];

export default function ServiceCards() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Start Your{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              Journey
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Search and compare prices across all major travel services
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Link
              key={service.id}
              to={service.href}
              className="group animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card
                className={cn(
                  "h-full border-2 transition-all duration-300",
                  "hover:-translate-y-2 hover:shadow-2xl",
                  `bg-gradient-to-br ${service.bgGradient}`,
                  service.borderColor
                )}
              >
                <CardContent className="p-6 sm:p-8 text-center">
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div
                      className={cn(
                        "w-20 h-20 mx-auto rounded-3xl flex items-center justify-center",
                        "bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
                        service.gradient
                      )}
                    >
                      <service.icon className="w-10 h-10 text-white" />
                    </div>
                    {/* Floating emoji */}
                    <span className="absolute -top-2 -right-2 text-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                      {service.image}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-display font-bold text-xl sm:text-2xl mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6">
                    {service.description}
                  </p>

                  {/* CTA */}
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full gap-2 rounded-xl font-semibold",
                      "group-hover:bg-gradient-to-r group-hover:text-white group-hover:border-transparent",
                      `group-hover:${service.gradient}`
                    )}
                  >
                    Search {service.title}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
