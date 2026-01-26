import { MapPin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import MessageStatus from "./MessageStatus";

interface LocationMessageProps {
  lat: number;
  lng: number;
  address?: string;
  isMe: boolean;
  isRead?: boolean;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNsNHoxZzl2YzFyaHQza29hMGZzYWdqcHoifQ.SR4M8qPT-wXTR6IPq8oYkg";

const LocationMessage = ({ lat, lng, address, isMe, isRead = false }: LocationMessageProps) => {
  // Generate static map URL
  const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+22c55e(${lng},${lat})/${lng},${lat},15,0/200x120@2x?access_token=${MAPBOX_TOKEN}`;

  const openInMaps = () => {
    // Open in Google Maps for navigation
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  };

  return (
    <div
      className={cn(
        "max-w-[75%] rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]",
        isMe ? "rounded-br-sm" : "rounded-bl-sm"
      )}
      onClick={openInMaps}
    >
      {/* Static Map Image */}
      <div className="relative">
        <img
          src={staticMapUrl}
          alt="Shared location"
          className="w-full h-[120px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-white font-medium truncate">
            {address || "Shared Location"}
          </span>
        </div>
      </div>
      
      {/* Action Bar */}
      <div
        className={cn(
          "px-3 py-2 flex items-center justify-between gap-2",
          isMe ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "text-xs",
            isMe ? "text-primary-foreground" : "text-foreground"
          )}
        >
          📍 My Location
        </span>
        <div className="flex items-center gap-1">
          {isMe && <MessageStatus isRead={isRead} />}
          <ExternalLink
            className={cn(
              "w-3.5 h-3.5",
              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationMessage;
