/**
 * ZivoRideRow - ZIVO Brand Premium Ride Selection Row
 * Tier-aware: Economy (cream/emerald), Premium (charcoal/gold), Elite (black/purple-gold)
 */

import { cn } from "@/lib/utils";
import { Zap, Star, Crown } from "lucide-react";
import type { SurgeLevel } from "@/lib/surge";

type RideTag = "wait_save" | "priority" | "green" | "standard" | "lux";
type RideCategory = "economy" | "premium" | "elite";

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
  category?: RideCategory;
  subtitle?: string;
}

// Economy car SVG
function EconomyCarSvg({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      width={compact ? "48" : "60"}
      height={compact ? "28" : "36"}
      viewBox="0 0 120 72"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-sm"
    >
      <ellipse cx="60" cy="64" rx="40" ry="6" fill="rgba(16,185,129,0.15)" />
      <rect x="18" y="30" width="84" height="22" rx="8" fill="#FFFBF5" stroke="#10B981" strokeWidth="2" />
      <path d="M36 30 L46 18 H74 L84 30 Z" fill="#FFFBF5" stroke="#10B981" strokeWidth="2" strokeLinejoin="round" />
      <rect x="48" y="20" width="24" height="8" rx="2" fill="#14B8A6" opacity="0.3" />
      <circle cx="38" cy="52" r="7" fill="#065F46" />
      <circle cx="82" cy="52" r="7" fill="#065F46" />
      <circle cx="38" cy="52" r="3" fill="#10B981" />
      <circle cx="82" cy="52" r="3" fill="#10B981" />
      <rect x="96" y="36" width="6" height="4" rx="1" fill="#FCD34D" />
      <rect x="18" y="36" width="6" height="4" rx="1" fill="#F87171" />
    </svg>
  );
}

// Premium car SVG — sleek sedan with gold accents
function PremiumCarSvg({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      width={compact ? "48" : "60"}
      height={compact ? "28" : "36"}
      viewBox="0 0 120 72"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-md"
    >
      <ellipse cx="60" cy="64" rx="42" ry="5" fill="rgba(212,175,55,0.15)" />
      <rect x="14" y="32" width="92" height="20" rx="10" fill="#1C1917" stroke="#D4AF37" strokeWidth="1.5" />
      <path d="M34 32 L44 18 H76 L86 32 Z" fill="#1C1917" stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="46" y="20" width="28" height="9" rx="3" fill="#D4AF37" opacity="0.25" />
      <circle cx="36" cy="52" r="7" fill="#292524" />
      <circle cx="84" cy="52" r="7" fill="#292524" />
      <circle cx="36" cy="52" r="3" fill="#D4AF37" />
      <circle cx="84" cy="52" r="3" fill="#D4AF37" />
      <rect x="100" y="37" width="6" height="3" rx="1" fill="#D4AF37" />
      <rect x="14" y="37" width="6" height="3" rx="1" fill="#EF4444" />
    </svg>
  );
}

// Elite car SVG — luxury with purple/gold
function EliteCarSvg({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      width={compact ? "48" : "60"}
      height={compact ? "28" : "36"}
      viewBox="0 0 120 72"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
    >
      <ellipse cx="60" cy="64" rx="44" ry="5" fill="rgba(147,51,234,0.12)" />
      <rect x="12" y="32" width="96" height="20" rx="10" fill="#0C0A09" stroke="#9333EA" strokeWidth="1.5" />
      <path d="M32 32 L42 16 H78 L88 32 Z" fill="#0C0A09" stroke="#9333EA" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="44" y="18" width="32" height="10" rx="3" fill="#9333EA" opacity="0.2" />
      <circle cx="34" cy="52" r="7" fill="#1C1917" />
      <circle cx="86" cy="52" r="7" fill="#1C1917" />
      <circle cx="34" cy="52" r="3" fill="#D4AF37" />
      <circle cx="86" cy="52" r="3" fill="#D4AF37" />
      <rect x="102" y="37" width="6" height="3" rx="1" fill="#D4AF37" />
      <rect x="12" y="37" width="6" height="3" rx="1" fill="#EF4444" />
    </svg>
  );
}

function ZivoCarThumbnail({ compact = false, category = "economy" }: { compact?: boolean; category?: RideCategory }) {
  return (
    <div className={cn(
      "flex items-center justify-center shrink-0",
      compact ? "w-12 h-8" : "w-16 h-10"
    )}>
      {category === "elite" ? (
        <EliteCarSvg compact={compact} />
      ) : category === "premium" ? (
        <PremiumCarSvg compact={compact} />
      ) : (
        <EconomyCarSvg compact={compact} />
      )}
    </div>
  );
}

// Tag pills
function ZivoTagPill({ tag, category = "economy" }: { tag?: RideTag; category?: RideCategory }) {
  if (!tag) {
    // Premium/Elite get a tier badge instead
    if (category === "premium") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-200">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          Premium
        </span>
      );
    }
    if (category === "elite") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-purple-500/30 text-purple-200">
          <Crown className="w-2.5 h-2.5 fill-purple-400 text-purple-400" />
          Elite
        </span>
      );
    }
    return null;
  }
  
  const tagMap: Record<RideTag, { dotClass: string; label: string; bgClass: string }> = {
    wait_save: { dotClass: "bg-teal-400", label: "Save", bgClass: "bg-teal-50 text-teal-700" },
    standard: { dotClass: "bg-emerald-400", label: "", bgClass: "" },
    green: { dotClass: "bg-emerald-500", label: "Eco", bgClass: "bg-emerald-50 text-emerald-700" },
    priority: { dotClass: "bg-amber-400", label: "Fast", bgClass: "bg-amber-50 text-amber-700" },
    lux: { dotClass: "bg-violet-400", label: "Elite", bgClass: "bg-violet-50 text-violet-700" },
  };
  
  const item = tagMap[tag];
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

// Tier-specific style config
function getTierStyles(category: RideCategory, selected: boolean) {
  if (category === "elite") {
    return selected
      ? "bg-gradient-to-br from-[#1a1025] to-[#0f0a1a] border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.35)]"
      : "bg-gradient-to-br from-[#1a1025] to-[#0f0a1a] border border-purple-400/50 shadow-[0_4px_16px_rgba(147,51,234,0.12)] hover:border-purple-400/70 hover:shadow-[0_6px_20px_rgba(168,85,247,0.2)]";
  }
  if (category === "premium") {
    return selected
      ? "bg-gradient-to-br from-[#1c1a17] to-[#141210] border-2 border-amber-400 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
      : "bg-gradient-to-br from-[#1c1a17] to-[#141210] border border-amber-400/40 shadow-[0_4px_16px_rgba(212,175,55,0.1)] hover:border-amber-400/60 hover:shadow-[0_6px_20px_rgba(212,175,55,0.2)]";
  }
  // Economy
  return selected
    ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 shadow-[0_8px_24px_rgba(16,185,129,0.15)]"
    : "bg-[#FFFBF5] border border-emerald-100 shadow-[0_4px_12px_rgba(16,185,129,0.06)] hover:border-emerald-200 hover:shadow-[0_6px_16px_rgba(16,185,129,0.1)]";
}

function getTierTextColors(category: RideCategory) {
  if (category === "elite") {
    return { name: "text-white", meta: "text-purple-200", price: "text-amber-300", livePrice: "text-purple-300/70", seats: "text-purple-300/60" };
  }
  if (category === "premium") {
    return { name: "text-white", meta: "text-amber-200/70", price: "text-amber-300", livePrice: "text-amber-300/60", seats: "text-amber-200/50" };
  }
  return { name: "text-zinc-800", meta: "text-zinc-500", price: "text-emerald-600", livePrice: "text-emerald-500", seats: "text-zinc-500" };
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
  category = "economy",
  subtitle,
}: ZivoRideRowProps) {
  const showSurge = surgeActive && surgeMultiplier && surgeMultiplier > 1.0;
  const isHighSurge = surgeLevel === "High";
  const colors = getTierTextColors(category);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl transition-all active:scale-[0.99]",
        compact ? "px-3 py-2" : "px-4 py-3",
        getTierStyles(category, selected)
      )}
    >
      <div className={cn("flex items-center", compact ? "gap-2" : "gap-3")}>
        <ZivoCarThumbnail compact={compact} category={category} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn(
              "truncate font-semibold",
              compact ? "text-[14px]" : "text-[15px]",
              colors.name
            )}>
              {name}
            </span>
            <ZivoTagPill tag={tag} category={category} />
            <span className={cn(
              "ml-auto inline-flex items-center gap-0.5 font-medium shrink-0",
              compact ? "text-[11px]" : "text-[12px]",
              colors.seats
            )}>
              <span aria-hidden className={compact ? "text-[10px]" : "text-[11px]"}>👤</span> {seats}
            </span>
          </div>

          {/* Subtitle for premium/elite */}
          {subtitle && (category === "premium" || category === "elite") && (
            <div className={cn("text-[11px] mt-0.5", colors.meta)}>{subtitle}</div>
          )}

          <div className={cn(
            "mt-0.5 flex items-center gap-1.5",
            compact ? "text-[12px]" : "text-[13px]"
          )}>
            <span className={colors.meta}>{time} · {eta}</span>
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

        <div className="flex flex-col items-end shrink-0">
          <span className={cn(
            "font-bold tabular-nums",
            compact ? "text-[15px]" : "text-[17px]",
            showSurge 
              ? (isHighSurge ? "text-rose-600" : "text-orange-600") 
              : colors.price
          )}>
            {price}
          </span>
          {showRealTimeIndicator && (
            <span className={cn("text-[10px] mt-0.5", colors.livePrice)}>
              Live prices
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
