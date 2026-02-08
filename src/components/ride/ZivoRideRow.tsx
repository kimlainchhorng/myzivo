/**
 * ZivoRideRow - ZIVO Brand Premium Ride Selection Row
 * Emerald/Teal palette with cream backgrounds and gradient accents
 */

import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import type { SurgeLevel } from "@/lib/surge";

type RideTag = "wait_save" | "priority" | "green" | "standard" | "lux";

interface ZivoRideRowProps {
  selected?: boolean;
  name: string;
  tag?: RideTag;
  seats: number;
  time: string;
  eta: string;
  price: string;
  onClick?: () => void;
  compact?: boolean;
  surgeMultiplier?: number;
  surgeLevel?: SurgeLevel;
  surgeActive?: boolean;
  showRealTimeIndicator?: boolean;
}

// ZIVO-branded inline SVG car thumbnail
function ZivoCarThumbnail({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-center shrink-0",
      compact ? "w-12 h-8" : "w-16 h-10"
    )}>
      <svg
        width={compact ? "48" : "60"}
        height={compact ? "28" : "36"}
        viewBox="0 0 120 72"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        {/* Shadow ellipse */}
        <ellipse cx="60" cy="64" rx="40" ry="6" fill="rgba(16,185,129,0.15)" />
        
        {/* Car body - cream with emerald accent */}
        <rect x="18" y="30" width="84" height="22" rx="8" fill="#FFFBF5" stroke="#10B981" strokeWidth="2" />
        
        {/* Roof/cabin */}
        <path
          d="M36 30 L46 18 H74 L84 30 Z"
          fill="#FFFBF5"
          stroke="#10B981"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        
        {/* Windows - teal tint */}
        <rect x="48" y="20" width="24" height="8" rx="2" fill="#14B8A6" opacity="0.3" />
        
        {/* Wheels */}
        <circle cx="38" cy="52" r="7" fill="#065F46" />
        <circle cx="82" cy="52" r="7" fill="#065F46" />
        <circle cx="38" cy="52" r="3" fill="#10B981" />
        <circle cx="82" cy="52" r="3" fill="#10B981" />
        
        {/* Headlights - warm glow */}
        <rect x="96" y="36" width="6" height="4" rx="1" fill="#FCD34D" />
        <rect x="18" y="36" width="6" height="4" rx="1" fill="#F87171" />
      </svg>
    </div>
  );
}

// ZIVO-branded tag pills with emerald/teal theme
function ZivoTagPill({ tag }: { tag?: RideTag }) {
  if (!tag) return null;
  
  const tagMap: Record<RideTag, { dotClass: string; label: string; bgClass: string }> = {
    wait_save: { dotClass: "bg-teal-400", label: "Save", bgClass: "bg-teal-50 text-teal-700" },
    standard: { dotClass: "bg-emerald-400", label: "", bgClass: "" },
    green: { dotClass: "bg-emerald-500", label: "Eco", bgClass: "bg-emerald-50 text-emerald-700" },
    priority: { dotClass: "bg-amber-400", label: "Fast", bgClass: "bg-amber-50 text-amber-700" },
    lux: { dotClass: "bg-violet-400", label: "Elite", bgClass: "bg-violet-50 text-violet-700" },
  };
  
  const item = tagMap[tag];
  
  // Standard shows only the dot indicator
  if (!item.label) {
    return (
      <span className="inline-flex items-center">
        <span className={cn("w-1.5 h-1.5 rounded-full", item.dotClass)} />
      </span>
    );
  }
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
      item.bgClass
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", item.dotClass)} />
      {item.label}
    </span>
  );
}

export function ZivoRideRow({
  selected = false,
  name,
  tag,
  seats,
  time,
  eta,
  price,
  onClick,
  compact = false,
  surgeMultiplier,
  surgeLevel,
  surgeActive = false,
  showRealTimeIndicator = false,
}: ZivoRideRowProps) {
  const showSurge = surgeActive && surgeMultiplier && surgeMultiplier > 1.0;
  const isHighSurge = surgeLevel === "High";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left",
        "rounded-2xl",
        "transition-all active:scale-[0.99]",
        compact ? "px-3 py-2" : "px-4 py-3",
        // ZIVO brand: cream background with emerald accents
        selected
          ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 shadow-[0_8px_24px_rgba(16,185,129,0.15)]"
          : "bg-[#FFFBF5] border border-emerald-100 shadow-[0_4px_12px_rgba(16,185,129,0.06)] hover:border-emerald-200 hover:shadow-[0_6px_16px_rgba(16,185,129,0.1)]"
      )}
    >
      <div className={cn("flex items-center", compact ? "gap-2" : "gap-3")}>
        {/* ZIVO Car thumbnail */}
        <ZivoCarThumbnail compact={compact} />

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn(
              "truncate font-semibold text-zinc-800",
              compact ? "text-[14px]" : "text-[15px]"
            )}>
              {name}
            </span>
            <ZivoTagPill tag={tag} />
            <span className={cn(
              "ml-auto inline-flex items-center gap-0.5 font-medium text-zinc-500 shrink-0",
              compact ? "text-[11px]" : "text-[12px]"
            )}>
              <span aria-hidden className={compact ? "text-[10px]" : "text-[11px]"}>👤</span> {seats}
            </span>
          </div>

          <div className={cn(
            "mt-0.5 flex items-center gap-1.5",
            compact ? "text-[12px]" : "text-[13px]"
          )}>
            <span className="text-zinc-500">{time} · {eta}</span>
            {/* Surge indicator with coral/rose theme */}
            {showSurge && (
              <span className={cn(
                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                isHighSurge
                  ? "bg-rose-100 text-rose-700"
                  : "bg-orange-100 text-orange-700"
              )}>
                <Zap className="w-2.5 h-2.5 fill-current" />
                {surgeMultiplier.toFixed(1)}×
              </span>
            )}
          </div>
        </div>

        {/* Price with ZIVO emerald styling */}
        <div className="flex flex-col items-end shrink-0">
          <span className={cn(
            "font-bold tabular-nums",
            compact ? "text-[15px]" : "text-[17px]",
            showSurge 
              ? (isHighSurge ? "text-rose-600" : "text-orange-600") 
              : "text-emerald-600"
          )}>
            {price}
          </span>
          {showRealTimeIndicator && (
            <span className="text-[10px] text-emerald-500 mt-0.5">
              Live prices
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
