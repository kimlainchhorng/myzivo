/**
 * ZIVO Travel Extras Landing Page
 * 
 * Ad-safe landing page for paid traffic.
 * Users explore on ZIVO first, then are redirected to partners.
 */

import { Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import LPHero from "@/components/lp/LPHero";
import LPComplianceFooter from "@/components/lp/LPComplianceFooter";

export default function ExtrasLP() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Explore Travel Extras – ZIVO"
        description="Discover travel extras like eSIM, activities, transfers, and more from trusted partners."
        noIndex={true}
      />
      
      <LPHero
        backgroundImage="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80"
        headline="Explore Travel Extras"
        subheadline="Discover eSIM, activities, transfers, insurance, and more for your trip."
        ctaText="Explore Travel Extras"
        ctaPath="/extras"
        icon={<Sparkles className="w-8 h-8 text-white" />}
        gradientFrom="from-teal-900/80"
        gradientTo="to-teal-700/50"
      />
      
      {/* Simple Value Props */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
            <div className="p-4">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-semibold mb-1">Browse</h3>
              <p className="text-sm text-muted-foreground">Explore travel add-ons</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">Compare</h3>
              <p className="text-sm text-muted-foreground">View partner options</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">✨</div>
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
