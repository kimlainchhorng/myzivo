import { Star, MapPin, Heart, ArrowRight, Crown, Sparkles, Users, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Import hotel images
import hotelLuxuryPool from "@/assets/hotel-luxury-pool.jpg";
import hotelRoomLuxury from "@/assets/hotel-room-luxury.jpg";
import hotelBoutique from "@/assets/hotel-boutique.jpg";
import hotelBeachResort from "@/assets/hotel-beach-resort.jpg";
import hotelMountainLodge from "@/assets/hotel-mountain-lodge.jpg";
import hotelSpa from "@/assets/hotel-spa.jpg";

/**
 * HOTEL IMAGE SHOWCASE
 * Premium visual grid with real hotel imagery
 * Replaces emoji placeholders with stunning photos
 */

const featuredProperties = [
  {
    id: 1,
    name: "Oceanview Infinity Resort",
    location: "Maldives",
    image: hotelLuxuryPool,
    rating: 4.9,
    reviews: 4520,
    pricePerNight: 599,
    originalPrice: 799,
    tag: "Luxury Pick",
    category: "Beach Resort",
    featured: true,
  },
  {
    id: 2,
    name: "The Metropolitan Suite",
    location: "Manhattan, NYC",
    image: hotelRoomLuxury,
    rating: 4.8,
    reviews: 3890,
    pricePerNight: 449,
    originalPrice: 599,
    tag: "City Escape",
    category: "Urban Luxury",
    featured: false,
  },
  {
    id: 3,
    name: "Le Charme Parisien",
    location: "Paris, France",
    image: hotelBoutique,
    rating: 4.9,
    reviews: 2340,
    pricePerNight: 299,
    originalPrice: 399,
    tag: "Boutique Gem",
    category: "Boutique Hotel",
    featured: false,
  },
  {
    id: 4,
    name: "Coral Bay Villas",
    location: "Bora Bora",
    image: hotelBeachResort,
    rating: 4.9,
    reviews: 1890,
    pricePerNight: 899,
    originalPrice: 1199,
    tag: "Paradise Found",
    category: "Overwater Villa",
    featured: true,
  },
  {
    id: 5,
    name: "Alpine Lodge & Spa",
    location: "Swiss Alps",
    image: hotelMountainLodge,
    rating: 4.8,
    reviews: 1650,
    pricePerNight: 389,
    originalPrice: 499,
    tag: "Winter Retreat",
    category: "Mountain Lodge",
    featured: false,
  },
  {
    id: 6,
    name: "Serenity Wellness Resort",
    location: "Bali, Indonesia",
    image: hotelSpa,
    rating: 4.9,
    reviews: 2120,
    pricePerNight: 349,
    originalPrice: 449,
    tag: "Wellness",
    category: "Spa Resort",
    featured: false,
  },
];

interface HotelImageShowcaseProps {
  onSelect?: (hotelName: string) => void;
  className?: string;
}

export default function HotelImageShowcase({ onSelect, className }: HotelImageShowcaseProps) {
  return (
    <section className={cn("py-12 sm:py-16 lg:py-20 relative overflow-hidden", className)}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-orange-500/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
            <Crown className="w-4 h-4" />
            Hand-Picked Selection
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Featured <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Luxury Properties</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Curated stays with exceptional ratings and world-class amenities
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredProperties.map((property, index) => (
            <div
              key={property.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer",
                "transition-all duration-500 hover:-translate-y-1",
                property.featured && "sm:col-span-2 lg:col-span-1 lg:row-span-2",
                property.featured ? "h-80 sm:h-96 lg:h-full" : "h-64 sm:h-72"
              )}
              onClick={() => onSelect?.(property.name)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Image */}
              <img
                src={property.image}
                alt={property.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
              
              {/* Top Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-primary-foreground border-0 shadow-lg">
                  {property.tag}
                </Badge>
                <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-all duration-200 group/heart">
                  <Heart className="w-5 h-5 text-primary-foreground group-hover/heart:text-red-400 group-hover/heart:fill-red-400 transition-all duration-200" />
                </button>
              </div>
              
              {/* Discount Badge */}
              {property.originalPrice && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-16 sm:translate-x-0">
                  <Badge className="bg-red-500 text-primary-foreground border-0 shadow-lg animate-pulse">
                    Save ${property.originalPrice - property.pricePerNight}
                  </Badge>
                </div>
              )}
              
              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                {/* Category */}
                <span className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2 block">
                  {property.category}
                </span>
                
                {/* Title & Location */}
                <h3 className="font-display text-xl sm:text-2xl font-bold text-primary-foreground mb-1 group-hover:text-amber-200 transition-all duration-200">
                  {property.name}
                </h3>
                <div className="flex items-center gap-1 text-primary-foreground/80 text-sm mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  {property.location}
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-primary-foreground text-sm">{property.rating}</span>
                  </div>
                  <span className="text-primary-foreground/70 text-sm">({property.reviews.toLocaleString()} reviews)</span>
                </div>
                
                {/* Price & CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl sm:text-3xl font-bold text-primary-foreground">${property.pricePerNight}</span>
                    <span className="text-primary-foreground/60 text-sm">/night</span>
                    {property.originalPrice && (
                      <span className="ml-2 text-primary-foreground/40 line-through text-sm">${property.originalPrice}</span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-primary-foreground border-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Hover Border Effect */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl ring-2 ring-transparent group-hover:ring-amber-500/50 transition-all duration-200" />
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-10">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-primary-foreground shadow-lg shadow-amber-500/30 gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Explore All Properties
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
