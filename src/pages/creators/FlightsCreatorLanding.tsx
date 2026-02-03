/**
 * ZIVO Flights Creator Landing
 * 
 * Landing page for TikTok, YouTube, Instagram, blog traffic.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SEOHead from "@/components/SEOHead";
import CreatorLandingHero from "@/components/creators/CreatorLandingHero";
import CreatorComplianceFooter from "@/components/creators/CreatorComplianceFooter";
import { trackCreatorPageView, trackCreatorSearchClick } from "@/lib/creatorTracking";

export default function FlightsCreatorLanding() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    trackCreatorPageView('flights');
  }, []);

  const handleSearch = () => {
    trackCreatorSearchClick('flights');
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    navigate(`/flights?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Search Flights – ZIVO"
        description="Search flight prices from global airlines. Book securely on ZIVO."
      />
      
      <CreatorLandingHero
        headline="Search Flights"
        subheadline="Real-time prices from global airlines. Secure ZIVO checkout."
        icon={<Plane className="w-7 h-7 text-white" />}
        accentColor="sky"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="from" className="text-xs text-foreground">From</Label>
              <Input
                id="from"
                placeholder="Departure"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 h-10"
              />
            </div>
            <div>
              <Label htmlFor="to" className="text-xs text-foreground">To</Label>
              <Input
                id="to"
                placeholder="Destination"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 h-10"
              />
            </div>
          </div>
          
          <Button onClick={handleSearch} className="w-full h-11 gap-2 bg-sky-600 hover:bg-sky-700">
            <Search className="w-4 h-4" />
            Search Flights
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Book securely on ZIVO · Instant e-tickets
          </p>
        </div>
      </CreatorLandingHero>

      <CreatorComplianceFooter />
    </div>
  );
}
