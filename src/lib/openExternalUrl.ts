/**
 * openExternalUrl — safely opens links in-app on native, or new tab on web.
 * Uses Capacitor Browser plugin on iOS/Android to avoid Safari redirect (Apple Guideline 2.1a).
 * Falls back to window.open on web.
 */
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

export async function openExternalUrl(url: string): Promise<void> {
  if (!url || url === "#") return;

  if (Capacitor.isNativePlatform()) {
    try {
      await Browser.open({ url, presentationStyle: "popover" });
    } catch (err) {
      console.warn("[openExternalUrl] Browser.open failed, falling back:", err);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  } else {
    const opener = window.top && window.top !== window ? window.top : window;
    const newTab = opener.open("", "_blank", "noopener,noreferrer");

    if (newTab) {
      try {
        newTab.opener = null;
      } catch {
        // Ignore browsers that prevent setting opener directly
      }
      newTab.location.replace(url);
      return;
    }

    window.location.assign(url);
  }
}

/** For mailto: and tel: links */
export function openSystemUrl(url: string): void {
  window.open(url, "_self");
}
