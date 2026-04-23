/**
 * StoreMiniMap — Interactive Google Map thumbnail for the store profile rail.
 * Customers can zoom in/out, pan, and tap the marker to open the full map page.
 * Falls back to a branded gradient when the API key or coordinates are missing.
 */
import { useEffect, useRef, useState } from "react";
import { MapPin, ExternalLink, Plus, Minus, Locate } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface StoreMiniMapProps {
  latitude?: number | null;
  longitude?: number | null;
  storeName: string;
  slug: string;
}

let cachedKey: string | null = null;

async function getMapsKey(): Promise<string> {
  if (cachedKey !== null) return cachedKey;
  const envKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "";
  try {
    const { data, error } = await supabase.functions.invoke("maps-api-key");
    if (!error && data?.key) {
      cachedKey = data.key;
      return data.key;
    }
  } catch {
    /* fall through */
  }
  cachedKey = envKey;
  return envKey;
}

async function loadGoogleMaps(apiKey: string): Promise<boolean> {
  if ((window as any).google?.maps) return true;
  const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
  if (existing) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if ((window as any).google?.maps) {
          clearInterval(check);
          resolve(true);
        }
      }, 150);
      setTimeout(() => {
        clearInterval(check);
        resolve(!!(window as any).google?.maps);
      }, 8000);
    });
  }
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export default function StoreMiniMap({ latitude, longitude, storeName, slug }: StoreMiniMapProps) {
  const hasCoords = typeof latitude === "number" && typeof longitude === "number";
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasCoords) return;
    let cancelled = false;

    (async () => {
      const key = await getMapsKey();
      if (!key) {
        setFailed(true);
        return;
      }
      const ok = await loadGoogleMaps(key);
      if (!ok || cancelled || !containerRef.current) {
        setFailed(true);
        return;
      }

      const google = (window as any).google;
      const center = { lat: latitude as number, lng: longitude as number };
      const map = new google.maps.Map(containerRef.current, {
        center,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: false,
        gestureHandling: "greedy",
        clickableIcons: false,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });
      mapRef.current = map;

      // Premium ZIVO pin: glossy emerald teardrop with inner glow + soft ground shadow
      const pinSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="68" viewBox="0 0 56 68">
          <defs>
            <radialGradient id="pinFill" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#34d399"/>
              <stop offset="55%" stop-color="#10b981"/>
              <stop offset="100%" stop-color="#047857"/>
            </radialGradient>
            <radialGradient id="gloss" cx="35%" cy="25%" r="35%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
            </radialGradient>
            <filter id="pinShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.35"/>
            </filter>
          </defs>
          <!-- ground shadow ellipse -->
          <ellipse cx="28" cy="63" rx="9" ry="2.5" fill="#000" opacity="0.25"/>
          <g filter="url(#pinShadow)">
            <!-- teardrop body -->
            <path d="M28 3 C16.4 3 7 12.4 7 24 c0 15.5 21 36 21 36 s21-20.5 21-36 C49 12.4 39.6 3 28 3 z"
                  fill="url(#pinFill)" stroke="#ffffff" stroke-width="3"/>
            <!-- gloss highlight -->
            <path d="M28 3 C16.4 3 7 12.4 7 24 c0 15.5 21 36 21 36 s21-20.5 21-36 C49 12.4 39.6 3 28 3 z"
                  fill="url(#gloss)"/>
            <!-- inner white disc -->
            <circle cx="28" cy="24" r="9" fill="#ffffff"/>
            <!-- emerald dot -->
            <circle cx="28" cy="24" r="4" fill="#10b981"/>
          </g>
        </svg>`;
      const marker = new google.maps.Marker({
        position: center,
        map,
        title: storeName,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(pinSvg),
          scaledSize: new google.maps.Size(56, 68),
          anchor: new google.maps.Point(28, 64),
        },
        animation: google.maps.Animation.DROP,
      });

      marker.addListener("click", () => {
        navigate(`/store-map?focus=${encodeURIComponent(slug)}`);
      });

      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCoords, latitude, longitude]);

  const zoomIn = () => {
    const m = mapRef.current;
    if (m) m.setZoom((m.getZoom() ?? 15) + 1);
  };
  const zoomOut = () => {
    const m = mapRef.current;
    if (m) m.setZoom((m.getZoom() ?? 15) - 1);
  };
  const recenter = () => {
    const m = mapRef.current;
    if (m && hasCoords) {
      m.panTo({ lat: latitude as number, lng: longitude as number });
      m.setZoom(15);
    }
  };

  const showFallback = !hasCoords || failed;

  return (
    <div className="group relative block h-72 w-full overflow-hidden rounded-3xl border border-white/10 bg-card/70 backdrop-blur-2xl shadow-xl shadow-black/10 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20">
      {/* Interactive map container */}
      {!showFallback && (
        <div
          ref={containerRef}
          className="absolute inset-0 h-full w-full"
          style={{ touchAction: "pan-x pan-y" }}
          aria-label={`Interactive map for ${storeName}`}
        />
      )}

      {/* Loading shimmer */}
      {!showFallback && !ready && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-primary/15 via-emerald-500/10 to-sky-500/10" />
      )}

      {/* Fallback gradient + pin */}
      {showFallback && (
        <>
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-emerald-500/15 to-sky-500/15" />
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground) / 0.15) 0.5px, transparent 0)`,
                backgroundSize: "18px 18px",
              }}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-background/60">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Top inner highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent z-10" />

      {/* Zoom controls (top-right) */}
      {!showFallback && (
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={zoomIn}
            aria-label="Zoom in"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur-xl text-foreground shadow-lg ring-1 ring-white/15 transition-all hover:bg-background hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={zoomOut}
            aria-label="Zoom out"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur-xl text-foreground shadow-lg ring-1 ring-white/15 transition-all hover:bg-background hover:scale-105 active:scale-95"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={recenter}
            aria-label="Recenter on store"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-white/20 transition-all hover:scale-105 active:scale-95"
          >
            <Locate className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Bottom action row */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur-xl px-3 py-1.5 shadow-lg ring-1 ring-white/10">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-bold text-foreground tracking-tight">
            {showFallback ? "View location" : "Drag • pinch to zoom"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/store-map?focus=${encodeURIComponent(slug)}`)}
          aria-label={`Open full map for ${storeName}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-white/20 transition-transform duration-300 hover:scale-110 hover:rotate-12"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
