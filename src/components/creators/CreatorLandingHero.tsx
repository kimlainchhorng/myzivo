/**
 * ZIVO Creator Landing Hero
 * 
 * Clean hero for influencer/creator landing pages.
 * Minimal, mobile-first, with clear disclosures.
 */

import { ReactNode } from "react";
import { ExternalLink, Search, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatorLandingHeroProps {
  headline: string;
  subheadline: string;
  icon: ReactNode;
  accentColor: string; // e.g., "sky", "amber", "violet"
  children: ReactNode; // Search form
}

export default function CreatorLandingHero({
  headline,
  subheadline,
  icon,
  accentColor,
  children,
}: CreatorLandingHeroProps) {
  const gradientClasses: Record<string, string> = {
    sky: "from-sky-600 to-sky-800",
    amber: "from-amber-600 to-amber-800",
    violet: "from-violet-600 to-violet-800",
    emerald: "from-emerald-600 to-emerald-800",
  };

  return (
    <section className={cn(
      "relative min-h-[65vh] flex items-center justify-center",
      "bg-gradient-to-br",
      gradientClasses[accentColor] || gradientClasses.sky
    )}>
      {/* Minimal background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm mb-5">
            {icon}
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {headline}
          </h1>
          
          {/* Subheadline */}
          <p className="text-base md:text-lg text-white/90 mb-6 max-w-lg mx-auto">
            {subheadline}
          </p>

          {/* How it works - compact */}
          <div className="flex items-center justify-center gap-4 mb-6 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <Search className="w-4 h-4" />
              Search
            </span>
            <span className="text-white/40">→</span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Compare
            </span>
            <span className="text-white/40">→</span>
            <span className="flex items-center gap-1">
              <ExternalLink className="w-4 h-4" />
              Book
            </span>
          </div>

          {/* Search Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-xl">
            {children}
          </div>

          {/* Disclosure - Always Visible */}
          <div className="mt-5 p-3 rounded-lg bg-white/10 text-left">
            <div className="flex items-start gap-2 text-sm text-white/90">
              <ExternalLink className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-white/80 text-xs">
                ZIVO compares options from trusted partners. You'll be redirected to complete your booking securely. 
                ZIVO may earn a commission at no extra cost to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
