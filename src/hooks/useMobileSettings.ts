/**
 * Mobile Settings Hook
 * Accesses mobile settings from localStorage or admin configuration
 */
import { useState, useEffect } from "react";

export interface MobileSettings {
  pwaInstallBannerEnabled: boolean;
  checkoutOpenBehavior: "same_tab" | "new_tab";
  stickyCtaEnabled: boolean;
  mobileFiltersEnabled: boolean;
  skeletonLoadersEnabled: boolean;
}

const defaultSettings: MobileSettings = {
  pwaInstallBannerEnabled: true,
  checkoutOpenBehavior: "same_tab",
  stickyCtaEnabled: true,
  mobileFiltersEnabled: true,
  skeletonLoadersEnabled: true,
};

export function useMobileSettings(): MobileSettings {
  const [settings, setSettings] = useState<MobileSettings>(defaultSettings);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hizovo-mobile-settings");
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error("[MobileSettings] Error loading settings:", e);
    }
  }, []);

  return settings;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export function useIsStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);
  }, []);

  return isStandalone;
}
