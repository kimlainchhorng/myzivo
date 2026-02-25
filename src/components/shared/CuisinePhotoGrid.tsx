/**
 * CUISINE PHOTO GRID
 * Food category tiles for Eats page
 * Uses 1:1 aspect ratio photos
 */

import { useNavigate } from "react-router-dom";
import { restaurantPhotos, RestaurantCuisine } from "@/config/restaurantPhotos";
import { cn } from "@/lib/utils";

interface CuisinePhotoGridProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

// Cuisine categories with display names
const cuisineCategories: { key: RestaurantCuisine; label: string }[] = [
  { key: "burger", label: "Burgers" },
  { key: "sushi", label: "Japanese" },
  { key: "pizza", label: "Italian" },
  { key: "taco", label: "Mexican" },
  { key: "noodles", label: "Asian" },
  { key: "salad", label: "Healthy" },
];

export default function CuisinePhotoGrid({
  title = "Explore by Cuisine",
  subtitle,
  className,
}: CuisinePhotoGridProps) {
  const navigate = useNavigate();

  const handleClick = (cuisine: string) => {
    navigate(`/eats/restaurants?cuisine=${cuisine}`);
  };

  return (
    <section className={cn("py-12", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            {title.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="bg-gradient-to-r from-eats to-orange-400 bg-clip-text text-transparent">
              {title.split(" ").slice(-1)}
            </span>
          </h2>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {cuisineCategories.map((cuisine, index) => {
            const photo = restaurantPhotos[cuisine.key];
            return (
              <button
                key={cuisine.key}
                onClick={() => handleClick(cuisine.key)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl aspect-square",
                  "border border-border/50 bg-card/50",
                  "hover:border-eats/30 hover:shadow-lg hover:shadow-eats/20",
                  "transition-all duration-300 hover:-translate-y-1"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Photo */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={300}
                  height={300}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-115"
                />
                
                {/* Multi-layer overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-eats/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                  <h3 className="font-bold text-white text-sm group-hover:text-eats transition-colors">
                    {cuisine.label}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
