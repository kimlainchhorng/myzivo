/**
 * openExternalUrl — keeps internal app routes inside the Capacitor WebView,
 * and only opens truly external destinations in the system/in-app browser.
 */
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

const SYSTEM_SCHEMES = ["mailto:", "tel:", "sms:"];

function resolveUrl(url: string): URL | null {
  try {
    return new URL(url, window.location.origin);
  } catch {
    return null;
  }
}

function isSystemUrl(url: string): boolean {
  return SYSTEM_SCHEMES.some((scheme) => url.startsWith(scheme));
}

function isInternalAppUrl(resolvedUrl: URL, originalUrl: string): boolean {
  if (originalUrl.startsWith("/") || originalUrl.startsWith("./") || originalUrl.startsWith("../")) {
    return true;
  }

  return resolvedUrl.origin === window.location.origin;
}

export async function openExternalUrl(url: string): Promise<void> {
  if (!url || url === "#") return;

  if (isSystemUrl(url)) {
    openSystemUrl(url);
    return;
  }

  const resolvedUrl = resolveUrl(url);
  if (!resolvedUrl) return;

  if (isInternalAppUrl(resolvedUrl, url)) {
    window.location.assign(`${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`);
    return;
  }

  if (Capacitor.isNativePlatform()) {
    try {
      await Browser.open({ url: resolvedUrl.href, presentationStyle: "popover" });
    } catch (err) {
      console.warn("[openExternalUrl] Browser.open failed, falling back:", err);
      window.open(resolvedUrl.href, "_blank", "noopener,noreferrer");
    }
    return;
  }

  const link = document.createElement("a");
  link.href = resolvedUrl.href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** For mailto:, tel:, sms: links */
export function openSystemUrl(url: string): void {
  window.location.assign(url);
}
