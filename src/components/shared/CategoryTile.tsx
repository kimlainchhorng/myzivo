import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type TileAspectRatio = "16:9" | "4:3" | "1:1" | "3:2";

interface CategoryTileProps {
  image: string;
  title: string;
  subtitle?: string;
  href: string;
  badge?: string;
  aspectRatio?: TileAspectRatio;
  className?: string;
  overlay?: "light" | "dark" | "gradient";
}

const aspectRatioMap: Record<TileAspectRatio, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "3:2": "aspect-[3/2]",
};

/**
 * CategoryTile - Reusable image tile for destinations, car categories, etc.
 * 
 * @example
 * <CategoryTile
 *   image={parisImage}
 *   title="Paris"
 *   subtitle="From $299"
 *   href="/flights?to=CDG"
 *   badge="Popular"
 * />
 */
export function CategoryTile({
  image,
  title,
  subtitle,
  href,
  badge,
  aspectRatio = "4:3",
  className,
  overlay = "gradient",
}: CategoryTileProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group relative block overflow-hidden rounded-2xl",
        "transition-all duration-200 hover:shadow-xl hover:-translate-y-1.5",
        className
      )}
    >
      {/* Image Container */}
      <div className={cn("relative", aspectRatioMap[aspectRatio])}>
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0",
            overlay === "gradient" && "bg-gradient-to-t from-black/70 via-black/20 to-transparent",
            overlay === "dark" && "bg-black/40 group-hover:bg-black/50 transition-all duration-200",
            overlay === "light" && "bg-white/20"
          )}
        />

        {/* Badge */}
        {badge && (
          <Badge
            className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] px-2 py-0.5"
          >
            {badge}
          </Badge>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display font-bold text-white text-lg leading-tight drop-shadow-md">
            {title}
          </h3>
          {subtitle && (
            <p className="text-white/80 text-sm mt-1 drop-shadow-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default CategoryTile;
