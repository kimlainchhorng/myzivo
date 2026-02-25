/**
 * Primary Services Section
 * 3 large image cards for Flights (primary), Hotels, and Car Rentals
 */

import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, CarFront, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { serviceCardPhotos } from "@/config/photos";

const primaryServices = [
  {
    id: "flights",
    title: "Flights",
    description: "Compare prices from 500+ airlines and book securely with our trusted travel partners.",
    icon: Plane,
    href: "/flights",
    image: serviceCardPhotos.flights.src,
    cta: "Search Flights",
    primary: true,
    color: "bg-flights",
    borderHover: "hover:border-flights/50",
  },
  {
    id: "hotels",
    title: "Hotels",
    description: "Find the best hotel deals worldwide. Compare rates and amenities.",
    icon: Hotel,
    href: "/hotels",
    image: serviceCardPhotos.hotels.src,
    cta: "Compare Hotels",
    primary: false,
    color: "bg-hotels",
    borderHover: "hover:border-hotels/50",
  },
  {
    id: "cars",
    title: "Car Rentals",
    description: "Rent cars from top providers. Compare prices and pick up anywhere.",
    icon: CarFront,
    href: "/rent-car",
    image: serviceCardPhotos.cars.src,
    cta: "Find Rental Cars",
    primary: false,
    color: "bg-cars",
    borderHover: "hover:border-cars/50",
  },
];

export default function PrimaryServicesSection() {
  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Start Your Journey
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Search and compare prices across all major travel services
          </p>
        </div>

        {/* Service Cards Grid - Flights is larger */}
        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {primaryServices.map((service) => (
            <Link
              key={service.id}
              to={service.href}
              className={cn(
                "group block",
                service.primary && "lg:row-span-1"
              )}
            >
              <Card
                className={cn(
                  "h-full border overflow-hidden transition-all duration-200",
                  "hover:-translate-y-2 hover:shadow-2xl",
                  service.borderHover,
                  service.primary && "ring-2 ring-flights/20 shadow-lg"
                )}
              >
                {/* Image Header */}
                <div className={cn(
                  "relative overflow-hidden",
                  service.primary ? "h-48 sm:h-56" : "h-40 sm:h-48"
                )}>
                  <img
                    src={service.image}
                    alt={`ZIVO ${service.title} - ${service.description}`}
                    width={600}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Icon badge */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md bg-white/20 border border-white/30",
                      service.primary && "w-14 h-14"
                    )}>
                      <service.icon className={cn(
                        "text-white",
                        service.primary ? "w-7 h-7" : "w-6 h-6"
                      )} />
                    </div>
                    <h3 className="text-white font-bold text-xl sm:text-2xl">
                      {service.title}
                    </h3>
                  </div>

                  {/* Primary badge */}
                  {service.primary && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-flights text-white text-xs font-semibold">
                      Most Popular
                    </div>
                  )}
                </div>

                <CardContent className="p-5 sm:p-6">
                  {/* Description */}
                  <p className="text-muted-foreground text-sm sm:text-base mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* CTA Button */}
                  <Button
                    className={cn(
                      "w-full font-semibold gap-2 rounded-xl transition-all",
                      service.primary 
                        ? "h-12 text-base bg-flights hover:bg-flights/90 text-white" 
                        : "h-11 text-sm",
                      !service.primary && service.id === "hotels" && "bg-hotels hover:bg-hotels/90 text-white",
                      !service.primary && service.id === "cars" && "bg-cars hover:bg-cars/90 text-white"
                    )}
                  >
                    {service.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  {/* P2P Link for Cars */}
                  {service.id === "cars" && (
                    <Link 
                      to="/p2p/search" 
                      onClick={(e) => e.stopPropagation()}
                      className="block mt-3 text-center text-sm text-primary hover:underline font-medium"
                    >
                      Or rent from local owners →
                    </Link>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}