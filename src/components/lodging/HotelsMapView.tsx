/**
 * HotelsMapView — Booking-style map preview for the hotels listing.
 *
 * Renders a static-map base image (no JS SDK billing required) and overlays
 * HTML price pills positioned with Web Mercator math. Tapping a pill or a
 * card in the carousel highlights the property; tapping the active pill or
 * card opens the detail page.
 */
import { useMemo, useRef, useState, useEffect } from "react";
import Star from "lucide-react/dist/esm/icons/star";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Hotel from "lucide-react/dist/esm/icons/hotel";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import { resolveMapsKey } from "@/lib/mapsKey";

export interface MapHotel {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  banner_url: string | null;
  logo_url: string | null;
  latitude: number;
  longitude: number;
  pricePerNightCents?: number | null;
  rating?: number | null;
  reviewCount?: number;
}

const formatPrice = (cents?: number | null) =>
  typeof cents === "number" && cents > 0 ? `$${Math.round(cents / 100)}` : null;

interface Props {
  hotels: MapHotel[];
  onSelect: (hotelId: string) => void;
  apiKey: string;
}

const MAP_W = 640;
const MAP_H = 360;
const TILE = 256;

// Web Mercator projection (Google Static Maps' projection).
function project(lat: number, lng: number) {
  const siny = Math.max(-0.9999, Math.min(0.9999, Math.sin((lat * Math.PI) / 180)));
  return {
    x: TILE * (0.5 + lng / 360),
    y: TILE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)),
  };
}

function pickCenterAndZoom(hotels: MapHotel[]): { center: { lat: number; lng: number }; zoom: number } {
  if (hotels.length === 0) return { center: { lat: 12.5657, lng: 104.991 }, zoom: 6 };
  if (hotels.length === 1) return { center: { lat: hotels[0].latitude, lng: hotels[0].longitude }, zoom: 13 };

  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const h of hotels) {
    if (h.latitude < minLat) minLat = h.latitude;
    if (h.latitude > maxLat) maxLat = h.latitude;
    if (h.longitude < minLng) minLng = h.longitude;
    if (h.longitude > maxLng) maxLng = h.longitude;
  }
  const center = { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };

  // Pick the largest zoom where all markers still fit in view (with padding).
  const PAD_FRAC = 0.85;
  let zoom = 13;
  for (let z = 14; z >= 3; z--) {
    const scale = Math.pow(2, z);
    const c = project(center.lat, center.lng);
    let ok = true;
    for (const h of hotels) {
      const p = project(h.latitude, h.longitude);
      const dx = (p.x - c.x) * scale;
      const dy = (p.y - c.y) * scale;
      if (Math.abs(dx) > (MAP_W / 2) * PAD_FRAC || Math.abs(dy) > (MAP_H / 2) * PAD_FRAC) {
        ok = false;
        break;
      }
    }
    if (ok) { zoom = z; break; }
  }
  return { center, zoom };
}

function buildStaticMapUrl(apiKey: string, center: { lat: number; lng: number }, zoom: number): string | null {
  if (!apiKey) return null;
  const params = new URLSearchParams();
  params.set("center", `${center.lat},${center.lng}`);
  params.set("zoom", String(zoom));
  params.set("size", `${MAP_W}x${MAP_H}`);
  params.set("scale", "2");
  params.set("maptype", "roadmap");
  // Hide POIs / transit / road labels so price pills are the focal point.
  params.append("style", "feature:poi|visibility:off");
  params.append("style", "feature:transit|visibility:off");
  params.append("style", "feature:road|element:labels|visibility:off");
  params.append("style", "feature:administrative|element:labels.text|visibility:simplified");
  params.set("key", apiKey);
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

export default function HotelsMapView({ hotels, onSelect, apiKey }: Props) {
  // Fall back to the shared resolver (env var → maps-api-key edge function)
  // when the parent didn't supply a key.
  const [resolvedKey, setResolvedKey] = useState<string>(apiKey || "");
  useEffect(() => {
    if (apiKey) { setResolvedKey(apiKey); return; }
    let cancelled = false;
    void resolveMapsKey().then((k) => { if (!cancelled) setResolvedKey(k); });
    return () => { cancelled = true; };
  }, [apiKey]);

  const valid = useMemo(
    () =>
      hotels.filter(
        (h) =>
          typeof h.latitude === "number" &&
          typeof h.longitude === "number" &&
          Number.isFinite(h.latitude) &&
          Number.isFinite(h.longitude),
      ),
    [hotels],
  );

  const [activeId, setActiveId] = useState<string | null>(valid[0]?.id ?? null);
  useEffect(() => {
    if (!valid.find((h) => h.id === activeId)) {
      setActiveId(valid[0]?.id ?? null);
    }
  }, [valid, activeId]);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const focusCard = (id: string) => {
    const node = cardRefs.current[id];
    node?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  if (valid.length === 0) {
    return (
      <div className="h-[60vh] rounded-2xl border border-border bg-card flex flex-col items-center justify-center text-center px-6">
        <MapPin className="w-10 h-10 text-muted-foreground/40 mb-2" />
        <p className="text-sm font-semibold">No mapped properties yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Switch to the list view to browse hotels without a fixed location.
        </p>
      </div>
    );
  }

  const { center, zoom } = pickCenterAndZoom(valid);
  const staticMapUrl = buildStaticMapUrl(resolvedKey, center, zoom);

  // Convert lat/lng to pixel coordinates within the rendered image.
  const scale = Math.pow(2, zoom);
  const centerPx = project(center.lat, center.lng);

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card">
      {/* Map preview header with price-pill overlays */}
      <div className="relative aspect-[16/9] w-full bg-muted overflow-hidden">
        {staticMapUrl ? (
          <img
            src={staticMapUrl}
            alt="Map of properties"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}

        {/* Price pills as percentage-positioned overlays so they scale with
            the rendered image regardless of device width. */}
        <div className="absolute inset-0 pointer-events-none">
          {valid.map((h) => {
            const p = project(h.latitude, h.longitude);
            const xPx = MAP_W / 2 + (p.x - centerPx.x) * scale;
            const yPx = MAP_H / 2 + (p.y - centerPx.y) * scale;
            // Reject pills that would render outside the visible viewport.
            if (xPx < 0 || xPx > MAP_W || yPx < 0 || yPx > MAP_H) return null;
            const leftPct = (xPx / MAP_W) * 100;
            const topPct = (yPx / MAP_H) * 100;
            const isActive = h.id === activeId;
            const priceLabel = formatPrice(h.pricePerNightCents);
            const hasPrice = !!priceLabel;
            return (
              <button
                key={`pill-${h.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isActive) {
                    onSelect(h.id);
                  } else {
                    setActiveId(h.id);
                    focusCard(h.id);
                  }
                }}
                aria-label={`${h.name}${priceLabel ? ` from ${priceLabel} per night` : ""}`}
                className={
                  "pointer-events-auto absolute -translate-x-1/2 -translate-y-full rounded-full font-bold text-[11px] px-2.5 py-1 shadow-md whitespace-nowrap transition transform-gpu border " +
                  (isActive
                    ? "bg-foreground text-background border-foreground scale-110 z-20"
                    : "bg-white text-black border-black/10 hover:scale-105 z-10")
                }
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              >
                {hasPrice ? priceLabel : <Hotel className="w-3 h-3" />}
              </button>
            );
          })}
        </div>

        {/* Top-right counter pill */}
        <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/95 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold shadow-md">
          <MapPin className="w-3 h-3 text-emerald-600" />
          {valid.length} {valid.length === 1 ? "property" : "properties"}
        </div>
      </div>

      {/* Horizontal card carousel */}
      <div className="relative">
        {valid.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-background/95 border border-border shadow-md hover:bg-background"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-background/95 border border-border shadow-md hover:bg-background"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-3 py-3 scrollbar-hide"
        >
          {valid.map((h) => {
            const priceLabel = formatPrice(h.pricePerNightCents);
            const isActive = h.id === activeId;
            return (
              <button
                key={h.id}
                ref={(el) => { cardRefs.current[h.id] = el; }}
                type="button"
                onClick={() => onSelect(h.id)}
                onFocus={() => setActiveId(h.id)}
                onMouseEnter={() => setActiveId(h.id)}
                className={
                  "snap-start shrink-0 w-[280px] text-left rounded-2xl border bg-card overflow-hidden transition active:scale-[0.99] " +
                  (isActive ? "border-emerald-500 shadow-md" : "border-border hover:border-foreground/20")
                }
              >
                <div className="flex">
                  <div className="w-24 h-24 shrink-0 bg-muted">
                    {(h.banner_url || h.logo_url) ? (
                      <img
                        src={h.banner_url || h.logo_url || ""}
                        alt={h.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0 p-2.5">
                    <p className="text-[13px] font-bold truncate">{h.name}</p>
                    {h.address && (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{h.address}</p>
                    )}
                    <div className="mt-1.5 flex items-center justify-between gap-1">
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                        {typeof h.rating === "number" ? h.rating.toFixed(1) : "New"}
                        {h.reviewCount ? <span className="font-normal opacity-70">({h.reviewCount})</span> : null}
                      </span>
                      {priceLabel && (
                        <span className="text-[11px] font-bold whitespace-nowrap">
                          from <span className="text-emerald-600">{priceLabel}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
