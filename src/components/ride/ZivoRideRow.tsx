/**
 * ZivoRideRow - ZIVO Brand Premium Ride Selection Row
 * Tier-aware: Economy (cream/emerald), Premium (charcoal/gold), Elite (black/purple-gold)
 */

import { cn } from "@/lib/utils";
import { Zap, Star, Crown, Check } from "lucide-react";
import { motion } from "framer-motion";
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

// Economy car icon — clean front-facing car
function EconomyCarSvg() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 17h1a2 2 0 0 0 4 0h4a2 2 0 0 0 4 0h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-.2-.6l-2.3-3.1A2 2 0 0 0 16 7H8a2 2 0 0 0-1.5.7L4.2 10.8A1 1 0 0 0 4 11.4V16a1 1 0 0 0 1 1Z" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10h10" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="17" r="1" fill="#10B981" />
      <circle cx="16" cy="17" r="1" fill="#10B981" />
    </svg>
  );
}

// Premium car icon — sleek sedan side view
function PremiumCarSvg() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 17h1a2 2 0 0 0 4 0h4a2 2 0 0 0 4 0h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-.2-.6l-2.3-3.1A2 2 0 0 0 16 7H8a2 2 0 0 0-1.5.7L4.2 10.8A1 1 0 0 0 4 11.4V16a1 1 0 0 0 1 1Z" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10h10" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="17" r="1" fill="#D4AF37" />
      <circle cx="16" cy="17" r="1" fill="#D4AF37" />
    </svg>
  );
}

// Elite car icon — luxury with purple/gold
function EliteCarSvg() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 17h1a2 2 0 0 0 4 0h4a2 2 0 0 0 4 0h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-.2-.6l-2.3-3.1A2 2 0 0 0 16 7H8a2 2 0 0 0-1.5.7L4.2 10.8A1 1 0 0 0 4 11.4V16a1 1 0 0 0 1 1Z" stroke="#A855F7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10h10" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="17" r="1" fill="#A855F7" />
      <circle cx="16" cy="17" r="1" fill="#A855F7" />
      {/* Gold accent line */}
      <line x1="6" y1="14" x2="18" y2="14" stroke="#D4AF37" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

// Car thumbnail with themed circular background (like reference)
function ZivoCarThumbnail({ compact = false, category = "economy" }: { compact?: boolean; category?: RideCategory }) {
  const bgClass = category === "elite"
    ? "bg-purple-500/10 ring-2 ring-purple-400/40"
    : category === "premium"
    ? "bg-amber-500/10 ring-2 ring-amber-400/40"
    : "bg-emerald-500/10 ring-2 ring-emerald-400/40";

  return (
    <div className={cn(
      "flex items-center justify-center shrink-0 rounded-full",
      compact ? "w-[44px] h-[44px]" : "w-[52px] h-[52px]",
      bgClass
    )}>
      {category === "elite" ? (
        <EliteCarSvg />
      ) : category === "premium" ? (
        <PremiumCarSvg />
      ) : (
        <EconomyCarSvg />
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
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          Premium
        </span>
      );
    }
    if (category === "elite") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-purple-500/30 text-purple-200">
          <Crown className="w-3 h-3 fill-amber-400 text-amber-400" />
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

// Left accent bar color per tier
function getAccentColor(category: RideCategory) {
  if (category === "elite") return "bg-purple-500";
  if (category === "premium") return "bg-amber-500";
  return "bg-emerald-500";
}

// Selected checkmark color per tier
function getCheckColor(category: RideCategory) {
  if (category === "elite") return "bg-purple-500 text-white";
  if (category === "premium") return "bg-amber-500 text-white";
  return "bg-emerald-500 text-white";
}

// Tier-specific style config
function getTierStyles(category: RideCategory, selected: boolean) {
  if (category === "elite") {
    return selected
      ? "bg-gradient-to-br from-[#1a1025] to-[#0f0a1a] border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-2 ring-purple-400/30 scale-[1.01]"
      : "bg-gradient-to-br from-[#1a1025] to-[#0f0a1a] border border-purple-400/50 shadow-[0_4px_16px_rgba(147,51,234,0.12)] hover:border-purple-400/70 hover:shadow-[0_6px_20px_rgba(168,85,247,0.2)]";
  }
  if (category === "premium") {
    return selected
      ? "bg-gradient-to-br from-[#1c1a17] to-[#141210] border-2 border-amber-400 shadow-[0_0_20px_rgba(212,175,55,0.3)] ring-2 ring-amber-400/30 scale-[1.01]"
      : "bg-gradient-to-br from-[#1c1a17] to-[#141210] border border-amber-400/40 shadow-[0_4px_16px_rgba(212,175,55,0.1)] hover:border-amber-400/60 hover:shadow-[0_6px_20px_rgba(212,175,55,0.2)]";
  }
  // Economy
  return selected
    ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 shadow-[0_8px_24px_rgba(16,185,129,0.15)] ring-2 ring-emerald-400/30 scale-[1.01]"
    : "bg-[#FFFBF5] border border-emerald-100 shadow-[0_4px_12px_rgba(16,185,129,0.06)] hover:border-emerald-200 hover:shadow-[0_6px_16px_rgba(16,185,129,0.1)]";
}

function getTierTextColors(category: RideCategory) {
  if (category === "elite") {
    return { name: "text-white", meta: "text-purple-200", price: "text-amber-300", livePrice: "text-purple-300/70", seats: "text-purple-300/60", subtitle: "text-purple-100 italic" };
  }
  if (category === "premium") {
    return { name: "text-white", meta: "text-amber-200/70", price: "text-amber-300", livePrice: "text-amber-300/60", seats: "text-amber-200/50", subtitle: "text-amber-100/80 italic" };
  }
  return { name: "text-zinc-800", meta: "text-zinc-500", price: "text-emerald-600", livePrice: "text-emerald-500", seats: "text-zinc-500", subtitle: "text-zinc-500" };
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
    <motion.button
      type="button"
      onClick={onClick}
      layout
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
      className={cn(
        "w-full text-left rounded-2xl transition-all overflow-hidden",
        compact ? "py-2" : "py-3",
        getTierStyles(category, selected)
      )}
    >
      <div className="flex">
        {/* Left accent bar */}
        <div className={cn("w-[3px] rounded-full self-stretch ml-1 shrink-0", getAccentColor(category))} />
        
        <div className={cn("flex items-center flex-1 min-w-0", compact ? "gap-2 px-2" : "gap-3 px-3")}>
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
              <div className={cn("text-[11px] mt-0.5", colors.subtitle)}>{subtitle}</div>
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

          <div className="flex flex-col items-end shrink-0 gap-1">
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
              <span className={cn("text-[10px]", colors.livePrice)}>
                Live prices
              </span>
            )}
            {/* Selected checkmark */}
            {selected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className={cn("w-5 h-5 rounded-full flex items-center justify-center", getCheckColor(category))}
              >
                <Check className="w-3 h-3" strokeWidth={3} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}