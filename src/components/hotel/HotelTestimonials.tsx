import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, ChevronLeft, ChevronRight, MapPin, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    location: "New York, USA",
    avatar: "👩‍💼",
    rating: 5,
    title: "Best hotel experience ever!",
    review: "The room was immaculate, staff incredibly attentive, and the location couldn't be better. Will definitely be returning on my next trip!",
    hotelName: "Grand Plaza Hotel",
    stayDate: "January 2024",
    verified: true,
  },
  {
    id: 2,
    name: "James Chen",
    location: "San Francisco, USA",
    avatar: "👨‍💻",
    rating: 5,
    title: "Exceeded all expectations",
    review: "From the moment I checked in, everything was perfect. The concierge helped me plan an amazing city tour. Five stars all the way!",
    hotelName: "Skyline Suites",
    stayDate: "December 2023",
    verified: true,
  },
  {
    id: 3,
    name: "Emma Thompson",
    location: "London, UK",
    avatar: "👩‍🎨",
    rating: 5,
    title: "Luxury at its finest",
    review: "The spa facilities were world-class and the restaurant served some of the best food I've had in any hotel. Truly a memorable stay.",
    hotelName: "Royal Gardens Resort",
    stayDate: "February 2024",
    verified: true,
  },
];

const HotelTestimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const current = testimonials[currentIndex];

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-amber-500/5 to-transparent">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Star className="w-3 h-3 mr-1 fill-current" /> Guest Reviews
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            What Guests Are Saying
          </h2>
          <p className="text-muted-foreground">Real reviews from verified hotel guests</p>
        </div>

        <div className="relative">
          {/* Main Testimonial Card */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-10">
            <Quote className="w-10 h-10 text-amber-500/20 mb-4" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl">{current.avatar}</div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-lg">{current.name}</h4>
                  {current.verified && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified
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
                <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
              ))}
            </div>

            <h3 className="text-xl font-bold mb-3 text-foreground">
              "{current.title}"
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {current.review}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="text-sm">
                <span className="text-muted-foreground">Stayed at </span>
                <span className="font-semibold text-amber-500">{current.hotelName}</span>
                <span className="text-muted-foreground"> • {current.stayDate}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="rounded-full w-10 h-10 active:scale-[0.90] transition-all duration-200 touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-200 touch-manipulation",
                    index === currentIndex 
                      ? "w-8 bg-amber-500" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
              className="rounded-full w-10 h-10 active:scale-[0.90] transition-all duration-200 touch-manipulation"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelTestimonials;
