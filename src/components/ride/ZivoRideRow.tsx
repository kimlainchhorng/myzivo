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

// Economy car — compact hatchback, emerald filled
function EconomyCarSvg() {
  return (
    <svg width="32" height="20" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <path d="M4 16h32a2 2 0 0 0 2-2v-2a1 1 0 0 0-.3-.7L33 7.5C32.4 6.6 31.4 6 30 6H18c-1.5 0-2.8.7-3.5 1.8L10 13H4a2 2 0 0 0-2 2v0a1 1 0 0 0 1 1Z" fill="#10B981"/>
      {/* Roof/windows */}
      <path d="M16 6.5L12.5 12H28L25.5 7C25 6.3 24.2 6 23.5 6H18.5C17.5 6 16.6 6.2 16 6.5Z" fill="#D1FAE5" opacity="0.85"/>
      {/* Window divider */}
      <line x1="20" y1="6.5" x2="19" y2="12" stroke="#10B981" strokeWidth="0.7"/>
      {/* Door handle */}
      <rect x="22" y="13" width="2.5" height="0.7" rx="0.35" fill="#059669"/>
      {/* Side mirror */}
      <ellipse cx="11.5" cy="11" rx="1" ry="0.7" fill="#059669"/>
      {/* Wheel well shadows */}
      <path d="M8 16a3.5 3.5 0 0 1 7 0" fill="#064E3B"/>
      <path d="M25 16a3.5 3.5 0 0 1 7 0" fill="#064E3B"/>
      {/* Wheels */}
      <circle cx="11.5" cy="16" r="3" fill="#1C1917"/>
      <circle cx="11.5" cy="16" r="1.5" fill="#6B7280"/>
      <circle cx="11.5" cy="16" r="0.5" fill="#9CA3AF"/>
      <circle cx="28.5" cy="16" r="3" fill="#1C1917"/>
      <circle cx="28.5" cy="16" r="1.5" fill="#6B7280"/>
      <circle cx="28.5" cy="16" r="0.5" fill="#9CA3AF"/>
      {/* Headlight */}
      <rect x="35" y="11.5" width="1.5" height="2" rx="0.5" fill="#FDE68A"/>
      {/* Taillight */}
      <rect x="3" y="12" width="1.2" height="1.8" rx="0.4" fill="#EF4444"/>
    </svg>
  );
}

// Premium car — longer, sportier sedan, charcoal/gold
function PremiumCarSvg() {
  return (
    <svg width="34" height="20" viewBox="0 0 44 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <path d="M3 16h38a2 2 0 0 0 2-2v-3a1 1 0 0 0-.2-.6L37 5.5C36.3 4.6 35.2 4 34 4H19c-1.8 0-3.2.9-4 2L10 12H3a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1Z" fill="#292524"/>
      {/* Windows - tinted */}
      <path d="M17 4.5L12 11h22L30 5.2C29.4 4.5 28.5 4 27.5 4H20C18.8 4 17.7 4.2 17 4.5Z" fill="#44403C" opacity="0.9"/>
      {/* Chrome window frame */}
      <path d="M17 4.5L12 11h22L30 5.2C29.4 4.5 28.5 4 27.5 4H20C18.8 4 17.7 4.2 17 4.5Z" stroke="#78716C" strokeWidth="0.5" fill="none"/>
      {/* Window divider */}
      <line x1="22" y1="4.3" x2="21" y2="11" stroke="#78716C" strokeWidth="0.6"/>
      {/* Gold trim line */}
      <line x1="5" y1="13" x2="40" y2="13" stroke="#D4AF37" strokeWidth="1" opacity="0.8"/>
      {/* Door handle */}
      <rect x="24" y="10" width="2.5" height="0.6" rx="0.3" fill="#D4AF37" opacity="0.7"/>
      {/* Side mirror */}
      <ellipse cx="10.5" cy="9.5" rx="1.2" ry="0.8" fill="#44403C"/>
      {/* Front grille */}
      <rect x="40" y="10" width="2" height="3.5" rx="0.5" fill="#78716C"/>
      <line x1="41" y1="10.5" x2="41" y2="13" stroke="#292524" strokeWidth="0.4"/>
      {/* Wheel wells */}
      <path d="M8 16a4 4 0 0 1 8 0" fill="#1C1917"/>
      <path d="M28 16a4 4 0 0 1 8 0" fill="#1C1917"/>
      {/* Wheels */}
      <circle cx="12" cy="16" r="3.5" fill="#1C1917"/>
      <circle cx="12" cy="16" r="2" fill="#57534E"/>
      <circle cx="12" cy="16" r="0.7" fill="#D4AF37"/>
      <circle cx="32" cy="16" r="3.5" fill="#1C1917"/>
      <circle cx="32" cy="16" r="2" fill="#57534E"/>
      <circle cx="32" cy="16" r="0.7" fill="#D4AF37"/>
      {/* Headlight */}
      <rect x="41" y="9" width="1.5" height="1.5" rx="0.5" fill="#FDE68A"/>
      {/* Taillight */}
      <rect x="2" y="11" width="1.2" height="2" rx="0.4" fill="#EF4444"/>
    </svg>
  );
}

// Elite car — ultra-long luxury sedan, purple/gold
function EliteCarSvg() {
  return (
    <svg width="36" height="20" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body - long, low */}
      <path d="M2 16h44a2 2 0 0 0 2-2v-3a1 1 0 0 0-.15-.5L42 4.5C41.2 3.5 40 3 38.5 3H20c-2 0-3.5 1-4.5 2.5L10 12H2a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1Z" fill="#581C87"/>
      {/* Windows - dark tinted with chrome frame */}
      <path d="M18 3.5L12 11h26L33 4.5C32.3 3.6 31.2 3 30 3H21.5C20 3 18.8 3.2 18 3.5Z" fill="#2E1065" opacity="0.9"/>
      <path d="M18 3.5L12 11h26L33 4.5C32.3 3.6 31.2 3 30 3H21.5C20 3 18.8 3.2 18 3.5Z" stroke="#C084FC" strokeWidth="0.6" fill="none"/>
      {/* Window dividers */}
      <line x1="23" y1="3.3" x2="22" y2="11" stroke="#C084FC" strokeWidth="0.5"/>
      <line x1="29" y1="3.5" x2="28.5" y2="11" stroke="#C084FC" strokeWidth="0.5"/>
      {/* Gold lower trim */}
      <line x1="4" y1="13.5" x2="44" y2="13.5" stroke="#D4AF37" strokeWidth="1.2" opacity="0.9"/>
      {/* Door handle */}
      <rect x="26" y="9.5" width="3" height="0.6" rx="0.3" fill="#D4AF37" opacity="0.8"/>
      {/* Side mirror */}
      <ellipse cx="10" cy="9" rx="1.3" ry="0.9" fill="#7C3AED"/>
      {/* Front grille - prominent */}
      <rect x="44" y="8.5" width="2.5" height="4.5" rx="0.7" fill="#A78BFA"/>
      <line x1="45.2" y1="9" x2="45.2" y2="12.5" stroke="#581C87" strokeWidth="0.4"/>
      <line x1="46" y1="9" x2="46" y2="12.5" stroke="#581C87" strokeWidth="0.4"/>
      {/* Gold star emblem */}
      <polygon points="8,8 8.6,9.2 10,9.4 9,10.3 9.2,11.6 8,11 6.8,11.6 7,10.3 6,9.4 7.4,9.2" fill="#D4AF37"/>
      {/* Wheel wells */}
      <path d="M9 16a4.5 4.5 0 0 1 9 0" fill="#2E1065"/>
      <path d="M30 16a4.5 4.5 0 0 1 9 0" fill="#2E1065"/>
      {/* Wheels - large chrome */}
      <circle cx="13.5" cy="16" r="4" fill="#1C1917"/>
      <circle cx="13.5" cy="16" r="2.5" fill="#78716C"/>
      <circle cx="13.5" cy="16" r="1" fill="#D4AF37"/>
      {/* Spokes */}
      <line x1="13.5" y1="13.5" x2="13.5" y2="14.5" stroke="#D4AF37" strokeWidth="0.4"/>
      <line x1="11.5" y1="15" x2="12.3" y2="15.4" stroke="#D4AF37" strokeWidth="0.4"/>
      <line x1="15.5" y1="15" x2="14.7" y2="15.4" stroke="#D4AF37" strokeWidth="0.4"/>
      <circle cx="34.5" cy="16" r="4" fill="#1C1917"/>
      <circle cx="34.5" cy="16" r="2.5" fill="#78716C"/>
      <circle cx="34.5" cy="16" r="1" fill="#D4AF37"/>
      <line x1="34.5" y1="13.5" x2="34.5" y2="14.5" stroke="#D4AF37" strokeWidth="0.4"/>
      <line x1="32.5" y1="15" x2="33.3" y2="15.4" stroke="#D4AF37" strokeWidth="0.4"/>
      <line x1="36.5" y1="15" x2="35.7" y2="15.4" stroke="#D4AF37" strokeWidth="0.4"/>
      {/* Headlight */}
      <rect x="45.5" y="7.5" width="1.5" height="1.5" rx="0.5" fill="#FDE68A"/>
      {/* Taillight */}
      <rect x="1" y="10.5" width="1.5" height="2.5" rx="0.5" fill="#EF4444"/>
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
      compact ? "w-[44px] h-[44px]" : "w-[56px] h-[56px]",
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