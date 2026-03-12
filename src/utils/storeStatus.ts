/**
 * Store status utility — determines open/closed and live delivery ETA
 */

export function getStoreStatus(hours: string): { isOpen: boolean; label: string; closesAt?: string } {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  // Parse hours string like "6am–11pm", "10am–8:30pm"
  const match = hours.match(/(\d+)(:\d+)?(am|pm)–(\d+)(:\d+)?(am|pm)/i);
  if (!match) return { isOpen: true, label: "Open" };

  let openHour = parseInt(match[1]);
  const openAmPm = match[3].toLowerCase();
  let closeHour = parseInt(match[4]);
  const closeMin = match[5] ? parseInt(match[5].slice(1)) : 0;
  const closeAmPm = match[6].toLowerCase();

  if (openAmPm === "pm" && openHour !== 12) openHour += 12;
  if (openAmPm === "am" && openHour === 12) openHour = 0;
  if (closeAmPm === "pm" && closeHour !== 12) closeHour += 12;
  if (closeAmPm === "am" && closeHour === 12) closeHour = 24; // midnight

  const currentMinutes = currentHour * 60 + currentMin;
  const openMinutes = openHour * 60;
  const closeMinutes = closeHour * 60 + closeMin;

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  if (!isOpen) {
    return { isOpen: false, label: "Closed" };
  }

  const minutesLeft = closeMinutes - currentMinutes;
  if (minutesLeft <= 60) {
    return { isOpen: true, label: `Closes in ${minutesLeft}m`, closesAt: hours.split("–")[1] };
  }

  return { isOpen: true, label: "Open", closesAt: hours.split("–")[1] };
}

/** Simulate live delivery ETA with slight variation from base */
export function getLiveEta(baseMin: number): number {
  const variation = Math.floor(Math.random() * 10) - 3; // -3 to +7 min
  return Math.max(15, baseMin + variation);
}
