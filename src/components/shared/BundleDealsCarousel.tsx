import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plane, 
  Hotel, 
  Car, 
  ArrowRight,
  Sparkles,
  Star,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BundleDeal {
  id: string;
  destination: string;
  emoji: string;
  image: string;
  services: ("flight" | "hotel" | "car")[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  duration: string;
  rating: number;
  reviews: number;
  expiry: string;
  featured?: boolean;
}

interface BundleDealsCarouselProps {
  className?: string;
}

const bundleDeals: BundleDeal[] = [
  {
    id: "1",
    destination: "Paris Getaway",
    emoji: "🇫🇷",
    image: "bg-gradient-to-br from-rose-500/20 to-purple-500/20",
    services: ["flight", "hotel"],
    originalPrice: 1599,
    bundlePrice: 1199,
    savings: 400,
    duration: "5 nights",
    rating: 4.9,
    reviews: 2847,
    expiry: "48h left",
    featured: true,
  },
  {
    id: "2",
    destination: "Tokyo Explorer",
    emoji: "🇯🇵",
    image: "bg-gradient-to-br from-pink-500/20 to-red-500/20",
    services: ["flight", "hotel", "car"],
    originalPrice: 2890,
    bundlePrice: 2190,
    savings: 700,
    duration: "7 nights",
    rating: 4.8,
    reviews: 1923,
    expiry: "3 days left",
  },
  {
    id: "3",
    destination: "Bali Paradise",
    emoji: "🏝️",
    image: "bg-gradient-to-br from-teal-500/20 to-emerald-500/20",
    services: ["flight", "hotel"],
    originalPrice: 1899,
    bundlePrice: 1449,
    savings: 450,
    duration: "6 nights",
    rating: 4.9,
    reviews: 3421,
    expiry: "5 days left",
  },
  {
    id: "4",
    destination: "Dubai Luxury",
    emoji: "🏙️",
    image: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
    services: ["flight", "hotel", "car"],
    originalPrice: 3299,
    bundlePrice: 2499,
    savings: 800,
    duration: "4 nights",
    rating: 4.7,
    reviews: 1567,
    expiry: "24h left",
    featured: true,
  },
];

const serviceIcons = {
  flight: { icon: Plane, label: "Flight" },
  hotel: { icon: Hotel, label: "Hotel" },
  car: { icon: Car, label: "Car" },
};

const BundleDealsCarousel = ({ className }: BundleDealsCarouselProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? bundleDeals.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === bundleDeals.length - 1 ? 0 : prev + 1));
  };

  const handleBookBundle = (deal: BundleDeal) => {
    navigate("/book-flight");
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-teal-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Bundle Deals</CardTitle>
              <p className="text-sm text-muted-foreground">
                Save up to 30% on complete packages
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {bundleDeals.map((deal) => (
              <div key={deal.id} className="w-full flex-shrink-0 px-1">
                <div className={cn(
                  "relative p-4 rounded-2xl border-2 overflow-hidden",
                  deal.image,
                  deal.featured ? "border-primary" : "border-border"
                )}>
                  {/* Featured Badge */}
                  {deal.featured && (
                    <Badge className="absolute top-3 right-3 bg-primary">
                      <Star className="w-3 h-3 mr-1 fill-white" />
                      Featured
                    </Badge>
                  )}

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{deal.emoji}</span>
                    <div>
                      <h3 className="font-bold text-lg">{deal.destination}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {deal.rating}
                        </span>
                        <span>({deal.reviews.toLocaleString()} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Services Included */}
                  <div className="flex gap-2 mb-4">
                    {deal.services.map((service) => {
                      const config = serviceIcons[service];
                      return (
                        <div
                          key={service}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/80"
                        >
                          <config.icon className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-medium">{config.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Duration & Expiry */}
                  <div className="flex items-center gap-3 mb-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {deal.duration}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {deal.expiry}
                    </Badge>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground line-through">
                        ${deal.originalPrice}
                      </p>
                      <p className="text-2xl font-bold">${deal.bundlePrice}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary text-sm">
                      Save ${deal.savings}
                    </Badge>
                  </div>

                  {/* CTA */}
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-teal-500"
                    onClick={() => handleBookBundle(deal)}
                  >
                    Book This Bundle
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {bundleDeals.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === currentIndex ? "bg-primary w-6" : "bg-muted"
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BundleDealsCarousel;
