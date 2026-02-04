/**
 * TestimonialsCarousel Component
 * Customer testimonials with auto-rotation
 */

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar?: string;
  tripType?: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Sarah M.",
    location: "New York, NY",
    rating: 5,
    text: "ZIVO made booking my family vacation so easy! Found flights that were $200 cheaper than anywhere else. Will definitely use again.",
    tripType: "Family vacation to Orlando",
  },
  {
    id: "2",
    name: "Mike T.",
    location: "Los Angeles, CA",
    rating: 5,
    text: "Best travel comparison site I've used. The price alerts saved me hundreds on my Europe trip. Highly recommend!",
    tripType: "Solo trip to Europe",
  },
  {
    id: "3",
    name: "Jennifer L.",
    location: "Chicago, IL",
    rating: 5,
    text: "The hotel deals were incredible. Stayed at a 5-star resort for the price of a 3-star. ZIVO is now my go-to for all travel bookings.",
    tripType: "Honeymoon in Maldives",
  },
  {
    id: "4",
    name: "David K.",
    location: "Miami, FL",
    rating: 5,
    text: "Super easy to compare prices across different providers. Saved time and money on my business trips.",
    tripType: "Business travel",
  },
  {
    id: "5",
    name: "Amanda R.",
    location: "Seattle, WA",
    rating: 5,
    text: "Love the ZIVO Miles program! Already earned enough for a free upgrade on my next trip.",
    tripType: "Weekend getaway",
  },
];

interface TestimonialsCarouselProps {
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

export function TestimonialsCarousel({
  className,
  autoPlay = true,
  interval = 5000,
}: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const currentTestimonial = TESTIMONIALS[currentIndex];

  return (
    <section className={cn("py-16 bg-gradient-to-b from-background to-muted/30", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Loved by Travelers Worldwide
          </h2>
          <p className="text-muted-foreground">
            See what our customers say about their ZIVO experience
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-3xl mx-auto">
          {/* Quote Icon */}
          <Quote className="absolute -top-4 left-0 w-12 h-12 text-primary/10" />

          {/* Testimonial Card */}
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-lg">
            {/* Stars */}
            <div className="flex items-center justify-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-5 h-5",
                    i < currentTestimonial.rating
                      ? "text-amber-500 fill-amber-500"
                      : "text-muted"
                  )}
                />
              ))}
            </div>

            {/* Text */}
            <blockquote className="text-lg md:text-xl text-center font-medium mb-6">
              "{currentTestimonial.text}"
            </blockquote>

            {/* Author */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-bold text-lg">
                {currentTestimonial.name.charAt(0)}
              </div>
              <p className="font-semibold mt-2">{currentTestimonial.name}</p>
              <p className="text-sm text-muted-foreground">{currentTestimonial.location}</p>
              {currentTestimonial.tripType && (
                <p className="text-xs text-primary mt-1">{currentTestimonial.tripType}</p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrev}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentIndex
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12">
          {[
            { value: "4.8", label: "Average Rating" },
            { value: "50K+", label: "Happy Travelers" },
            { value: "100+", label: "Countries Served" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
