import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Hotel, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

import heroImg1 from "@/assets/hero-homepage-cinematic.jpg";
import heroImg2 from "@/assets/hero-travel-2.jpg";
import heroImg3 from "@/assets/hero-travel-3.jpg";
import heroImg4 from "@/assets/hero-nav-bg.jpg";

const heroSlides = [
  { src: heroImg1, alt: "Luxury Mediterranean infinity pool at golden hour", tagline: "Your next escape starts here" },
  { src: heroImg4, alt: "Dramatic mountain peaks at golden hour sunrise", tagline: "Adventure awaits beyond the clouds" },
  { src: heroImg2, alt: "Premium travel destination cityscape", tagline: "Explore the world's best destinations" },
  { src: heroImg3, alt: "Stunning travel landscape", tagline: "Unforgettable journeys, unbeatable prices" },
];

const stats = [
  { value: "500+", label: "Airlines" },
  { value: "190", label: "Countries" },
  { value: "2M+", label: "Travelers" },
];

const SLIDE_DURATION = 7000;

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const interval = setInterval(nextSlide, SLIDE_DURATION);
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / (SLIDE_DURATION / 50), 100));
    }, 50);
    return () => { clearInterval(interval); clearInterval(progressInterval); };
  }, [nextSlide, currentSlide]);

  const goToSlide = (i: number) => {
    setCurrentSlide(i);
    setProgress(0);
  };

  const scrollToSearch = () => {
    const el = document.getElementById("hero-search-card");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="relative overflow-hidden bg-background perspective-container" aria-label="Hero banner with travel search">
      {/* ─── MOBILE ─── */}
      <div className="lg:hidden relative min-h-[85vh] flex flex-col justify-end preserve-3d">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={heroSlides[currentSlide].src}
            alt={heroSlides[currentSlide].alt}
            initial={{ opacity: 0, scale: 1.12, rotateX: 3 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* 3D Floating Orbs */}
        <div className="orb-3d-1 top-[10%] right-[-10%] opacity-60" />
        <div className="orb-3d-2 bottom-[30%] left-[-15%] opacity-40" />

        <div className="relative z-10 px-5 pb-8 pt-20">
          <motion.p
            initial={{ opacity: 0, y: 12, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-primary text-sm font-semibold tracking-widest uppercase mb-3"
          >
            {heroSlides[currentSlide].tagline}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30, rotateX: -8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-black text-foreground leading-[1.1] tracking-tight mb-4"
            style={{ transformStyle: "preserve-3d" }}
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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex gap-3"
          >
            <Button
              size="lg"
              onClick={scrollToSearch}
              className="flex-1 h-13 text-base font-semibold rounded-xl gap-2 touch-manipulation btn-3d"
            >
              <Search className="w-5 h-5" />
              Search Now
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-13 px-5 rounded-xl font-medium touch-manipulation active:scale-[0.97] bg-background/50 backdrop-blur-sm border-border/50 card-3d"
            >
              <Link to="/flights">Flights</Link>
            </Button>
          </motion.div>

          {/* Progress indicators */}
          <div className="flex gap-2 mt-6 justify-center">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className="relative rounded-full overflow-hidden touch-manipulation min-w-[24px] min-h-[24px] flex items-center justify-center"
                aria-label={`View slide ${i + 1}`}
              >
                <div className={`transition-all duration-300 ${
                  i === currentSlide ? "w-8 h-2.5 bg-primary/30" : "w-2.5 h-2.5 bg-muted-foreground/30"
                } rounded-full`} />
                {i === currentSlide && (
                  <div
                    className="absolute left-0 top-0 h-full bg-primary rounded-full transition-none"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── DESKTOP ─── */}
      <div className="hidden lg:block relative min-h-[92vh] preserve-3d">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={heroSlides[currentSlide].src}
            alt={heroSlides[currentSlide].alt}
            initial={{ opacity: 0, scale: 1.15, rotateX: 2 }}
            animate={{ opacity: 1, scale: 1.02, rotateX: 0 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ opacity: { duration: 1.5 }, scale: { duration: 8, ease: "linear" } }}
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            loading="eager"
            fetchPriority="high"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 150px 60px hsl(var(--background) / 0.3)" }} />

        {/* 3D Ambient Orbs */}
        <div className="orb-3d-1 top-[15%] right-[10%] opacity-50" />
        <div className="orb-3d-2 bottom-[20%] left-[5%] opacity-30" />

        <div className="relative z-10 h-full min-h-[92vh] flex items-center">
          <div className="container mx-auto px-8 xl:px-16">
            <div className="max-w-2xl" style={{ transformStyle: "preserve-3d" }}>
              {/* Tagline pill */}
              <motion.div
                initial={{ opacity: 0, y: 15, z: -30 }}
                animate={{ opacity: 1, y: 0, z: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/15 border border-primary/25 backdrop-blur-sm mb-8 glass-3d"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-sm font-medium text-primary tracking-wide">
                  Trusted by 2M+ travelers worldwide
                </span>
              </motion.div>

              {/* Main headline — 3D depth */}
              <motion.h1
                initial={{ opacity: 0, y: 40, rotateX: -12 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl xl:text-7xl font-black text-foreground leading-[1.05] tracking-tighter mb-6"
                style={{ textShadow: "0 4px 30px hsl(var(--background) / 0.5)", transformStyle: "preserve-3d" }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentSlide}
                    initial={{ opacity: 0, y: 20, rotateX: -15, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, rotateX: 15, filter: "blur(4px)" }}
                    transition={{ duration: 0.5 }}
                    className="block text-primary drop-shadow-lg"
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

              {/* CTA buttons — 3D alive */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.55 }}
                className="flex flex-wrap gap-4 mb-12"
              >
                <Button
                  size="lg"
                  onClick={scrollToSearch}
                  className="h-14 px-10 text-lg font-bold rounded-2xl gap-3 btn-3d transition-all duration-300"
                >
                  <Search className="w-5 h-5" />
                  Search Flights
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="h-14 px-8 text-base font-semibold rounded-2xl bg-background/30 backdrop-blur-md border-border/40 card-3d hover:bg-background/50 transition-all duration-300"
                >
                  <Link to="/hotels">
                    <Hotel className="w-4 h-4 mr-2" />
                    Browse Hotels
                  </Link>
                </Button>
              </motion.div>

              {/* Stats bar — 3D float */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex items-center gap-8"
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-center gap-3"
                    whileHover={{ y: -4, z: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {i > 0 && <div className="w-px h-8 bg-border/30" />}
                    <div className={i > 0 ? "pl-3" : ""}>
                      <div className="text-2xl font-black text-foreground tracking-tight">{stat.value}</div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Progress bar indicators - bottom center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className="relative rounded-full overflow-hidden touch-manipulation"
              aria-label={`View slide ${i + 1}`}
            >
              <div className={`transition-all duration-300 ${
                i === currentSlide
                  ? "w-12 h-3 bg-primary/30"
                  : "w-3 h-3 bg-foreground/20 hover:bg-foreground/40"
              } rounded-full`} />
              {i === currentSlide && (
                <div
                  className="absolute left-0 top-0 h-full bg-primary rounded-full shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
                  style={{ width: `${progress}%`, transition: "none" }}
                />
              )}
            </button>
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