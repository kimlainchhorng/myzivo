import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon, Shield, Globe, Clock, Zap } from "lucide-react";

export type TravelServiceType = "flights" | "hotels" | "cars";

const serviceThemes = {
  flights: {
    gradient: "from-slate-950 via-sky-950 to-blue-950",
    accent: "from-sky-500/20 via-blue-500/10",
    glow: "from-sky-500/15 to-cyan-500/10",
    badgeBg: "bg-gradient-to-r from-sky-500 to-blue-600",
    badgeShadow: "shadow-sky-500/30",
    textGradient: "from-sky-400 via-cyan-400 to-blue-400",
  },
  hotels: {
    gradient: "from-slate-950 via-amber-950 to-orange-950",
    accent: "from-amber-500/20 via-orange-500/10",
    glow: "from-amber-500/15 to-yellow-500/10",
    badgeBg: "bg-gradient-to-r from-amber-500 to-orange-600",
    badgeShadow: "shadow-amber-500/30",
    textGradient: "from-amber-400 via-orange-400 to-yellow-400",
  },
  cars: {
    gradient: "from-slate-950 via-violet-950 to-purple-950",
    accent: "from-violet-500/20 via-purple-500/10",
    glow: "from-violet-500/15 to-purple-500/10",
    badgeBg: "bg-gradient-to-r from-violet-500 to-purple-600",
    badgeShadow: "shadow-violet-500/30",
    textGradient: "from-violet-400 via-purple-400 to-fuchsia-400",
  },
};

const trustBadges = [
  { icon: Shield, text: "Secure Search", color: "text-emerald-500" },
  { icon: Globe, text: "500+ Partners", color: "text-sky-500" },
  { icon: Clock, text: "24/7 Support", color: "text-amber-500" },
  { icon: Zap, text: "Real-Time Prices", color: "text-purple-500" },
];

interface TravelPageHeroProps {
  service: TravelServiceType;
  icon: LucideIcon;
  serviceName: string;
  title: string;
  highlightedText: string;
  subtitle: string;
  children: ReactNode;
}

export default function TravelPageHero({
  service,
  icon: Icon,
  serviceName,
  title,
  highlightedText,
  subtitle,
  children,
}: TravelPageHeroProps) {
  const theme = serviceThemes[service];

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className={cn("absolute inset-0 bg-gradient-to-br", theme.gradient)} />
        <div className={cn(
          "absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
          theme.accent,
          "to-transparent"
        )} />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-8 sm:py-12">
        {/* Page Title */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Badge className={cn(
            "mb-4 px-4 py-2 text-white border-0 gap-2 backdrop-blur-xl shadow-lg",
            theme.badgeBg,
            theme.badgeShadow
          )}>
            <Icon className="w-4 h-4" />
            {serviceName} — Search & Compare
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white">
            {title}
            <br className="hidden sm:block" />
            <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", theme.textGradient)}>
              {" "}{highlightedText}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto">
            {subtitle}
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {trustBadges.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10"
              >
                <item.icon className={cn("w-4 h-4", item.color)} />
                <span className="text-sm text-white/80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search Card (children) */}
        {children}
      </div>
    </section>
  );
}
