/**
 * Car Inventory Card Component
 * Displays a single vehicle from search results
 */

import { MapPin, Gauge, Fuel, Settings, Calendar, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CarInventoryItem } from "@/types/carInventory";
import { brandedCarModels } from "@/config/photos";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useImageLoaded } from "@/hooks/useImageLoaded";

interface CarInventoryCardProps {
  vehicle: CarInventoryItem;
}

// Map fuel types to branded car categories
const fuelToCategoryMap: Record<string, string[]> = {
  electric: ["electric"],
  hybrid: ["electric", "sedan"],
  "plug-in hybrid": ["electric", "sedan"],
  gasoline: ["sedan", "suv", "compact", "luxury"],
  diesel: ["suv", "truck"],
};

export function CarInventoryCard({ vehicle }: CarInventoryCardProps) {
  // Get a branded car image based on fuel type and vehicle ID hash
  const brandedCar = useMemo(() => {
    const categories = fuelToCategoryMap[vehicle.fuel] || ["sedan"];
    const matchingCars = brandedCarModels.filter(car => categories.includes(car.category));
    
    if (matchingCars.length === 0) return null;
    
    const hash = vehicle.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return matchingCars[hash % matchingCars.length];
  }, [vehicle.id, vehicle.fuel]);
  const { loaded, onLoad } = useImageLoaded(brandedCar?.src);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("en-US").format(mileage);
  };

  const getFuelBadgeColor = (fuel: string) => {
    switch (fuel) {
      case "electric":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "hybrid":
      case "plug-in hybrid":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <CardContent className="p-0">
        {/* Image */}
        <div className="aspect-[16/10] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
          {brandedCar ? (
            <>
              {!loaded && <div className="absolute inset-0 animate-pulse bg-muted/50" />}
              <img
                src={brandedCar.src}
                alt={`${vehicle.make?.name} ${vehicle.model?.name}`}
                onLoad={onLoad}
                className={cn(
                  "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
                  loaded ? "opacity-100" : "opacity-0"
                )}
                loading="lazy"
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          {/* Year badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm"
          >
            <Calendar className="w-3 h-3 mr-1" />
            {vehicle.year}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div>
            <h3 className="font-bold text-lg leading-tight">
              {vehicle.make?.name} {vehicle.model?.name}
            </h3>
            {vehicle.trim && (
              <p className="text-sm text-muted-foreground">{vehicle.trim}</p>
            )}
          </div>

          {/* Price */}
          <p className="text-2xl font-bold text-primary">
            {formatPrice(vehicle.price)}
          </p>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Gauge className="w-4 h-4" />
              <span>{formatMileage(vehicle.mileage)} mi</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Settings className="w-4 h-4" />
              <span className="capitalize">{vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
              <MapPin className="w-4 h-4" />
              <span>{vehicle.location_city}, {vehicle.location_state}</span>
            </div>
          </div>

          {/* Fuel Badge */}
          <Badge className={`${getFuelBadgeColor(vehicle.fuel)} capitalize`}>
            <Fuel className="w-3 h-3 mr-1" />
            {vehicle.fuel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
