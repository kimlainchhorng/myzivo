import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { carCategoryPhotos, CarCategory } from "@/config/photos";

/**
 * CAR CATEGORY TILES
 * Photo-based car type selection for Car Rental page
 * Consistent with ZIVO photo style guidelines
 */

interface CarCategoryTilesProps {
  onSelect?: (category: CarCategory) => void;
  selectedCategory?: CarCategory | null;
  className?: string;
}

const categoryOrder: CarCategory[] = ["economy", "compact", "midsize", "suv", "luxury", "van"];

const categoryPricing: Record<CarCategory, { priceFrom: number; popular?: boolean }> = {
  economy: { priceFrom: 25 },
  compact: { priceFrom: 30 },
  midsize: { priceFrom: 38, popular: true },
  suv: { priceFrom: 55, popular: true },
  luxury: { priceFrom: 95 },
  van: { priceFrom: 65 },
};

export default function CarCategoryTiles({
  onSelect,
  selectedCategory,
  className,
}: CarCategoryTilesProps) {
  return (
    <section className={cn("py-12 sm:py-16 bg-muted/30", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Browse by Car Type
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Find the perfect vehicle for your trip
            </p>
          </div>
          <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryOrder.map((categoryKey) => {
            const category = carCategoryPhotos[categoryKey];
            const pricing = categoryPricing[categoryKey];
            const isSelected = selectedCategory === categoryKey;

            return (
              <Card
                key={categoryKey}
                className={cn(
                  "group overflow-hidden cursor-pointer transition-all duration-300",
                  "hover:-translate-y-1 hover:shadow-xl border-0 bg-card",
                  isSelected && "ring-2 ring-violet-500 ring-offset-2 ring-offset-background"
                )}
                onClick={() => onSelect?.(categoryKey)}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={category.src}
                    alt={category.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Popular badge */}
                  {pricing.popular && (
                    <Badge className="absolute top-2 left-2 text-[10px] font-semibold border-0 shadow-lg bg-violet-500 text-white">
                      Popular
                    </Badge>
                  )}

                  {/* Category name overlay */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="font-bold text-white text-sm sm:text-base drop-shadow-lg">
                      {category.label}
                    </h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {category.passengers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {category.bags}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block">From</span>
                      <span className="font-bold text-sm text-violet-500">
                        ${pricing.priceFrom}/day
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Mobile view all */}
        <button className="sm:hidden w-full mt-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 rounded-xl bg-card border border-border">
          View all car types <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
