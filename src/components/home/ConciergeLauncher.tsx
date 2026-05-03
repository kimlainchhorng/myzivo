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
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        <button
          onClick={() => open()}
          className="w-full text-left p-4 active:bg-secondary/50 transition-colors touch-manipulation"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-ig-gradient-from via-ig-gradient-via to-ig-gradient-to">
              <Sparkles className="w-3 h-3" strokeWidth={2} /> ZIVO Concierge
            </span>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Beta
            </span>
          </div>
          <div className="mt-3 text-[17px] font-semibold text-foreground leading-tight">
            Plan your day in one sentence.
          </div>
          <div className="mt-1 text-[13px] text-muted-foreground">
            Tell us what you want — we'll line up the reservation, ride, and stay.
          </div>
        </button>

        <div className="px-4 pb-4 flex flex-wrap items-center gap-2">
          {SUGGESTIONS.map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.96 }}
              onClick={() => open(s)}
              className="rounded-full bg-secondary hover:bg-accent px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors"
            >
              {s}
            </motion.button>
          ))}
          <button
            onClick={() => open()}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3.5 py-1.5 text-[12px] font-semibold hover:bg-primary/90 transition-colors"
          >
            Start <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.25} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
