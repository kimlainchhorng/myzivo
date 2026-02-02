/**
 * Airline Trust Section
 * Visual trust indicators showing major airline logos
 */

import { cn } from "@/lib/utils";

const airlines = [
  { name: "American Airlines", code: "AA", color: "bg-red-600" },
  { name: "Delta", code: "DL", color: "bg-blue-700" },
  { name: "United", code: "UA", color: "bg-blue-900" },
  { name: "Emirates", code: "EK", color: "bg-red-700" },
  { name: "Lufthansa", code: "LH", color: "bg-yellow-500" },
  { name: "British Airways", code: "BA", color: "bg-blue-800" },
  { name: "Air France", code: "AF", color: "bg-blue-600" },
  { name: "Qatar Airways", code: "QR", color: "bg-purple-800" },
  { name: "Singapore Airlines", code: "SQ", color: "bg-amber-600" },
  { name: "JetBlue", code: "B6", color: "bg-blue-500" },
  { name: "Southwest", code: "WN", color: "bg-orange-500" },
  { name: "Alaska Airlines", code: "AS", color: "bg-sky-600" },
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
              {/* Airline Badge */}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold",
                airline.color
              )}>
                {airline.code}
              </div>
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