import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Quote, 
  ThumbsUp, 
  CheckCircle, 
  MapPin,
  Hotel,
  ChevronLeft,
  ChevronRight,
  Award,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HotelTestimonialsSectionProps {
  className?: string;
}

export default function HotelTestimonialsSection({ className }: HotelTestimonialsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Jennifer Adams",
      role: "Business Traveler",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      location: "Chicago, USA",
      rating: 5,
      hotel: "The Grand Plaza",
      city: "New York",
      date: "1 week ago",
      review: "ZIVO made finding the perfect hotel so easy! Got an amazing rate at a 5-star property with breakfast included. The price comparison saved me over $150.",
      verified: true,
      helpful: 89,
      tier: "Gold",
    },
    {
      id: 2,
      name: "David Park",
      role: "Family Vacation",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      location: "Seattle, USA",
      rating: 5,
      hotel: "Beachfront Resort",
      city: "Miami",
      date: "2 weeks ago",
      review: "Booked a family suite for our beach vacation. The filters helped us find kid-friendly properties with pools. Excellent customer service when we needed to modify our dates!",
      verified: true,
      helpful: 124,
      tier: "Platinum",
    },
    {
      id: 3,
      name: "Maria Santos",
      role: "Romantic Getaway",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      location: "Austin, USA",
      rating: 5,
      hotel: "Boutique Villa",
      city: "Santorini",
      date: "3 weeks ago",
      review: "Found the most romantic boutique hotel in Santorini. The property photos were accurate and the location was perfect. Will definitely use ZIVO for all future trips!",
      verified: true,
      helpful: 156,
      tier: "Silver",
    },
    {
      id: 4,
      name: "Michael Thompson",
      role: "Solo Explorer",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      location: "Denver, USA",
      rating: 5,
      hotel: "City Center Hotel",
      city: "Tokyo",
      date: "1 month ago",
      review: "As a frequent traveler, I've tried many booking platforms. ZIVO consistently offers the best rates and the loyalty program rewards are fantastic. Highly recommend!",
      verified: true,
      helpful: 203,
      tier: "Platinum",
    },
  ];

  const stats = [
    { value: "4.8", label: "Avg Rating", icon: Star },
    { value: "5M+", label: "Guests Served", icon: ThumbsUp },
    { value: "97%", label: "Would Book Again", icon: CheckCircle },
    { value: "850K+", label: "Properties", icon: Hotel },
  ];

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className={cn("py-10 sm:py-16 relative overflow-hidden", className)}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent" />
      <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-orange-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30 text-xs sm:text-sm">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 fill-amber-500" />
            Guest Reviews
          </Badge>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
            Loved by Travelers Worldwide
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            See why guests choose ZIVO for their hotel bookings
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-8 sm:mb-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-3 sm:p-4 rounded-xl bg-card/50 backdrop-blur-xl border border-border/50 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-center mb-1.5 sm:mb-2">
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
          <Card className="relative overflow-hidden border-0 bg-card/80 backdrop-blur-2xl shadow-xl sm:shadow-2xl">
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />
            
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
              {/* Quote Icon */}
              <div className="absolute top-4 sm:top-6 right-4 sm:right-6 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500/50" />
              </div>

              {/* Testimonial Content */}
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0 flex md:block items-center gap-3">
                  <Avatar className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 ring-4 ring-amber-500/20">
                    <AvatarImage src={testimonials[activeIndex].avatar} />
                    <AvatarFallback>{testimonials[activeIndex].name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="md:hidden">
                    <h4 className="font-bold text-foreground text-sm">{testimonials[activeIndex].name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonials[activeIndex].role}</p>
                  </div>
                </div>

                <div className="flex-1">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2 sm:mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4 sm:w-5 sm:h-5",
                          i < testimonials[activeIndex].rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground leading-relaxed mb-3 sm:mb-4">
                    "{testimonials[activeIndex].review}"
                  </p>

                  {/* User Info */}
                  <div className="hidden md:flex flex-wrap items-center gap-4 mb-3 sm:mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground">{testimonials[activeIndex].name}</h4>
                        {testimonials[activeIndex].verified && (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {testimonials[activeIndex].tier}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{testimonials[activeIndex].role}</p>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="truncate max-w-[80px] sm:max-w-none">{testimonials[activeIndex].location}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Hotel className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="truncate max-w-[100px] sm:max-w-none">{testimonials[activeIndex].hotel}, {testimonials[activeIndex].city}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{testimonials[activeIndex].helpful} helpful</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full w-9 h-9 sm:w-10 sm:h-10 touch-manipulation active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            
            <div className="flex items-center gap-1.5 sm:gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all touch-manipulation",
                    index === activeIndex
                      ? "bg-amber-500 w-6 sm:w-8"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full w-9 h-9 sm:w-10 sm:h-10 touch-manipulation active:scale-95"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
