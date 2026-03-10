/**
 * PWA Install Banner - Smart, non-intrusive install prompt for mobile users
 * Shows contextually after 30s of browsing, respects dismissals
 */
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Smartphone, Zap, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from "@capacitor/core";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Don't show inside native Capacitor app
    if (Capacitor.isNativePlatform()) return;
    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Don't show on desktop
    if (!isMobile) return;
    // Don't interrupt full-screen ride booking flows
    if (location.pathname.startsWith("/rides")) return;
    // Don't show if dismissed recently (7 days)
    const dismissed = localStorage.getItem("pwa_banner_dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Show after 30s of browsing
    const timer = setTimeout(() => setShow(true), 30000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, [isMobile, location.pathname]);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("pwa_banner_dismissed", String(Date.now()));
  };

  // Only show in mobile browsers, never in native Capacitor apps or standalone PWA
  if (!isMobile || Capacitor.isNativePlatform() || window.matchMedia("(display-mode: standalone)").matches) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-3 right-3 z-50 safe-area-bottom"
        >
          <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-xl p-4">
            {/* Glow accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary" />

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted touch-manipulation active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="font-bold text-sm text-foreground mb-1">Get the ZIVO App</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> Faster</span>
                  <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-primary" /> Offline</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3 text-primary" /> Free</span>
                </div>
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="h-9 px-5 rounded-xl text-xs font-semibold glow-green-btn touch-manipulation active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Install Now
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
