/**
 * ZIVO Ad Landing Hero
 * 
 * Clean, compliant hero section for paid ad landing pages.
 * Follows affiliate rules - no price guarantees, clear disclosures.
 */

import { ReactNode } from "react";
import { ExternalLink, Search, Shield, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdLandingHeroProps {
  headline: string;
  subheadline: string;
  icon: ReactNode;
  gradientFrom: string;
  gradientTo: string;
  children: ReactNode; // Search form
}

export default function AdLandingHero({
  headline,
  subheadline,
  icon,
  gradientFrom,
  gradientTo,
  children,
}: AdLandingHeroProps) {
  return (
    <section className={cn(
      "relative min-h-[70vh] flex items-center justify-center",
      "bg-gradient-to-br",
      gradientFrom,
      gradientTo
    )}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
            {icon}
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {headline}
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {subheadline}
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-white/80 text-sm">
            <span className="flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              Search & Compare
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Trusted Partners
            </span>
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4" />
              Book Securely
            </span>
          </div>

          {/* Search Form Container */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            {children}
          </div>

          {/* Affiliate Disclosure - Always Visible */}
          <div className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="flex items-start gap-3 text-left">
              <ExternalLink className="w-5 h-5 text-white/80 shrink-0 mt-0.5" />
              <div className="text-sm text-white/90">
                <p className="font-medium mb-1">How ZIVO Works</p>
                <p className="text-white/70">
                  ZIVO compares options from trusted travel partners. When you're ready to book, 
                  you'll be redirected to our partner's website to complete your reservation securely. 
                  ZIVO may earn a commission at no extra cost to you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
