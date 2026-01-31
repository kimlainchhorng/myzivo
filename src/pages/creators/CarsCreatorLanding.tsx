/**
 * ZIVO Cars Creator Landing
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SEOHead from "@/components/SEOHead";
import CreatorLandingHero from "@/components/creators/CreatorLandingHero";
import CreatorComplianceFooter from "@/components/creators/CreatorComplianceFooter";
import { trackCreatorPageView, trackCreatorSearchClick } from "@/lib/creatorTracking";

export default function CarsCreatorLanding() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");

  useEffect(() => {
    trackCreatorPageView('cars');
  }, []);

  const handleSearch = () => {
    trackCreatorSearchClick('cars');
    navigate(`/car-rental?location=${encodeURIComponent(location)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Search & Compare Car Rentals – ZIVO"
        description="Compare car rental prices from trusted partners."
      />
      
      <CreatorLandingHero
        headline="Search & Compare Car Rentals"
        subheadline="Compare rental options before you book"
        icon={<Car className="w-7 h-7 text-white" />}
        accentColor="violet"
      >
        <div className="space-y-3">
          <div>
            <Label htmlFor="location" className="text-xs text-foreground">Pick-up Location</Label>
            <Input
              id="location"
              placeholder="Airport or city"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 h-10"
            />
          </div>
          
          <Button onClick={handleSearch} className="w-full h-11 gap-2 bg-violet-600 hover:bg-violet-700">
            <Search className="w-4 h-4" />
            Search Car Rentals
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
