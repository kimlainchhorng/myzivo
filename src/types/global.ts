/**
 * ZIVO Global Expansion Types
 * Multi-country, multi-language, multi-currency support
 */

export interface Country {
  id: string;
  code: string;
  code_alpha3: string | null;
  name: string;
  native_name: string | null;
  region: string;
  subregion: string | null;
  default_currency: string;
  default_language: string;
  timezone: string | null;
  phone_code: string | null;
  flag_emoji: string | null;
  is_active: boolean;
  is_beta: boolean;
  launched_at: string | null;
  disabled_at: string | null;
  disabled_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CountryService {
  id: string;
  country_id: string;
  service_type: ServiceType;
  is_enabled: boolean;
  is_beta: boolean;
  launched_at: string | null;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CountryLegalPage {
  id: string;
  country_id: string;
  page_type: LegalPageType;
  language: string;
  title: string;
  content: string;
  version: string;
  is_active: boolean;
  effective_at: string;
  created_at: string;
  updated_at: string;
}

export interface CountryTaxConfig {
  id: string;
  country_id: string;
  tax_name: string;
  tax_type: TaxType;
  rate_percent: number;
  applies_to: string[];
  is_inclusive: boolean;
  is_active: boolean;
  effective_from: string;
  effective_until: string | null;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SupportedLanguage {
  id: string;
  code: string;
  name: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  flag_emoji: string | null;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
}

export interface UITranslation {
  id: string;
  language_code: string;
  namespace: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface UserLocalePreferences {
  id: string;
  user_id: string;
  country_code: string | null;
  language_code: string;
  currency_code: string;
  timezone: string | null;
  detected_country: string | null;
  detected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CountryAnalytics {
  id: string;
  country_id: string;
  date: string;
  service_type: string;
  total_users: number;
  new_users: number;
  active_users: number;
  total_bookings: number;
  total_revenue_usd: number;
  total_clicks: number;
  conversion_rate: number;
  created_at: string;
}

export type ServiceType = 'flights' | 'hotels' | 'cars' | 'rides' | 'eats' | 'move';
export type LegalPageType = 'terms' | 'privacy' | 'cookies' | 'seller_of_travel' | 'partner_disclosure';
export type TaxType = 'vat' | 'gst' | 'sales_tax' | 'service_fee';

export interface CountryWithServices extends Country {
  services: CountryService[];
}

export interface RegionStats {
  region: string;
  countries: number;
  activeCountries: number;
  totalUsers: number;
  totalRevenue: number;
}

export interface GlobalOverview {
  totalCountries: number;
  activeCountries: number;
  totalLanguages: number;
  activeLanguages: number;
  totalUsers: number;
  revenueByRegion: RegionStats[];
}
