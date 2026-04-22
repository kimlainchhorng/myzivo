/**
 * LodgingRoomCard - public-facing room card on store profile.
 * Tap card body → opens details modal. Reserve button → booking flow.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Users, BedDouble, Coffee, Plus, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LodgingRoomDetailsModal } from "@/components/lodging/LodgingRoomDetailsModal";
import type { LodgeAddon } from "@/hooks/lodging/useLodgeRooms";

interface Props {
  name: string;
  type?: string | null;
  beds?: string | null;
  maxGuests: number;
  baseRateCents: number;
  amenities?: string[];
  breakfastIncluded?: boolean;
  imageUrl?: string;
  description?: string | null;
  addonsCount?: number;
  /** Optional: full photos array + cover index. If provided, takes precedence over imageUrl. */
  photos?: string[];
  coverIndex?: number;
  /** Extended fields for details modal */
  sizeSqm?: number | null;
  addons?: LodgeAddon[];
  cancellationPolicy?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  onReserve: () => void;
}

export function LodgingRoomCard({
  name, type, beds, maxGuests, baseRateCents, amenities = [], breakfastIncluded, imageUrl,
  description, addonsCount = 0, photos, coverIndex, sizeSqm, addons, cancellationPolicy,
  checkInTime, checkOutTime, onReserve,
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const hasPhotos = !!(photos && photos.length > 0);
  const resolvedImage = hasPhotos
    ? (photos![coverIndex ?? 0] ?? photos![0])
    : imageUrl;
  const totalAddons = addons?.length ?? addonsCount;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm"
      >
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          aria-label={`View details for ${name}`}
          className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="aspect-[16/9] bg-gradient-to-br from-muted to-muted/50 relative">
            {resolvedImage ? (
              <img src={resolvedImage} alt={name} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center gap-1.5">
                <BedDouble className="h-10 w-10 text-muted-foreground/40" />
                <span className="text-[11px] text-muted-foreground font-medium">Photo coming soon</span>
              </div>
            )}
            {type && (
              <Badge className="absolute top-2 left-2 text-[10px] bg-background/90 text-foreground border-border">
                {type}
              </Badge>
            )}
          </div>
          <div className="p-4 space-y-2">
            <p className="font-bold text-base leading-tight">{name}</p>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {beds && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {beds}</span>}
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Sleeps {maxGuests}</span>
              {breakfastIncluded && <span className="flex items-center gap-1"><Coffee className="h-3 w-3" /> Breakfast</span>}
              {totalAddons > 0 && (
                <span className="flex items-center gap-1 text-primary"><Plus className="h-3 w-3" /> {totalAddons} add-on{totalAddons > 1 ? "s" : ""}</span>
              )}
            </div>
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {amenities.slice(0, 4).map(a => (
                  <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{a}</span>
                ))}
                {amenities.length > 4 && <span className="text-[10px] text-muted-foreground">+{amenities.length - 4}</span>}
              </div>
            )}
          </div>
        </button>
        <div className="flex items-end justify-between gap-3 px-4 pb-4 pt-1">
          <div>
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="text-[11px] font-semibold text-primary inline-flex items-center gap-0.5 hover:underline"
            >
              View details <ChevronRight className="h-3 w-3" />
            </button>
            <p className="text-xl font-extrabold text-foreground mt-0.5">${(baseRateCents / 100).toFixed(2)}<span className="text-xs font-medium text-muted-foreground"> /night</span></p>
          </div>
          <Button onClick={onReserve} className="font-bold">Reserve</Button>
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
