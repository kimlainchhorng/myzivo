/**
 * INTERNATIONAL EXPANSION CONFIGURATION
 * 
 * Countries, regions, rollout phases, and compliance
 */

// ============================================
// SUPPORTED REGIONS
// ============================================

export type Region = 'north-america' | 'europe' | 'asia-pacific' | 'middle-east' | 'latin-america';

export interface CountryConfig {
  code: string;
  code3: string;
  name: string;
  nativeName?: string;
  region: Region;
  currency: string;
  language: string;
  flag: string;
  timezone: string;
  primaryAirport?: string;
  popularRoutes?: string[];
  isLaunched: boolean;
  launchPhase: 1 | 2 | 3;
}

export const COUNTRIES: CountryConfig[] = [
  // Phase 1: North America
  {
    code: "US",
    code3: "USA",
    name: "United States",
    region: "north-america",
    currency: "USD",
    language: "en",
    flag: "🇺🇸",
    timezone: "America/New_York",
    primaryAirport: "JFK",
    popularRoutes: ["New York to Los Angeles", "Miami to Chicago", "San Francisco to Seattle"],
    isLaunched: true,
    launchPhase: 1,
  },
  {
    code: "CA",
    code3: "CAN",
    name: "Canada",
    region: "north-america",
    currency: "CAD",
    language: "en",
    flag: "🇨🇦",
    timezone: "America/Toronto",
    primaryAirport: "YYZ",
    popularRoutes: ["Toronto to Vancouver", "Montreal to Calgary", "Ottawa to Halifax"],
    isLaunched: true,
    launchPhase: 1,
  },
  {
    code: "GB",
    code3: "GBR",
    name: "United Kingdom",
    region: "europe",
    currency: "GBP",
    language: "en",
    flag: "🇬🇧",
    timezone: "Europe/London",
    primaryAirport: "LHR",
    popularRoutes: ["London to New York", "Manchester to Dubai", "Edinburgh to Paris"],
    isLaunched: true,
    launchPhase: 1,
  },
  // Phase 2: EU Major Markets
  {
    code: "DE",
    code3: "DEU",
    name: "Germany",
    nativeName: "Deutschland",
    region: "europe",
    currency: "EUR",
    language: "de",
    flag: "🇩🇪",
    timezone: "Europe/Berlin",
    primaryAirport: "FRA",
    popularRoutes: ["Frankfurt to New York", "Munich to London", "Berlin to Barcelona"],
    isLaunched: false,
    launchPhase: 2,
  },
  {
    code: "FR",
    code3: "FRA",
    name: "France",
    nativeName: "France",
    region: "europe",
    currency: "EUR",
    language: "fr",
    flag: "🇫🇷",
    timezone: "Europe/Paris",
    primaryAirport: "CDG",
    popularRoutes: ["Paris to New York", "Nice to London", "Lyon to Barcelona"],
    isLaunched: false,
    launchPhase: 2,
  },
  {
    code: "ES",
    code3: "ESP",
    name: "Spain",
    nativeName: "España",
    region: "europe",
    currency: "EUR",
    language: "es",
    flag: "🇪🇸",
    timezone: "Europe/Madrid",
    primaryAirport: "MAD",
    popularRoutes: ["Madrid to Barcelona", "Barcelona to London", "Malaga to Paris"],
    isLaunched: false,
    launchPhase: 2,
  },
  {
    code: "IT",
    code3: "ITA",
    name: "Italy",
    nativeName: "Italia",
    region: "europe",
    currency: "EUR",
    language: "it",
    flag: "🇮🇹",
    timezone: "Europe/Rome",
    primaryAirport: "FCO",
    popularRoutes: ["Rome to Milan", "Venice to London", "Florence to Paris"],
    isLaunched: false,
    launchPhase: 2,
  },
  {
    code: "NL",
    code3: "NLD",
    name: "Netherlands",
    nativeName: "Nederland",
    region: "europe",
    currency: "EUR",
    language: "nl",
    flag: "🇳🇱",
    timezone: "Europe/Amsterdam",
    primaryAirport: "AMS",
    popularRoutes: ["Amsterdam to London", "Amsterdam to Paris", "Amsterdam to Barcelona"],
    isLaunched: false,
    launchPhase: 2,
  },
  // Phase 3: Asia-Pacific
  {
    code: "AU",
    code3: "AUS",
    name: "Australia",
    region: "asia-pacific",
    currency: "AUD",
    language: "en",
    flag: "🇦🇺",
    timezone: "Australia/Sydney",
    primaryAirport: "SYD",
    popularRoutes: ["Sydney to Melbourne", "Sydney to Singapore", "Melbourne to Auckland"],
    isLaunched: false,
    launchPhase: 3,
  },
  {
    code: "JP",
    code3: "JPN",
    name: "Japan",
    nativeName: "日本",
    region: "asia-pacific",
    currency: "JPY",
    language: "ja",
    flag: "🇯🇵",
    timezone: "Asia/Tokyo",
    primaryAirport: "NRT",
    popularRoutes: ["Tokyo to Osaka", "Tokyo to Seoul", "Tokyo to Bangkok"],
    isLaunched: false,
    launchPhase: 3,
  },
  {
    code: "SG",
    code3: "SGP",
    name: "Singapore",
    region: "asia-pacific",
    currency: "SGD",
    language: "en",
    flag: "🇸🇬",
    timezone: "Asia/Singapore",
    primaryAirport: "SIN",
    popularRoutes: ["Singapore to Bangkok", "Singapore to Tokyo", "Singapore to Bali"],
    isLaunched: false,
    launchPhase: 3,
  },
  {
    code: "KR",
    code3: "KOR",
    name: "South Korea",
    nativeName: "한국",
    region: "asia-pacific",
    currency: "KRW",
    language: "ko",
    flag: "🇰🇷",
    timezone: "Asia/Seoul",
    primaryAirport: "ICN",
    popularRoutes: ["Seoul to Tokyo", "Seoul to Osaka", "Seoul to Bangkok"],
    isLaunched: false,
    launchPhase: 3,
  },
];

// ============================================
// SUPPORTED LANGUAGES
// ============================================

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
  isReady: boolean;
  phase: 1 | 2 | 3;
}

export const LANGUAGES: LanguageConfig[] = [
  { code: "en", name: "English", nativeName: "English", direction: "ltr", flag: "🇺🇸", isReady: true, phase: 1 },
  { code: "es", name: "Spanish", nativeName: "Español", direction: "ltr", flag: "🇪🇸", isReady: false, phase: 1 },
  { code: "fr", name: "French", nativeName: "Français", direction: "ltr", flag: "🇫🇷", isReady: false, phase: 2 },
  { code: "de", name: "German", nativeName: "Deutsch", direction: "ltr", flag: "🇩🇪", isReady: false, phase: 2 },
  { code: "it", name: "Italian", nativeName: "Italiano", direction: "ltr", flag: "🇮🇹", isReady: false, phase: 2 },
  { code: "pt", name: "Portuguese", nativeName: "Português", direction: "ltr", flag: "🇧🇷", isReady: false, phase: 2 },
  { code: "ja", name: "Japanese", nativeName: "日本語", direction: "ltr", flag: "🇯🇵", isReady: false, phase: 3 },
  { code: "ko", name: "Korean", nativeName: "한국어", direction: "ltr", flag: "🇰🇷", isReady: false, phase: 3 },
  { code: "zh", name: "Chinese", nativeName: "中文", direction: "ltr", flag: "🇨🇳", isReady: false, phase: 3 },
];

// ============================================
// ROLLOUT PHASES
// ============================================

export interface RolloutPhase {
  phase: number;
  name: string;
  description: string;
  targetDate?: string;
  countries: string[];
  languages: string[];
  status: 'completed' | 'active' | 'planned';
}

export const ROLLOUT_PHASES: RolloutPhase[] = [
  {
    phase: 1,
    name: "North America & UK",
    description: "Core English-speaking markets with established partner relationships",
    targetDate: "2024-Q1",
    countries: ["US", "CA", "GB"],
    languages: ["en", "es"],
    status: "active",
  },
  {
    phase: 2,
    name: "EU Major Markets",
    description: "Expansion into key European markets with localized content",
    targetDate: "2024-Q3",
    countries: ["DE", "FR", "ES", "IT", "NL"],
    languages: ["de", "fr", "it", "pt"],
    status: "planned",
  },
  {
    phase: 3,
    name: "Asia-Pacific",
    description: "Entry into high-growth APAC markets",
    targetDate: "2025-Q1",
    countries: ["AU", "JP", "SG", "KR"],
    languages: ["ja", "ko", "zh"],
    status: "planned",
  },
];

// ============================================
// INTERNATIONAL COMPLIANCE
// ============================================

export const INTERNATIONAL_COMPLIANCE = {
  globalDisclaimer: "ZIVO operates as a booking facilitator and sub-agent. Travel services are fulfilled by licensed providers in each region.",
  currencyDisclaimer: "Prices may vary by currency and provider. Final price confirmed at checkout.",
  taxDisclaimer: "Taxes, fees, and payment methods may vary by country. All taxes are calculated by our travel partners.",
  partnerDisclaimer: "Bookings are processed by licensed travel partners in your region.",
  
  // Country-specific notices
  ukNotice: "ATOL protected. Bookings include UK consumer protections.",
  euNotice: "EU Package Travel Directive applies to qualifying bookings.",
  usNotice: "California and Florida Seller of Travel registrations on file.",
  auNotice: "Australian Consumer Law applies to qualifying bookings.",
};

// ============================================
// GEO-DETECTION HELPERS
// ============================================

export interface GeoDetectionResult {
  countryCode: string;
  currency: string;
  language: string;
  timezone: string;
  nearestAirport?: string;
}

export function getCountryByCode(code: string): CountryConfig | undefined {
  return COUNTRIES.find(c => c.code === code.toUpperCase());
}

export function getLanguageByCode(code: string): LanguageConfig | undefined {
  return LANGUAGES.find(l => l.code === code.toLowerCase());
}

export function getLaunchedCountries(): CountryConfig[] {
  return COUNTRIES.filter(c => c.isLaunched);
}

export function getCountriesByPhase(phase: number): CountryConfig[] {
  return COUNTRIES.filter(c => c.launchPhase === phase);
}

export function getCountriesByRegion(region: Region): CountryConfig[] {
  return COUNTRIES.filter(c => c.region === region);
}

export function getActiveLanguages(): LanguageConfig[] {
  return LANGUAGES.filter(l => l.isReady);
}

// Country URL slugs for SEO
export function getCountrySlug(code: string): string {
  const slugMap: Record<string, string> = {
    US: "us",
    CA: "ca",
    GB: "uk",
    DE: "de",
    FR: "fr",
    ES: "es",
    IT: "it",
    NL: "nl",
    AU: "au",
    JP: "jp",
    SG: "sg",
    KR: "kr",
  };
  return slugMap[code.toUpperCase()] || code.toLowerCase();
}

export function getCountryFromSlug(slug: string): CountryConfig | undefined {
  const codeMap: Record<string, string> = {
    us: "US",
    ca: "CA",
    uk: "GB",
    de: "DE",
    fr: "FR",
    es: "ES",
    it: "IT",
    nl: "NL",
    au: "AU",
    jp: "JP",
    sg: "SG",
    kr: "KR",
  };
  const code = codeMap[slug.toLowerCase()];
  return code ? getCountryByCode(code) : undefined;
}
