/**
 * ConciergeLauncher — sleek hero card on AppHome that opens /concierge
 * with the user's tapped example as a prefilled query.
 *
 * The mini-pill examples cycle the user's eye through the kinds of intents
 * the concierge can resolve — dining, travel, ride, full bundle.
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";

const SUGGESTIONS = [
  "Dinner at 7pm in SoHo",
  "Weekend in Bali",
  "Ride to JFK at 5pm",
];

export default function ConciergeLauncher() {
  const navigate = useNavigate();
  const open = (q?: string) =>
    navigate(`/concierge${q ? `?q=${encodeURIComponent(q)}` : ""}`);

  return (
    <div className="px-4 pb-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 ring-1 ring-white/10 shadow-lg"
      >
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />

        <button
          onClick={() => open()}
          className="relative w-full text-left p-4 active:scale-[0.99] transition-transform touch-manipulation"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              <Sparkles className="w-3 h-3" /> ZIVO Concierge
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
              Beta
            </span>
          </div>
          <div className="mt-2 text-[17px] font-extrabold text-white leading-tight">
            Plan your day in one sentence.
          </div>
          <div className="mt-1 text-[12px] text-white/80">
            Tell us what you want — we'll line up the reservation, ride, and stay.
          </div>
        </button>

        <div className="relative px-4 pb-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => open(s)}
              className="rounded-full bg-white/10 hover:bg-white/15 backdrop-blur px-3 py-1.5 text-[11px] font-bold text-white transition-colors"
            >
              {s}
            </motion.button>
          ))}
          <button
            onClick={() => open()}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-white text-indigo-700 px-3 py-1.5 text-[11px] font-bold shadow-md"
          >
            Start <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
