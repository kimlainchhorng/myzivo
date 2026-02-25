/**
 * AsSeenOnSection Component
 * Media logos for brand authority
 */

import { cn } from "@/lib/utils";

interface MediaLogo {
  name: string;
  width: number;
}

// Placeholder logos - these would be replaced with actual media logos
const MEDIA_LOGOS: MediaLogo[] = [
  { name: "TechCrunch", width: 120 },
  { name: "Forbes", width: 90 },
  { name: "Travel+Leisure", width: 130 },
  { name: "CNN Travel", width: 80 },
  { name: "Business Insider", width: 140 },
  { name: "The Points Guy", width: 120 },
];

interface AsSeenOnSectionProps {
  className?: string;
  variant?: "default" | "compact";
}

export function AsSeenOnSection({ className, variant = "default" }: AsSeenOnSectionProps) {
  if (variant === "compact") {
    return (
      <div className={cn("py-6 border-y border-border/50", className)}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              As seen on
            </span>
            {MEDIA_LOGOS.slice(0, 4).map((logo) => (
              <div
                key={logo.name}
                className="text-muted-foreground/40 font-semibold text-sm md:text-base tracking-tight"
                style={{ width: logo.width * 0.8 }}
              >
                {logo.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={cn("py-12 bg-muted/20", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Featured In
          </p>
          <h3 className="text-lg font-semibold">
            Trusted by leading travel publications
          </h3>
        </div>

        {/* Logo Grid */}
        <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap">
          {MEDIA_LOGOS.map((logo) => (
            <div
              key={logo.name}
              className="group flex items-center justify-center h-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
              style={{ width: logo.width }}
            >
              {/* Placeholder text - replace with actual logo images */}
              <span className="font-bold text-lg md:text-xl tracking-tight text-muted-foreground group-hover:text-foreground transition-colors">
                {logo.name}
              </span>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-[10px] text-muted-foreground mt-8">
          ZIVO has been featured in various publications for travel technology and innovation.
        </p>
      </div>
    </section>
  );
}
