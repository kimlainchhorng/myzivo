/**
 * LocationShareBubble — Displays shared location with a static map preview
 */
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";

interface LocationShareBubbleProps {
  lat: number;
  lng: number;
  label?: string;
  isMe: boolean;
  time: string;
}

export default function LocationShareBubble({ lat, lng, label, isMe, time }: LocationShareBubbleProps) {
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15`;
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=300x150&markers=color:red%7C${lat},${lng}&key=`;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`block max-w-[75%] rounded-2xl overflow-hidden ${
          isMe ? "rounded-br-md" : "rounded-bl-md"
        }`}
      >
        {/* Map preview placeholder */}
        <div className={`w-[250px] h-[120px] flex items-center justify-center ${
          isMe ? "bg-primary/20" : "bg-muted"
        }`}>
          <div className="text-center">
            <MapPin className={`w-8 h-8 mx-auto mb-1 ${isMe ? "text-primary" : "text-primary"}`} />
            <p className={`text-[10px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
          </div>
        </div>

        <div className={`px-3 py-2 ${isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-medium truncate">{label || "Shared Location"}</span>
            <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
          </div>
          <span className={`text-[9px] block text-right mt-0.5 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
            {time}
          </span>
        </div>
      </a>
    </div>
  );
}
