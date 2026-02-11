import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Shield, Globe, Zap, Headphones, Plane, PlaneTakeoff, PlaneLanding, Globe2, Hotel, Building2, Palmtree, Mountain, Car, CarFront, Route } from "lucide-react";

/**
 * TOP-TIER TRAVEL HERO SECTION
 * Skyscanner / Kayak / Expedia quality
 * Immersive hero with travel imagery
 */

export type ServiceType = "flights" | "hotels" | "cars";

const heroContent = {
  flights: {
    headline: "Search Flights Worldwide",
    subheadline: "Real-time prices from global airlines. Secure ZIVO checkout.",
    gradient: "from-slate-950 via-blue-950/90 to-slate-950",
    accentGlow: "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(56, 189, 248, 0.15), transparent 50%)",
    decorativeIcons: [Plane, Globe, PlaneTakeoff, Globe2, PlaneLanding] as LucideIcon[],
    patternColor: "rgba(56, 189, 248, 0.03)",
    textGradient: "from-sky-400 via-cyan-400 to-blue-400",
    accentColor: "sky",
  },
  hotels: {
    headline: "Find & Compare Hotel Prices",
    subheadline: "500,000+ properties worldwide. Best rates from top booking sites.",
    gradient: "from-slate-950 via-amber-950/80 to-slate-950",
    accentGlow: "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(251, 191, 36, 0.12), transparent 50%)",
    decorativeIcons: [Hotel, Building2, Palmtree, Palmtree, Mountain] as LucideIcon[],
    patternColor: "rgba(251, 191, 36, 0.03)",
    textGradient: "from-amber-400 via-orange-400 to-yellow-400",
    accentColor: "amber",
  },
  cars: {
    headline: "Compare & Save on Car Rentals",
    subheadline: "Rent from trusted providers in 800+ locations worldwide.",
    gradient: "from-slate-950 via-violet-950/80 to-slate-950",
    accentGlow: "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(139, 92, 246, 0.12), transparent 50%)",
    decorativeIcons: [Car, Route, CarFront, Car, Route] as LucideIcon[],
    patternColor: "rgba(139, 92, 246, 0.03)",
    textGradient: "from-violet-400 via-purple-400 to-fuchsia-400",
    accentColor: "violet",
  },
};

const trustBadges = [
  { icon: Shield, text: "Secure & Trusted" },
  { icon: Globe, text: "500+ Partners" },
  { icon: Zap, text: "Real-Time Prices" },
  { icon: Headphones, text: "24/7 Support" },
];

interface TopTierHeroProps {
  service: ServiceType;
  icon: LucideIcon;
  children: ReactNode;
}

export default function TopTierHero({ 
  service, 
  icon: Icon,
  children 
}: TopTierHeroProps) {
  const content = heroContent[service];

  return (
    <section className="relative overflow-hidden">
      {/* Multi-layer background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className={cn("absolute inset-0 bg-gradient-to-b", content.gradient)} />
        
        {/* Accent glow from top */}
        <div 
          className="absolute inset-0"
          style={{ background: content.accentGlow }}
        />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `linear-gradient(${content.patternColor} 1px, transparent 1px),
                              linear-gradient(90deg, ${content.patternColor} 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {content.decorativeIcons.map((IconComp, i) => (
            <div
              key={i}
              className="absolute opacity-[0.08] animate-pulse"
              style={{
                left: `${10 + (i * 20)}%`,
                top: `${15 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i}s`,
              }}
            >
              <IconComp className="w-8 h-8 sm:w-10 sm:h-10 text-current" />
            </div>
          ))}
        </div>

        {/* Bottom fade to background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-8 sm:pt-12 pb-6">
        {/* Header content */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Service icon badge */}
          <div className="inline-flex items-center gap-2 mb-5">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
              content.accentColor === "sky" && "bg-sky-500/20 shadow-sky-500/20",
              content.accentColor === "amber" && "bg-amber-500/20 shadow-amber-500/20",
              content.accentColor === "violet" && "bg-violet-500/20 shadow-violet-500/20"
            )}>
              <Icon className={cn(
                "w-6 h-6",
                content.accentColor === "sky" && "text-sky-400",
                content.accentColor === "amber" && "text-amber-400",
                content.accentColor === "violet" && "text-violet-400"
              )} />
            </div>
          </div>
          
          {/* Headlines */}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 text-white leading-tight tracking-tight">
            {content.headline.split(' ').map((word, i, arr) => (
              i >= arr.length - 2 ? (
                <span 
                  key={i} 
                  className={cn("bg-gradient-to-r bg-clip-text text-transparent", content.textGradient)}
                >
                  {word}{' '}
                </span>
              ) : `${word} `
            ))}
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto mb-6">
            {content.subheadline}
          </p>

          {/* Trust badges row */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {trustBadges.map((badge) => (
              <div
                key={badge.text}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full",
                  "bg-white/5 backdrop-blur-sm border border-white/10",
                  "text-xs sm:text-sm text-white/70"
                )}
              >
                <badge.icon className={cn(
                  "w-3.5 h-3.5",
                  content.accentColor === "sky" && "text-sky-400",
                  content.accentColor === "amber" && "text-amber-400",
                  content.accentColor === "violet" && "text-violet-400"
                )} />
                <span>{badge.text}</span>
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
