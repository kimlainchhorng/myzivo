/**
 * ZIVO Currency Configuration
 * Supported currencies with metadata for formatting and display
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
  locale: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: "USD", symbol: "$", name: "US Dollar", decimals: 2, locale: "en-US", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", decimals: 2, locale: "de-DE", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", decimals: 2, locale: "en-GB", flag: "🇬🇧" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", decimals: 2, locale: "en-CA", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", decimals: 2, locale: "en-AU", flag: "🇦🇺" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", decimals: 0, locale: "ja-JP", flag: "🇯🇵" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", decimals: 0, locale: "ko-KR", flag: "🇰🇷" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", decimals: 2, locale: "en-SG", flag: "🇸🇬" },
  { code: "THB", symbol: "฿", name: "Thai Baht", decimals: 2, locale: "th-TH", flag: "🇹🇭" },
  { code: "KHR", symbol: "៛", name: "Cambodian Riel", decimals: 0, locale: "km-KH", flag: "🇰🇭" },
];

export const DEFAULT_CURRENCY = "USD";

export const CURRENCY_MAP: Record<string, CurrencyConfig> = SUPPORTED_CURRENCIES.reduce(
  (acc, currency) => ({ ...acc, [currency.code]: currency }),
  {}
);

export function getCurrencyConfig(code: string): CurrencyConfig {
  return CURRENCY_MAP[code] || CURRENCY_MAP[DEFAULT_CURRENCY];
}

// Static fallback rates (USD as base = 1.0)
// These are used when API rates fail or are stale
export const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.5,
  KRW: 1320.0,
  SGD: 1.34,
  THB: 35.5,
  KHR: 4100.0,
};
