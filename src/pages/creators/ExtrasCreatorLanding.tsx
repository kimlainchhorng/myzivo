/**
 * ZIVO Extras Creator Landing
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Wifi, Bus, Briefcase, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import CreatorLandingHero from "@/components/creators/CreatorLandingHero";
import CreatorComplianceFooter from "@/components/creators/CreatorComplianceFooter";
import { trackCreatorPageView, trackCreatorSearchClick } from "@/lib/creatorTracking";

export default function ExtrasCreatorLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    trackCreatorPageView('extras');
  }, []);

  const handleExplore = () => {
    trackCreatorSearchClick('extras');
    navigate('/travel-extras');
  };

  const extras = [
    { icon: Wifi, label: "Travel eSIM", desc: "Stay connected abroad" },
    { icon: Bus, label: "Airport Transfers", desc: "Reliable pickups" },
    { icon: Briefcase, label: "Luggage Storage", desc: "Store bags safely" },
    { icon: Shield, label: "Flight Compensation", desc: "Claim delays" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Travel Extras & Add-ons – ZIVO"
        description="Essential travel services: eSIM, transfers, luggage storage, and more."
      />
      
      <CreatorLandingHero
        headline="Travel Extras & Add-ons"
        subheadline="Essential services for smarter travel"
        icon={<Sparkles className="w-7 h-7 text-white" />}
        accentColor="emerald"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {extras.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="p-3 rounded-lg bg-muted/50 text-left">
                <Icon className="w-5 h-5 text-emerald-600 mb-1" />
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          
          <Button onClick={handleExplore} className="w-full h-11 gap-2 bg-emerald-600 hover:bg-emerald-700">
            Explore Extras
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            All services via trusted partner sites
          </p>
        </div>
      </CreatorLandingHero>

      <CreatorComplianceFooter />
    </div>
  );
}
