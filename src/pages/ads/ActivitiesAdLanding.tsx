/**
 * ZIVO Activities Ad Landing Page
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SEOHead from "@/components/SEOHead";
import AdLandingHero from "@/components/ads/AdLandingHero";
import AdComplianceFooter from "@/components/ads/AdComplianceFooter";
import { trackAdPageView, trackAdSearchClick } from "@/lib/adTracking";

export default function ActivitiesAdLanding() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");

  useEffect(() => {
    trackAdPageView('activities');
  }, []);

  const handleSearch = () => {
    trackAdSearchClick('activities', { destination });
    navigate(`/activities?destination=${encodeURIComponent(destination)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Search & Compare Tours & Activities – ZIVO"
        description="Compare tours, attractions, and activities from trusted partners."
      />
      
      <AdLandingHero
        headline="Search & Compare Tours & Activities"
        subheadline="Discover experiences from trusted local partners"
        icon={<Ticket className="w-8 h-8 text-white" />}
        gradientFrom="from-emerald-600"
        gradientTo="to-emerald-800"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="destination" className="text-foreground">Destination</Label>
            <Input
              id="destination"
              placeholder="City or region"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <Button onClick={handleSearch} className="w-full h-12 text-lg gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Search className="w-5 h-5" />
            Search Activities
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            You'll be redirected to partner sites to complete your booking
          </p>
        </div>
      </AdLandingHero>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold mb-2">Search</h3>
              <p className="text-sm text-muted-foreground">Enter your destination</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Compare</h3>
              <p className="text-sm text-muted-foreground">Browse tours and experiences</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Book Securely</h3>
              <p className="text-sm text-muted-foreground">Complete booking on partner sites</p>
            </div>
          </div>
        </div>
      </section>

      <AdComplianceFooter />
    </div>
  );
}
