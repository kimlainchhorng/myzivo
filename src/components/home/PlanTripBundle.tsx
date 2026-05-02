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
  { icon: Plane, label: "Flight", to: "/flights?bundle=1", tone: "bg-sky-500/20 text-sky-100" },
  { icon: BedDouble, label: "Hotel", to: "/hotels?bundle=1", tone: "bg-violet-500/20 text-violet-100" },
  { icon: Car, label: "Airport ride", to: "/rides?bundle=1", tone: "bg-emerald-500/20 text-emerald-100" },
] as const;

export default function PlanTripBundle() {
  const navigate = useNavigate();
  return (
    <div className="px-4 pb-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 shadow-lg ring-1 ring-white/15"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-fuchsia-300/20 blur-2xl pointer-events-none" />

        <div className="relative flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> New
          </span>
          <span className="text-[11px] font-semibold text-white/90">Trip Bundle</span>
        </div>

        <div className="relative text-white">
          <div className="text-[17px] font-extrabold leading-tight">Plan everything in one go</div>
          <div className="text-[12px] text-white/85 mt-0.5">
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
                className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur px-2 py-3 transition-colors touch-manipulation"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.tone}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-white">{s.label}</div>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/flights?bundle=1")}
          className="relative mt-3 w-full flex items-center justify-center gap-1 rounded-2xl bg-white text-indigo-700 font-bold py-2.5 text-sm shadow-md touch-manipulation"
        >
          Start with a flight <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
