/**
 * nativeContacts — Optional bridge to @capacitor-community/contacts.
 *
 * The dependency is intentionally NOT added to package.json to avoid pinning
 * the project to a plugin version. Functions resolve gracefully on web and
 * when the plugin isn't installed: callers get { available: false } and can
 * fall back to the paste-text flow in FindContactsPage.
 *
 * Raw phone numbers NEVER leave the device — we only emit SHA-256 hashes via
 * hashPhoneE164() for the contact-match edge function.
 */
import { hashPhoneE164 } from "@/lib/phoneHash";

type Capacitor = { isNativePlatform: () => boolean; getPlatform: () => string };

async function getCapacitor(): Promise<Capacitor | null> {
  try {
    const mod: any = await import("@capacitor/core");
    return mod?.Capacitor ?? null;
  } catch {
    return null;
  }
}

export async function isNativeAvailable(): Promise<boolean> {
  const cap = await getCapacitor();
  if (!cap?.isNativePlatform()) return false;
  try {
    // @ts-ignore — optional peer dependency
    await import(/* @vite-ignore */ "@capacitor-community/contacts");
    return true;
  } catch {
    return false;
  }
}

export async function requestPermission(): Promise<boolean> {
  try {
    // @ts-ignore — optional peer dependency
    const mod: any = await import(/* @vite-ignore */ "@capacitor-community/contacts");
    const Contacts = mod?.Contacts;
    if (!Contacts?.requestPermissions) return false;
    const res = await Contacts.requestPermissions();
    return res?.contacts === "granted";
  } catch {
    return false;
  }
}

function normaliseToE164Best(raw: string, fallbackCountryCode = "1"): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (!digits) return null;
  if (digits.startsWith("+")) {
    return digits.length >= 8 ? digits : null;
  }
  // Heuristic: 10-digit number => prepend country code (default US)
  if (digits.length === 10) return `+${fallbackCountryCode}${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  return null;
}

/**
 * pickAndHashPhones — opens native picker (or pulls all contacts), normalises,
 * hashes, and returns the hash list ready for the contact-match edge function.
 */
export async function pickAndHashPhones(opts?: { defaultCountryCode?: string }): Promise<{
  ok: boolean;
  hashes: string[];
  count: number;
  reason?: "no-plugin" | "denied" | "empty" | "error";
}> {
  try {
    // @ts-ignore — optional peer dependency
    const mod: any = await import(/* @vite-ignore */ "@capacitor-community/contacts");
    const Contacts = mod?.Contacts;
    if (!Contacts) return { ok: false, hashes: [], count: 0, reason: "no-plugin" };

    const granted = await requestPermission();
    if (!granted) return { ok: false, hashes: [], count: 0, reason: "denied" };

    const result = await Contacts.getContacts({
      projection: { phones: true, name: false, emails: false },
    });
    const list: any[] = result?.contacts ?? [];
    const phones = new Set<string>();
    for (const c of list) {
      for (const p of c?.phones ?? []) {
        const n = normaliseToE164Best(p?.number ?? "", opts?.defaultCountryCode);
        if (n) phones.add(n);
      }
    }
    if (phones.size === 0) return { ok: false, hashes: [], count: 0, reason: "empty" };

    const hashes = await Promise.all(Array.from(phones).map(hashPhoneE164));
    return { ok: true, hashes, count: phones.size };
  } catch {
    return { ok: false, hashes: [], count: 0, reason: "error" };
  }
}
