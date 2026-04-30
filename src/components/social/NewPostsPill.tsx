/**
 * NewPostsPill — floating "N new posts" badge that animates in when realtime
 * delivers new feed content while the user is scrolled mid-feed.
 */
import { motion, AnimatePresence } from "framer-motion";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up";

interface Props {
  count: number;
  onClick: () => void;
}

export default function NewPostsPill({ count, onClick }: Props) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          type="button"
          onClick={onClick}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 320 }}
          className="absolute left-1/2 top-20 z-50 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2.5 sm:py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 hover:bg-emerald-600 active:scale-95 transition-all min-h-[44px] sm:min-h-0"
          aria-label={`Show ${count} new posts`}
        >
          <ArrowUp className="h-4 w-4" />
          {count} new {count === 1 ? "post" : "posts"}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
