/**
 * UberLikeRideRow - Premium Uber-style ride selection row
 * Features inline SVG car thumbnail, tag pills, and polished selection states
 */

import { cn } from "@/lib/utils";

type RideTag = "wait_save" | "priority" | "green" | "standard" | "lux";

interface UberLikeRideRowProps {
  selected?: boolean;
  name: string;
  tag?: RideTag;
  seats: number;
  time: string;
  eta: string;
  price: string;
  onClick?: () => void;
}

// Inline SVG car thumbnail (Uber-style, no external assets)
function CarThumbnail() {
  return (
    <div className="w-16 h-10 flex items-center justify-center shrink-0">
      <svg
        width="60"
        height="36"
        viewBox="0 0 120 72"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        {/* Shadow ellipse */}
        <ellipse cx="60" cy="64" rx="40" ry="6" fill="rgba(0,0,0,0.12)" />
        
        {/* Car body */}
        <rect x="18" y="30" width="84" height="22" rx="8" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" />
        
        {/* Roof/cabin */}
        <path
          d="M36 30 L46 18 H74 L84 30 Z"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        
        {/* Windows */}
        <rect x="48" y="20" width="24" height="8" rx="2" fill="#cbd5e1" />
        
        {/* Wheels */}
        <circle cx="38" cy="52" r="7" fill="#1f2937" />
        <circle cx="82" cy="52" r="7" fill="#1f2937" />
        <circle cx="38" cy="52" r="3" fill="#6b7280" />
        <circle cx="82" cy="52" r="3" fill="#6b7280" />
        
        {/* Headlights */}
        <rect x="96" y="36" width="6" height="4" rx="1" fill="#fef08a" />
        <rect x="18" y="36" width="6" height="4" rx="1" fill="#fca5a5" />
      </svg>
    </div>
  );
}

// Tag pill with colored dot badges
function TagPill({ tag }: { tag?: RideTag }) {
  if (!tag) return null;
  
  const tagMap: Record<RideTag, { dotClass: string; label: string; bgClass: string }> = {
    wait_save: { dotClass: "bg-blue-400", label: "Save", bgClass: "bg-blue-50 text-blue-700" },
    standard: { dotClass: "bg-yellow-400", label: "", bgClass: "" },
    green: { dotClass: "bg-emerald-400", label: "Eco", bgClass: "bg-emerald-50 text-emerald-700" },
    priority: { dotClass: "bg-orange-400", label: "Fast", bgClass: "bg-orange-50 text-orange-700" },
    lux: { dotClass: "bg-purple-400", label: "Elite", bgClass: "bg-purple-50 text-purple-700" },
  };
  
  const item = tagMap[tag];
  
  // Standard shows only the dot indicator, no label pill
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

export function UberLikeRideRow({
  selected = false,
  name,
  tag,
  seats,
  time,
  eta,
  price,
  onClick,
}: UberLikeRideRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left",
        "rounded-2xl px-4 py-3",
        "bg-white",
        "transition-all active:scale-[0.99]",
        selected
          ? "border-2 border-black shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
          : "border border-black/5 shadow-[0_6px_16px_rgba(0,0,0,0.06)] hover:bg-zinc-50/50"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Car thumbnail (Uber feel) */}
        <CarThumbnail />

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate text-[15px] font-semibold text-zinc-900">
              {name}
            </span>
            <TagPill tag={tag} />
            <span className="ml-auto inline-flex items-center gap-0.5 text-[12px] font-medium text-zinc-500 shrink-0">
              <span aria-hidden className="text-[11px]">👤</span> {seats}
            </span>
          </div>

          <div className="mt-0.5 text-[13px] text-zinc-500">
            {time} · {eta}
          </div>
        </div>

        {/* Price */}
        <div className="text-[17px] font-bold text-zinc-900 tabular-nums shrink-0">
          {price}
        </div>
      </div>
    </button>
  );
}
