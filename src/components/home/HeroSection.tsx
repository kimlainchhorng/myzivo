import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Plane, Hotel, Car, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import heroImg1 from "@/assets/hero-homepage-cinematic.jpg";
import heroImg2 from "@/assets/hero-travel-2.jpg";
import heroImg3 from "@/assets/hero-travel-3.jpg";

const heroSlides = [
  { src: heroImg1, alt: "Luxury Mediterranean infinity pool at golden hour", tagline: "Your next escape starts here" },
  { src: heroImg2, alt: "Premium travel destination cityscape", tagline: "Explore the world's best destinations" },
  { src: heroImg3, alt: "Stunning travel landscape", tagline: "Unforgettable journeys, unbeatable prices" },
];

const stats = [
  { value: "500+", label: "Airlines" },
  { value: "190", label: "Countries" },
  { value: "2M+", label: "Travelers" },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSearch = () => {
    const el = document.getElementById("hero-search-card");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="relative overflow-hidden bg-background">
      {/* ─── MOBILE: Full-bleed immersive hero ─── */}
      <div className="lg:hidden relative min-h-[85vh] flex flex-col justify-end">
        {/* Background image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={heroSlides[currentSlide].src}
            alt={heroSlides[currentSlide].alt}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </AnimatePresence>

        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 px-5 pb-8 pt-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-primary text-sm font-semibold tracking-widest uppercase mb-3"
          >
            {heroSlides[currentSlide].tagline}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-black text-foreground leading-[1.1] tracking-tight mb-4"
          >
            Flights. Hotels. Cars.{"\n"}
            <span className="text-primary">All in One Place.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-muted-foreground text-sm mb-6 max-w-xs"
          >
            Compare prices from 500+ airlines & trusted partners. No fees from ZIVO.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex gap-3"
          >
            <Button
              size="lg"
              onClick={scrollToSearch}
              className="flex-1 h-13 text-base font-semibold rounded-xl gap-2 touch-manipulation active:scale-[0.97] shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
            >
              <Search className="w-5 h-5" />
              Search Now
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-13 px-5 rounded-xl font-medium touch-manipulation active:scale-[0.97] bg-background/50 backdrop-blur-sm border-border/50"
            >
              <Link to="/flights">Flights</Link>
            </Button>
          </motion.div>

          {/* Slide indicators */}
          <div className="flex gap-2 mt-6 justify-center">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`rounded-full transition-all duration-300 touch-manipulation min-w-[24px] min-h-[24px] flex items-center justify-center ${
                  i === currentSlide
                    ? "bg-primary w-8 h-2.5"
                    : "bg-muted-foreground/30 w-2.5 h-2.5"
                }`}
                aria-label={`View slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── DESKTOP: Full-bleed cinematic hero ─── */}
      <div className="hidden lg:block relative min-h-[92vh]">
        {/* Background image with Ken Burns */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={heroSlides[currentSlide].src}
            alt={heroSlides[currentSlide].alt}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </AnimatePresence>

        {/* Cinematic dark gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30" />

        {/* Content */}
        <div className="relative z-10 h-full min-h-[92vh] flex items-center">
          <div className="container mx-auto px-8 xl:px-16">
            <div className="max-w-2xl">
              {/* Tagline pill */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/15 border border-primary/25 backdrop-blur-sm mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-sm font-medium text-primary tracking-wide">
                  Trusted by 2M+ travelers worldwide
                </span>
              </motion.div>

              {/* Main headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl xl:text-7xl font-black text-foreground leading-[1.05] tracking-tighter mb-6"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentSlide}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="block text-primary"
                  >
                    {heroSlides[currentSlide].tagline}
                  </motion.span>
                </AnimatePresence>
                <span className="block mt-2">
                  Flights. Hotels. Cars.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg"
              >
                Compare real-time prices from 500+ airlines and trusted travel partners. 
                No hidden fees — ever.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.55 }}
                className="flex flex-wrap gap-4 mb-12"
              >
                <Button
                  size="lg"
                  onClick={scrollToSearch}
                  className="h-14 px-10 text-lg font-bold rounded-2xl gap-3 shadow-[0_0_30px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)] hover:scale-[1.02] transition-all duration-300"
                >
                  <Search className="w-5 h-5" />
                  Search Flights
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="h-14 px-8 text-base font-semibold rounded-2xl bg-background/30 backdrop-blur-md border-border/40 hover:bg-background/50 transition-all duration-300 hover:scale-[1.02]"
                >
                  <Link to="/hotels">
                    <Hotel className="w-4 h-4 mr-2" />
                    Browse Hotels
                  </Link>
                </Button>
              </motion.div>

              {/* Stats bar */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex items-center gap-8"
              >
                {stats.map((stat, i) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    {i > 0 && <div className="w-px h-8 bg-border/30" />}
                    <div className={i > 0 ? "pl-3" : ""}>
                      <div className="text-2xl font-black text-foreground tracking-tight">{stat.value}</div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Slide indicators - bottom center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`rounded-full transition-all duration-300 touch-manipulation ${
                i === currentSlide
                  ? "bg-primary w-10 h-3 shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
                  : "bg-foreground/20 hover:bg-foreground/40 w-3 h-3"
              }`}
              aria-label={`View slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-8 right-8 z-20"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-muted-foreground/50"
          >
            <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
