import { useState } from "react";
import { X, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DemoModeBannerProps {
  className?: string;
}

const DemoModeBanner = ({ className = "" }: DemoModeBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`fixed top-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur-sm px-4 py-2 ${className}`}
      >
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-black">
          <Wifi className="w-4 h-4" />
          <span>Demo mode (no backend)</span>
          <button
            onClick={() => setDismissed(true)}
            className="ml-2 p-1 hover:bg-black/10 rounded"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DemoModeBanner;
