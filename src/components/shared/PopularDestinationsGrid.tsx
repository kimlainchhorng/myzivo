import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * POPULAR DESTINATIONS GRID
 * Visual destination cards with images
 * Professional quality like Booking.com
 */

export type ServiceType = "flights" | "hotels" | "cars";

interface Destination {
  city: string;
  country: string;
  image: string;
  count: number;
  priceFrom: number;
  trending?: boolean;
}

const destinations: Record<ServiceType, Destination[]> = {
  flights: [
    { city: "New York", country: "USA", image: "🗽", count: 450, priceFrom: 199, trending: true },
    { city: "London", country: "UK", image: "🎡", count: 380, priceFrom: 459, trending: true },
    { city: "Paris", country: "France", image: "🗼", count: 320, priceFrom: 489, trending: false },
    { city: "Tokyo", country: "Japan", image: "🏯", count: 290, priceFrom: 689, trending: true },
    { city: "Dubai", country: "UAE", image: "🌴", count: 260, priceFrom: 549, trending: false },
    { city: "Los Angeles", country: "USA", image: "🌅", count: 410, priceFrom: 149, trending: true },
    { city: "Miami", country: "USA", image: "🏖️", count: 340, priceFrom: 179, trending: false },
    { city: "Barcelona", country: "Spain", image: "⛪", count: 280, priceFrom: 429, trending: false },
  ],
  hotels: [
    { city: "New York", country: "USA", image: "🗽", count: 2450, priceFrom: 189, trending: true },
    { city: "Paris", country: "France", image: "🗼", count: 1890, priceFrom: 165, trending: true },
    { city: "Tokyo", country: "Japan", image: "🏯", count: 2100, priceFrom: 142, trending: false },
    { city: "London", country: "UK", image: "🎡", count: 1980, priceFrom: 175, trending: true },
    { city: "Dubai", country: "UAE", image: "🌴", count: 1250, priceFrom: 225, trending: true },
    { city: "Bali", country: "Indonesia", image: "🏝️", count: 820, priceFrom: 95, trending: false },
    { city: "Barcelona", country: "Spain", image: "⛪", count: 1120, priceFrom: 135, trending: false },
    { city: "Sydney", country: "Australia", image: "🦘", count: 890, priceFrom: 168, trending: false },
  ],
  cars: [
    { city: "Los Angeles", country: "CA", image: "🌴", count: 850, priceFrom: 45, trending: true },
    { city: "Miami", country: "FL", image: "🏖️", count: 680, priceFrom: 42, trending: true },
    { city: "Las Vegas", country: "NV", image: "🎰", count: 590, priceFrom: 38, trending: true },
    { city: "New York", country: "NY", image: "🗽", count: 920, priceFrom: 55, trending: false },
    { city: "San Francisco", country: "CA", image: "🌉", count: 540, priceFrom: 52, trending: false },
    { city: "Orlando", country: "FL", image: "🎢", count: 710, priceFrom: 35, trending: true },
    { city: "Denver", country: "CO", image: "🏔️", count: 420, priceFrom: 48, trending: false },
    { city: "Seattle", country: "WA", image: "☕", count: 380, priceFrom: 50, trending: false },
  ],
};

const serviceConfig = {
  flights: {
    title: "Popular Flight Destinations",
    subtitle: "Explore top destinations with great flight deals",
    countLabel: "daily flights",
    priceLabel: "/person",
    accentColor: "sky",
    gradient: "from-sky-500/10 to-blue-500/10",
    hoverBorder: "hover:border-sky-500/50",
  },
  hotels: {
    title: "Popular Hotel Destinations",
    subtitle: "Top-rated hotels in trending cities worldwide",
    countLabel: "hotels",
    priceLabel: "/night",
    accentColor: "amber",
    gradient: "from-amber-500/10 to-orange-500/10",
    hoverBorder: "hover:border-amber-500/50",
  },
  cars: {
    title: "Popular Pickup Locations",
    subtitle: "Rent a car at top destinations across the US",
    countLabel: "cars available",
    priceLabel: "/day",
    accentColor: "violet",
    gradient: "from-violet-500/10 to-purple-500/10",
    hoverBorder: "hover:border-violet-500/50",
  },
};

interface PopularDestinationsGridProps {
  service: ServiceType;
  onSelect?: (city: string) => void;
  className?: string;
}

export default function PopularDestinationsGrid({ 
  service, 
  onSelect,
  className = '' 
}: PopularDestinationsGridProps) {
  const config = serviceConfig[service];
  const data = destinations[service];

  return (
    <section className={cn("py-12 sm:py-16 border-t border-border/50", className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
              {config.title}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {config.subtitle}
            </p>
          </div>
          <button className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {data.map((dest, index) => (
            <Card
              key={dest.city}
              className={cn(
                "overflow-hidden group cursor-pointer transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-lg",
                config.hoverBorder
              )}
              onClick={() => onSelect?.(dest.city)}
            >
              <CardContent className="p-0">
                <div className={cn(
                  "relative h-24 sm:h-32 flex items-center justify-center",
                  `bg-gradient-to-br ${config.gradient}`
                )}>
                  <span className="text-5xl sm:text-6xl transition-transform group-hover:scale-110">
                    {dest.image}
                  </span>
                  {dest.trending && (
                    <Badge className={cn(
                      "absolute top-2 right-2 text-[10px] text-white border-0",
                      config.accentColor === 'sky' && "bg-sky-500",
                      config.accentColor === 'amber' && "bg-amber-500",
                      config.accentColor === 'violet' && "bg-violet-500"
                    )}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors">
                    {dest.city}
                  </h3>
                  <p className="text-muted-foreground text-xs mb-2">{dest.country}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {dest.count.toLocaleString()} {config.countLabel}
                    </span>
                    <span className={cn(
                      "text-sm font-bold",
                      config.accentColor === 'sky' && "text-sky-500",
                      config.accentColor === 'amber' && "text-amber-500",
                      config.accentColor === 'violet' && "text-violet-500"
                    )}>
                      ${dest.priceFrom}{config.priceLabel}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
