/**
 * StoreMiniMap — lightweight Google Static Maps thumbnail for the store profile rail.
 * Fetches the Maps API key from the `maps-api-key` edge function (with env fallback)
 * so it works in both dev and production. Falls back to a branded gradient when the
 * key or coordinates are missing.
 */
import { useEffect, useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
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
    /* fall through to env */
  }
  cachedKey = envKey;
  return envKey;
}

export default function StoreMiniMap({ latitude, longitude, storeName, slug }: StoreMiniMapProps) {
  const hasCoords = typeof latitude === "number" && typeof longitude === "number";
  const center = hasCoords ? `${latitude},${longitude}` : "";
  const [apiKey, setApiKey] = useState<string>(cachedKey ?? "");

  useEffect(() => {
    if (!hasCoords) return;
    let cancelled = false;
    getMapsKey().then((k) => {
      if (!cancelled) setApiKey(k);
    });
    return () => {
      cancelled = true;
    };
  }, [hasCoords]);

  // Static map URL with emerald-tinted ZIVO pin
  const staticMapUrl =
    hasCoords && apiKey
      ? `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=15&size=640x320&scale=2&maptype=roadmap&markers=color:0x10b981%7C${center}&style=feature:poi%7Cvisibility:off&key=${apiKey}`
      : null;

  return (
    <Link
      to={`/store-map?focus=${encodeURIComponent(slug)}`}
      className="group relative block h-72 w-full overflow-hidden rounded-3xl border border-white/10 bg-card/70 backdrop-blur-2xl shadow-xl shadow-black/10 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-0.5 hover:border-primary/30"
      aria-label={`Open map for ${storeName}`}
    >
      {staticMapUrl ? (
        <img
          src={staticMapUrl}
          alt={`Map showing location of ${storeName}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
      ) : (
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
      )}

      {/* Subtle vignette for depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

      {/* Fallback brand pin — only when no static map renders */}
      {!staticMapUrl && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-background/60">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* Floating "Open full map" pill */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur-xl px-3 py-1.5 shadow-lg ring-1 ring-white/10">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-bold text-foreground tracking-tight">View location</span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
          <ExternalLink className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Top inner highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </Link>
  );
}
