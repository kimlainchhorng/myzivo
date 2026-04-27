/**
 * LodgingRoomCard - public-facing room card on store profile.
 * Premium "magazine" style: type badge top-left, ornament divider, 2-column
 * photo grid with key info overlaid on the leading panel, clean Reserve CTA.
 * Tap card body → opens details modal. Reserve button → booking flow.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { BedDouble, ChevronRight, Wifi, Snowflake, Tv, ShieldCheck, Coffee, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LodgingRoomDetailsModal } from "@/components/lodging/LodgingRoomDetailsModal";
import { getAmenityIcon } from "@/components/lodging/amenityIcons";
import type { LodgeAddon } from "@/hooks/lodging/useLodgeRooms";

interface Props {
  name: string;
  type?: string | null;
  beds?: string | null;
  maxGuests: number;
  baseRateCents: number;
  weekendRateCents?: number;
  weeklyDiscountPct?: number;
  monthlyDiscountPct?: number;
  amenities?: string[];
  breakfastIncluded?: boolean;
  imageUrl?: string;
  description?: string | null;
  addonsCount?: number;
  photos?: string[];
  coverIndex?: number;
  sizeSqm?: number | null;
  addons?: LodgeAddon[];
  cancellationPolicy?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  onReserve: () => void;
}

/** Tiny floral ornament divider — vector, no asset dependency */
function OrnamentDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5 px-3 py-1.5">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-200/60 to-sky-300/40" />
      <svg viewBox="0 0 40 12" className="h-3 w-10 text-sky-400/80" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M2 6 Q 8 1, 14 6 T 26 6 T 38 6" />
        <circle cx="20" cy="6" r="1.2" fill="currentColor" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-sky-200/60 to-sky-300/40" />
    </div>
  );
}

export function LodgingRoomCard({
  name, type, beds, maxGuests, baseRateCents,
  weekendRateCents, weeklyDiscountPct = 0, monthlyDiscountPct = 0,
  amenities = [], breakfastIncluded, imageUrl,
  description, addonsCount = 0, photos, coverIndex, sizeSqm, addons, cancellationPolicy,
  checkInTime, checkOutTime, onReserve,
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const allPhotos = photos && photos.length > 0 ? photos : (imageUrl ? [imageUrl] : []);
  const cover = allPhotos[coverIndex ?? 0] ?? allPhotos[0];
  const gridPhotos: (string | undefined)[] = [
    allPhotos[0],
    allPhotos[1],
    allPhotos[2],
    allPhotos[3],
    allPhotos[4],
    allPhotos[5],
    allPhotos[6],
    allPhotos[7],
    allPhotos[8],
  ];
  const totalAddons = addons?.length ?? addonsCount;

  // Quick chip amenities (icons + labels) — show first 4
  const quickChips = amenities.slice(0, 4);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden border border-border/60 bg-card shadow-[0_8px_28px_-12px_hsl(220_40%_20%/0.18)]"
      >
        {/* ── Top: stylized type chip + ornament ── */}
        {type && (
          <div className="relative pt-3">
            <span className="absolute top-3 left-3 z-10 inline-flex items-center rounded-xl bg-background/95 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-foreground border border-border/60 shadow-sm">
              {type}
            </span>
            <OrnamentDivider />
          </div>
        )}

        {/* ── Hero: 2-col photo grid with overlaid info on the left tile ── */}
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          aria-label={`View details for ${name}`}
          className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring px-3"
        >
          <div className="grid grid-cols-[1.05fr_1fr] gap-1.5 rounded-2xl overflow-hidden">
            {/* Left big tile w/ info overlay */}
            <div className="relative aspect-[4/5] bg-gradient-to-br from-sky-100 to-sky-200/60 overflow-hidden rounded-l-2xl">
              {gridPhotos[0] ? (
                <img src={gridPhotos[0]} alt={name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BedDouble className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
              {/* Stronger left-anchored gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/55 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/30" />
              {/* Info overlay column */}
              <div className="absolute inset-0 p-3 flex flex-col justify-between text-white">
                <div className="space-y-2.5">
                  {type && (
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.14em] font-bold text-white/65 leading-none">Type of {type.toLowerCase()}</p>
                      <p className="text-[12px] font-extrabold leading-tight mt-1 line-clamp-2 drop-shadow-md tracking-wide uppercase">{name}</p>
                    </div>
                  )}
                  {beds && (
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.14em] font-bold text-white/65 leading-none">Size of bed</p>
                      <p className="text-[11px] font-bold leading-tight mt-1 drop-shadow-md">{beds}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.14em] font-bold text-white/65 leading-none">Occupancy</p>
                    <p className="text-[11px] font-bold leading-tight mt-1 drop-shadow-md">{maxGuests} {maxGuests === 1 ? "guest" : "guests"}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/15">
                  <p className="text-[8px] uppercase tracking-[0.14em] font-bold text-white/65 leading-none">Weekday</p>
                  <p className="text-[15px] font-black leading-tight mt-1 drop-shadow-md tracking-tight">US${(baseRateCents / 100).toFixed(0)}</p>
                </div>
              </div>
            </div>

            {/* Right column: 2x2 mini grid of photos */}
            <div className="grid grid-rows-2 gap-1.5">
              {[1, 2].map((row) => (
                <div key={row} className="grid grid-cols-2 gap-1.5">
                  {[gridPhotos[row * 2 - 1], gridPhotos[row * 2]].map((src, i) => {
                    const isLastTile = row === 2 && i === 1;
                    const extraCount = isLastTile && allPhotos.length > 5 ? allPhotos.length - 5 : 0;
                    return (
                      <div
                        key={i}
                        className={`relative bg-gradient-to-br from-muted to-muted/50 overflow-hidden ${row === 1 && i === 1 ? "rounded-tr-2xl" : ""} ${row === 2 && i === 1 ? "rounded-br-2xl" : ""}`}
                      >
                        {src ? (
                          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        ) : cover ? (
                          <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" loading="lazy" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BedDouble className="h-5 w-5 text-muted-foreground/30" />
                          </div>
                        )}
                        {extraCount > 0 && (
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="text-white text-[13px] font-extrabold tracking-tight drop-shadow">+{extraCount}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ── Title + chips ── */}
          <div className="px-1 pt-3 pb-1 space-y-2">
            <p className="font-extrabold text-base leading-tight tracking-tight uppercase">{name}</p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
              {beds && (
                <span className="flex items-center gap-1">
                  <BedDouble className="h-3 w-3" /> {beds}
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
                Sleeps {maxGuests}
              </span>
              {sizeSqm && (
                <span className="flex items-center gap-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
                  {sizeSqm} m² · {Math.round(sizeSqm * 10.764)} ft²
                </span>
              )}
            </div>
            {(quickChips.length > 0 || breakfastIncluded || totalAddons > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {quickChips.map((a) => {
                  const Icon = getAmenityIcon(a);
                  return (
                    <span
                      key={a}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 inline-flex items-center gap-1 font-medium dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20"
                    >
                      <Icon className="h-2.5 w-2.5" />
                      {a}
                    </span>
                  );
                })}
                {breakfastIncluded && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 inline-flex items-center gap-1 font-medium dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
                    <Coffee className="h-2.5 w-2.5" /> Breakfast
                  </span>
                )}
                {amenities.length > 4 && (
                  <span className="text-[10px] text-muted-foreground self-center">+{amenities.length - 4}</span>
                )}
                {totalAddons > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 inline-flex items-center gap-1 font-medium dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
                    <Plus className="h-2.5 w-2.5" /> {totalAddons} add-on{totalAddons > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>
        </button>

        {/* ── Footer: View details + price + Reserve ── */}
        <div className="flex items-end justify-between gap-3 px-4 pb-4 pt-2">
          <div>
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5 hover:underline"
            >
              View details <ChevronRight className="h-3 w-3" />
            </button>
            <p className="text-xl font-extrabold text-foreground mt-0.5 leading-none">
              ${(baseRateCents / 100).toFixed(2)}
              <span className="text-xs font-medium text-muted-foreground"> /night</span>
            </p>
          </div>
          <Button
            onClick={onReserve}
            className="font-bold rounded-full px-6 h-10 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
          >
            Reserve
          </Button>
        </div>
      </motion.div>

      <LodgingRoomDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        name={name}
        type={type}
        beds={beds}
        maxGuests={maxGuests}
        sizeSqm={sizeSqm}
        baseRateCents={baseRateCents}
        description={description}
        amenities={amenities}
        breakfastIncluded={breakfastIncluded}
        photos={photos}
        coverIndex={coverIndex}
        addons={addons}
        cancellationPolicy={cancellationPolicy}
        checkInTime={checkInTime}
        checkOutTime={checkOutTime}
        onReserve={onReserve}
      />
    </>
  );
}
