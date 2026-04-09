/**
 * Full-screen interstitial shown when users visit via in-app browsers
 * (Facebook, Instagram, TikTok, etc.) to prompt app download.
 * Shows once per session; can be dismissed.
 */
import { useState, useEffect } from "react";
import { detectInAppBrowser } from "@/lib/isInAppBrowser";
import { X, Smartphone, Zap, Bell, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const APP_STORE_URL = "https://apps.apple.com/us/app/zivo-customer/id6759480121";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.hizovo.app";

const SESSION_KEY = "zivo_iab_dismissed";

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

const features = [
  { icon: Zap, text: "Faster & smoother experience" },
  { icon: Bell, text: "Real-time price alerts" },
  { icon: Shield, text: "Secure biometric login" },
];

export default function InAppBrowserInterstitial() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const detected = detectInAppBrowser();
    if (detected) {
      setPlatform(detected);
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  };

  // Use iOS App Store for iPhone, Play Store for Android
  const storeUrl = isIOS() ? APP_STORE_URL : PLAY_STORE_URL;
  const storeName = isIOS() ? "App Store" : "Google Play";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-background/98 backdrop-blur-xl flex flex-col items-center justify-center p-6"
        >
          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 p-2 rounded-full bg-muted/60 hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-sm w-full text-center space-y-6"
          >
            {/* App icon */}
            <div className="w-20 h-20 mx-auto rounded-[1.25rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-black text-primary tracking-tight">Z</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">Get the ZIVO App</h2>
              <p className="text-sm text-muted-foreground">
                You're browsing from {platform}. Open ZIVO in our app for the best experience.
              </p>
            </div>

            {/* Feature cards */}
            <div className="space-y-3">
              {features.map((feat) => (
                <div
                  key={feat.text}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feat.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{feat.text}</span>
                </div>
              ))}
            </div>

            {/* CTA — uses <a> tag for reliability in in-app browsers */}
            <div className="space-y-3 pt-2">
              <a
                href={storeUrl}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg active:scale-[0.97] transition-transform touch-manipulation"
              >
                <Smartphone className="w-4 h-4" />
                Download on {storeName}
              </a>

              <button
                onClick={dismiss}
                className="w-full py-3 text-sm text-muted-foreground underline underline-offset-2"
              >
                Continue on web
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
