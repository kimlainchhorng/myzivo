/**
 * StoreMiniMap — lightweight Google Static Maps thumbnail for the store profile rail.
 * Falls back to a branded gradient placeholder when coordinates or API key are missing.
 * Click → opens the full store map page.
 */
import { MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface StoreMiniMapProps {
  latitude?: number | null;
  longitude?: number | null;
  storeName: string;
  slug: string;
}

const GOOGLE_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export default function StoreMiniMap({ latitude, longitude, storeName, slug }: StoreMiniMapProps) {
  const hasCoords = typeof latitude === "number" && typeof longitude === "number";
  const center = hasCoords ? `${latitude},${longitude}` : "";

  // Static map URL with emerald-tinted ZIVO pin
  const staticMapUrl = hasCoords && GOOGLE_KEY
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=15&size=640x320&scale=2&maptype=roadmap&markers=color:0x10b981%7C${center}&style=feature:poi%7Cvisibility:off&key=${GOOGLE_KEY}`
    : null;

  return (
    <Link
      to={`/store-map?focus=${encodeURIComponent(slug)}`}
      className="group relative block h-72 w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-card/70 backdrop-blur-2xl shadow-xl shadow-black/10"
      aria-label={`Open map for ${storeName}`}
    >
      {staticMapUrl ? (
        <img
          src={staticMapUrl}
          alt={`Map showing location of ${storeName}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-emerald-500/10 to-sky-500/10" />
      )}

      {/* Pin overlay (always visible, even over static map for crisp brand) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-background/60">
            <MapPin className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Bottom gradient + label */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3">
        <div className="flex items-center justify-between text-white">
          <span className="text-xs font-semibold drop-shadow">Open full map</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </div>
      </div>

      {/* Top inner highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </Link>
  );
}
