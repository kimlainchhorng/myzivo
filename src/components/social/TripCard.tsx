/**
 * TripCard — Shareable flight/trip card for the social feed
 */
import { Plane, Calendar, ArrowRight, Share2, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { useShareContent } from "@/hooks/useShareContent";
import { useBookmark } from "@/hooks/useBookmark";
import { cn } from "@/lib/utils";

interface TripCardProps {
  id: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  departDate: string;
  returnDate?: string;
  price?: string;
  airline?: string;
  imageUrl?: string;
}

export default function TripCard({
  id, origin, originCode, destination, destinationCode,
  departDate, returnDate, price, airline, imageUrl,
}: TripCardProps) {
  const { shareFlight } = useShareContent();
  const { isBookmarked, toggle: toggleBookmark } = useBookmark("flight", id);

  return (
    <motion.div
      className="rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm"
      whileTap={{ scale: 0.98 }}
    >
      {/* Hero image */}
      {imageUrl && (
        <div className="h-32 bg-muted relative overflow-hidden">
          <img src={imageUrl} alt={destination} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-3">
            <p className="text-white text-xs font-medium">{airline || "ZIVO Travel"}</p>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Route */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{originCode}</p>
            <p className="text-xs text-muted-foreground">{origin}</p>
          </div>
          <div className="flex items-center gap-2 px-3">
            <div className="h-px w-8 bg-border" />
            <Plane className="h-4 w-4 text-primary rotate-45" />
            <div className="h-px w-8 bg-border" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{destinationCode}</p>
            <p className="text-xs text-muted-foreground">{destination}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Calendar className="h-3.5 w-3.5" />
          <span>{departDate}{returnDate ? ` — ${returnDate}` : ""}</span>
        </div>

        {/* Price + actions */}
        <div className="flex items-center justify-between">
          {price && (
            <p className="text-lg font-bold text-primary">{price}</p>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={toggleBookmark} className="p-2 rounded-full hover:bg-accent/50">
              <Bookmark className={cn("h-4 w-4", isBookmarked ? "fill-primary text-primary" : "text-muted-foreground")} />
            </button>
            <button onClick={() => shareFlight(originCode, destinationCode)} className="p-2 rounded-full hover:bg-accent/50">
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
