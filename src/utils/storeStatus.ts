/**
 * Store status utility — determines open/closed/almost-open/closing-soon and live delivery ETA
 */

export type StoreStatusType = "open" | "closing-soon" | "almost-open" | "closed";

export interface StoreStatusResult {
  isOpen: boolean;
  status: StoreStatusType;
  label: string;
  closesAt?: string;
}

export function getStoreStatus(hours: string): StoreStatusResult {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  // Parse hours string like "6am–11pm", "10am–8:30pm", "7:00 AM–8:00 PM"
  const match = hours.match(/(\d+)(:\d+)?\s*(am|pm)\s*[–-]\s*(\d+)(:\d+)?\s*(am|pm)/i);
  if (!match) return { isOpen: true, status: "open", label: "Open" };

  let openHour = parseInt(match[1]);
  const openMin = match[2] ? parseInt(match[2].slice(1)) : 0;
  const openAmPm = match[3].toLowerCase();
  let closeHour = parseInt(match[4]);
  const closeMin = match[5] ? parseInt(match[5].slice(1)) : 0;
  const closeAmPm = match[6].toLowerCase();

  if (openAmPm === "pm" && openHour !== 12) openHour += 12;
  if (openAmPm === "am" && openHour === 12) openHour = 0;
  if (closeAmPm === "pm" && closeHour !== 12) closeHour += 12;
  if (closeAmPm === "am" && closeHour === 12) closeHour = 24; // midnight

  const currentMinutes = currentHour * 60 + currentMin;
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  if (isOpen) {
    const minutesLeft = closeMinutes - currentMinutes;
    if (minutesLeft <= 30) {
      return { isOpen: true, status: "closing-soon", label: `Closing in ${minutesLeft}m`, closesAt: hours.split(/[–-]/)[1]?.trim() };
    }
    if (minutesLeft <= 60) {
      return { isOpen: true, status: "closing-soon", label: `Closes in ${minutesLeft}m`, closesAt: hours.split(/[–-]/)[1]?.trim() };
    }
    return { isOpen: true, status: "open", label: "Open", closesAt: hours.split(/[–-]/)[1]?.trim() };
  }

  // Closed — check if almost open (within 60 minutes of opening)
  const minutesUntilOpen = openMinutes - currentMinutes;
  if (minutesUntilOpen > 0 && minutesUntilOpen <= 60) {
    return { isOpen: false, status: "almost-open", label: `Opens in ${minutesUntilOpen}m` };
  }

  return { isOpen: false, status: "closed", label: "Closed" };
}

/** Simulate live delivery ETA with slight variation from base */
export function getLiveEta(baseMin: number): number {
  const variation = Math.floor(Math.random() * 10) - 3; // -3 to +7 min
  return Math.max(15, baseMin + variation);
}
