import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, ChevronLeft, ChevronRight, MapPin, CheckCircle, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stories = [
  {
    id: 1,
    name: "Michael Rodriguez",
    location: "Austin, TX",
    avatar: "👨‍🦱",
    rating: 5,
    title: "Perfect road trip experience!",
    review: "Rented a Jeep for our Grand Canyon trip. Pickup was seamless, car was spotless, and the unlimited mileage let us explore freely. Best rental experience I've had!",
    vehicle: "Jeep Wrangler",
    tripType: "Road Trip",
    verified: true,
  },
  {
    id: 2,
    name: "Lisa Park",
    location: "Seattle, WA",
    avatar: "👩‍💻",
    rating: 5,
    title: "Business travel made easy",
    review: "Needed a reliable car for client meetings. The Mercedes was immaculate and the premium service matched. Express checkout saved me so much time!",
    vehicle: "Mercedes E-Class",
    tripType: "Business",
    verified: true,
  },
  {
    id: 3,
    name: "The Williams Family",
    location: "Chicago, IL",
    avatar: "👨‍👩‍👧‍👦",
    rating: 5,
    title: "Family vacation made perfect",
    review: "The minivan had everything we needed for our week-long Florida trip. Kids loved the entertainment system, and the free car seats were a huge plus!",
    vehicle: "Toyota Sienna",
    tripType: "Family Vacation",
    verified: true,
  },
];

const CarCustomerStories = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const current = stories[currentIndex];

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
            <Star className="w-3 h-3 mr-1 fill-current" /> Customer Stories
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Happy Drivers, Happy Journeys
          </h2>
          <p className="text-muted-foreground">Real experiences from verified renters</p>
        </div>

        <div className="relative">
          {/* Main Story Card */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-10">
            <Quote className="w-10 h-10 text-primary/20 mb-4" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl">{current.avatar}</div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-lg">{current.name}</h4>
                  {current.verified && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified Renter
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {current.location}
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: current.rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>

            <h3 className="text-xl font-bold mb-3 text-foreground">
              "{current.title}"
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {current.review}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  <span className="font-semibold text-primary">{current.vehicle}</span>
                  <span className="text-muted-foreground"> • {current.tripType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex gap-2">
              {stories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentIndex 
                      ? "w-8 bg-primary" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % stories.length)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarCustomerStories;
