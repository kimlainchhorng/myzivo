/**
 * HIZIVO Ad Landing Page Compliance Footer
 * 
 * Required footer for all ad landing pages (/lp/*)
 * Includes locked disclaimers for Google & Meta ad compliance
 */

import { Shield, ExternalLink, Lock, Mail } from "lucide-react";
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
            Hizivo may earn a commission when users book through partner links.
            All bookings are completed on partner websites.
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            ⚠️ {FLIGHT_DISCLAIMERS.ticketing}
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
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link to="/affiliate-disclosure" className="hover:text-foreground transition-colors">
            Affiliate Disclosure
          </Link>
          <Link to="/partner-disclosure" className="hover:text-foreground transition-colors">
            Partner Disclosure
          </Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Hizivo LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
