import { Star, Quote, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    role: "Daily Commuter",
    avatar: "SM",
    rating: 5,
    text: "ZIVO has completely changed how I commute. The drivers are professional, and the app is so intuitive. I can't imagine going back to traditional taxis!",
    service: "Rides",
    location: "New York, NY",
  },
  {
    id: 2,
    name: "Michael T.",
    role: "Food Enthusiast",
    avatar: "MT",
    rating: 5,
    text: "The food delivery is incredibly fast, and the restaurant selection is amazing. I've discovered so many new favorite spots through ZIVO Eats!",
    service: "Eats",
    location: "Los Angeles, CA",
  },
  {
    id: 3,
    name: "Emily R.",
    role: "Business Traveler",
    avatar: "ER",
    rating: 5,
    text: "Booking flights and hotels together through ZIVO saved me hours of planning and hundreds of dollars. The bundle deals are unbeatable!",
    service: "Travel",
    location: "Chicago, IL",
  },
  {
    id: 4,
    name: "David K.",
    role: "Driver Partner",
    avatar: "DK",
    rating: 5,
    text: "As a driver, ZIVO gives me the flexibility I need. The instant payouts are a game-changer, and I love being my own boss.",
    service: "Driver",
    location: "Miami, FL",
  },
  {
    id: 5,
    name: "Jessica L.",
    role: "Weekend Explorer",
    avatar: "JL",
    rating: 5,
    text: "Renting a car through ZIVO was seamless. No hidden fees, easy pickup, and the car was exactly what I needed for my road trip!",
    service: "Car Rental",
    location: "Austin, TX",
  },
  {
    id: 6,
    name: "Robert H.",
    role: "Restaurant Owner",
    avatar: "👨‍🍳",
    rating: 5,
    text: "Partnering with ZIVO Eats doubled our delivery orders. Their platform is easy to manage, and customer support is top-notch!",
    service: "Partner",
    location: "Seattle, WA",
  },
];

const getServiceConfig = (service: string) => {
  switch (service) {
    case "Rides":
      return { gradient: "from-primary to-teal-400", bg: "bg-primary/10", text: "text-primary" };
    case "Eats":
      return { gradient: "from-eats to-orange-500", bg: "bg-eats/10", text: "text-eats" };
    case "Travel":
      return { gradient: "from-sky-500 to-blue-500", bg: "bg-sky-500/10", text: "text-sky-500" };
    case "Driver":
      return { gradient: "from-emerald-500 to-green-500", bg: "bg-emerald-500/10", text: "text-emerald-500" };
    case "Car Rental":
      return { gradient: "from-amber-500 to-orange-500", bg: "bg-amber-500/10", text: "text-amber-500" };
    case "Partner":
      return { gradient: "from-violet-500 to-purple-500", bg: "bg-violet-500/10", text: "text-violet-500" };
    default:
      return { gradient: "from-primary to-teal-400", bg: "bg-muted", text: "text-muted-foreground" };
  }
};

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const goNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsTransitioning(false), 400);
  };
  
  const goPrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const currentTestimonial = testimonials[activeIndex];
  const serviceConfig = getServiceConfig(currentTestimonial.service);

  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/12 via-transparent to-transparent opacity-50" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-eats/20 to-orange-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-violet-500/20 to-purple-500/15 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-gradient-radial from-primary/12 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-gradient-radial from-sky-500/10 to-transparent rounded-full blur-3xl" />
      
      {/* Static floating elements */}
      <div className="absolute top-32 left-[10%] hidden lg:block opacity-40 animate-float"><Star className="w-10 h-10 text-amber-400" /></div>
      <div className="absolute bottom-40 right-[8%] hidden lg:block opacity-30 animate-float-delayed"><Quote className="w-8 h-8 text-muted-foreground" /></div>
      <div className="absolute top-1/2 right-[12%] hidden lg:block opacity-25 animate-float"><Sparkles className="w-8 h-8 text-pink-400" /></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-eats/15 border border-primary/25 text-sm font-bold mb-6 shadow-lg shadow-primary/10 animate-in zoom-in-95 duration-300">
            <Sparkles className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-muted-foreground">Customer Stories</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 px-2">
            Loved by{" "}
            <span className="bg-gradient-to-r from-primary via-teal-400 to-eats bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              millions
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
            See what our customers, drivers, and partners have to say about ZIVO
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-10 sm:mb-14">
          <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
            <div className="p-6 sm:p-10 lg:p-14 rounded-3xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-2xl relative overflow-hidden">
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none animate-border-glow" />
              
              {/* Shine sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none animate-shine" />
              
              {/* Decorative quote */}
              <div className={cn(
                "absolute top-4 left-4 sm:top-6 sm:left-6 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center opacity-10",
                serviceConfig.gradient
              )}>
                <Quote className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              
              {/* Corner glow */}
              <div className={cn(
                "absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br rounded-full blur-3xl opacity-20 animate-pulse-slow",
                serviceConfig.gradient
              )} />
              
              <div
                key={activeIndex}
                className={cn(
                  "relative z-10 transition-all duration-400",
                  isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                )}
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-6 sm:mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 fill-current animate-in zoom-in-50",
                        serviceConfig.text
                      )} 
                      style={{ animationDelay: `${i * 75}ms`, animationFillMode: 'both' }}
                    />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-foreground font-medium mb-8 sm:mb-10 leading-relaxed">
                  "{currentTestimonial.text}"
                </p>

                {/* Author info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl sm:text-3xl shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl",
                      serviceConfig.gradient
                    )}>
                      {currentTestimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg sm:text-xl">{currentTestimonial.name}</p>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {currentTestimonial.role} • {currentTestimonial.location}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "self-start sm:self-auto px-4 py-2 rounded-full text-sm font-semibold",
                    serviceConfig.bg, serviceConfig.text
                  )}>
                    {currentTestimonial.service}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-2 sm:-mx-6">
              <button
                onClick={goPrev}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-xl flex items-center justify-center pointer-events-auto hover:border-primary/50 transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={goNext}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-xl flex items-center justify-center pointer-events-auto hover:border-primary/50 transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 sm:gap-2.5 mb-10 sm:mb-14">
          {testimonials.map((testimonial, index) => {
            const config = getServiceConfig(testimonial.service);
            return (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-2.5 sm:h-3 rounded-full transition-all duration-300 touch-manipulation hover:scale-110",
                  index === activeIndex 
                    ? `w-8 sm:w-10 bg-gradient-to-r ${config.gradient}` 
                    : 'w-2.5 sm:w-3 bg-muted hover:bg-muted-foreground/50'
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            );
          })}
        </div>

        {/* Testimonial Grid */}
        <div className="hidden sm:grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.slice(0, 3).map((testimonial, index) => {
            const config = getServiceConfig(testimonial.service);
            return (
              <div
                key={testimonial.id}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4",
                  index === activeIndex % 3 && "ring-2 ring-primary/50"
                )}
                style={{ animationDelay: `${200 + index * 75}ms`, animationFillMode: 'both' }}
              >
                {/* Corner glow */}
                <div className={cn(
                  "absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity",
                  config.gradient
                )} />
                
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className={cn("w-4 h-4 fill-current", config.text)} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg shadow-lg",
                    config.gradient
                  )}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
