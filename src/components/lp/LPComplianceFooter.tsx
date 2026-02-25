/**
 * HIZIVO Ad Landing Page Compliance Footer
 * 
 * Required footer for all ad landing pages (/lp/*)
 * Includes locked disclaimers for Google & Meta ad compliance
 */

import { Shield, ExternalLink, Lock, Mail, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { FLIGHT_DISCLAIMERS } from "@/config/flightCompliance";

export default function LPComplianceFooter() {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-8">
        {/* Affiliate Disclosure */}
        <div className="max-w-xl mx-auto text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-foreground">Affiliate Disclosure</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            ZIVO acts as a booking facilitator and sub-agent for licensed travel providers.
            ZIVO may earn a commission when you book through our partner links.
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            <Check className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-emerald-500" />Prices may change until booking is completed on the partner's site.
          </p>
        </div>

        {/* Trust Block */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground mb-6">
          <span className="flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Compare options from trusted partners
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Secure booking on partner sites
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            support@hizivo.com
          </span>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground mb-6">
          <Link to="/privacy" className="hover:text-foreground transition-all duration-200">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-all duration-200">
            Terms
          </Link>
          <Link to="/affiliate-disclosure" className="hover:text-foreground transition-all duration-200">
            Affiliate Disclosure
          </Link>
          <Link to="/partner-disclosure" className="hover:text-foreground transition-all duration-200">
            Partner Disclosure
          </Link>
          <Link to="/contact" className="hover:text-foreground transition-all duration-200">
            Contact
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ZIVO LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
