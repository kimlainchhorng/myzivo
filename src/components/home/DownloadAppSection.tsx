/**
 * Download App Section - App store CTA with phone mockup visual
 */
import { motion } from "framer-motion";
import { Smartphone, Plane, Bell, Shield, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  { icon: Plane, text: "Book flights, hotels & cars on the go" },
  { icon: Bell, text: "Real-time price alerts & notifications" },
  { icon: Shield, text: "Secure checkout with biometric auth" },
  { icon: Star, text: "Exclusive app-only deals & rewards" },
];

export default function DownloadAppSection() {
  return (
    <section className="py-16 sm:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-background to-background" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(142_71%_45%/0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Smartphone className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Coming Soon</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Your world.{" "}
              <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                One app.
              </span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md">
              Download the ZIVO app for the fastest way to search, compare, and book travel — anywhere, anytime.
            </p>

            {/* Feature list */}
            <div className="space-y-4 mb-8">
              {features.map((feat, i) => (
                <motion.div
                  key={feat.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <feat.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground/80">{feat.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Store buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                App Store
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.609 22.186a.996.996 0 01-.609-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.707l2.386 1.381c.906.525.906 1.713 0 2.238l-2.386 1.38-2.538-2.538 2.538-2.461zM5.864 3.457L16.8 9.79l-2.302 2.302L5.864 3.457z"/>
                </svg>
                Google Play
              </a>
            </div>
          </motion.div>

          {/* Right: Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[280px] h-[560px] rounded-[3rem] bg-gradient-to-b from-card to-card/80 border-2 border-border/50 shadow-2xl overflow-hidden relative">
                {/* Screen content */}
                <div className="absolute inset-3 rounded-[2.4rem] overflow-hidden bg-background">
                  {/* Status bar */}
                  <div className="h-12 bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary tracking-wider">ZIVO</span>
                  </div>
                  {/* Mock content */}
                  <div className="p-4 space-y-3">
                    <div className="h-8 rounded-xl bg-muted/50 w-3/4" />
                    <div className="h-6 rounded-lg bg-muted/30 w-1/2" />
                    <div className="h-32 rounded-2xl bg-primary/5 border border-primary/10 mt-4 flex items-center justify-center">
                      <Plane className="w-10 h-10 text-primary/30" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-muted/30" />
                      ))}
                    </div>
                    <div className="h-12 rounded-xl bg-primary/20 mt-3 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">Search Flights</span>
                    </div>
                  </div>
                </div>
                {/* Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-card rounded-full" />
              </div>
              {/* Glow behind phone */}
              <div className="absolute -inset-8 bg-[radial-gradient(circle,hsl(142_71%_45%/0.1)_0%,transparent_60%)] pointer-events-none -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
