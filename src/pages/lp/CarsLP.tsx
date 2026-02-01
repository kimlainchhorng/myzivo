/**
 * ZIVO Car Rentals Landing Page
 * 
 * Ad-safe landing page for paid traffic.
 * Users search on ZIVO first, then are redirected to partners.
 */

import { Car } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import LPHero from "@/components/lp/LPHero";
import LPComplianceFooter from "@/components/lp/LPComplianceFooter";

export default function CarsLP() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Compare Car Rentals – ZIVO"
        description="Compare car rental prices from trusted partners. Search, compare, and book securely on partner sites."
        noIndex={true}
      />
      
      <LPHero
        backgroundImage="https://images.unsplash.com/photo-1449965408869-ebd3fee52112?w=1920&q=80"
        headline="Compare Car Rentals"
        subheadline="Find the best rental car deals from trusted partners worldwide."
        ctaText="Compare Car Rentals"
        ctaPath="/rent-car"
        icon={<Car className="w-8 h-8 text-white" />}
        gradientFrom="from-violet-900/80"
        gradientTo="to-violet-700/50"
      />
      
      {/* Simple Value Props */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
            <div className="p-4">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-semibold mb-1">Search</h3>
              <p className="text-sm text-muted-foreground">Enter pickup location</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">Compare</h3>
              <p className="text-sm text-muted-foreground">View rental options</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🚗</div>
              <h3 className="font-semibold mb-1">Book</h3>
              <p className="text-sm text-muted-foreground">Complete on partner site</p>
            </div>
          </div>
        </div>
      </section>

      <LPComplianceFooter />
    </div>
  );
}
