import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Business Traveler",
    avatar: "SM",
    rating: 5,
    text: "ZIVO has completely transformed how I travel for work. The seamless booking experience and instant confirmations save me hours every week.",
    service: "Flights & Hotels",
    location: "New York, USA",
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Food Enthusiast",
    avatar: "MC",
    rating: 5,
    text: "The food delivery is incredibly fast and the restaurant selection is amazing. I've discovered so many new favorites through ZIVO Eats!",
    service: "Food Delivery",
    location: "San Francisco, USA",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "Frequent Rider",
    avatar: "ER",
    rating: 5,
    text: "Safe, reliable, and always on time. The drivers are professional and the app is so easy to use. Best ride service I've ever used.",
    service: "Rides",
    location: "Miami, USA",
  },
  {
    id: 4,
    name: "James Thompson",
    role: "Vacation Planner",
    avatar: "JT",
    rating: 5,
    text: "Booked my entire family vacation through ZIVO - flights, hotels, and car rental. Everything was perfect and we saved over $800!",
    service: "Full Travel Package",
    location: "London, UK",
  },
  {
    id: 5,
    name: "Priya Sharma",
    role: "Weekend Explorer",
    avatar: "PS",
    rating: 5,
    text: "The car rental process is so smooth! Pick up and drop off was a breeze. Will definitely use ZIVO for all my road trips.",
    service: "Car Rental",
    location: "Toronto, Canada",
  },
];

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-current" />
            Customer Reviews
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Loved by <span className="text-primary">Millions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join our community of satisfied travelers and discover why ZIVO is the trusted choice
          </p>
        </div>

        {/* Main Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Quote Icon */}
            <Quote className="absolute -top-4 -left-4 w-16 h-16 text-primary/20" />
            
            {/* Testimonial Card */}
            <div className="p-8 md:p-12 rounded-3xl bg-card/50 backdrop-blur-xl border border-border/50 relative overflow-hidden">
              {/* Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-teal-400 to-cyan-400" />
              
              {/* Content */}
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-2xl font-bold text-white">
                    {testimonials[currentIndex].avatar}
                  </div>
                </div>
                
                {/* Text */}
                <div className="flex-1">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-lg md:text-xl text-foreground mb-6 leading-relaxed">
                    "{testimonials[currentIndex].text}"
                  </p>
                  
                  {/* Author */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <h4 className="font-semibold text-lg">{testimonials[currentIndex].name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonials[currentIndex].role}</p>
                    </div>
                    <div className="hidden md:block w-px h-10 bg-border" />
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                        {testimonials[currentIndex].service}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                        {testimonials[currentIndex].location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                className="rounded-full w-12 h-12"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentIndex(index);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-primary w-8"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="rounded-full w-12 h-12"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: "4.9", label: "App Rating", suffix: "/5" },
            { value: "2M+", label: "Happy Customers", suffix: "" },
            { value: "98%", label: "Satisfaction Rate", suffix: "" },
            { value: "150+", label: "Countries Served", suffix: "" },
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 rounded-xl bg-card/30 border border-border/30">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {stat.value}<span className="text-muted-foreground">{stat.suffix}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
