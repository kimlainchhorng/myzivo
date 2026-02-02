/**
 * Airline Trust Section
 * Visual trust indicators showing major airline logos
 */

import { cn } from "@/lib/utils";
import { getAirlineLogo } from "@/data/airlines";

const airlines = [
  { name: "American Airlines", code: "AA" },
  { name: "Delta", code: "DL" },
  { name: "United", code: "UA" },
  { name: "Emirates", code: "EK" },
  { name: "Lufthansa", code: "LH" },
  { name: "British Airways", code: "BA" },
  { name: "Air France", code: "AF" },
  { name: "Qatar Airways", code: "QR" },
  { name: "Singapore Airlines", code: "SQ" },
  { name: "JetBlue", code: "B6" },
  { name: "Southwest", code: "WN" },
  { name: "Alaska Airlines", code: "AS" },
];

export default function AirlineTrustSection() {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Trusted by Major Airlines Worldwide
          </h2>
          <p className="text-muted-foreground text-sm">
            Compare prices across 500+ airlines and travel partners
          </p>
        </div>

        {/* Airline Logos Grid */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
          {airlines.map((airline) => (
            <div
              key={airline.code}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl",
                "bg-card border border-border/50",
                "hover:border-primary/30 hover:shadow-md transition-all duration-200"
              )}
            >
              {/* Airline Logo */}
              <img
                src={getAirlineLogo(airline.code, 32)}
                alt={`${airline.name} logo`}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  // Fallback to code if logo fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                {airline.code}
              </span>
              <span className="text-sm font-medium text-foreground/80 hidden sm:inline">
                {airline.name}
              </span>
              <span className="text-sm font-medium text-foreground/80 sm:hidden">
                {airline.code}
              </span>
            </div>
          ))}
        </div>

        {/* Additional Trust Text */}
        <p className="text-center text-xs text-muted-foreground mt-8 max-w-md mx-auto">
          ZIVO searches across hundreds of airlines and travel sites to find you the best prices.
        </p>
      </div>
    </section>
  );
}