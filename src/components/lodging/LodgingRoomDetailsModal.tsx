/**
 * LodgingRoomDetailsModal — full room information view with photo carousel,
 * description, amenities, add-ons, and policies. Sticky footer with Reserve.
 */
import { useState } from "react";
import { ChevronLeft, ChevronRight, BedDouble, Users, Coffee, Maximize2, Clock, ShieldCheck, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import type { LodgeAddon } from "@/hooks/lodging/useLodgeRooms";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
  type?: string | null;
  beds?: string | null;
  maxGuests: number;
  sizeSqm?: number | null;
  baseRateCents: number;
  description?: string | null;
  amenities?: string[];
  breakfastIncluded?: boolean;
  photos?: string[];
  coverIndex?: number;
  addons?: LodgeAddon[];
  cancellationPolicy?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  onReserve: () => void;
}

const POLICY_LABELS: Record<string, string> = {
  flexible: "Flexible — full refund up to 24h before check-in",
  moderate: "Moderate — full refund up to 5 days before",
  strict: "Strict — 50% refund up to 7 days before",
  non_refundable: "Non-refundable",
};

function formatAddonPrice(a: LodgeAddon) {
  const dollars = (a.price_cents / 100).toFixed(2);
  const suffix = a.per === "night" ? "/night" : a.per === "guest" ? "/guest" : "/stay";
  return `+$${dollars} ${suffix}`;
}

export function LodgingRoomDetailsModal({
  open, onOpenChange, name, type, beds, maxGuests, sizeSqm, baseRateCents,
  description, amenities = [], breakfastIncluded, photos = [], coverIndex = 0,
  addons = [], cancellationPolicy, checkInTime, checkOutTime, onReserve,
}: Props) {
  // Reorder photos so cover is first
  const orderedPhotos = photos.length > 0
    ? [photos[coverIndex] ?? photos[0], ...photos.filter((_, i) => i !== (coverIndex ?? 0))]
    : [];
  const [idx, setIdx] = useState(0);

  const next = () => setIdx((i) => (i + 1) % orderedPhotos.length);
  const prev = () => setIdx((i) => (i - 1 + orderedPhotos.length) % orderedPhotos.length);

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={name}
      description={type || undefined}
      footer={
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-extrabold text-foreground">
              ${(baseRateCents / 100).toFixed(2)}
              <span className="text-xs font-medium text-muted-foreground"> /night</span>
            </p>
            <p className="text-[10px] text-muted-foreground">Taxes calculated at booking</p>
          </div>
          <Button onClick={() => { onOpenChange(false); onReserve(); }} className="font-bold">
            Reserve
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Photo carousel */}
        <div className="relative -mx-1">
          <div className="aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 relative">
            {orderedPhotos.length > 0 ? (
              <img
                src={orderedPhotos[idx]}
                alt={`${name} ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center gap-2">
                <BedDouble className="h-10 w-10 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground">Photo coming soon</span>
              </div>
            )}
            {orderedPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous photo"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next photo"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {orderedPhotos.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {beds && <span className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5" /> {beds}</span>}
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Sleeps {maxGuests}</span>
          {sizeSqm != null && <span className="flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5" /> {sizeSqm} m²</span>}
          {breakfastIncluded && <span className="flex items-center gap-1.5 text-primary"><Coffee className="h-3.5 w-3.5" /> Breakfast included</span>}
        </div>

        {/* Description */}
        {description && (
          <div>
            <h3 className="text-sm font-bold mb-1.5">About this room</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{description}</p>
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div>
            <h3 className="text-sm font-bold mb-2">Amenities</h3>
            <div className="grid grid-cols-2 gap-2">
              {amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 text-xs text-foreground">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons */}
        {addons.length > 0 && (
          <div>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-primary" /> Available extras
            </h3>
            <div className="space-y-1.5">
              {addons.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-sm font-medium">{a.name || "Untitled"}</span>
                  <Badge variant="secondary" className="text-xs">{formatAddonPrice(a)}</Badge>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">Pick extras during booking.</p>
          </div>
        )}

        {/* Policies */}
        <div>
          <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Policies
          </h3>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {cancellationPolicy && (
              <p><span className="font-medium text-foreground">Cancellation:</span> {POLICY_LABELS[cancellationPolicy] ?? cancellationPolicy}</p>
            )}
            {(checkInTime || checkOutTime) && (
              <p className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>
                  {checkInTime && <>Check-in from <span className="font-medium text-foreground">{checkInTime}</span></>}
                  {checkInTime && checkOutTime && " · "}
                  {checkOutTime && <>Check-out by <span className="font-medium text-foreground">{checkOutTime}</span></>}
                </span>
              </p>
            )}
            {breakfastIncluded && <p>Breakfast is included with your stay.</p>}
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}
