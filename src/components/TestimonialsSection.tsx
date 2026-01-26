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
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-rides/5 via-transparent to-transparent opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Loved by <span className="text-gradient-rides">millions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our customers, drivers, and partners have to say about ZIVO
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-12 animate-fade-in">
          <div className="glass-card p-8 lg:p-12 rounded-3xl relative">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-rides/20" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-6 h-6 fill-rides text-rides" 
                  />
                ))}
              </div>

              <p className="text-xl lg:text-2xl text-foreground font-medium mb-8 leading-relaxed">
                "{testimonials[activeIndex].text}"
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl">
                    {testimonials[activeIndex].avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonials[activeIndex].name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonials[activeIndex].role} • {testimonials[activeIndex].location}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getServiceColor(testimonials[activeIndex].service)}`}>
                  {testimonials[activeIndex].service}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mb-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'w-8 bg-rides' 
                  : 'bg-muted hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Testimonial Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`glass-card p-6 hover:border-white/20 transition-all duration-300 animate-fade-in ${
                index === activeIndex % 3 ? 'border-rides/30' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-rides text-rides" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 line-clamp-3">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
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
