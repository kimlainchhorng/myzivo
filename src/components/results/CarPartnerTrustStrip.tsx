/**
 * Car Partner Trust Strip
 * Shows partner logos for trust-building on results page
 */

import { cn } from "@/lib/utils";

interface CarPartnerTrustStripProps {
  className?: string;
}

// Partner data with text-based logos
const carPartners = [
  { id: "economybookings", name: "EconomyBookings", emoji: "🚗" },
  { id: "qeeq", name: "QEEQ", emoji: "🔑" },
  { id: "getrentacar", name: "GetRentACar", emoji: "🚙" },
  { id: "rentalcars", name: "Rentalcars.com", emoji: "🏎️" },
  { id: "discovercars", name: "DiscoverCars", emoji: "🛻" },
];

export function CarPartnerTrustStrip({ className }: CarPartnerTrustStripProps) {
  return (
    <div className={cn(
      "bg-card border-y border-border/40 py-4",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Message */}
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Comparing prices from trusted rental partners
          </p>
          
          {/* Right: Partner logos */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {carPartners.map((partner) => (
              <div
                key={partner.id}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5",
                  "bg-muted/50 rounded-lg border border-border/40",
                  "text-xs font-medium text-muted-foreground",
                  "grayscale hover:grayscale-0 transition-all"
                )}
              >
                <span>{partner.emoji}</span>
                <span>{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
