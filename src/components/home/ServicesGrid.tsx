import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, CarFront, Car, UtensilsCrossed, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { serviceCardPhotos, ServiceType } from "@/config/photos";

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
  image: string;
}

const services: Service[] = [
  {
    id: "flights",
    title: "Flights",
    description: "Compare prices from 500+ airlines worldwide",
    icon: Plane,
    href: "/flights",
    color: "text-white",
    bgColor: "bg-flights-light",
    borderHover: "hover:border-flights/50",
    status: "live",
    image: serviceCardPhotos.flights.src,
  },
  {
    id: "hotels",
    title: "Hotels",
    description: "Best rates on hotels, resorts & vacation stays",
    icon: Hotel,
    href: "/hotels",
    color: "text-white",
    bgColor: "bg-hotels-light",
    borderHover: "hover:border-hotels/50",
    status: "live",
    image: serviceCardPhotos.hotels.src,
  },
  {
    id: "cars",
    title: "Car Rental",
    description: "Compare rental prices from trusted partners",
    icon: CarFront,
    href: "/rent-car",
    color: "text-white",
    bgColor: "bg-cars-light",
    borderHover: "hover:border-cars/50",
    status: "live",
    image: serviceCardPhotos.cars.src,
  },
  {
    id: "rides",
    title: "Rides",
    description: "Request a ride in your local area",
    icon: Car,
    href: "/rides",
    color: "text-white",
    bgColor: "bg-rides-light",
    borderHover: "hover:border-rides/50",
    status: "live",
    image: serviceCardPhotos.rides.src,
  },
  {
    id: "eats",
    title: "Eats",
    description: "Order food from local restaurants",
    icon: UtensilsCrossed,
    href: "/eats",
    color: "text-white",
    bgColor: "bg-eats-light",
    borderHover: "hover:border-eats/50",
    status: "live",
    image: serviceCardPhotos.eats.src,
  },
  {
    id: "more",
    title: "More",
    description: "Transfers, insurance & travel extras",
    icon: Sparkles,
    href: "/extras",
    color: "text-white",
    bgColor: "bg-more-light",
    borderHover: "hover:border-more/50",
    status: "live",
    image: serviceCardPhotos.extras.src,
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
                  "h-full border overflow-hidden transition-all duration-300",
                  "hover:-translate-y-1 hover:shadow-xl",
                  service.borderHover
                )}
              >
                {/* Image Header */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={service.image}
                    alt={`ZIVO ${service.title} - ${service.description}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  
                  {/* Icon on image */}
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md bg-white/20 border border-white/30",
                      )}
                    >
                      <service.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {service.status === "live" ? (
                      <span className="badge-live">Live</span>
                    ) : (
                      <span className="badge-coming-soon">Coming Soon</span>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Content */}
                  <h3 className="text-subheading mb-1">
                    {service.title}
                  </h3>
                  <p className="text-small text-muted-foreground mb-3">
                    {service.description}
                  </p>

                  {/* CTA */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "p-0 h-auto font-semibold gap-1.5",
                      service.id === "flights" && "text-flights",
                      service.id === "hotels" && "text-hotels",
                      service.id === "cars" && "text-cars",
                      service.id === "rides" && "text-rides",
                      service.id === "eats" && "text-eats",
                      service.id === "more" && "text-more",
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
