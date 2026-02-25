import { MapPin, ExternalLink, Navigation2, Clock, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import MessageStatus from "./MessageStatus";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface LocationMessageProps {
  lat: number;
  lng: number;
  address?: string;
  isMe: boolean;
  isRead?: boolean;
  timestamp?: Date;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

const LocationMessage = ({ lat, lng, address, isMe, isRead = false, timestamp }: LocationMessageProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Generate static map URL with premium styling
  const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+22c55e(${lng},${lat})/${lng},${lat},15,0/240x140@2x?access_token=${MAPBOX_TOKEN}`;

  // Format coordinates for display
  const formattedCoords = useMemo(() => {
    const latDir = lat >= 0 ? "N" : "S";
    const lngDir = lng >= 0 ? "E" : "W";
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
  }, [lat, lng]);

  // Format timestamp
  const formattedTime = useMemo(() => {
    if (!timestamp) return null;
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  }, [timestamp]);

  // Initialize interactive map when expanded
  useEffect(() => {
    if (!isExpanded || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [lng, lat],
      zoom: 15,
      pitch: 45,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add custom marker
    const markerEl = document.createElement("div");
    markerEl.innerHTML = `
      <div class="relative">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 border-3 border-white shadow-xl flex items-center justify-center animate-pulse">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-500 rotate-45 -z-10"></div>
      </div>
    `;

    new mapboxgl.Marker(markerEl)
      .setLngLat([lng, lat])
      .addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [isExpanded, lat, lng]);

  const openExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "max-w-[80%] rounded-2xl overflow-hidden cursor-pointer transition-all",
          "shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30",
          "border border-white/10 backdrop-blur-sm",
          isMe ? "rounded-br-md" : "rounded-bl-md"
        )}
        onClick={() => setIsExpanded(true)}
      >
        {/* Static Map Image with Premium Overlay */}
        <div className="relative group">
          <img
            src={staticMapUrl}
            alt="Shared location"
            className="w-full h-[130px] object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Premium gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Tap to expand indicator */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="w-2.5 h-2.5 text-white" />
            <span className="text-[9px] font-medium text-white">Tap to view</span>
          </div>

          {/* Live pulse indicator */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wide">Live</span>
          </div>

          {/* Location info overlay */}
          <div className="absolute bottom-0 inset-x-0 p-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-semibold truncate">
                  {address || "Shared Location"}
                </p>
                <p className="text-[10px] text-white/60 font-mono truncate">
                  {formattedCoords}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Premium Action Bar */}
        <div
          className={cn(
            "px-3 py-2 flex items-center justify-between gap-2",
            isMe 
              ? "bg-gradient-to-r from-primary to-primary/90" 
              : "bg-gradient-to-r from-muted to-muted/90"
          )}
        >
          <div className="flex items-center gap-2">
            <Navigation2 
              className={cn(
                "w-3.5 h-3.5",
                isMe ? "text-primary-foreground" : "text-foreground"
              )} 
            />
            <span
              className={cn(
                "text-[11px] font-medium",
                isMe ? "text-primary-foreground" : "text-foreground"
              )}
            >
              {isMe ? "My Location" : "Their Location"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {formattedTime && (
              <div className="flex items-center gap-1">
                <Clock className={cn(
                  "w-2.5 h-2.5",
                  isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-[9px]",
                  isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {formattedTime}
                </span>
              </div>
            )}
            {isMe && <MessageStatus isRead={isRead} />}
          </div>
        </div>
      </motion.div>

      {/* Expanded Map Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-lg bg-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Map Container */}
              <div ref={mapContainer} className="h-[300px] w-full" />
              
              {/* Location Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {address || "Shared Location"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {formattedCoords}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-10 rounded-xl border-white/10"
                    onClick={() => setIsExpanded(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                  <Button
                    className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                    onClick={openExternal}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Navigate
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LocationMessage;
