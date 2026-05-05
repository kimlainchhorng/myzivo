/**
 * ZivoCardPicker — bottom sheet listing the inline-card kinds you can drop
 * into a chat. Each tap fires onPick with a fully-formed ZivoCardPayload
 * that the chat composer can ship via the existing handleSend pipeline.
 */
import { motion, AnimatePresence } from "framer-motion";
import X from "lucide-react/dist/esm/icons/x";
import Plane from "lucide-react/dist/esm/icons/plane";
import Hotel from "lucide-react/dist/esm/icons/hotel";
import UtensilsCrossed from "lucide-react/dist/esm/icons/utensils-crossed";
import Car from "lucide-react/dist/esm/icons/car";
import Compass from "lucide-react/dist/esm/icons/compass";
import type { ComponentType, SVGProps } from "react";
import type { ZivoCardKind, ZivoCardPayload } from "./ZivoActionBubble";

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (payload: ZivoCardPayload) => void;
}

interface Option {
  kind: ZivoCardKind;
  label: string;
  desc: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  gradient: string;
  build: () => ZivoCardPayload;
}

const OPTIONS: Option[] = [
  {
    kind: "flight",
    label: "Share a flight",
    desc: "Drop a route, the chat opens it in seconds.",
    icon: Plane,
    gradient: "from-sky-500 to-indigo-500",
    build: () => ({
      kind: "flight",
      title: "JFK → LAX",
      subtitle: "Sat, Jun 14 · Direct · 5h 45m",
      meta: "From $189",
      deepLink: "/flights",
      image: null,
    }),
  },
  {
    kind: "hotel",
    label: "Share a hotel",
    desc: "Send a stay your friend can book inline.",
    icon: Hotel,
    gradient: "from-emerald-500 to-teal-500",
    build: () => ({
      kind: "hotel",
      title: "Park Hyatt Tokyo",
      subtitle: "Shinjuku · 4.8 ★",
      meta: "From $420 / night",
      deepLink: "/hotels",
      image: null,
    }),
  },
  {
    kind: "eats",
    label: "Share a place to eat",
    desc: "Reservation or order, one tap from the chat.",
    icon: UtensilsCrossed,
    gradient: "from-orange-500 to-rose-500",
    build: () => ({
      kind: "eats",
      title: "Mommy Seafood",
      subtitle: "Cambodian · Open until 11pm",
      meta: "Free delivery this week",
      deepLink: "/eats",
      image: null,
    }),
  },
  {
    kind: "ride",
    label: "Share a ride",
    desc: "Hand off the pickup and ETA in one bubble.",
    icon: Car,
    gradient: "from-violet-500 to-fuchsia-500",
    build: () => ({
      kind: "ride",
      title: "Ride to JFK Airport",
      subtitle: "Pickup in 4 min · UberX-style",
      meta: "$32–$38",
      deepLink: "/rides",
      image: null,
    }),
  },
  {
    kind: "trip",
    label: "Share a trip bundle",
    desc: "Flight + hotel + ride, planned together.",
    icon: Compass,
    gradient: "from-amber-500 to-pink-500",
    build: () => ({
      kind: "trip",
      title: "Weekend in Bali",
      subtitle: "Flight + 3 nights + airport ride",
      meta: "From $612 total",
      deepLink: "/trip-bundle",
      image: null,
    }),
  },
];

export default function ZivoCardPicker({ open, onClose, onPick }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[180] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Share a ZIVO card"
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] max-h-[80dvh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Share a ZIVO card</h3>
                <p className="text-[11px] text-muted-foreground">Drop bookable cards into the chat.</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="h-9 w-9 -mr-1.5 flex items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-2">
              {OPTIONS.map((o) => (
                <button
                  key={o.kind}
                  onClick={() => { onPick(o.build()); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-muted/20 hover:bg-muted/40 active:scale-[0.99] transition text-left"
                >
                  <div className={`h-10 w-10 shrink-0 rounded-full bg-gradient-to-br ${o.gradient} flex items-center justify-center text-white`}>
                    <o.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{o.label}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{o.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
