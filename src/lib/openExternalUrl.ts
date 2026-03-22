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
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/** For mailto: and tel: links */
export function openSystemUrl(url: string): void {
  window.open(url, "_self");
}
