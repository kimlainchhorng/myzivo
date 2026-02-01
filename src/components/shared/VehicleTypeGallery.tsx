/**
 * VEHICLE TYPE GALLERY
 * Photo-based car/ride categories with 4:3 aspect ratio
 * Uses carCategoryPhotos config for cars, custom for rides
 */

import { useNavigate } from "react-router-dom";
import { carCategoryPhotos, CarCategory } from "@/config/photos";
import { Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleTypeGalleryProps {
  service: "cars" | "rides";
  title?: string;
  subtitle?: string;
  className?: string;
}

const serviceColors = {
  cars: {
    text: "text-violet-400",
    border: "border-violet-500/30",
    shadow: "shadow-violet-500/20",
    gradient: "from-violet-500 to-purple-600",
  },
  rides: {
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    shadow: "shadow-emerald-500/20",
    gradient: "from-emerald-500 to-teal-600",
  },
};

// Ride vehicle types with custom photos
const rideVehicleTypes = [
  {
    type: "sedan",
    label: "Sedan",
    passengers: 4,
    description: "Standard comfort",
    src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=450&fit=crop&q=75&fm=webp&auto=format",
    alt: "Sedan ride - comfortable 4-passenger vehicle",
  },
  {
    type: "suv",
    label: "SUV",
    passengers: 6,
    description: "Extra space",
    src: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&h=450&fit=crop&q=75&fm=webp&auto=format",
    alt: "SUV ride - spacious 6-passenger vehicle",
  },
  {
    type: "premium",
    label: "Premium",
    passengers: 4,
    description: "Luxury experience",
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=450&fit=crop&q=75&fm=webp&auto=format",
    alt: "Premium ride - luxury sedan experience",
  },
  {
    type: "xl",
    label: "XL",
    passengers: 8,
    description: "Group travel",
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop&q=75&fm=webp&auto=format",
    alt: "XL ride - spacious van for groups",
  },
];

// Car categories to show
const carCategories: CarCategory[] = ["economy", "compact", "suv", "luxury"];

export default function VehicleTypeGallery({
  service,
  title = service === "cars" ? "Browse by Car Type" : "Choose Your Ride",
  subtitle,
  className,
}: VehicleTypeGalleryProps) {
  const navigate = useNavigate();
  const colors = serviceColors[service];

  const vehicles = service === "cars"
    ? carCategories.map((cat) => ({
        type: cat,
        label: carCategoryPhotos[cat].label,
        passengers: carCategoryPhotos[cat].passengers,
        bags: carCategoryPhotos[cat].bags,
        src: carCategoryPhotos[cat].src,
        alt: carCategoryPhotos[cat].alt,
      }))
    : rideVehicleTypes;

  const handleClick = (vehicleType: string) => {
    if (service === "cars") {
      navigate(`/rent-car?type=${vehicleType}`);
    }
    // For rides, could scroll to form or pre-select vehicle type
  };

  return (
    <section className={cn("py-12", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            {title.split(" ").slice(0, -1).join(" ")}{" "}
            <span className={colors.text}>{title.split(" ").slice(-1)}</span>
          </h2>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {vehicles.map((vehicle, index) => (
            <button
              key={vehicle.type}
              onClick={() => handleClick(vehicle.type)}
              className={cn(
                "group relative overflow-hidden rounded-2xl",
                "border border-border/50 bg-card/50",
                "hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
                `hover:${colors.border} hover:${colors.shadow}`
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Photo (4:3 aspect) */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={vehicle.src}
                  alt={vehicle.alt}
                  width={600}
                  height={450}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
              </div>
              
              {/* Info Panel */}
              <div className="p-4 bg-card/80">
                <h3 className={cn(
                  "font-bold text-lg mb-1 transition-colors",
                  `group-hover:${colors.text}`
                )}>
                  {vehicle.label}
                </h3>
                
                {/* Specs Row */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{vehicle.passengers}</span>
                  </div>
                  {"bags" in vehicle && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{vehicle.bags}</span>
                    </div>
                  )}
                  {"description" in vehicle && (
                    <span className="text-xs">{vehicle.description}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
