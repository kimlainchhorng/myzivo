/**
 * LodgingRoomDetailsModal — full room information view with photo carousel,
 * description, amenities, add-ons, and policies. Sticky footer with Reserve.
 */
import { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, BedDouble, Users, Coffee, Maximize2, Clock,
  ShieldCheck, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel, CarouselContent, CarouselItem, type CarouselApi,
} from "@/components/ui/carousel";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getAmenityIcon } from "@/components/lodging/amenityIcons";
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

const PER_LABEL: Record<LodgeAddon["per"], string> = {
  night: "per night",
  guest: "per guest",
  stay: "per stay",
};

export function LodgingRoomDetailsModal({
  open, onOpenChange, name, type, beds, maxGuests, sizeSqm, baseRateCents,
  description, amenities = [], breakfastIncluded, photos = [], coverIndex = 0,
  addons = [], cancellationPolicy, checkInTime, checkOutTime, onReserve,
}: Props) {
  const { format } = useCurrency();

  // Reorder so cover is first
  const orderedPhotos = photos.length > 0
    ? [photos[coverIndex] ?? photos[0], ...photos.filter((_, i) => i !== (coverIndex ?? 0))]
    : [];
  const total = orderedPhotos.length;

  const [api, setApi] = useState<CarouselApi>();
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [errored, setErrored] = useState<Record<number, boolean>>({});

  // Sync embla → idx
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIdx(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api]);

  // Reset state when modal re-opens or photos change
  useEffect(() => {
    if (open) {
      setIdx(0);
      api?.scrollTo(0, true);
    }
  }, [open, api, total]);

  // Keyboard nav while modal is open
  useEffect(() => {
    if (!open || !api || total <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); api.scrollPrev(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); api.scrollNext(); }
      else if (e.key === "Home") { e.preventDefault(); api.scrollTo(0); }
      else if (e.key === "End") { e.preventDefault(); api.scrollTo(total - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, api, total]);

  const handleReserve = useCallback(() => {
    onReserve();
    requestAnimationFrame(() => onOpenChange(false));
  }, [onReserve, onOpenChange]);

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
              {format(baseRateCents / 100, "USD")}
              <span className="text-xs font-medium text-muted-foreground"> /night</span>
            </p>
            <p className="text-[10px] text-muted-foreground">Taxes calculated at booking</p>
          </div>
          <Button
            onClick={handleReserve}
            className="font-bold"
            aria-label={`Reserve ${name}`}
            data-testid="reserve-from-details"
          >
            Reserve
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Photo carousel */}
        <div
          className="relative -mx-1 focus-visible:outline-none"
          tabIndex={0}
          aria-roledescription="carousel"
          aria-label={`${name} photos`}
        >
          {total > 0 ? (
            <Carousel opts={{ loop: total > 1 }} setApi={setApi} className="w-full">
              <CarouselContent>
                {orderedPhotos.map((src, i) => (
                  <CarouselItem key={`${src}-${i}`}>
                    <div className="aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 relative">
                      {!loaded[i] && !errored[i] && (
                        <Skeleton className="absolute inset-0 rounded-xl" />
                      )}
                      {errored[i] ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <BedDouble className="h-10 w-10 text-muted-foreground/40" />
                          <span className="text-xs text-muted-foreground">Image unavailable</span>
                        </div>
                      ) : (
                        <img
                          src={src}
                          alt={`${name} photo ${i + 1} of ${total}`}
                          loading="lazy"
                          onLoad={() => setLoaded(p => ({ ...p, [i]: true }))}
                          onError={() => setErrored(p => ({ ...p, [i]: true }))}
                          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded[i] ? "opacity-100" : "opacity-0"}`}
                        />
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center gap-2">
              <BedDouble className="h-10 w-10 text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground">Photo coming soon</span>
            </div>
          )}

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow z-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => api?.scrollNext()}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow z-10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-[10px] font-semibold tabular-nums shadow">
                {idx + 1} / {total}
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {orderedPhotos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to photo ${i + 1}`}
                    onClick={() => api?.scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {amenities.map((a) => {
                const Icon = getAmenityIcon(a);
                return (
                  <div key={a} className="flex items-center gap-2 text-xs text-foreground">
                    <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{a}</span>
                  </div>
                );
              })}
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
                <div key={i} className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground truncate">{a.name || "Untitled"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground tabular-nums">
                      +{format(a.price_cents / 100, "USD")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{PER_LABEL[a.per]}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Optional — choose during booking. Prices shown per the property's policy.
            </p>
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
