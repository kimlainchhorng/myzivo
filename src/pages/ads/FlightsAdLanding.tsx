/**
 * ZIVO Flights Ad Landing Page
 * 
 * Compliant landing page for paid flight search ads.
 * Clean, fast, with proper disclosures.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SEOHead from "@/components/SEOHead";
import AdLandingHero from "@/components/ads/AdLandingHero";
import AdComplianceFooter from "@/components/ads/AdComplianceFooter";
import { trackAdPageView, trackAdSearchClick } from "@/lib/adTracking";

export default function FlightsAdLanding() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    trackAdPageView('flights');
  }, []);

  const handleSearch = () => {
    trackAdSearchClick('flights', { from, to });
    
    // Navigate to flights page with search params
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    navigate(`/flights?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Search & Compare Flights – ZIVO"
        description="Compare flight prices from trusted travel partners. Search, compare, and book securely on partner websites."
      />
      
      <AdLandingHero
        headline="Search & Compare Flights"
        subheadline="Compare options from trusted travel partners and book securely on their websites"
        icon={<Plane className="w-8 h-8 text-white" />}
        gradientFrom="from-sky-600"
        gradientTo="to-sky-800"
      >
        {/* Simple Search Form */}
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from" className="text-foreground">From</Label>
              <Input
                id="from"
                placeholder="Departure city or airport"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="to" className="text-foreground">To</Label>
              <Input
                id="to"
                placeholder="Destination city or airport"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <Button onClick={handleSearch} className="w-full h-12 text-lg gap-2 bg-sky-600 hover:bg-sky-700">
            <Search className="w-5 h-5" />
            Search Flights
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            You'll be redirected to partner sites to complete your booking
          </p>
        </div>
      </AdLandingHero>

      {/* Simple Value Props */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="font-semibold mb-2">Search</h3>
              <p className="text-sm text-muted-foreground">
                Enter your travel details to search across trusted partners
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Compare</h3>
              <p className="text-sm text-muted-foreground">
                View options from multiple partners in one place
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Book Securely</h3>
              <p className="text-sm text-muted-foreground">
                Complete your booking on trusted partner websites
              </p>
            </div>
          </div>
        </div>
      </section>

      <AdComplianceFooter />
    </div>
  );
}
