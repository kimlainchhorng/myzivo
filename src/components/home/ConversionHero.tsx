import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, CarFront, Shield, Globe, Zap, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-homepage.jpg";

const primaryCTAs = [
  {
    label: "Compare Flights",
    href: "/flights",
    icon: Plane,
    gradient: "from-sky-500 to-blue-600",
  },
  {
    label: "Compare Hotels",
    href: "/hotels",
    icon: Hotel,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    label: "Compare Car Rentals",
    href: "/rent-car",
    icon: CarFront,
    gradient: "from-violet-500 to-purple-600",
  },
];

const trustBadges = [
  { icon: Plane, label: "500+ Airlines Compared" },
  { icon: Globe, label: "500,000+ Hotels Worldwide" },
  { icon: Shield, label: "Trusted Rental Partners" },
  { icon: Zap, label: "No Hidden Fees" },
];

export default function ConversionHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Travel destinations worldwide"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/70 to-slate-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        {/* Main Headline */}
        <div className="max-w-4xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Compare Flights, Hotels, and Car Rentals{" "}
            <span className="bg-gradient-to-r from-primary via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              — All in One Place
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            ZIVO helps you compare travel prices from licensed partners worldwide.{" "}
            <span className="text-white font-semibold">Choose a provider and complete your booking securely on their site.</span>
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          {primaryCTAs.map((cta, index) => (
            <Link key={cta.href} to={cta.href}>
              <Button
                size="lg"
                className={cn(
                  "h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold rounded-2xl gap-3",
                  "bg-gradient-to-r text-white shadow-2xl",
                  "hover:scale-105 hover:shadow-xl transition-all duration-200",
                  "active:scale-[0.98]",
                  cta.gradient
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <cta.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                {cta.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2.5 text-white/70"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <badge.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm sm:text-base font-medium">{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Partner Note */}
        <p className="mt-10 text-sm text-white/50 animate-in fade-in duration-700 delay-500">
          Prices provided by licensed travel partners.
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
