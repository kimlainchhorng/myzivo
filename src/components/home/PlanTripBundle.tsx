/**
 * PlanTripBundle — single-tap "Plan a Trip" hero on AppHome.
 * Sells the super-app pitch: book flight + hotel + airport ride together.
 *
 * Tapping any sub-action drops the user into that vertical with `?bundle=1`
 * so the destination page can later choose to surface bundle pricing or
 * resume the flow.
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Plane from "lucide-react/dist/esm/icons/plane";
import BedDouble from "lucide-react/dist/esm/icons/bed-double";
import Car from "lucide-react/dist/esm/icons/car";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";

const STEPS = [
  { icon: Plane, label: "Flight", to: "/flights?bundle=1" },
  { icon: BedDouble, label: "Hotel", to: "/hotels?bundle=1" },
  { icon: Car, label: "Airport ride", to: "/rides?bundle=1" },
] as const;

export default function PlanTripBundle() {
  const navigate = useNavigate();
  return (
    <div className="px-4 pb-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-lg p-4 bg-card border border-border"
      >
        <div className="relative flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
            <Sparkles className="w-3 h-3 text-ig-gradient" /> <span className="text-ig-gradient">New</span>
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground">Trip Bundle</span>
        </div>

        <div className="relative">
          <div className="text-[17px] font-bold leading-tight text-foreground">Plan everything in one go</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">
            Flight, hotel, and the ride — booked together, tracked together.
          </div>
        </div>

        <div className="relative mt-3 grid grid-cols-3 gap-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <motion.button
                key={s.label}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(s.to)}
                className="flex flex-col items-center justify-center gap-1 rounded-lg bg-muted active:bg-muted/70 px-2 py-3 transition-colors touch-manipulation"
              >
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                  <Icon className="w-4 h-4 text-foreground" strokeWidth={1.8} />
                </div>
                <div className="text-[11px] font-semibold text-foreground">{s.label}</div>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/flights?bundle=1")}
          className="relative mt-3 w-full flex items-center justify-center gap-1 rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 text-sm active:opacity-80 transition-opacity touch-manipulation"
        >
          Start with a flight <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
