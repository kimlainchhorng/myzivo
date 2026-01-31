import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Shield, Globe, Zap, Headphones } from "lucide-react";

// Hero images (imported as ES6 modules)
import heroFlightsImg from "@/assets/hero-flights.jpg";
import heroHotelsImg from "@/assets/hero-hotels.jpg";
import heroCarsImg from "@/assets/hero-cars.jpg";

/**
 * PREMIUM IMAGE HERO SECTION
 * Google Flights / Booking.com / Expedia quality
 * Full-width background images with overlay
 */

export type ServiceType = "flights" | "hotels" | "cars";

const heroContent = {
  flights: {
    headline: "Search & Compare Flights Worldwide",
    subheadline: "Compare prices from hundreds of airlines. No hidden fees. Book with confidence.",
    image: heroFlightsImg,
    overlayGradient: "from-slate-950/90 via-blue-950/80 to-slate-950/70",
    accentColor: "sky",
    textGradient: "from-sky-400 via-cyan-400 to-blue-400",
  },
  hotels: {
    headline: "Find the Best Hotel Deals Anywhere",
    subheadline: "Compare hotels, resorts, and stays from trusted partners worldwide.",
    image: heroHotelsImg,
    overlayGradient: "from-slate-950/90 via-amber-950/70 to-slate-950/60",
    accentColor: "amber",
    textGradient: "from-amber-400 via-orange-400 to-yellow-400",
  },
  cars: {
    headline: "Compare & Rent Cars Worldwide",
    subheadline: "Find the right car at the best price from trusted rental partners.",
    image: heroCarsImg,
    overlayGradient: "from-slate-950/90 via-violet-950/70 to-slate-950/60",
    accentColor: "violet",
    textGradient: "from-violet-400 via-purple-400 to-fuchsia-400",
  },
};

const trustBadges = [
  { icon: Shield, text: "Secure & Trusted" },
  { icon: Globe, text: "500+ Partners" },
  { icon: Zap, text: "Real-Time Prices" },
  { icon: Headphones, text: "24/7 Support" },
];

interface ImageHeroProps {
  service: ServiceType;
  icon: LucideIcon;
  children: ReactNode;
}

export default function ImageHero({ 
  service, 
  icon: Icon,
  children 
}: ImageHeroProps) {
  const content = heroContent[service];

  return (
    <section className="relative overflow-hidden">
      {/* Full-width background image */}
      <div className="absolute inset-0">
        <img 
          src={content.image} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Gradient overlay for text readability */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b",
          content.overlayGradient
        )} />
        {/* Additional vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
        {/* Bottom fade to background */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-8 sm:pt-16 lg:pt-20 pb-8">
        {/* Header content */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Service icon badge */}
          <div className="inline-flex items-center gap-2 mb-5">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/20",
              content.accentColor === "sky" && "bg-sky-500/30 shadow-sky-500/30",
              content.accentColor === "amber" && "bg-amber-500/30 shadow-amber-500/30",
              content.accentColor === "violet" && "bg-violet-500/30 shadow-violet-500/30"
            )}>
              <Icon className={cn(
                "w-7 h-7",
                content.accentColor === "sky" && "text-sky-300",
                content.accentColor === "amber" && "text-amber-300",
                content.accentColor === "violet" && "text-violet-300"
              )} />
            </div>
          </div>
          
          {/* Headlines */}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 text-white leading-tight tracking-tight drop-shadow-lg">
            {content.headline.split(' ').slice(0, -2).join(' ')}{' '}
            <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", content.textGradient)}>
              {content.headline.split(' ').slice(-2).join(' ')}
            </span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-6 drop-shadow-md">
            {content.subheadline}
          </p>

          {/* Trust badges row */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {trustBadges.map((badge) => (
              <div
                key={badge.text}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full",
                  "bg-white/10 backdrop-blur-xl border border-white/20",
                  "text-xs sm:text-sm text-white/90 shadow-lg"
                )}
              >
                <badge.icon className={cn(
                  "w-4 h-4",
                  content.accentColor === "sky" && "text-sky-400",
                  content.accentColor === "amber" && "text-amber-400",
                  content.accentColor === "violet" && "text-violet-400"
                )} />
                <span className="font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search form (children) */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          {children}
        </div>
      </div>
    </section>
  );
}
