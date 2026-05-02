import { useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCookiePrefs } from "@/hooks/useCookiePrefs";

export default function CookieConsentBanner() {
  const { prefs, acceptAll, rejectAll } = useCookiePrefs();
  const [dismissed, setDismissed] = useState(false);

  // Don't render if user already chose, or has dismissed this session
  if (prefs.updatedAt || dismissed) return null;

  const handleAcceptAll = () => {
    acceptAll();
    setDismissed(true);
  };

  const handleRejectOptional = () => {
    rejectAll();
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 28 }}
        className="fixed bottom-0 left-0 right-0 z-[60] safe-area-bottom px-3 pb-3 sm:px-6 sm:pb-6 pointer-events-none"
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-desc"
      >
        <div className="mx-auto max-w-3xl pointer-events-auto">
          <div className="rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/10 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="hidden sm:flex h-10 w-10 rounded-xl bg-amber-500/15 items-center justify-center shrink-0">
                <Cookie className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h2 id="cookie-banner-title" className="text-sm font-semibold text-foreground">
                    We use cookies
                  </h2>
                  <button
                    onClick={() => setDismissed(true)}
                    aria-label="Close"
                    className="-mt-1 -mr-1 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p id="cookie-banner-desc" className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Strictly necessary cookies keep ZIVO secure. Optional cookies help us improve performance,
                  personalize your experience, and measure marketing.{" "}
                  <Link to="/legal/privacy" className="text-primary underline hover:text-primary/80">
                    Learn more
                  </Link>
                  .
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" onClick={handleAcceptAll} className="rounded-xl">
                    Accept all
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleRejectOptional} className="rounded-xl">
                    Reject optional
                  </Button>
                  <Button size="sm" variant="ghost" asChild className="rounded-xl">
                    <Link to="/account/data-rights#cookies">
                      <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                      Customize
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
