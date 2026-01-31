import { Sparkles } from "lucide-react";
import AdCreativeCard from "./AdCreativeCard";
import { cn } from "@/lib/utils";

/**
 * AD CREATIVE SHOWCASE - Marketing Section
 * Displays all ad creatives in a grid layout
 * Used on homepage and marketing pages
 */

interface AdCreativeShowcaseProps {
  className?: string;
}

export default function AdCreativeShowcase({ className }: AdCreativeShowcaseProps) {
  return (
    <section className={cn("py-16 sm:py-20 bg-muted/20", className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Explore Travel Options</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Compare{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              Before You Book
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Search across trusted partners for the best travel options
          </p>
        </div>

        {/* Ad Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <AdCreativeCard variant="flights" size="md" />
          <AdCreativeCard variant="hotels" size="md" />
          <AdCreativeCard variant="cars" size="md" />
        </div>

        {/* Trust Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Prices shown on partner sites • No booking fees on ZIVO
          </p>
        </div>
      </div>
    </section>
  );
}
