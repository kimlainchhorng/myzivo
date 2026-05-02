/**
 * Tier ladder for fan supporter badges (lifetime coins gifted to a host).
 * Drives the small badge next to chat names and viewer-list rows.
 */
export type TierName =
  | "Newcomer"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Legend";

export interface Tier {
  name: TierName;
  level: number;
  threshold: number;
  /** Tailwind class for the badge background */
  bg: string;
  /** Tailwind class for the badge label text */
  text: string;
  /** Single character or short symbol */
  symbol: string;
}

export const TIERS: Tier[] = [
  { name: "Newcomer", level: 0, threshold: 0,         bg: "bg-zinc-700/70",                                                       text: "text-zinc-200",  symbol: "•" },
  { name: "Bronze",   level: 1, threshold: 100,       bg: "bg-gradient-to-br from-orange-700 to-orange-500",                      text: "text-white",     symbol: "1" },
  { name: "Silver",   level: 2, threshold: 1_000,     bg: "bg-gradient-to-br from-zinc-400 to-zinc-300",                          text: "text-zinc-900",  symbol: "2" },
  { name: "Gold",     level: 3, threshold: 5_000,     bg: "bg-gradient-to-br from-amber-500 to-yellow-400",                       text: "text-amber-950", symbol: "3" },
  { name: "Platinum", level: 4, threshold: 25_000,    bg: "bg-gradient-to-br from-cyan-400 to-blue-400",                          text: "text-white",     symbol: "4" },
  { name: "Diamond",  level: 5, threshold: 100_000,   bg: "bg-gradient-to-br from-fuchsia-500 to-purple-600",                     text: "text-white",     symbol: "5" },
  { name: "Legend",   level: 6, threshold: 1_000_000, bg: "bg-gradient-to-br from-rose-500 via-amber-400 to-yellow-300",          text: "text-rose-950",  symbol: "★" },
];

export function tierFor(coinsTotal: number | undefined | null): Tier {
  const c = Number(coinsTotal ?? 0);
  let chosen = TIERS[0];
  for (const t of TIERS) if (c >= t.threshold) chosen = t;
  return chosen;
}
