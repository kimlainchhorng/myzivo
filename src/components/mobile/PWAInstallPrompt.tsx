/**
 * PWA Install Prompt
 * Shows install banner on supported browsers
 */
import { useState, useEffect } from "react";
import { X, Download, Smartphone, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAInstallPromptProps {
  enabled?: boolean;
}

const PWAInstallPrompt = ({ enabled = true }: PWAInstallPromptProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if dismissed recently
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show iOS banner after delay if on iOS Safari
    if (ios && !standalone) {
      setTimeout(() => {
        setShowBanner(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSInstructions(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (!enabled || isStandalone || !showBanner) {
    return null;
  }

  return (
    <>
      {/* Install Banner */}
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
          "bg-gradient-to-r from-primary/95 to-teal-500/95 backdrop-blur-xl",
          "p-4 pb-safe",
          "animate-in slide-in-from-bottom-4 duration-300",
          "border-t border-white/10"
        )}
      >
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">Install Hizovo</p>
            <p className="text-white/80 text-xs truncate">
              Add to your home screen for quick access
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="secondary"
              className="h-9 px-4 rounded-xl font-bold bg-white text-primary hover:bg-white/90"
              onClick={handleInstall}
            >
              {isIOS ? (
                <>
                  <Share className="w-4 h-4 mr-1" />
                  Add
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-1" />
                  Install
                </>
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-xl text-white hover:bg-white/10"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 pb-safe animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Install Hizovo</h3>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl"
                onClick={() => setShowIOSInstructions(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Tap the Share button</p>
                  <p className="text-sm text-muted-foreground">
                    At the bottom of your Safari browser
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Scroll down and tap "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground">
                    You may need to scroll to find this option
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Tap "Add"</p>
                  <p className="text-sm text-muted-foreground">
                    The app will appear on your home screen
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-6 h-12 rounded-xl font-bold"
              onClick={() => setShowIOSInstructions(false)}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
