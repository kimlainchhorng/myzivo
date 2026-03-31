/**
 * Store status utility — determines open/closed/almost-open/closing-soon and live delivery ETA
 * Uses store's country timezone for accurate status
 */

export type StoreStatusType = "open" | "closing-soon" | "almost-open" | "closed";

export interface StoreStatusResult {
  isOpen: boolean;
  status: StoreStatusType;
  label: string;
  closesAt?: string;
  formattedHours?: string;
}

/** Map market/country codes to IANA timezones */
const MARKET_TIMEZONES: Record<string, string> = {
  KH: "Asia/Phnom_Penh",
  US: "America/New_York",
  kh: "Asia/Phnom_Penh",
  us: "America/New_York",
  cambodia: "Asia/Phnom_Penh",
  usa: "America/New_York",
};

/** Get current hours & minutes in a given timezone */
function getNowInTimezone(timezone?: string): { hours: number; minutes: number } {
  const now = new Date();
  if (!timezone) {
    return { hours: now.getHours(), minutes: now.getMinutes() };
  }
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(now);
    const h = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
    const m = parseInt(parts.find((p) => p.type === "minute")?.value || "0");
    return { hours: h === 24 ? 0 : h, minutes: m };
  } catch {
    return { hours: now.getHours(), minutes: now.getMinutes() };
  }
}

/** Parse an hours string like "7am–10pm", "7:00 AM - 8:00 PM" */
function parseHoursString(hours: string) {
  const match = hours.match(/(\d+)(:\d+)?\s*(am|pm)\s*[–\-]\s*(\d+)(:\d+)?\s*(am|pm)/i);
  if (!match) return null;

  let openHour = parseInt(match[1]);
  const openMin = match[2] ? parseInt(match[2].slice(1)) : 0;
  const openAmPm = match[3].toLowerCase();
  let closeHour = parseInt(match[4]);
  const closeMin = match[5] ? parseInt(match[5].slice(1)) : 0;
  const closeAmPm = match[6].toLowerCase();

  const fmtTime = (h: number, m: number, ap: string) => {
    const mm = m > 0 ? `:${m.toString().padStart(2, "0")}` : ":00";
    return `${h}${mm} ${ap.toUpperCase()}`;
  };
  const formattedOpen = fmtTime(openHour, openMin, openAmPm);
  const formattedClose = fmtTime(closeHour, closeMin, closeAmPm);

  if (openAmPm === "pm" && openHour !== 12) openHour += 12;
  if (openAmPm === "am" && openHour === 12) openHour = 0;
  if (closeAmPm === "pm" && closeHour !== 12) closeHour += 12;
  if (closeAmPm === "am" && closeHour === 12) closeHour = 24;

  return { openHour, openMin, closeHour, closeMin, formattedOpen, formattedClose };
}

/**
 * @param hours - e.g. "7am–10pm"
 * @param market - optional market/country code (e.g. "KH", "US") to use correct timezone
 */
export function getStoreStatus(hours: string, market?: string): StoreStatusResult {
  const timezone = market ? MARKET_TIMEZONES[market] || MARKET_TIMEZONES[market.toLowerCase()] : undefined;
  const { hours: currentHour, minutes: currentMin } = getNowInTimezone(timezone);
  const currentMinutes = currentHour * 60 + currentMin;

  const parsed = parseHoursString(hours);
  if (!parsed) return { isOpen: true, status: "open", label: "Open" };

  const { openHour, openMin, closeHour, closeMin, formattedOpen, formattedClose } = parsed;
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  const formattedHours = `${formattedOpen}–${formattedClose}`;

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  if (isOpen) {
    const minutesLeft = closeMinutes - currentMinutes;
    if (minutesLeft <= 30) {
      return { isOpen: true, status: "closing-soon", label: `Closing in ${minutesLeft}m`, closesAt: formattedClose, formattedHours };
    }
    if (minutesLeft <= 60) {
      return { isOpen: true, status: "closing-soon", label: `Closes in ${minutesLeft}m`, closesAt: formattedClose, formattedHours };
    }
    return { isOpen: true, status: "open", label: "Open", closesAt: formattedClose, formattedHours };
  }

  const minutesUntilOpen = openMinutes - currentMinutes;
  if (minutesUntilOpen > 0 && minutesUntilOpen <= 60) {
    return { isOpen: false, status: "almost-open", label: `Opens in ${minutesUntilOpen}m`, formattedHours };
  }

  return { isOpen: false, status: "closed", label: "Closed", formattedHours };
}

/** Simulate live delivery ETA with slight variation from base */
export function getLiveEta(baseMin: number): number {
  const variation = Math.floor(Math.random() * 10) - 3;
  return Math.max(15, baseMin + variation);
}
