/**
 * Mobility Services Compliance Footer
 * 
 * Required disclaimer text for Rides, Eats, Move pages.
 * Clarifies that services are provided by independent drivers.
 */

import { Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface MobilityComplianceFooterProps {
  className?: string;
  variant?: 'full' | 'compact' | 'inline';
}

export default function MobilityComplianceFooter({ 
  className,
  variant = 'full' 
}: MobilityComplianceFooterProps) {
  const text = "Mobility services are provided by independent drivers via ZIVO Driver.";

  if (variant === 'inline') {
    return (
      <p className={cn(
        "text-xs text-muted-foreground flex items-center gap-1.5",
        className
      )}>
        <Info className="w-3 h-3 shrink-0" />
        {text}
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        "py-4 text-center border-t border-border/50",
        className
      )}>
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
          {text}
        </p>
      </div>
    );
  }

  // Full variant
  return (
    <section className={cn(
      "py-6 border-t border-border/50 bg-muted/10",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-rose-400" />
          <span className="text-sm font-medium">Service Information</span>
        </div>
        
        <p className="text-xs text-muted-foreground max-w-3xl mx-auto text-center leading-relaxed mb-4">
          {text}{' '}
          ZIVO is a technology platform that connects users with independent driver-partners.{' '}
          ZIVO does not provide transportation, delivery, or moving services.{' '}
          Drivers are independent contractors, not employees of ZIVO.
        </p>

        {/* Footer Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <span className="text-border">•</span>
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <span className="text-border">•</span>
          <Link to="/partner-disclosure" className="hover:text-foreground transition-colors">
            Partner Disclosure
          </Link>
        </div>
      </div>
    </section>
  );
}
