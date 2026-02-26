import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  Calendar, 
  Star, 
  ArrowRight,
  Clock,
  TrendingUp,
  Sparkles,
  Heart,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlightFeaturedDestinationsProps {
  className?: string;
  onSelectDestination?: (city: string, code: string) => void;
}

export default function FlightFeaturedDestinations({ 
  className,
  onSelectDestination 
}: FlightFeaturedDestinationsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [likedDestinations, setLikedDestinations] = useState<Set<string>>(new Set());

  const featuredDestinations = [
    {
      id: "paris",
      city: "Paris",
      country: "France",
      code: "CDG",
      price: 449,
      originalPrice: 599,
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop",
      rating: 4.9,
      reviews: 12500,
      flightTime: "7h 30m",
      badge: "Most Popular",
      badgeColor: "bg-sky-500",
      highlight: "Romantic getaway with direct flights",
      tags: ["Culture", "Food", "Romance"],
    },
    {
      id: "tokyo",
      city: "Tokyo",
      country: "Japan",
      code: "NRT",
      price: 799,
      originalPrice: 1099,
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop",
      rating: 4.8,
      reviews: 9800,
      flightTime: "13h 45m",
      badge: "Best Value",
      badgeColor: "bg-emerald-500",
      highlight: "Cherry blossom season specials",
      tags: ["Technology", "Culture", "Food"],
    },
    {
      id: "dubai",
      city: "Dubai",
      country: "UAE",
      code: "DXB",
      price: 549,
      originalPrice: 749,
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop",
      rating: 4.9,
      reviews: 15200,
      flightTime: "14h 20m",
      badge: "Luxury",
      badgeColor: "bg-amber-500",
      highlight: "Premium cabin upgrades available",
      tags: ["Luxury", "Shopping", "Beach"],
    },
    {
      id: "bali",
      city: "Bali",
      country: "Indonesia",
      code: "DPS",
      price: 699,
      originalPrice: 899,
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop",
      rating: 4.7,
      reviews: 8600,
      flightTime: "18h 30m",
      badge: "Trending",
      badgeColor: "bg-pink-500",
      highlight: "Paradise beaches await",
      tags: ["Beach", "Nature", "Wellness"],
    },
    {
      id: "london",
      city: "London",
      country: "United Kingdom",
      code: "LHR",
      price: 399,
      originalPrice: 549,
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop",
      rating: 4.8,
      reviews: 18900,
      flightTime: "7h 00m",
      badge: "Flash Sale",
      badgeColor: "bg-orange-500",
      highlight: "West End shows included packages",
      tags: ["Culture", "History", "Theatre"],
    },
    {
      id: "maldives",
      city: "Maldives",
      country: "Maldives",
      code: "MLE",
      price: 899,
      originalPrice: 1299,
      image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=400&fit=crop",
      rating: 5.0,
      reviews: 6200,
      flightTime: "16h 15m",
      badge: "Honeymoon",
      badgeColor: "bg-rose-500",
      highlight: "Overwater villa packages",
      tags: ["Luxury", "Beach", "Romance"],
    },
  ];

  const toggleLike = (id: string) => {
    setLikedDestinations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <section className={cn("py-16 relative overflow-hidden", className)}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-500 border-sky-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Featured Destinations
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Explore Dream Destinations
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Handpicked destinations with exclusive deals and premium experiences
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start md:self-auto">
            View All Destinations
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Featured Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDestinations.map((dest, index) => (
            <Card
              key={dest.id}
              className={cn(
                "group relative overflow-hidden border-0 cursor-pointer transition-all duration-500",
                "hover:shadow-2xl hover:shadow-sky-500/20 hover:-translate-y-1.5",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredId(dest.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectDestination?.(dest.city, dest.code)}
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.city}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-700",
                    hoveredId === dest.id ? "scale-110" : "scale-100"
                  )}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                
                {/* Badge */}
                <Badge className={cn(
                  "absolute top-4 left-4 text-primary-foreground font-semibold",
                  dest.badgeColor
                )}>
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  {dest.badge}
                </Badge>

                {/* Like Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(dest.id);
                  }}
                  className={cn(
                    "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    likedDestinations.has(dest.id)
                      ? "bg-rose-500 text-primary-foreground"
                      : "bg-background/80 backdrop-blur-sm text-foreground hover:bg-background"
                  )}
                >
                  <Heart className={cn(
                    "w-5 h-5",
                    likedDestinations.has(dest.id) && "fill-current"
                  )} />
                </button>

                {/* Price Tag */}
                <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-xl px-4 py-2 text-right">
                  <p className="text-xs text-muted-foreground line-through">${dest.originalPrice}</p>
                  <p className="text-2xl font-bold text-sky-500">${dest.price}</p>
                </div>
              </div>

              <CardContent className="p-5">
                {/* Location */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      {dest.city}
                      <span className="text-sm font-normal text-muted-foreground">({dest.code})</span>
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      {dest.country}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold">{dest.rating}</span>
                    <span className="text-xs text-muted-foreground">({(dest.reviews / 1000).toFixed(1)}k)</span>
                  </div>
                </div>

                {/* Highlight */}
                <p className="text-sm text-muted-foreground mb-3">{dest.highlight}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {dest.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {dest.flightTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Plane className="w-4 h-4" />
                      Direct
                    </div>
                  </div>
                  <Button size="sm" className="gap-1 bg-gradient-to-r from-sky-500 to-blue-600">
                    Book Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
