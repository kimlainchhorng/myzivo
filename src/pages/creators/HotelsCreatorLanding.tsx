/**
 * ZIVO Hotels Creator Landing
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hotel, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SEOHead from "@/components/SEOHead";
import CreatorLandingHero from "@/components/creators/CreatorLandingHero";
import CreatorComplianceFooter from "@/components/creators/CreatorComplianceFooter";
import { trackCreatorPageView, trackCreatorSearchClick } from "@/lib/creatorTracking";

export default function HotelsCreatorLanding() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");

  useEffect(() => {
    trackCreatorPageView('hotels');
  }, []);

  const handleSearch = () => {
    trackCreatorSearchClick('hotels');
    navigate(`/hotels?destination=${encodeURIComponent(destination)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Search & Compare Hotels – ZIVO"
        description="Compare hotel prices from trusted partners before you book."
      />
      
      <CreatorLandingHero
        headline="Search & Compare Hotels"
        subheadline="Find and compare accommodation options"
        icon={<Hotel className="w-7 h-7 text-white" />}
        accentColor="amber"
      >
        <div className="space-y-3">
          <div>
            <Label htmlFor="destination" className="text-xs text-foreground">Destination</Label>
            <Input
              id="destination"
              placeholder="City or region"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1 h-10"
            />
          </div>
          
          <Button onClick={handleSearch} className="w-full h-11 gap-2 bg-amber-600 hover:bg-amber-700">
            <Search className="w-4 h-4" />
            Search Hotels
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            You'll be redirected to partner sites to book
          </p>
        </div>
      </CreatorLandingHero>

      <CreatorComplianceFooter />
    </div>
  );
}
