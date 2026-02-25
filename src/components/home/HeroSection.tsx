import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, CarFront, Car, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import HeroTrustBar from "./HeroTrustBar";

import heroImg1 from "@/assets/hero-travel-1.jpg";
import heroImg2 from "@/assets/hero-travel-2.jpg";
import heroImg3 from "@/assets/hero-travel-3.jpg";

const heroImages = [heroImg1, heroImg2, heroImg3];

const taglines = [
  "Find your next adventure",
  "Explore the world your way",
  "Travel made effortless",
];

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] lg:min-h-[85vh] hero-glow-bg overflow-hidden">
      {/* Mobile: Stacked layout */}
      <div className="lg:hidden">
        <div className="relative h-[42vh] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={heroImages[currentImage]}
              alt="Premium travel destination"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              className="w-full h-full object-cover absolute inset-0"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-[radial-gradient(circle,hsl(142_71%_45%/0.18)_0%,transparent_70%)] pointer-events-none" />
          
          {/* Floating tagline on image */}
          <motion.div
            className="absolute bottom-8 left-4 right-4 z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={currentImage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="text-white/80 text-sm font-medium tracking-wide"
              >
                {taglines[currentImage]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="px-4 py-6 bg-background relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight"
          >
            Book Flights, Hotels, and Car Rentals —{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">All in One Place</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-muted-foreground text-sm sm:text-base mb-5"
          >
            ZIVO helps you book travel with secure checkout and instant confirmation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/flights" className="block mb-3">
              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-2xl gap-2 bg-primary hover:bg-primary/90 text-primary-foreground glow-green-btn"
              >
                <Plane className="w-5 h-5" />
                Book Flights
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>

            <div className="flex gap-2 mb-3">
              <Link to="/hotels" className="flex-1">
                <Button variant="outline" size="lg" className="w-full h-12 text-sm font-medium rounded-xl gap-1.5 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <Hotel className="w-4 h-4 text-amber-500" />
                  Hotels
                </Button>
              </Link>
              <Link to="/rent-car" className="flex-1">
                <Button variant="outline" size="lg" className="w-full h-12 text-sm font-medium rounded-xl gap-1.5 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <CarFront className="w-4 h-4 text-violet-500" />
                  Cars
                </Button>
              </Link>
              <Link to="/rides" className="flex-1">
                <Button variant="outline" size="lg" className="w-full h-12 text-sm font-medium rounded-xl gap-1.5 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <Car className="w-4 h-4 text-primary" />
                  Rides
                </Button>
              </Link>
            </div>

            <Link to="/price-alerts" className="block mb-5">
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-primary gap-1.5 group">
                <Sparkles className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                Track prices and get alerts
              </Button>
            </Link>
          </motion.div>

          <HeroTrustBar />

          <p className="text-center text-[11px] text-muted-foreground/70 mt-4">
            Prices are final at checkout unless otherwise stated.
          </p>
        </div>
      </div>

      {/* Desktop: Split layout */}
      <div className="hidden lg:grid lg:grid-cols-2 min-h-[85vh]">
        <div className="flex items-center px-8 xl:px-16 py-12 bg-background relative z-10">
          <div className="max-w-xl">
            {/* Animated badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 shimmer-chip"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Your travel, simplified</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-4xl xl:text-[3.25rem] font-bold text-foreground mb-5 leading-[1.1] tracking-tight"
            >
              Book Flights, Hotels, and Car Rentals —{" "}
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                All in One Place
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg text-muted-foreground mb-8 leading-relaxed"
            >
              ZIVO helps you book travel with secure checkout and instant confirmation.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-wrap gap-3 mb-4"
            >
              <Link to="/flights">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold rounded-2xl gap-3 bg-primary hover:bg-primary/90 text-primary-foreground glow-green-btn hover:scale-[1.03] transition-all duration-200"
                >
                  <Plane className="w-6 h-6" />
                  Book Flights
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/hotels">
                <Button variant="outline" size="lg" className="h-14 px-6 text-base font-medium rounded-2xl gap-2 hover:scale-[1.03] hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
                  <Hotel className="w-5 h-5 text-amber-500" />
                  Book Hotels
                </Button>
              </Link>
              <Link to="/rent-car">
                <Button variant="outline" size="lg" className="h-14 px-6 text-base font-medium rounded-2xl gap-2 hover:scale-[1.03] hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
                  <CarFront className="w-5 h-5 text-violet-500" />
                  Car Rentals
                </Button>
              </Link>
              <Link to="/rides">
                <Button variant="outline" size="lg" className="h-14 px-6 text-base font-medium rounded-2xl gap-2 hover:scale-[1.03] hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
                  <Car className="w-5 h-5 text-primary" />
                  Book Rides
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link to="/price-alerts" className="inline-block mb-8">
                <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-primary gap-2 group">
                  <Sparkles className="w-4 h-4 group-hover:text-primary transition-colors" />
                  Track prices and get alerts
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <HeroTrustBar />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="text-xs text-muted-foreground/70 mt-5 max-w-md"
            >
              Prices are final at checkout unless otherwise stated.
            </motion.p>
          </div>
        </div>

        {/* Right: Image carousel with crossfade */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={heroImages[currentImage]}
              alt="Premium travel destination"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full h-full object-cover absolute inset-0"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/15" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(142_71%_45%/0.15)_0%,transparent_70%)] pointer-events-none" />

          {/* Tagline overlay */}
          <div className="absolute bottom-20 left-8 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className="glass-chip px-5 py-3 rounded-2xl"
              >
                <p className="text-white text-sm font-medium">{taglines[currentImage]}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Image indicator dots */}
          <div className="absolute bottom-6 right-6 flex gap-2 z-10">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === currentImage
                    ? "bg-primary w-7 rounded-full shadow-[0_0_12px_hsl(142_71%_45%/0.6)]"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`View image ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
