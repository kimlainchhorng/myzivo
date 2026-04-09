/**
 * Detects if the current browser is a social-media in-app browser
 * (Facebook, Instagram, TikTok, Snapchat, LinkedIn, Twitter, etc.)
 */
export function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|Instagram|LinkedInApp|Snapchat|TikTok|Twitter|Line\//i.test(ua);
}

export function getInAppBrowserName(): string | null {
  const ua = navigator.userAgent || "";
  if (/FBAN|FBAV/i.test(ua)) return "Facebook";
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/TikTok/i.test(ua)) return "TikTok";
  if (/Snapchat/i.test(ua)) return "Snapchat";
  if (/LinkedInApp/i.test(ua)) return "LinkedIn";
  if (/Twitter/i.test(ua)) return "Twitter";
  return null;
}
