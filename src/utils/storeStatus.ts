/**
 * Store status utility — determines open/closed/almost-open/closing-soon and live delivery ETA
 */

export type StoreStatusType = "open" | "closing-soon" | "almost-open" | "closed";

export interface StoreStatusResult {
  isOpen: boolean;
  status: StoreStatusType;
  label: string;
  closesAt?: string;
  formattedHours?: string;
}

/** Parse an hours string like "7am–10pm", "7:00 AM - 8:00 PM", "8:00 AM–8:00 PM" */
function parseHoursString(hours: string): { openHour: number; openMin: number; closeHour: number; closeMin: number; formattedOpen: string; formattedClose: string } | null {
  const match = hours.match(/(\d+)(:\d+)?\s*(am|pm)\s*[–\-]\s*(\d+)(:\d+)?\s*(am|pm)/i);
  if (!match) return null;

  let openHour = parseInt(match[1]);
  const openMin = match[2] ? parseInt(match[2].slice(1)) : 0;
  const openAmPm = match[3].toLowerCase();
  let closeHour = parseInt(match[4]);
  const closeMin = match[5] ? parseInt(match[5].slice(1)) : 0;
  const closeAmPm = match[6].toLowerCase();

  // Format display strings before converting to 24h
  const fmtTime = (h: number, m: number, ap: string) => {
    const mm = m > 0 ? `:${m.toString().padStart(2, "0")}` : ":00";
    return `${h}${mm} ${ap.toUpperCase()}`;
  };
  const formattedOpen = fmtTime(openHour, openMin, openAmPm);
  const formattedClose = fmtTime(closeHour, closeMin, closeAmPm);

  // Convert to 24h
  if (openAmPm === "pm" && openHour !== 12) openHour += 12;
  if (openAmPm === "am" && openHour === 12) openHour = 0;
  if (closeAmPm === "pm" && closeHour !== 12) closeHour += 12;
  if (closeAmPm === "am" && closeHour === 12) closeHour = 24;

  return { openHour, openMin, closeHour, closeMin, formattedOpen, formattedClose };
}

export function getStoreStatus(hours: string): StoreStatusResult {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

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

  // Closed — check if almost open (within 60 minutes of opening)
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
