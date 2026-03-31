/**
 * openExternalUrl — keeps internal app routes inside the Capacitor WebView,
 * and only opens truly external destinations in the system/in-app browser.
 */
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

const SYSTEM_SCHEMES = ["mailto:", "tel:", "sms:"];

function normalizeUrl(url: string): string {
  const value = url.trim();
  if (!value) return "";

  // Already absolute (https:, mailto:, tel:, sms:, etc.)
  if (/^[a-z][a-z\d+\-.]*:/i.test(value)) return value;

  // Protocol-relative URL
  if (value.startsWith("//")) return `https:${value}`;

  // User-entered domains like facebook.com/username
  if (/^(www\.)?[a-z0-9-]+\.[a-z]{2,}/i.test(value)) return `https://${value}`;

  return value;
}

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
  const normalizedUrl = normalizeUrl(url);
  if (!normalizedUrl || normalizedUrl === "#") return;

  if (isSystemUrl(normalizedUrl)) {
    openSystemUrl(normalizedUrl);
    return;
  }

  const resolvedUrl = resolveUrl(normalizedUrl);
  if (!resolvedUrl) return;

  if (isInternalAppUrl(resolvedUrl, normalizedUrl)) {
    window.location.assign(`${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`);
    return;
  }

  if (Capacitor.isNativePlatform()) {
    try {
      // Keep defaults for max compatibility across iOS/Android WebViews
      await Browser.open({ url: resolvedUrl.href });
      return;
    } catch (err) {
      console.warn("[openExternalUrl] Browser.open failed, using top-level navigation:", err);
      window.location.assign(resolvedUrl.href);
      return;
    }
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
