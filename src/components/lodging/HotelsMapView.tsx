/**
 * HotelsMapView — Interactive Google Map with price-pill overlays.
 *
 * Users can pinch-zoom, drag, and tap the +/- controls. Each property is
 * rendered as a custom HTML pill (price or hotel icon) using an OverlayView
 * so styling stays consistent with the rest of the UI.
 */
/// <reference types="google.maps" />
import { useEffect, useMemo, useRef, useState } from "react";
import Star from "lucide-react/dist/esm/icons/star";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
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

// ---- Shared script loader (module-scoped so we only load once) -------------
let mapsScriptPromise: Promise<void> | null = null;
function loadMapsScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as unknown as { google?: { maps?: unknown } };
  if (w.google?.maps) return Promise.resolve();
  if (mapsScriptPromise) return mapsScriptPromise;
  if (!apiKey) return Promise.reject(new Error("no maps key"));
  mapsScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-zivo-maps="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("maps script failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;
    s.async = true;
    s.defer = true;
    s.dataset.zivoMaps = "1";
    s.onload = () => resolve();
    s.onerror = () => { mapsScriptPromise = null; reject(new Error("maps script failed")); };
    document.head.appendChild(s);
  });
  return mapsScriptPromise;
}

// ---- Component -------------------------------------------------------------
export default function HotelsMapView({ hotels, onSelect, apiKey }: Props) {
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
    if (!valid.find((h) => h.id === activeId)) setActiveId(valid[0]?.id ?? null);
  }, [valid, activeId]);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlaysRef = useRef<Map<string, google.maps.OverlayView>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  const focusCard = (id: string) => {
    cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  // Initialize the interactive map once the script is loaded
  useEffect(() => {
    if (!resolvedKey || !mapContainerRef.current || valid.length === 0) return;
    let cancelled = false;
    loadMapsScript(resolvedKey)
      .then(() => {
        if (cancelled || !mapContainerRef.current) return;
        if (!mapRef.current) {
          mapRef.current = new google.maps.Map(mapContainerRef.current, {
            center: { lat: valid[0].latitude, lng: valid[0].longitude },
            zoom: 12,
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: "greedy",
            clickableIcons: false,
            styles: [
              { featureType: "poi", stylers: [{ visibility: "off" }] },
              { featureType: "transit", stylers: [{ visibility: "off" }] },
              { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
            ],
          });
        }
        setMapReady(true);
      })
      .catch(() => { /* noop — fallback UI shown below */ });
    return () => { cancelled = true; };
  }, [resolvedKey, valid.length]);

  // Fit bounds to all hotels when the set changes
  useEffect(() => {
    if (!mapReady || !mapRef.current || valid.length === 0) return;
    if (valid.length === 1) {
      mapRef.current.setCenter({ lat: valid[0].latitude, lng: valid[0].longitude });
      mapRef.current.setZoom(13);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    valid.forEach((h) => bounds.extend({ lat: h.latitude, lng: h.longitude }));
    mapRef.current.fitBounds(bounds, 48);
  }, [mapReady, valid]);

  // Render price-pill overlays
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    // Custom overlay class — created lazily after google.maps is loaded
    class PillOverlay extends google.maps.OverlayView {
      private pos: google.maps.LatLng;
      private el: HTMLElement;
      constructor(pos: google.maps.LatLng, el: HTMLElement) {
        super();
        this.pos = pos;
        this.el = el;
      }
      onAdd() {
        const panes = this.getPanes();
        if (panes) panes.floatPane.appendChild(this.el);
      }
      draw() {
        const proj = this.getProjection();
        if (!proj) return;
        const p = proj.fromLatLngToDivPixel(this.pos);
        if (!p) return;
        this.el.style.position = "absolute";
        this.el.style.left = `${p.x}px`;
        this.el.style.top = `${p.y}px`;
        this.el.style.transform = "translate(-50%, -100%)";
      }
      onRemove() {
        if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
      }
    }

    // Clear previous overlays
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current.clear();

    valid.forEach((h) => {
      const isActive = h.id === activeId;
      const priceLabel = formatPrice(h.pricePerNightCents);
      const el = document.createElement("button");
      el.type = "button";
      el.className =
        "pointer-events-auto rounded-full font-bold text-[11px] px-2.5 py-1 shadow-md whitespace-nowrap border transition-transform " +
        (isActive
          ? "bg-foreground text-background border-foreground scale-110 z-20"
          : "bg-white text-black border-black/10 hover:scale-105 z-10");
      el.style.cursor = "pointer";
      el.innerHTML = priceLabel
        ? priceLabel
        : '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22v-6.57"/><path d="M12 11h.01"/><path d="M12 7h.01"/><path d="M14 15.43V22"/><path d="M15 16a5 5 0 0 0-6 0"/><path d="M16 11h.01"/><path d="M16 7h.01"/><path d="M8 11h.01"/><path d="M8 7h.01"/><rect x="4" y="2" width="16" height="20" rx="2"/></svg>';
      el.setAttribute("aria-label", `${h.name}${priceLabel ? ` from ${priceLabel} per night` : ""}`);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (h.id === activeId) onSelect(h.id);
        else { setActiveId(h.id); focusCard(h.id); }
      });
      const overlay = new PillOverlay(new google.maps.LatLng(h.latitude, h.longitude), el);
      overlay.setMap(map);
      overlaysRef.current.set(h.id, overlay);
    });

    return () => {
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current.clear();
    };
  }, [mapReady, valid, activeId, onSelect]);

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

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card">
      {/* Interactive map */}
      <div className="relative aspect-[16/9] w-full bg-muted overflow-hidden">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <MapPin className="w-10 h-10 text-muted-foreground/40 animate-pulse" />
          </div>
        )}
        {/* Top-right counter pill */}
        <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/95 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold shadow-md pointer-events-none">
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
