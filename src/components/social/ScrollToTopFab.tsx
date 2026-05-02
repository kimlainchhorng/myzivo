/**
 * ScrollToTopFab — small floating button that appears once the user has
 * scrolled past ~1.5 viewports. Smooth-scrolls back to the top of the feed.
 * Sits above the mobile bottom nav.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";

export default function ScrollToTopFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 1.5;
      setVisible(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Scroll to top"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 320 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed right-4 z-[300] h-11 w-11 rounded-full bg-foreground text-background shadow-xl flex items-center justify-center active:scale-90 transition-transform"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 84px)" }}
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
