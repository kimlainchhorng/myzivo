import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plane, Hotel, CarFront, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PROMO BANNER - Reusable Marketing Component
 * Clean, professional marketing banner for homepage and product pages
 * Compliant with affiliate rules - no price guarantees or exclusive claims
 */

export type PromoVariant = "flights" | "hotels" | "cars" | "general";

interface PromoBannerProps {
  variant?: PromoVariant;
  className?: string;
}

const promoContent: Record<PromoVariant, {
  headline: string;
  subtext: string;
  cta: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
  accentGradient: string;
  badgeText: string;
}> = {
  flights: {
    headline: "Search Flights Worldwide",
    subtext: "Browse prices from 500+ airlines and book securely on ZIVO",
    cta: "Search Flights",
    href: "/book-flight",
    icon: Plane,
    gradient: "from-sky-600 via-blue-600 to-indigo-700",
    accentGradient: "from-sky-400 to-cyan-400",
    badgeText: "Search & Book",
  },
  hotels: {
    headline: "Find Hotels Anywhere",
    subtext: "Browse real-time hotel prices from trusted partners",
    cta: "Search Hotels",
    href: "/book-hotel",
    icon: Hotel,
    gradient: "from-amber-500 via-orange-500 to-rose-600",
    accentGradient: "from-amber-400 to-yellow-400",
    badgeText: "Search & Book",
  },
  cars: {
    headline: "Search Car Rentals Worldwide",
    subtext: "Rent smarter — browse prices from top rental companies",
    cta: "Rent a Car",
    href: "/rent-car",
    icon: CarFront,
    gradient: "from-violet-600 via-purple-600 to-fuchsia-700",
    accentGradient: "from-violet-400 to-purple-400",
    badgeText: "Search & Book",
  },
  general: {
    headline: "Plan Your Trip in One Place",
    subtext: "Flights, Hotels & Cars — Browse and book with confidence",
    cta: "Start Planning",
    href: "/book-flight",
    icon: Plane,
    gradient: "from-primary via-teal-500 to-cyan-600",
    accentGradient: "from-primary to-teal-400",
    badgeText: "Book Travel",
  },
};

export default function PromoBanner({ variant = "general", className }: PromoBannerProps) {
  const content = promoContent[variant];
  const Icon = content.icon;

  return (
    <section className={cn("py-8 sm:py-12", className)}>
      <div className="container mx-auto px-4">
        <div className={cn(
          "relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16",
          "bg-gradient-to-br",
          content.gradient
        )}>
          {/* Background Effects */}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center lg:text-left">
              {/* Icon Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
                <Icon className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white/90">{content.badgeText}</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {content.headline}
              </h2>
              <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 mb-8">
                {content.subtext}
              </p>

              <Link to={content.href}>
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg font-bold rounded-2xl bg-white text-gray-900 hover:bg-white/90 shadow-2xl gap-3 group"
                >
                  {content.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Decorative Icon */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="w-40 h-40 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Icon className="w-20 h-20 text-white/80" />
                </div>
                {/* Floating accent */}
                <div className={cn(
                  "absolute -bottom-4 -right-4 w-16 h-16 rounded-2xl flex items-center justify-center",
                  "bg-gradient-to-br",
                  content.accentGradient
                )}>
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Trust Line */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/20">
            <p className="text-center text-sm text-white/60">
              Compare prices from trusted partners • No booking fees on ZIVO
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
