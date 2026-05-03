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
        className="relative overflow-hidden rounded-lg bg-card border border-border"
      >
        <button
          onClick={() => open()}
          className="relative w-full text-left p-4 active:bg-muted/50 transition-colors touch-manipulation"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
              <Sparkles className="w-3 h-3 text-ig-gradient" /> <span className="text-ig-gradient">ZIVO Concierge</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Beta
            </span>
          </div>
          <div className="mt-2 text-[17px] font-bold text-foreground leading-tight">
            Plan your day in one sentence.
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground">
            Tell us what you want — we'll line up the reservation, ride, and stay.
          </div>
        </button>

        <div className="relative px-4 pb-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.96 }}
              onClick={() => open(s)}
              className="rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-foreground active:bg-muted transition-colors"
            >
              {s}
            </motion.button>
          ))}
          <button
            onClick={() => open()}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-[11px] font-bold active:opacity-80 transition-opacity"
          >
            Start <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
