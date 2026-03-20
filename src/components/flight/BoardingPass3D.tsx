/**
 * BoardingPass3D — Premium 3D boarding pass visualization
 * Shown in the expanded flight card drawer
 */
import { motion } from "framer-motion";
import { Plane, QrCode, Barcode } from "lucide-react";
import { type DuffelOffer } from "@/hooks/useDuffelFlights";
import { cn } from "@/lib/utils";

interface BoardingPass3DProps {
  offer: DuffelOffer;
  className?: string;
}

export default function BoardingPass3D({ offer, className }: BoardingPass3DProps) {
  const seg = offer.segments?.[0];
  const depCode = offer.departure.code;
  const arrCode = offer.arrival.code;
  const depTime = offer.departure.time;
  const arrTime = offer.arrival.time;

  return (
    <motion.div
      initial={{ rotateX: -15, opacity: 0, y: 10 }}
      animate={{ rotateX: 0, opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      className={cn("relative", className)}
    >
      <div
        className="relative rounded-xl overflow-hidden border border-[hsl(var(--flights))]/20"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Holographic foil gradient overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-30 bg-gradient-to-br from-sky-400/20 via-transparent to-cyan-400/20" />
        <div className="absolute inset-0 pointer-events-none z-10 opacity-15"
          style={{
            background: "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 6px)"
          }}
        />

        {/* Top section — airline band */}
        <div className="bg-gradient-to-r from-[hsl(var(--flights))] via-sky-500 to-[hsl(var(--flights))] px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Plane className="w-3 h-3 text-primary-foreground" />
            <span className="text-[10px] font-bold text-primary-foreground tracking-wider uppercase">
              {offer.airline}
            </span>
          </div>
          <span className="text-[9px] font-mono text-primary-foreground/80">
            {offer.flightNumber}
          </span>
        </div>

        {/* Main pass content */}
        <div className="bg-card/95 backdrop-blur-sm px-3 py-3">
          {/* Route display */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-center">
              <p className="text-lg font-extrabold tracking-tight leading-none">{depCode}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{depTime}</p>
            </div>

            <div className="flex-1 flex items-center justify-center px-3 relative">
              {/* 3D plane flying across */}
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <motion.div
                animate={{ x: ["-120%", "120%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="relative z-10 bg-card px-1"
              >
                <Plane className="w-3 h-3 text-[hsl(var(--flights))] rotate-0" />
              </motion.div>
            </div>

            <div className="text-center">
              <p className="text-lg font-extrabold tracking-tight leading-none">{arrCode}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{arrTime}</p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Duration</p>
              <p className="text-[10px] font-bold">{offer.duration}</p>
            </div>
            <div>
              <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Class</p>
              <p className="text-[10px] font-bold capitalize">{offer.cabinClass.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Stops</p>
              <p className="text-[10px] font-bold">{offer.stops === 0 ? "Direct" : `${offer.stops}`}</p>
            </div>
          </div>
        </div>

        {/* Perforated tear line */}
        <div className="relative h-4 bg-card/95">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-background" />
          <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-border/50" />
        </div>

        {/* Bottom — barcode strip */}
        <div className="bg-card/95 px-3 pb-2.5 pt-0 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex gap-[1px]">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-foreground/70 rounded-[0.5px]"
                  style={{
                    width: Math.random() > 0.5 ? "2px" : "1px",
                    height: `${12 + Math.random() * 8}px`,
                  }}
                />
              ))}
            </div>
          </div>
          <p className="text-[8px] text-muted-foreground font-mono ml-2">ZIVO-{offer.id?.slice(-6).toUpperCase() || "XXXX"}</p>
        </div>
      </div>
    </motion.div>
  );
}
