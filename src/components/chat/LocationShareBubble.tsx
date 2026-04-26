/**
 * LocationShareBubble — Telegram-style shared location card
 * Uses OpenStreetMap static tiles (no API key) + Nominatim reverse geocoding.
 */
import { useEffect, useState } from "react";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Navigation from "lucide-react/dist/esm/icons/navigation";

interface LocationShareBubbleProps {
  lat: number;
  lng: number;
  label?: string;
  isMe: boolean;
  time: string;
}

// Lightweight in-memory cache so repeated renders don't re-hit Nominatim
const addressCache = new Map<string, string>();

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (addressCache.has(key)) return addressCache.get(key)!;
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!r.ok) return null;
    const j = await r.json();
    const a = j.address || {};
    const line =
      [a.road, a.suburb || a.neighbourhood, a.city || a.town || a.village, a.country]
        .filter(Boolean)
        .join(", ") || j.display_name;
    if (line) addressCache.set(key, line);
    return line ?? null;
  } catch {
    return null;
  }
}

export default function LocationShareBubble({ lat, lng, label, isMe, time }: LocationShareBubbleProps) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    reverseGeocode(lat, lng).then((a) => {
      if (!cancelled) setAddress(a);
    });
    return () => { cancelled = true; };
  }, [lat, lng]);

  // Universal "open in maps" — works on iOS, Android, and desktop
  const isApple = typeof navigator !== "undefined" && /iPhone|iPad|Mac/i.test(navigator.userAgent);
  const mapUrl = isApple
    ? `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(label || "Shared Location")}`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  // OpenStreetMap static map via staticmap.openstreetmap.de (no key required)
  // Falls back gracefully via onError → embedded iframe placeholder
  const staticMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=500x260&markers=${lat},${lng},red-pushpin`;

  const title = label || address || "Shared Location";
  const subtitle = address && address !== label
    ? address
    : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block max-w-[78%] rounded-2xl overflow-hidden border border-border/30 bg-card shadow-sm hover:shadow-md transition-shadow"
      >
        {/* Real static map preview */}
        <div className="relative w-[260px] h-[140px] bg-muted overflow-hidden">
          <img
            src={staticMapUrl}
            alt="Map preview"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              // Hide broken image so the gradient placeholder shows through
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Gradient overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          {/* Center pin marker */}
          <div className="absolute inset-0 flex items-start justify-center pt-[42px] pointer-events-none">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-primary/25 blur-md animate-pulse" />
              <div className="relative w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-2 ring-background">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Info row */}
        <div className="px-3 py-2.5 bg-card">
          <div className="flex items-start gap-2">
            <Navigation className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
                {title}
              </p>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-primary font-medium">Tap to open in Maps</span>
            <span className="text-[10px] text-muted-foreground">{time}</span>
          </div>
        </div>
      </a>
    </div>
  );
}
