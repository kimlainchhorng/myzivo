/**
 * ZIVO Ad Compliance Footer
 * 
 * Required footer for all ad landing pages.
 * Ensures FTC compliance and affiliate transparency.
 */

import { Shield, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdComplianceFooter() {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-8">
        {/* Compliance Notice */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span className="font-medium text-foreground">Affiliate Disclosure</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            ZIVO is a travel search and comparison platform. We help you find and compare options 
            from trusted travel partners. All bookings are completed directly on partner websites. 
            Prices shown are indicative and may change. ZIVO may earn a commission when you book 
            through our links, at no additional cost to you.
          </p>
          <p className="text-xs text-muted-foreground">
            ZIVO does not guarantee prices, availability, or specific deals. 
            Final booking terms are determined by the travel partner.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
          <Link to="/about" className="hover:text-foreground transition-colors">
            About ZIVO
          </Link>
          <Link to="/how-it-works" className="hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link to="/affiliate-disclosure" className="hover:text-foreground transition-colors">
            Affiliate Disclosure
          </Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ZIVO LLC. All rights reserved.</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            <ExternalLink className="w-3 h-3" />
            All bookings completed on partner websites
          </p>
        </div>
      </div>
    </footer>
  );
}
