/**
 * Sticky Search Summary Bar
 * Shows search parameters with edit button
 * Fixed on scroll for quick reference
 */

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Pencil, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type ServiceType = "flights" | "hotels" | "cars";

interface StickySearchSummaryProps {
  service: ServiceType;
  title: ReactNode;
  badges: { label: string; value?: string }[];
  backLink: string;
  backLabel?: string;
  searchForm?: ReactNode;
  className?: string;
}

const serviceColors = {
  flights: {
    gradient: "from-sky-950/40 to-background",
    accent: "text-sky-500",
    badge: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  },
  hotels: {
    gradient: "from-amber-950/40 to-background",
    accent: "text-amber-500",
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  cars: {
    gradient: "from-violet-950/40 to-background",
    accent: "text-violet-500",
    badge: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  },
};

export function StickySearchSummary({
  service,
  title,
  badges,
  backLink,
  backLabel = "New search",
  searchForm,
  className,
}: StickySearchSummaryProps) {
  const [showEditSheet, setShowEditSheet] = useState(false);
  const colors = serviceColors[service];

  return (
    <>
      <section
        className={cn(
          "sticky top-16 z-30 bg-gradient-to-b border-b border-border/50 py-4",
          colors.gradient,
          className
        )}
      >
        <div className="container mx-auto px-4">
          {/* Back link */}
          <Link
            to={backLink}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>

          {/* Summary row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
              {badges.map((badge, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className={cn("text-xs sm:text-sm", colors.badge)}
                >
                  {badge.value ? `${badge.label}: ${badge.value}` : badge.label}
                </Badge>
              ))}
            </div>

            {searchForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditSheet(true)}
                className="gap-2"
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">Edit search</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Edit Search Sheet (Mobile) */}
      {searchForm && (
        <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
          <SheetContent side="bottom" className="h-auto max-h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Modify Search</SheetTitle>
            </SheetHeader>
            <div className="mt-4">{searchForm}</div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
