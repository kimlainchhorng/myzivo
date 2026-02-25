/**
 * POPULAR DESTINATIONS GRID (SHARED)
 * 1:1 photo tiles using destinationPhotos config
 * Professional quality like Booking.com
 */

import { destinationPhotos, DestinationCity } from "@/config/photos";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ServiceType = "flights" | "hotels" | "cars";

// Default destinations to display (ordered by priority)
const defaultDestinations: DestinationCity[] = [
  "new-york",
  "los-angeles",
  "miami",
  "las-vegas",
  "london",
  "paris",
  "tokyo",
  "dubai",
];

// Trending cities get a badge
const trendingCities: DestinationCity[] = ["new-york", "tokyo", "las-vegas", "london"];

interface Destination {
  city: string;
  country: string;
  cityKey: DestinationCity;
  count: number;
  priceFrom: number;
  trending?: boolean;
}

const destinationData: Record<ServiceType, Destination[]> = {
  flights: [
    { city: "New York", country: "USA", cityKey: "new-york", count: 450, priceFrom: 199, trending: true },
    { city: "Los Angeles", country: "USA", cityKey: "los-angeles", count: 410, priceFrom: 149, trending: true },
    { city: "Miami", country: "USA", cityKey: "miami", count: 340, priceFrom: 179, trending: false },
    { city: "Las Vegas", country: "USA", cityKey: "las-vegas", count: 320, priceFrom: 159, trending: true },
    { city: "London", country: "UK", cityKey: "london", count: 380, priceFrom: 459, trending: true },
    { city: "Paris", country: "France", cityKey: "paris", count: 320, priceFrom: 489, trending: false },
    { city: "Tokyo", country: "Japan", cityKey: "tokyo", count: 290, priceFrom: 689, trending: true },
    { city: "Dubai", country: "UAE", cityKey: "dubai", count: 260, priceFrom: 549, trending: false },
  ],
  hotels: [
    { city: "New York", country: "USA", cityKey: "new-york", count: 2450, priceFrom: 189, trending: true },
    { city: "Los Angeles", country: "USA", cityKey: "los-angeles", count: 1850, priceFrom: 165, trending: false },
    { city: "Miami", country: "USA", cityKey: "miami", count: 1420, priceFrom: 145, trending: true },
    { city: "Las Vegas", country: "USA", cityKey: "las-vegas", count: 1680, priceFrom: 125, trending: true },
    { city: "London", country: "UK", cityKey: "london", count: 1980, priceFrom: 175, trending: true },
    { city: "Paris", country: "France", cityKey: "paris", count: 1890, priceFrom: 165, trending: true },
    { city: "Tokyo", country: "Japan", cityKey: "tokyo", count: 2100, priceFrom: 142, trending: false },
    { city: "Dubai", country: "UAE", cityKey: "dubai", count: 1250, priceFrom: 225, trending: true },
  ],
  cars: [
    { city: "New York", country: "NY", cityKey: "new-york", count: 920, priceFrom: 55, trending: false },
    { city: "Los Angeles", country: "CA", cityKey: "los-angeles", count: 850, priceFrom: 45, trending: true },
    { city: "Miami", country: "FL", cityKey: "miami", count: 680, priceFrom: 42, trending: true },
    { city: "Las Vegas", country: "NV", cityKey: "las-vegas", count: 590, priceFrom: 38, trending: true },
    { city: "San Francisco", country: "CA", cityKey: "san-francisco", count: 540, priceFrom: 52, trending: false },
    { city: "Orlando", country: "FL", cityKey: "orlando", count: 710, priceFrom: 35, trending: true },
    { city: "Chicago", country: "IL", cityKey: "chicago", count: 480, priceFrom: 48, trending: false },
    { city: "Phoenix", country: "AZ", cityKey: "phoenix", count: 380, priceFrom: 40, trending: false },
  ],
};

const serviceConfig = {
  flights: {
    title: "Popular Flight Destinations",
    subtitle: "Explore top destinations with great flight deals",
    countLabel: "daily flights",
    priceLabel: "/person",
    accentColor: "sky",
    hoverBorder: "hover:border-sky-500/50",
    hoverShadow: "hover:shadow-sky-500/20",
  },
  hotels: {
    title: "Popular Hotel Destinations",
    subtitle: "Top-rated hotels in trending cities worldwide",
    countLabel: "hotels",
    priceLabel: "/night",
    accentColor: "amber",
    hoverBorder: "hover:border-amber-500/50",
    hoverShadow: "hover:shadow-amber-500/20",
  },
  cars: {
    title: "Popular Pickup Locations",
    subtitle: "Rent a car at top destinations across the US",
    countLabel: "cars available",
    priceLabel: "/day",
    accentColor: "violet",
    hoverBorder: "hover:border-violet-500/50",
    hoverShadow: "hover:shadow-violet-500/20",
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
  const data = destinationData[service];

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
          {data.map((dest) => {
            const photo = destinationPhotos[dest.cityKey];
            
            return (
              <div
                key={dest.city}
                className={cn(
                  "overflow-hidden group cursor-pointer transition-all duration-200 rounded-xl",
                  "hover:-translate-y-1 hover:shadow-lg border border-border/50",
                  config.hoverBorder,
                  config.hoverShadow
                )}
                onClick={() => onSelect?.(dest.city)}
              >
                {/* 1:1 Photo Tile */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={photo?.src}
                    alt={photo?.alt || `${dest.city} destination`}
                    width={photo?.width || 400}
                    height={photo?.height || 400}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                  
                  {/* Trending Badge */}
                  {dest.trending && (
                    <Badge className={cn(
                      "absolute top-2 right-2 text-[10px] text-white border-0 shadow-lg",
                      config.accentColor === 'sky' && "bg-sky-500",
                      config.accentColor === 'amber' && "bg-amber-500",
                      config.accentColor === 'violet' && "bg-violet-500"
                    )}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-primary transition-colors">
                      {dest.city}
                    </h3>
                    <p className="text-white/70 text-xs mb-2">{dest.country}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">
                        {dest.count.toLocaleString()} {config.countLabel}
                      </span>
                      <span className={cn(
                        "text-sm font-bold",
                        config.accentColor === 'sky' && "text-sky-400",
                        config.accentColor === 'amber' && "text-amber-400",
                        config.accentColor === 'violet' && "text-violet-400"
                      )}>
                        ${dest.priceFrom}{config.priceLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
