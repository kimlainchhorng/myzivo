/**
 * Testimonials Section - Premium carousel with service-colored accents
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const serviceColors: Record<string, string> = {
  Flights: "bg-[hsl(var(--flights))]",
  "Price Alerts": "bg-primary",
  Hotels: "bg-[hsl(var(--hotels))]",
  "Car Rentals": "bg-[hsl(var(--cars))]",
  Support: "bg-emerald-500",
};

const testimonials = [
  { name: "Sarah Mitchell", location: "New York, USA", rating: 5, text: "ZIVO made booking my family vacation incredibly easy. The price comparison saved us over $200 on flights alone. The checkout was seamless and secure.", avatar: "SM", service: "Flights" },
  { name: "Carlos Rivera", location: "Miami, USA", rating: 5, text: "I love the price alerts feature. Got notified when my dream trip to Tokyo dropped in price and booked it instantly. Best travel platform I've used.", avatar: "CR", service: "Price Alerts" },
  { name: "Emily Thompson", location: "Los Angeles, USA", rating: 5, text: "Finally a travel site that doesn't hide fees. What I saw was what I paid. The hotel options were excellent and booking took less than 2 minutes.", avatar: "ET", service: "Hotels" },
  { name: "James Kim", location: "Chicago, USA", rating: 4, text: "Great selection of car rentals. The flexible search with nearby airports found me a deal I wouldn't have found elsewhere. Highly recommend ZIVO.", avatar: "JK", service: "Car Rentals" },
  { name: "Aisha Patel", location: "Houston, USA", rating: 5, text: "Customer support was phenomenal when I needed to make changes to my booking. They responded within minutes. This is what premium service looks like.", avatar: "AP", service: "Support" },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

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

  const prev = () => { setDirection(-1); setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length); };
  const next = () => { setDirection(1); setCurrent((c) => (c + 1) % testimonials.length); };

  const t = testimonials[current];
  const accentColor = serviceColors[t.service] || "bg-primary";

  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            What our travelers <span className="text-primary">say</span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative min-h-[300px] flex items-center">
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
                <div className="rounded-2xl bg-card border border-border/50 p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
                  {/* Service accent bar at top */}
                  <div className={cn("absolute top-0 left-0 right-0 h-1", accentColor)} />

                  <Quote className="w-8 h-8 text-primary/20 mx-auto mb-5" />

                  <div className="flex justify-center gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("w-5 h-5", i < t.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20")} />
                    ))}
                  </div>

                  <p className="text-foreground text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto italic">
                    "{t.text}"
                  </p>

                  <div className="flex items-center justify-center gap-3">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white", accentColor)}>
                      {t.avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{t.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{t.location}</p>
                        <span className={cn("inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full text-white", accentColor)}>
                          {t.service}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

             <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-card border border-border/50 flex items-center justify-center hover:bg-muted hover:scale-110 active:scale-90 transition-all duration-200 shadow-sm touch-manipulation" aria-label="Previous">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-card border border-border/50 flex items-center justify-center hover:bg-muted hover:scale-110 active:scale-90 transition-all duration-200 shadow-sm touch-manipulation" aria-label="Next">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center gap-2.5 mt-8">
            {testimonials.map((tItem, i) => {
              const dotColor = serviceColors[tItem.service] || "bg-primary";
              return (
               <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    "rounded-full transition-all duration-300 touch-manipulation min-w-[24px] min-h-[24px] flex items-center justify-center",
                    i === current ? `${dotColor} w-7 h-2.5` : "bg-muted-foreground/20 w-2.5 h-2.5 hover:bg-muted-foreground/40"
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
