/**
 * LodgingRoomCard - public-facing room card on store profile.
 */
import { motion } from "framer-motion";
import { Users, BedDouble, Coffee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  name: string;
  type?: string | null;
  beds?: string | null;
  maxGuests: number;
  baseRateCents: number;
  amenities?: string[];
  breakfastIncluded?: boolean;
  imageUrl?: string;
  onReserve: () => void;
}

export function LodgingRoomCard({
  name, type, beds, maxGuests, baseRateCents, amenities = [], breakfastIncluded, imageUrl, onReserve,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm"
    >
      <div className="aspect-[16/9] bg-muted/30 relative">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <BedDouble className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
        {type && (
          <Badge className="absolute top-2 left-2 text-[10px] bg-background/90 text-foreground border-border">
            {type}
          </Badge>
        )}
      </div>
      <div className="p-4 space-y-2">
        <p className="font-bold text-base leading-tight">{name}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {beds && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {beds}</span>}
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Sleeps {maxGuests}</span>
          {breakfastIncluded && <span className="flex items-center gap-1"><Coffee className="h-3 w-3" /> Breakfast</span>}
        </div>
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {amenities.slice(0, 4).map(a => (
              <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{a}</span>
            ))}
            {amenities.length > 4 && <span className="text-[10px] text-muted-foreground">+{amenities.length - 4}</span>}
          </div>
        )}
        <div className="flex items-end justify-between pt-2">
          <div>
            <p className="text-xl font-extrabold text-foreground">${(baseRateCents / 100).toFixed(2)}<span className="text-xs font-medium text-muted-foreground"> /night</span></p>
          </div>
          <Button onClick={onReserve} className="font-bold">Reserve</Button>
        </div>
      </div>
    </motion.div>
  );
}
