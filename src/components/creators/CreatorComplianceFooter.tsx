/**
 * ZIVO Creator Compliance Footer
 * 
 * Compact footer for creator landing pages.
 */

import { Shield, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function CreatorComplianceFooter() {
  return (
    <footer className="bg-muted/30 border-t border-border py-6">
      <div className="container mx-auto px-4">
        {/* Compact Disclosure */}
        <div className="max-w-xl mx-auto text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium">Affiliate Disclosure</span>
          </div>
          <p className="text-xs text-muted-foreground">
            ZIVO helps you compare travel options. All bookings are completed on partner websites. 
            ZIVO may earn a commission at no additional cost to you.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/how-it-works" className="hover:text-foreground">How It Works</Link>
          <Link to="/affiliate-disclosure" className="hover:text-foreground">Disclosure</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            <ExternalLink className="w-3 h-3" />
            © {new Date().getFullYear()} ZIVO LLC • Bookings on partner sites
          </p>
        </div>
      </div>
    </footer>
  );
}
