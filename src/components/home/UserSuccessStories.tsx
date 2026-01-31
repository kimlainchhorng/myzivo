import { useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, Verified } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const stories = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Frequent Traveler",
    avatar: "SM",
    rating: 5,
    story: "ZIVO transformed how I travel. I saved over $2,000 on flights last year alone. The price alerts are a game-changer!",
    service: "Flights",
    savings: "$2,400",
    verified: true,
  },
  {
    id: 2,
    name: "James Rodriguez",
    role: "Business Executive",
    avatar: "JR",
    rating: 5,
    story: "The reliability of ZIVO rides for my daily commute is unmatched. Professional drivers, always on time.",
    service: "Rides",
    trips: "500+",
    verified: true,
  },
  {
    id: 3,
    name: "Emily Chen",
    role: "Food Enthusiast",
    avatar: "EC",
    rating: 5,
    story: "As a foodie, I love discovering new restaurants through ZIVO Eats. The delivery is always fast and fresh!",
    service: "Food",
    orders: "200+",
    verified: true,
  },
  {
    id: 4,
    name: "Michael Park",
    role: "Family Vacationer",
    avatar: "MP",
    rating: 5,
    story: "Booked our entire family vacation through ZIVO - flights, hotels, and car rental. Seamless experience!",
    service: "Hotels",
    savings: "$1,800",
    verified: true,
  },
  {
    id: 5,
    name: "Lisa Thompson",
    role: "Weekend Explorer",
    avatar: "LT",
    rating: 5,
    story: "The car rental comparison saved me hours of research. Found a luxury SUV at economy prices!",
    service: "Cars",
    savings: "$450",
    verified: true,
  },
];

const UserSuccessStories = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextStory = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const prevStory = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const currentStory = stories[currentIndex];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Success Stories</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Loved by Millions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real stories from real travelers who made ZIVO their go-to platform
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-card/80 to-card/40 border border-border/50 backdrop-blur-xl">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-primary/20" />

            <div className="text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-2xl font-bold text-white">
                  {currentStory.avatar}
                </div>
                {currentStory.verified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                    <Verified className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center justify-center gap-1 mb-4">
                {Array.from({ length: currentStory.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-xl md:text-2xl font-medium mb-6 leading-relaxed">
                "{currentStory.story}"
              </p>

              {/* Author */}
              <div className="mb-6">
                <p className="font-bold text-lg">{currentStory.name}</p>
                <p className="text-sm text-muted-foreground">{currentStory.role}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-6">
                <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="font-bold text-primary">{currentStory.service}</p>
                </div>
                {currentStory.savings && (
                  <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-muted-foreground">Saved</p>
                    <p className="font-bold text-green-400">{currentStory.savings}</p>
                  </div>
                )}
                {currentStory.trips && (
                  <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-muted-foreground">Trips</p>
                    <p className="font-bold text-blue-400">{currentStory.trips}</p>
                  </div>
                )}
                {currentStory.orders && (
                  <div className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="font-bold text-orange-400">{currentStory.orders}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevStory}
                className="rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-2">
                {stories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
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
                onClick={nextStory}
                className="rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserSuccessStories;
