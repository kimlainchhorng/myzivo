import { useState, useEffect } from "react";
import { isInAppBrowser, getInAppBrowserName } from "@/lib/isInAppBrowser";
import { IOS_STORE_URL, ANDROID_STORE_URL } from "@/lib/deepLinks";
import { Apple, Smartphone, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Full-screen interstitial shown when users arrive from a social-media
 * in-app browser (Facebook, Instagram, etc.).
 * Prompts them to download or open the native app.
 */
export default function InAppBrowserInterstitial({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const browserName = getInAppBrowserName();

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("zivo_iab_dismissed")) return;
    if (isInAppBrowser()) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    sessionStorage.setItem("zivo_iab_dismissed", "1");
  };

  const storeUrl = isIOS() ? IOS_STORE_URL : ANDROID_STORE_URL;

  if (!show || dismissed) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-2 rounded-full bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-sm w-full space-y-6">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Get the ZIVO App</h1>
          <p className="text-muted-foreground text-sm">
            For the best experience, open this in the ZIVO app
            {browserName ? ` instead of ${browserName}'s browser` : ""}.
          </p>
        </div>

        {/* Features */}
        <div className="bg-card border border-border/40 rounded-2xl p-4 space-y-3 text-left">
          {[
            "Faster & smoother experience",
            "Exclusive app-only deals",
            "Real-time notifications",
            "Save your preferences",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">✓</span>
              <span>{f}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full rounded-xl h-12 font-semibold shadow-lg"
            onClick={() => window.location.assign(storeUrl)}
          >
            <Apple className="w-5 h-5 mr-2" />
            Download ZIVO App
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-xl h-12 font-semibold"
            onClick={handleDismiss}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Continue on Web
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Free download · 4.9★ rating
        </p>
      </div>
    </div>
  );
}
