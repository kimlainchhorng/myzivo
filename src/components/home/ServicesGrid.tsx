import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Hotel, CarFront, Car, UtensilsCrossed, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ServiceStatus = "live" | "coming-soon";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bgColor: string;
  borderHover: string;
  status: ServiceStatus;
}

const services: Service[] = [
  {
    id: "flights",
    title: "Flights",
    description: "Compare prices from 500+ airlines worldwide",
    icon: Plane,
    href: "/book-flight",
    color: "text-flights",
    bgColor: "bg-flights-light",
    borderHover: "hover:border-flights/50",
    status: "live",
  },
  {
    id: "hotels",
    title: "Hotels",
    description: "Best rates on hotels, resorts & vacation stays",
    icon: Hotel,
    href: "/book-hotel",
    color: "text-hotels",
    bgColor: "bg-hotels-light",
    borderHover: "hover:border-hotels/50",
    status: "live",
  },
  {
    id: "cars",
    title: "Car Rental",
    description: "Compare rental prices from trusted partners",
    icon: CarFront,
    href: "/rent-car",
    color: "text-cars",
    bgColor: "bg-cars-light",
    borderHover: "hover:border-cars/50",
    status: "live",
  },
  {
    id: "rides",
    title: "Rides",
    description: "Request a ride in your local area",
    icon: Car,
    href: "/rides",
    color: "text-rides",
    bgColor: "bg-rides-light",
    borderHover: "hover:border-rides/50",
    status: "coming-soon",
  },
  {
    id: "eats",
    title: "Eats",
    description: "Order food from local restaurants",
    icon: UtensilsCrossed,
    href: "/eats",
    color: "text-eats",
    bgColor: "bg-eats-light",
    borderHover: "hover:border-eats/50",
    status: "coming-soon",
  },
  {
    id: "more",
    title: "More",
    description: "Transfers, insurance & travel extras",
    icon: Sparkles,
    href: "/extras",
    color: "text-more",
    bgColor: "bg-more-light",
    borderHover: "hover:border-more/50",
    status: "live",
  },
];

export default function ServicesGrid() {
  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-heading-lg mb-3">
            Start Your Journey
          </h2>
          <p className="text-muted-foreground text-body max-w-xl mx-auto">
            Search and compare prices across all major travel services
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service) => (
            <Link
              key={service.id}
              to={service.href}
              className="group"
            >
              <Card
                className={cn(
                  "h-full border transition-all duration-200",
                  "hover:-translate-y-1 hover:shadow-lg",
                  service.borderHover
                )}
              >
                <CardContent className="p-6">
                  {/* Header with Icon and Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        service.bgColor
                      )}
                    >
                      <service.icon className={cn("w-6 h-6", service.color)} />
                    </div>
                    
                    {service.status === "live" ? (
                      <span className="badge-live">Live</span>
                    ) : (
                      <span className="badge-coming-soon">Coming Soon</span>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="text-subheading mb-2">
                    {service.title}
                  </h3>
                  <p className="text-small text-muted-foreground mb-4">
                    {service.description}
                  </p>

                  {/* CTA */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "p-0 h-auto font-semibold gap-1.5",
                      service.color,
                      "group-hover:gap-2.5 transition-all"
                    )}
                  >
                    {service.status === "live" ? `Search ${service.title}` : "Learn More"}
                    <ArrowRight className="w-4 h-4" />
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
