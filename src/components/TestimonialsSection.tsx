import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    role: "Daily Commuter",
    avatar: "👩‍💼",
    rating: 5,
    text: "ZIVO has completely changed how I commute. The drivers are professional, and the app is so intuitive. I can't imagine going back to traditional taxis!",
    service: "Rides",
    location: "New York, NY",
  },
  {
    id: 2,
    name: "Michael T.",
    role: "Food Enthusiast",
    avatar: "👨‍🍳",
    rating: 5,
    text: "The food delivery is incredibly fast, and the restaurant selection is amazing. I've discovered so many new favorite spots through ZIVO Eats!",
    service: "Eats",
    location: "Los Angeles, CA",
  },
  {
    id: 3,
    name: "Emily R.",
    role: "Business Traveler",
    avatar: "👩‍💻",
    rating: 5,
    text: "Booking flights and hotels together through ZIVO saved me hours of planning and hundreds of dollars. The bundle deals are unbeatable!",
    service: "Travel",
    location: "Chicago, IL",
  },
  {
    id: 4,
    name: "David K.",
    role: "Driver Partner",
    avatar: "👨‍✈️",
    rating: 5,
    text: "As a driver, ZIVO gives me the flexibility I need. The instant payouts are a game-changer, and I love being my own boss.",
    service: "Driver",
    location: "Miami, FL",
  },
  {
    id: 5,
    name: "Jessica L.",
    role: "Weekend Explorer",
    avatar: "👩‍🎨",
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

const getServiceColor = (service: string) => {
  switch (service) {
    case "Rides":
      return "bg-rides/10 text-rides";
    case "Eats":
      return "bg-eats/10 text-eats";
    case "Travel":
      return "bg-sky-500/10 text-sky-500";
    case "Driver":
      return "bg-emerald-500/10 text-emerald-500";
    case "Car Rental":
      return "bg-amber-500/10 text-amber-500";
    case "Partner":
      return "bg-purple-500/10 text-purple-500";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 sm:py-16 lg:py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-rides/5 via-transparent to-transparent opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fade-in">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Loved by <span className="text-gradient-rides">millions</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            See what our customers, drivers, and partners have to say about ZIVO
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12 animate-fade-in">
          <div className="glass-card p-5 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl relative">
            <Quote className="absolute top-4 left-4 sm:top-6 sm:left-6 w-8 h-8 sm:w-12 sm:h-12 text-rides/20" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-0.5 sm:gap-1 mb-4 sm:mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 fill-rides text-rides" 
                  />
                ))}
              </div>

              <p className="text-base sm:text-lg lg:text-2xl text-foreground font-medium mb-5 sm:mb-8 leading-relaxed">
                "{testimonials[activeIndex].text}"
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-muted flex items-center justify-center text-xl sm:text-2xl">
                    {testimonials[activeIndex].avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm sm:text-base">{testimonials[activeIndex].name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {testimonials[activeIndex].role} • {testimonials[activeIndex].location}
                    </p>
                  </div>
                </div>
                <span className={`self-start sm:self-auto px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getServiceColor(testimonials[activeIndex].service)}`}>
                  {testimonials[activeIndex].service}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 touch-manipulation ${
                index === activeIndex 
                  ? 'w-6 sm:w-8 bg-rides' 
                  : 'w-2 sm:w-2.5 bg-muted hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Testimonial Grid - Hidden on mobile for cleaner experience */}
        <div className="hidden sm:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`glass-card p-5 sm:p-6 hover:border-white/20 active:scale-[0.98] transition-all duration-300 animate-fade-in touch-manipulation ${
                index === activeIndex % 3 ? 'border-rides/30' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-rides text-rides" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-3">"{testimonial.text}"</p>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center text-base sm:text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium text-foreground text-xs sm:text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
