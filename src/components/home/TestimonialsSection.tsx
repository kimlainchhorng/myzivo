/**
 * Testimonials Section - Customer reviews carousel
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Sarah M.",
    location: "New York, USA",
    rating: 5,
    text: "ZIVO made booking my family vacation incredibly easy. The price comparison saved us over $200 on flights alone. The checkout was seamless and secure.",
    avatar: "SM",
    service: "Flights",
  },
  {
    name: "Carlos R.",
    location: "Miami, USA",
    rating: 5,
    text: "I love the price alerts feature. Got notified when my dream trip to Tokyo dropped in price and booked it instantly. Best travel platform I've used.",
    avatar: "CR",
    service: "Price Alerts",
  },
  {
    name: "Emily T.",
    location: "Los Angeles, USA",
    rating: 5,
    text: "Finally a travel site that doesn't hide fees. What I saw was what I paid. The hotel options were excellent and booking took less than 2 minutes.",
    avatar: "ET",
    service: "Hotels",
  },
  {
    name: "James K.",
    location: "Chicago, USA",
    rating: 4,
    text: "Great selection of car rentals. The flexible search with nearby airports found me a deal I wouldn't have found elsewhere. Highly recommend ZIVO.",
    avatar: "JK",
    service: "Car Rentals",
  },
  {
    name: "Aisha P.",
    location: "Houston, USA",
    rating: 5,
    text: "Customer support was phenomenal when I needed to make changes to my booking. They responded within minutes. This is what premium service looks like.",
    avatar: "AP",
    service: "Support",
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-advance every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  };

  const next = () => {
    setDirection(1);
    setCurrent((c) => (c + 1) % testimonials.length);
  };

  const t = testimonials[current];

  return (
    <section className="py-16 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-primary">Trusted by Travelers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">What our travelers say</h2>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Testimonial Card */}
          <div className="relative min-h-[280px] flex items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction * 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full"
              >
                <div className="rounded-3xl bg-card/60 backdrop-blur-sm border border-border/50 p-8 sm:p-10 glow-border-hover text-center relative">
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-primary/20 mx-auto mb-4" />

                  {/* Stars */}
                  <div className="flex justify-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-5 h-5",
                          i < t.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-foreground/90 text-base sm:text-lg leading-relaxed mb-6 max-w-xl mx-auto">
                    "{t.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-sm font-bold text-primary">
                      {t.avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.location} · {t.service}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Nav arrows */}
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  i === current
                    ? "bg-primary scale-110 shadow-[0_0_8px_hsl(142_71%_45%/0.5)]"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
