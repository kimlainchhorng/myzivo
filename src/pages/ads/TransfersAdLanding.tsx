/**
 * ZIVO Transfers Ad Landing Page
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SEOHead from "@/components/SEOHead";
import AdLandingHero from "@/components/ads/AdLandingHero";
import AdComplianceFooter from "@/components/ads/AdComplianceFooter";
import { trackAdPageView, trackAdSearchClick } from "@/lib/adTracking";

export default function TransfersAdLanding() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    trackAdPageView('transfers');
  }, []);

  const handleSearch = () => {
    trackAdSearchClick('transfers', { from, to });
    navigate(`/travel-extras?service=transfers&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Search & Compare Airport Transfers – ZIVO"
        description="Compare airport transfer options from trusted partners."
      />
      
      <AdLandingHero
        headline="Search & Compare Airport Transfers"
        subheadline="Find reliable airport transfer options from trusted partners"
        icon={<Bus className="w-8 h-8 text-white" />}
        gradientFrom="from-orange-600"
        gradientTo="to-orange-800"
      >
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from" className="text-foreground">From</Label>
              <Input
                id="from"
                placeholder="Airport or location"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="to" className="text-foreground">To</Label>
              <Input
                id="to"
                placeholder="Hotel or destination"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <Button onClick={handleSearch} className="w-full h-12 text-lg gap-2 bg-orange-600 hover:bg-orange-700">
            <Search className="w-5 h-5" />
            Search Transfers
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
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Search</h3>
              <p className="text-sm text-muted-foreground">Enter your pickup and drop-off</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Compare</h3>
              <p className="text-sm text-muted-foreground">View transfer options and prices</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
