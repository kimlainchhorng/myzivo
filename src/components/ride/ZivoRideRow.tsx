/**
 * ZivoRideRow - ZIVO Brand Premium Ride Selection Row
 * Tier-aware: Economy (cream/emerald), Premium (charcoal/gold), Elite (black/purple-gold)
 */

import { cn } from "@/lib/utils";
import { Zap, Star, Crown, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { SurgeLevel } from "@/lib/surge";

import fleetEconomy from "@/assets/fleet-economy.png";
import ridePremium from "@/assets/ride-premium.png";
import rideXl from "@/assets/ride-xl.png";

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

// Economy — white/silver compact hatchback, emerald-tinted windows
function EconomyCarSvg() {
  return (
    <svg width="34" height="22" viewBox="0 0 42 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="21" cy="23" rx="16" ry="1.5" fill="#94A3B8" opacity="0.15"/>
      {/* Lower body - white/silver */}
      <path d="M5 18h32c1.1 0 2-.9 2-2v-2H3v2c0 1.1.9 2 2 2Z" fill="#E2E8F0"/>
      {/* Upper body - white */}
      <path d="M8 14h29l-3-5.5c-.6-1.1-1.8-1.8-3.1-1.8H16.5c-1.5 0-2.8.8-3.5 2L8 14Z" fill="#F1F5F9"/>
      {/* Roof highlight */}
      <path d="M13.5 9.5L10 14h5l2-4.5h-3.5Z" fill="#FFFFFF" opacity="0.5"/>
      {/* Front windshield - emerald tint */}
      <path d="M30 8.5L34 14H27l2-4.8c.3-.5.6-.7 1-.7Z" fill="#6EE7B7" opacity="0.7"/>
      {/* Rear window - emerald tint */}
      <path d="M13.5 9.2L10.5 14H16l1.5-4c.1-.3-.1-.8-.5-.8h-3.5Z" fill="#6EE7B7" opacity="0.7"/>
      {/* Side windows - emerald tint */}
      <path d="M18 9h8.5l2.5 5H17l1-5Z" fill="#A7F3D0" opacity="0.65"/>
      {/* Window divider */}
      <line x1="24" y1="9.2" x2="23.5" y2="14" stroke="#CBD5E1" strokeWidth="0.8"/>
      {/* Door line */}
      <line x1="23" y1="14" x2="23" y2="17.5" stroke="#CBD5E1" strokeWidth="0.6" opacity="0.5"/>
      {/* Door handle */}
      <rect x="25" y="15.2" width="2.2" height="0.7" rx="0.35" fill="#94A3B8"/>
      {/* Side mirror */}
      <path d="M35 11.5h1.5c.3 0 .5.2.5.5v.5c0 .3-.2.5-.5.5H35v-1.5Z" fill="#CBD5E1"/>
      {/* Bumper front */}
      <rect x="37" y="14.5" width="2" height="2.5" rx="0.8" fill="#CBD5E1"/>
      {/* Headlight */}
      <circle cx="38" cy="13.5" r="1" fill="#FDE68A"/>
      <circle cx="38" cy="13.5" r="0.5" fill="#FEF3C7"/>
      {/* Bumper rear */}
      <rect x="3" y="14.5" width="1.8" height="2.5" rx="0.6" fill="#CBD5E1"/>
      {/* Taillight */}
      <rect x="3.5" y="13" width="1.2" height="1.8" rx="0.4" fill="#F87171"/>
      {/* Emerald accent trim */}
      <line x1="5" y1="15.5" x2="37" y2="15.5" stroke="#10B981" strokeWidth="0.8" opacity="0.6"/>
      {/* Wheel arches */}
      <path d="M9 18a3.8 3.8 0 0 1 7.6 0" fill="#334155"/>
      <path d="M26 18a3.8 3.8 0 0 1 7.6 0" fill="#334155"/>
      {/* Wheels */}
      <circle cx="12.8" cy="18" r="3.3" fill="#1E293B"/>
      <circle cx="12.8" cy="18" r="2.1" fill="#475569"/>
      <circle cx="12.8" cy="18" r="1" fill="#94A3B8"/>
      <circle cx="12.8" cy="18" r="0.4" fill="#CBD5E1"/>
      <circle cx="29.8" cy="18" r="3.3" fill="#1E293B"/>
      <circle cx="29.8" cy="18" r="2.1" fill="#475569"/>
      <circle cx="29.8" cy="18" r="1" fill="#94A3B8"/>
      <circle cx="29.8" cy="18" r="0.4" fill="#CBD5E1"/>
    </svg>
  );
}

// Premium — white/silver sport sedan, gold-tinted windows
function PremiumCarSvg() {
  return (
    <svg width="36" height="22" viewBox="0 0 48 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="24" cy="23" rx="19" ry="1.5" fill="#D4AF37" opacity="0.12"/>
      {/* Lower body - white/silver */}
      <path d="M4 18h40c1.1 0 2-.9 2-2v-2.5c0-.3-.1-.5-.2-.7L43 10H5l-2.8 2.8c-.1.2-.2.4-.2.7V16c0 1.1.9 2 2 2Z" fill="#E2E8F0"/>
      {/* Upper body - white */}
      <path d="M12 10h28l-2.5-4.8c-.5-1-1.6-1.7-2.8-1.7H19c-1.4 0-2.7.8-3.3 2L12 10Z" fill="#F8FAFC"/>
      {/* Body highlight */}
      <path d="M12 10h28l-.5-1H12.5l-.5 1Z" fill="#FFFFFF" opacity="0.6"/>
      {/* Front windshield - gold tint */}
      <path d="M36 5.5L40 10H34l1.5-4c.2-.4.3-.5.5-.5Z" fill="#FCD34D" opacity="0.5"/>
      {/* Rear window - gold tint */}
      <path d="M16 6L13 10h6l1-3.5c.1-.3-.1-.5-.3-.5H16Z" fill="#FCD34D" opacity="0.5"/>
      {/* Side windows - gold tint */}
      <path d="M20 5.8h13l3 4.2H19l1-4.2Z" fill="#FDE68A" opacity="0.55"/>
      {/* Chrome window trim */}
      <path d="M16 6L13 10h27l-2.5-4.5c-.4-.8-1.3-1.5-2.2-1.5H19c-1.2 0-2.3.7-3 1.7" stroke="#D4AF37" strokeWidth="0.5" fill="none"/>
      {/* Window dividers */}
      <line x1="25" y1="5.9" x2="24.5" y2="10" stroke="#D4AF37" strokeWidth="0.4"/>
      <line x1="31" y1="6.2" x2="31" y2="10" stroke="#D4AF37" strokeWidth="0.4"/>
      {/* Gold accent trim */}
      <line x1="5" y1="14" x2="43" y2="14" stroke="#D4AF37" strokeWidth="1.2"/>
      {/* Door lines */}
      <line x1="23" y1="10" x2="23" y2="17.5" stroke="#CBD5E1" strokeWidth="0.5"/>
      <line x1="32" y1="10" x2="32" y2="17.5" stroke="#CBD5E1" strokeWidth="0.5"/>
      {/* Door handles - gold */}
      <rect x="25.5" y="12" width="2.5" height="0.6" rx="0.3" fill="#D4AF37"/>
      <rect x="34" y="12" width="2.5" height="0.6" rx="0.3" fill="#D4AF37"/>
      {/* Side mirror */}
      <path d="M41.5 8h2c.3 0 .5.3.5.6v.8c0 .3-.2.6-.5.6h-2V8Z" fill="#CBD5E1"/>
      {/* Front grille */}
      <rect x="44" y="11" width="2.5" height="4" rx="0.6" fill="#94A3B8"/>
      {/* Headlights */}
      <path d="M44 10l2-.5v1.5h-2v-1Z" fill="#FDE68A"/>
      <circle cx="45.5" cy="10.5" r="0.4" fill="#FEF3C7"/>
      {/* Rear bumper */}
      <rect x="2.5" y="11" width="2" height="4" rx="0.5" fill="#CBD5E1"/>
      {/* Taillights */}
      <rect x="3" y="10.5" width="1.5" height="2.5" rx="0.4" fill="#EF4444"/>
      {/* Wheel arches */}
      <path d="M9 18a4.2 4.2 0 0 1 8.4 0" fill="#334155"/>
      <path d="M30 18a4.2 4.2 0 0 1 8.4 0" fill="#334155"/>
      {/* Wheels - sport rims */}
      <circle cx="13.2" cy="18" r="3.6" fill="#1E293B"/>
      <circle cx="13.2" cy="18" r="2.4" fill="#475569"/>
      <line x1="13.2" y1="15.8" x2="13.2" y2="16.8" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="11.2" y1="17" x2="12" y2="17.5" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="15.2" y1="17" x2="14.4" y2="17.5" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="11.5" y1="19.5" x2="12.2" y2="18.8" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="14.9" y1="19.5" x2="14.2" y2="18.8" stroke="#94A3B8" strokeWidth="0.5"/>
      <circle cx="13.2" cy="18" r="0.8" fill="#D4AF37"/>
      <circle cx="34.2" cy="18" r="3.6" fill="#1E293B"/>
      <circle cx="34.2" cy="18" r="2.4" fill="#475569"/>
      <line x1="34.2" y1="15.8" x2="34.2" y2="16.8" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="32.2" y1="17" x2="33" y2="17.5" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="36.2" y1="17" x2="35.4" y2="17.5" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="32.5" y1="19.5" x2="33.2" y2="18.8" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="35.9" y1="19.5" x2="35.2" y2="18.8" stroke="#94A3B8" strokeWidth="0.5"/>
      <circle cx="34.2" cy="18" r="0.8" fill="#D4AF37"/>
    </svg>
  );
}

// Elite — white/silver ultra-long luxury sedan, purple/magenta windows, sparkle
function EliteCarSvg() {
  return (
    <svg width="38" height="22" viewBox="0 0 52 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="26" cy="23.5" rx="22" ry="1.8" fill="#A855F7" opacity="0.12"/>
      {/* Lower body - white/silver */}
      <path d="M3 18h46c1.1 0 2-.9 2-2v-3c0-.3-.1-.5-.2-.7L48 9H4L1.2 12.3c-.1.2-.2.4-.2.7V16c0 1.1.9 2 2 2Z" fill="#E2E8F0"/>
      {/* Upper body - white */}
      <path d="M14 9h30l-2-4.2c-.5-1-1.7-1.8-3-1.8H20c-1.6 0-3 .9-3.8 2.2L14 9Z" fill="#F8FAFC"/>
      {/* Roof chrome line */}
      <path d="M17 5.5C18 4.3 19.5 3.5 21 3.5h17c1 0 2 .5 2.6 1.3" stroke="#C084FC" strokeWidth="0.5" fill="none" opacity="0.7"/>
      {/* Front windshield - purple tint */}
      <path d="M40 5L44 9H38l1.2-3.5c.2-.4.4-.5.8-.5Z" fill="#C084FC" opacity="0.5"/>
      {/* Rear window - purple tint */}
      <path d="M17.5 5.5L15 9h6l1-3c.1-.3-.1-.5-.4-.5h-4.1Z" fill="#C084FC" opacity="0.5"/>
      {/* Side windows - purple/magenta tint */}
      <path d="M22 4.5h15l3 4.5H21l1-4.5Z" fill="#D8B4FE" opacity="0.55"/>
      {/* Chrome window frame */}
      <path d="M17.5 5.5L15 9h29l-2-3.8c-.4-.8-1.3-1.5-2.2-1.5H21c-1.3 0-2.5.6-3.2 1.5" stroke="#C084FC" strokeWidth="0.7" fill="none"/>
      {/* Window dividers - chrome */}
      <line x1="26" y1="4.7" x2="25.5" y2="9" stroke="#C084FC" strokeWidth="0.5"/>
      <line x1="32" y1="4.8" x2="31.5" y2="9" stroke="#C084FC" strokeWidth="0.5"/>
      <line x1="37" y1="5.2" x2="37" y2="9" stroke="#C084FC" strokeWidth="0.5"/>
      {/* Gold accent trim */}
      <line x1="4" y1="13.8" x2="48" y2="13.8" stroke="#D4AF37" strokeWidth="1.4"/>
      <line x1="5" y1="12.2" x2="47" y2="12.2" stroke="#D4AF37" strokeWidth="0.4" opacity="0.5"/>
      {/* Door lines */}
      <line x1="22" y1="9" x2="22" y2="17.5" stroke="#CBD5E1" strokeWidth="0.5"/>
      <line x1="30" y1="9" x2="30" y2="17.5" stroke="#CBD5E1" strokeWidth="0.5"/>
      <line x1="38" y1="9" x2="38" y2="17.5" stroke="#CBD5E1" strokeWidth="0.5"/>
      {/* Door handles - gold */}
      <rect x="24" y="11.5" width="2.8" height="0.6" rx="0.3" fill="#D4AF37"/>
      <rect x="32" y="11.5" width="2.8" height="0.6" rx="0.3" fill="#D4AF37"/>
      {/* Side mirror - chrome */}
      <path d="M45 7h2.2c.4 0 .7.3.7.7v1c0 .4-.3.7-.7.7H45V7Z" fill="#CBD5E1"/>
      {/* Front grille */}
      <rect x="48.5" y="9.5" width="2.8" height="5" rx="0.8" fill="#94A3B8"/>
      <rect x="49" y="10" width="1.8" height="4" rx="0.5" fill="#CBD5E1"/>
      {/* Headlights */}
      <path d="M48.5 8.5l2.5-.8v2h-2.5v-1.2Z" fill="#FDE68A"/>
      <circle cx="50" cy="8.8" r="0.5" fill="#FEF3C7"/>
      {/* DRL strip */}
      <line x1="48.5" y1="9.2" x2="50.5" y2="9.2" stroke="#E9D5FF" strokeWidth="0.4"/>
      {/* Rear section */}
      <rect x="1.5" y="9.5" width="2.5" height="5" rx="0.6" fill="#CBD5E1"/>
      {/* Taillights */}
      <rect x="2" y="9" width="1.8" height="3" rx="0.5" fill="#EF4444"/>
      {/* Sparkle effects ✨ */}
      <polygon points="8,6 8.5,7.2 9.8,7.4 8.9,8.2 9.1,9.4 8,8.7 6.9,9.4 7.1,8.2 6.2,7.4 7.5,7.2" fill="#D4AF37" opacity="0.8"/>
      <polygon points="46,4 46.3,4.8 47.2,4.9 46.6,5.4 46.7,6.2 46,5.8 45.3,6.2 45.4,5.4 44.8,4.9 45.7,4.8" fill="#D4AF37" opacity="0.6"/>
      <polygon points="26,2 26.2,2.6 26.8,2.7 26.4,3 26.5,3.6 26,3.3 25.5,3.6 25.6,3 25.2,2.7 25.8,2.6" fill="#C084FC" opacity="0.5"/>
      {/* Wheel arches */}
      <path d="M10 18a4.5 4.5 0 0 1 9 0" fill="#334155"/>
      <path d="M33 18a4.5 4.5 0 0 1 9 0" fill="#334155"/>
      {/* Wheels - luxury chrome */}
      <circle cx="14.5" cy="18" r="4" fill="#1E293B"/>
      <circle cx="14.5" cy="18" r="2.8" fill="#475569"/>
      <line x1="14.5" y1="15.5" x2="14.5" y2="16.5" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="12.2" y1="16.5" x2="13" y2="17.2" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="16.8" y1="16.5" x2="16" y2="17.2" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="12" y1="19" x2="12.8" y2="18.4" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="17" y1="19" x2="16.2" y2="18.4" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="14.5" y1="20.5" x2="14.5" y2="19.5" stroke="#94A3B8" strokeWidth="0.5"/>
      <circle cx="14.5" cy="18" r="1.2" fill="#78716C"/>
      <circle cx="14.5" cy="18" r="0.5" fill="#D4AF37"/>
      <circle cx="37.5" cy="18" r="4" fill="#1E293B"/>
      <circle cx="37.5" cy="18" r="2.8" fill="#475569"/>
      <line x1="37.5" y1="15.5" x2="37.5" y2="16.5" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="35.2" y1="16.5" x2="36" y2="17.2" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="39.8" y1="16.5" x2="39" y2="17.2" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="35" y1="19" x2="35.8" y2="18.4" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="40" y1="19" x2="39.2" y2="18.4" stroke="#94A3B8" strokeWidth="0.5"/>
      <line x1="37.5" y1="20.5" x2="37.5" y2="19.5" stroke="#94A3B8" strokeWidth="0.5"/>
      <circle cx="37.5" cy="18" r="1.2" fill="#78716C"/>
      <circle cx="37.5" cy="18" r="0.5" fill="#D4AF37"/>
    </svg>
  );
}

// Car thumbnail with themed circular background using PNG illustrations
function ZivoCarThumbnail({ compact = false, category = "economy" }: { compact?: boolean; category?: RideCategory }) {
  const bgClass = category === "elite"
    ? "bg-purple-500/10 ring-2 ring-purple-400/40"
    : category === "premium"
    ? "bg-amber-500/10 ring-2 ring-amber-400/40"
    : "bg-emerald-500/10 ring-2 ring-emerald-400/40";

  const imageSrc = category === "elite"
    ? rideXl
    : category === "premium"
    ? ridePremium
    : fleetEconomy;

  return (
    <div className={cn(
      "flex items-center justify-center shrink-0 rounded-full overflow-hidden",
      compact ? "w-[44px] h-[44px]" : "w-[56px] h-[56px]",
      bgClass
    )}>
      <img
        src={imageSrc}
        alt={`${category} vehicle`}
        className={cn(
          "object-contain",
          compact ? "w-[38px] h-[38px]" : "w-[48px] h-[48px]"
        )}
      />
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