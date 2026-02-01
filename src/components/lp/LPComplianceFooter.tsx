/**
 * ZIVO Ad Landing Page Compliance Footer
 * 
 * Compact footer with required affiliate disclosure and legal links.
 */

import { Shield, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

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
          <p className="text-xs text-muted-foreground">
            ZIVO may earn a commission when users book through partner links.
            Bookings are completed on partner websites.
          </p>
        </div>

        {/* Trust Block */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground mb-6">
          <span className="flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Compare options from trusted partners
          </span>
          <span>•</span>
          <span>Secure booking on partner sites</span>
          <span>•</span>
          <span>Support: info@hizivo.com</span>
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
          <Link to="/partners" className="hover:text-foreground transition-colors">
            Partners
          </Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">
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
