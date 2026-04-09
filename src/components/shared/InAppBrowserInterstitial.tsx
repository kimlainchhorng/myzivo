import { useState, useEffect } from "react";
import { isInAppBrowser, getInAppBrowserName } from "@/lib/isInAppBrowser";
import { IOS_STORE_URL, ANDROID_STORE_URL } from "@/lib/deepLinks";
import { Download, ExternalLink, X, Zap, Gift, Bell, Heart } from "lucide-react";
import zivoLogo from "@/assets/ZIVO_LOGO.png";
import { Button } from "@/components/ui/button";

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function InAppBrowserInterstitial({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const browserName = getInAppBrowserName();

  useEffect(() => {
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

  const features = [
    { icon: Zap, text: "Faster & smoother experience", color: "text-amber-500" },
    { icon: Gift, text: "Exclusive app-only deals", color: "text-emerald-500" },
    { icon: Bell, text: "Real-time notifications", color: "text-blue-500" },
    { icon: Heart, text: "Save your preferences", color: "text-rose-500" },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-background via-background to-muted/30 flex flex-col items-center justify-center px-5">
      {/* Close */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-muted/80 text-muted-foreground hover:bg-muted active:scale-95 transition-all"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-sm w-full space-y-8">
        {/* App Icon */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10 overflow-hidden">
              <img src={zivoLogo} alt="ZIVO" className="w-full h-full object-contain p-2" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive flex items-center justify-center shadow-md">
              <span className="text-[11px] font-bold text-destructive-foreground">1</span>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight">Get the ZIVO App</h1>
            <p className="text-muted-foreground text-[13px] leading-relaxed max-w-[280px] mx-auto">
              For the best experience, open this in the ZIVO app
              {browserName ? ` instead of ${browserName}'s browser` : ""}.
            </p>
          </div>
        </div>

        {/* Features as notification cards */}
        <div className="space-y-2.5">
          {features.map(({ icon: Icon, text, color }) => (
            <div
              key={text}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center flex-shrink-0">
                <Icon className={`w-[18px] h-[18px] ${color}`} />
              </div>
              <span className="text-[13px] font-medium">{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-1">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full rounded-2xl h-14 font-bold text-[15px] shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform bg-primary text-primary-foreground"
          >
            <Download className="w-5 h-5 mr-2.5" />
            Download ZIVO App
          </a>

          <button
            onClick={handleDismiss}
            className="flex items-center justify-center w-full rounded-2xl h-12 font-semibold text-muted-foreground text-[13px]"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Continue on Web
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground/60 text-center">
          Free download · 4.9★ rating · 10K+ downloads
        </p>
      </div>
    </div>
  );
}
