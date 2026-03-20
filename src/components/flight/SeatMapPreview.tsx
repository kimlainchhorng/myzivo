/**
 * SeatMapPreview — Mini cabin class visual for the expanded card drawer
 * Shows a simplified visual representation of Economy/Business/First
 */

import { cn } from "@/lib/utils";

interface SeatMapPreviewProps {
  cabinClass: string;
  className?: string;
}

const cabinConfigs: Record<string, { label: string; cols: number; rows: number; seatWidth: string; gap: string; accent: string }> = {
  first: { label: "First Class", cols: 4, rows: 2, seatWidth: "w-4 h-3.5", gap: "gap-1.5", accent: "bg-amber-500/60" },
  business: { label: "Business", cols: 4, rows: 3, seatWidth: "w-3.5 h-3", gap: "gap-1", accent: "bg-[hsl(var(--flights))]/50" },
  premium_economy: { label: "Premium Economy", cols: 6, rows: 3, seatWidth: "w-3 h-2.5", gap: "gap-0.5", accent: "bg-primary/40" },
  economy: { label: "Economy", cols: 6, rows: 4, seatWidth: "w-2.5 h-2", gap: "gap-0.5", accent: "bg-muted-foreground/25" },
};

export default function SeatMapPreview({ cabinClass, className }: SeatMapPreviewProps) {
  const normalized = cabinClass.toLowerCase().replace(/\s+/g, "_");
  const config = cabinConfigs[normalized] || cabinConfigs.economy;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Mini seat grid */}
      <div className="bg-muted/30 border border-border/20 rounded-lg p-2 shrink-0">
        {/* Nose / cockpit indicator */}
        <div className="w-full flex justify-center mb-1">
          <div className="w-4 h-1 rounded-full bg-muted-foreground/20" />
        </div>
        <div className={cn("flex flex-col items-center", config.gap)}>
          {Array.from({ length: config.rows }).map((_, row) => (
            <div key={row} className={cn("flex items-center", config.gap)}>
              {Array.from({ length: config.cols }).map((_, col) => {
                const isAisle = config.cols === 6 ? col === 2 || col === 3 : col === 1 || col === 2;
                const isHighlighted = row === 0 && (col === 0 || col === config.cols - 1);
                return (
                  <div key={col} className="flex items-center">
                    {config.cols === 6 && col === 3 && <div className="w-1" />}
                    {config.cols === 4 && col === 2 && <div className="w-1.5" />}
                    <div
                      className={cn(
                        config.seatWidth,
                        "rounded-[2px] transition-colors",
                        isHighlighted ? config.accent : "bg-muted-foreground/15"
                      )}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold capitalize">{config.label}</p>
        <p className="text-[8px] text-muted-foreground">
          {normalized === "first" && "Lie-flat seats · Suite privacy"}
          {normalized === "business" && "Wider seats · Extra legroom"}
          {normalized === "premium_economy" && "More legroom · Priority boarding"}
          {normalized === "economy" && "Standard seating"}
        </p>
      </div>
    </div>
  );
}
