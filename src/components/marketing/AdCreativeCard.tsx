import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plane, Hotel, CarFront, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Import ad images
import adFlights from "@/assets/ad-flights-1.jpg";
import adHotels from "@/assets/ad-hotels-1.jpg";
import adCars from "@/assets/ad-cars-1.jpg";

/**
 * AD CREATIVE CARD - Social/Display Ad Style Component
 * Clean, minimal text overlay on premium imagery
 * CTA-ready but not aggressive
 */

export type AdVariant = "flights" | "hotels" | "cars";

interface AdCreativeCardProps {
  variant: AdVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const adContent: Record<AdVariant, {
  headline: string;
  subtext: string;
  cta: string;
  href: string;
  icon: LucideIcon;
  image: string;
  accentColor: string;
}> = {
  flights: {
    headline: "Compare Flights Worldwide",
    subtext: "Search & Compare Before You Book",
    cta: "Search Flights",
    href: "/book-flight",
    icon: Plane,
    image: adFlights,
    accentColor: "from-sky-500 to-blue-600",
  },
  hotels: {
    headline: "Find Hotels Anywhere",
    subtext: "Compare Real-Time Hotel Prices",
    cta: "Search Hotels",
    href: "/book-hotel",
    icon: Hotel,
    image: adHotels,
    accentColor: "from-amber-500 to-orange-500",
  },
  cars: {
    headline: "Compare Car Rentals Worldwide",
    subtext: "Rent Smarter. Compare First.",
    cta: "Rent a Car",
    href: "/rent-car",
    icon: CarFront,
    image: adCars,
    accentColor: "from-violet-500 to-purple-600",
  },
};

export default function AdCreativeCard({ variant, size = "md", className }: AdCreativeCardProps) {
  const content = adContent[variant];
  const Icon = content.icon;

  const sizeClasses = {
    sm: "h-48",
    md: "h-64 sm:h-80",
    lg: "h-80 sm:h-96",
  };

  return (
    <Link 
      to={content.href}
      className={cn(
        "group block relative overflow-hidden rounded-2xl sm:rounded-3xl",
        sizeClasses[size],
        className
      )}
    >
      {/* Background Image */}
      <img
        src={content.image}
        alt={content.headline}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full p-6 sm:p-8 flex flex-col justify-end">
        {/* Brand Badge */}
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit mb-4",
          "bg-gradient-to-r text-white text-xs font-bold",
          content.accentColor
        )}>
          <Icon className="w-3.5 h-3.5" />
          <span>ZIVO</span>
        </div>

        {/* Headline */}
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
          {content.headline}
        </h3>
        <p className="text-white/80 text-sm sm:text-base mb-4 max-w-xs">
          {content.subtext}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
          <span>{content.cta}</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent",
        "group-hover:border-white/30 transition-colors duration-300"
      )} />
    </Link>
  );
}
