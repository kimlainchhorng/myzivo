import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon, Shield, Users, Zap, Clock } from "lucide-react";

/**
 * PROFESSIONAL HERO SECTION
 * Google Flights / Booking.com / Expedia quality
 * Clean, focused design with subtle background patterns
 */

export type ServiceType = "flights" | "hotels" | "cars";

const serviceThemes = {
  flights: {
    gradient: "from-slate-950 via-blue-950/80 to-slate-950",
    accentGradient: "from-sky-500 to-blue-600",
    accentLight: "sky",
    bgPattern: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.15), transparent)",
    textGradient: "from-sky-400 to-blue-500",
  },
  hotels: {
    gradient: "from-slate-950 via-amber-950/60 to-slate-950",
    accentGradient: "from-amber-500 to-orange-600",
    accentLight: "amber",
    bgPattern: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(251, 191, 36, 0.12), transparent)",
    textGradient: "from-amber-400 to-orange-500",
  },
  cars: {
    gradient: "from-slate-950 via-violet-950/60 to-slate-950",
    accentGradient: "from-violet-500 to-purple-600",
    accentLight: "violet",
    bgPattern: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.12), transparent)",
    textGradient: "from-violet-400 to-purple-500",
  },
};

const trustBadges = [
  { icon: Shield, text: "Secure Search" },
  { icon: Users, text: "Trusted Partners" },
  { icon: Zap, text: "Real-Time Prices" },
  { icon: Clock, text: "24/7 Support" },
];

interface ProfessionalHeroProps {
  service: ServiceType;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function ProfessionalHero({
  service,
  icon: Icon,
  title,
  subtitle,
  children,
}: ProfessionalHeroProps) {
  const theme = serviceThemes[service];

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className={cn("absolute inset-0 bg-gradient-to-b", theme.gradient)} />
        <div 
          className="absolute inset-0 opacity-60"
          style={{ background: theme.bgPattern }}
        />
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-24 pb-8">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              `bg-${theme.accentLight}-500/20`
            )}>
              <Icon className={cn("w-5 h-5", `text-${theme.accentLight}-500`)} />
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "px-3 py-1 text-xs font-medium border-white/20 text-white/80"
              )}
            >
              Search & Compare
            </Badge>
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-white leading-tight">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Search Card */}
        {children}

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          {trustBadges.map((badge) => (
            <div
              key={badge.text}
              className="flex items-center gap-2 text-white/50 text-xs sm:text-sm"
            >
              <badge.icon className={cn("w-4 h-4", `text-${theme.accentLight}-500`)} />
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
