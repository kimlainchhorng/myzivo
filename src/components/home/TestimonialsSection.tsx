/**
 * Testimonials Section - Premium multi-card carousel with glassmorphism
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Sarah M.",
    location: "New York, USA",
    rating: 5,
    text: "ZIVO made booking my family vacation incredibly easy. The price comparison saved us over $200 on flights alone. The checkout was seamless and secure.",
    avatar: "SM",
    service: "Flights",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    name: "Carlos R.",
    location: "Miami, USA",
    rating: 5,
    text: "I love the price alerts feature. Got notified when my dream trip to Tokyo dropped in price and booked it instantly. Best travel platform I've used.",
    avatar: "CR",
    service: "Price Alerts",
    gradient: "from-primary to-teal-500",
  },
  {
    name: "Emily T.",
    location: "Los Angeles, USA",
    rating: 5,
    text: "Finally a travel site that doesn't hide fees. What I saw was what I paid. The hotel options were excellent and booking took less than 2 minutes.",
    avatar: "ET",
    service: "Hotels",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    name: "James K.",
    location: "Chicago, USA",
    rating: 4,
    text: "Great selection of car rentals. The flexible search with nearby airports found me a deal I wouldn't have found elsewhere. Highly recommend ZIVO.",
    avatar: "JK",
    service: "Car Rentals",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "Aisha P.",
    location: "Houston, USA",
    rating: 5,
    text: "Customer support was phenomenal when I needed to make changes to my booking. They responded within minutes. This is what premium service looks like.",
    avatar: "AP",
    service: "Support",
    gradient: "from-rose-500 to-pink-600",
  },
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
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(142_71%_45%/0.04)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-5 shimmer-chip">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Trusted by Travelers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            What our travelers{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">say</span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative min-h-[320px] flex items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -direction * 60, scale: 0.95 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="w-full"
              >
                <div className="rounded-3xl bg-card/60 backdrop-blur-xl border border-border/50 p-8 sm:p-12 glow-border-hover text-center relative overflow-hidden">
                  {/* Gradient accent at top */}
                  <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", t.gradient)} />
                  
                  <Quote className="w-10 h-10 text-primary/15 mx-auto mb-5" />

                  <div className="flex justify-center gap-1 mb-5">
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

                  <p className="text-foreground/90 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto font-medium">
                    "{t.text}"
                  </p>

                  <div className="flex items-center justify-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br shadow-lg",
                      t.gradient
                    )}>
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

            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-14 w-11 h-11 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-muted hover:scale-105 transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-14 w-11 h-11 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-muted hover:scale-105 transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center gap-2.5 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === current
                    ? "bg-primary w-8 h-2.5 shadow-[0_0_12px_hsl(142_71%_45%/0.5)]"
                    : "bg-muted-foreground/25 w-2.5 h-2.5 hover:bg-muted-foreground/40"
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
