import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Wifi, Waves, Dumbbell, Heart, ArrowRight, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

// Import hotel images
import hotelLuxuryPool from "@/assets/hotel-luxury-pool.jpg";
import hotelRoomLuxury from "@/assets/hotel-room-luxury.jpg";
import hotelBoutique from "@/assets/hotel-boutique.jpg";
import hotelBeachResort from "@/assets/hotel-beach-resort.jpg";

const featuredProperties = [
  {
    id: 1,
    name: "The Ritz-Carlton",
    location: "Central Park, NYC",
    image: hotelRoomLuxury,
    rating: 4.9,
    reviews: 4520,
    pricePerNight: 599,
    originalPrice: 799,
    tag: "Luxury Pick",
    amenities: ["wifi", "pool", "spa", "gym"],
    featured: true,
  },
  {
    id: 2,
    name: "Four Seasons Resort",
    location: "Beverly Hills, LA",
    image: hotelLuxuryPool,
    rating: 4.9,
    reviews: 3890,
    pricePerNight: 549,
    originalPrice: 699,
    tag: "Most Popular",
    amenities: ["wifi", "pool", "spa"],
    featured: true,
  },
  {
    id: 3,
    name: "W Hotel",
    location: "South Beach, Miami",
    image: hotelBeachResort,
    rating: 4.8,
    reviews: 2340,
    pricePerNight: 399,
    originalPrice: 499,
    tag: "Beach Front",
    amenities: ["wifi", "pool", "gym"],
    featured: false,
  },
  {
    id: 4,
    name: "Mandarin Oriental",
    location: "Las Vegas Strip",
    image: hotelBoutique,
    rating: 4.9,
    reviews: 1890,
    pricePerNight: 459,
    originalPrice: 599,
    tag: "Editor's Choice",
    amenities: ["wifi", "spa", "gym"],
    featured: false,
  },
];

interface HotelFeaturedPropertiesProps {
  onSelect?: (hotelName: string) => void;
}

const HotelFeaturedProperties = ({ onSelect }: HotelFeaturedPropertiesProps) => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProperties.map((property, index) => (
            <Card
              key={property.id}
              className={cn(
                "glass-card overflow-hidden group cursor-pointer transition-all duration-300 touch-manipulation active:scale-[0.98]",
                "hover:border-amber-500/50 hover:-translate-y-1",
                property.featured && "lg:col-span-2 lg:row-span-2"
              )}
              onClick={() => onSelect?.(property.name)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0 h-full flex flex-col">
                <div className={cn(
                  "relative overflow-hidden",
                  property.featured ? "h-48 sm:h-64" : "h-40"
                )}>
                  <img 
                    src={property.image} 
                    alt={property.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    {property.tag}
                  </Badge>
                  <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors">
                    <Heart className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                  </button>
                  {property.originalPrice && (
                    <Badge className="absolute bottom-3 right-3 bg-red-500 text-white">
                      Save ${property.originalPrice - property.pricePerNight}
                    </Badge>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-sm">{property.rating}</span>
                    <span className="text-xs text-muted-foreground">({property.reviews.toLocaleString()} reviews)</span>
                  </div>
                  <h3 className="font-display font-bold text-lg group-hover:text-amber-400 transition-colors">
                    {property.name}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                    <MapPin className="w-3 h-3" />
                    {property.location}
                  </div>

                  <div className="flex gap-2 mb-3">
                    {property.amenities.slice(0, 3).map((amenity) => (
                      <div key={amenity} className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center">
                        {amenity === "wifi" && <Wifi className="w-3.5 h-3.5 text-muted-foreground" />}
                        {amenity === "pool" && <Waves className="w-3.5 h-3.5 text-muted-foreground" />}
                        {amenity === "gym" && <Dumbbell className="w-3.5 h-3.5 text-muted-foreground" />}
                        {amenity === "spa" && <span className="text-xs">💆</span>}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-amber-400">${property.pricePerNight}</span>
                      <span className="text-xs text-muted-foreground">/night</span>
                    </div>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                      View <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotelFeaturedProperties;
