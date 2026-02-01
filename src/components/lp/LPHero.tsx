/**
 * ZIVO Ad Landing Page Hero Component
 * 
 * Premium hero section for /lp/* ad landing pages.
 * Clean design with photo background, headline, and single CTA.
 */

import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LPHeroProps {
  /** Background image URL */
  backgroundImage: string;
  /** Main headline */
  headline: string;
  /** Short subheadline */
  subheadline: string;
  /** CTA button text */
  ctaText: string;
  /** Destination path (e.g., /flights) */
  ctaPath: string;
  /** Icon to display */
  icon: ReactNode;
  /** Primary color for accents */
  accentColor?: string;
  /** Gradient overlay colors */
  gradientFrom?: string;
  gradientTo?: string;
}

export default function LPHero({
  backgroundImage,
  headline,
  subheadline,
  ctaText,
  ctaPath,
  icon,
  accentColor = "bg-primary",
  gradientFrom = "from-black/70",
  gradientTo = "to-black/40",
}: LPHeroProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Preserve UTM params when navigating
  const handleCTA = () => {
    const targetUrl = `${ctaPath}${location.search}`;
    navigate(targetUrl);
  };
  
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Gradient Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b",
          gradientFrom,
          gradientTo
        )} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          {/* Icon */}
          <div className={cn(
            "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6",
            "bg-white/20 backdrop-blur-sm border border-white/30"
          )}>
            {icon}
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {headline}
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto">
            {subheadline}
          </p>
          
          {/* CTA Button */}
          <Button
            onClick={handleCTA}
            size="lg"
            className={cn(
              "h-14 px-8 text-lg font-semibold gap-3",
              "bg-white text-black hover:bg-white/90",
              "shadow-2xl shadow-black/30",
              "transition-all duration-300 hover:scale-105"
            )}
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          {/* Compliance Copy */}
          <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 max-w-md mx-auto">
            <div className="flex items-start gap-3 text-left">
              <ExternalLink className="w-4 h-4 text-white/80 shrink-0 mt-0.5" />
              <p className="text-sm text-white/80">
                ZIVO compares travel options. When you click an offer, you'll be 
                redirected to our trusted partner to complete booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
