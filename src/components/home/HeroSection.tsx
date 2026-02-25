import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Search, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import HeroTrustBar from "./HeroTrustBar";

import heroImg1 from "@/assets/hero-travel-1.jpg";
import heroImg2 from "@/assets/hero-travel-2.jpg";
import heroImg3 from "@/assets/hero-travel-3.jpg";

const heroImages = [heroImg1, heroImg2, heroImg3];

const rotatingWords = ["Travel", "Explore", "Discover", "Experience"];

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Mobile: Stacked layout */}
      <div className="lg:hidden">
        <div className="relative h-[38vh] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={heroImages[currentImage]}
              alt="Premium travel destination"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="w-full h-full object-cover absolute inset-0"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-background" />
        </div>

        <div className="px-5 py-6 bg-background relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-primary inline-block"
              >
                {rotatingWords[wordIndex]}.
              </motion.span>
            </AnimatePresence>{" "}
            Ride. Eat.{" "}
            <span className="text-foreground">All in One Place.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-muted-foreground text-sm sm:text-base mb-6"
          >
            Book flights, hotels, car rentals, rides, and food delivery with ZIVO.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex gap-3"
          >
            <Link to="/flights" className="flex-1">
              <Button size="lg" className="w-full h-13 text-base font-semibold rounded-xl gap-2">
                <Search className="w-5 h-5" />
                Search Now
              </Button>
            </Link>
            <Link to="/flights">
              <Button variant="outline" size="lg" className="h-13 px-5 rounded-xl font-medium">
                Explore
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-5"
          >
            <HeroTrustBar />
          </motion.div>
        </div>
      </div>

      {/* Desktop: Split layout */}
      <div className="hidden lg:grid lg:grid-cols-2 min-h-[80vh]">
        <div className="flex items-center px-8 xl:px-16 py-16 bg-background relative z-10">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Your travel, simplified</span>
            </motion.div>

            {/* Pulse badge */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 mb-6 ml-3"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Join 500K+ travelers</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-4xl xl:text-[3.5rem] font-bold text-foreground mb-5 leading-[1.1] tracking-tight"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="text-primary inline-block"
                >
                  {rotatingWords[wordIndex]}.
                </motion.span>
              </AnimatePresence>{" "}
              Ride. Eat.{" "}
              <span className="text-foreground">
                All in One Place.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-md"
            >
              Book flights, hotels, car rentals, rides, and food delivery with ZIVO.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex gap-4 mb-10"
            >
              <Link to="/flights">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold rounded-xl gap-3 hover:scale-[1.02] transition-transform"
                >
                  <Search className="w-5 h-5" />
                  Search Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/flights">
                <Button variant="outline" size="lg" className="h-14 px-7 text-base font-medium rounded-xl hover:bg-muted/50 transition-colors">
                  Explore Services
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <HeroTrustBar />
            </motion.div>
          </div>
        </div>

        {/* Right: Image carousel */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={heroImages[currentImage]}
              alt="Premium travel destination"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full h-full object-cover absolute inset-0"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/20" />

          {/* Image dots - larger and more tactile */}
          <div className="absolute bottom-6 right-6 flex gap-2.5 z-10">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentImage
                    ? "bg-primary w-8 h-3 shadow-md"
                    : "bg-white/50 hover:bg-white/70 w-3 h-3"
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
