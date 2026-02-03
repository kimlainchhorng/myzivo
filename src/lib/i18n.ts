/**
 * ZIVO i18n Framework
 * Lightweight internationalization system
 * Ready for multi-language expansion
 */

import { supabase } from "@/integrations/supabase/client";

// Default translations (English)
const defaultTranslations: Record<string, Record<string, string>> = {
  common: {
    // Navigation
    "nav.home": "Home",
    "nav.flights": "Flights",
    "nav.hotels": "Hotels",
    "nav.cars": "Cars",
    "nav.rides": "Rides",
    "nav.eats": "Eats",
    "nav.move": "Move",
    "nav.account": "Account",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.logout": "Logout",

    // Actions
    "action.search": "Search",
    "action.book": "Book Now",
    "action.continue": "Continue",
    "action.cancel": "Cancel",
    "action.save": "Save",
    "action.edit": "Edit",
    "action.delete": "Delete",
    "action.view": "View",
    "action.back": "Back",
    "action.next": "Next",
    "action.submit": "Submit",
    "action.confirm": "Confirm",
    "action.close": "Close",

    // Status
    "status.loading": "Loading...",
    "status.error": "An error occurred",
    "status.success": "Success",
    "status.pending": "Pending",
    "status.completed": "Completed",
    "status.cancelled": "Cancelled",

    // Time
    "time.today": "Today",
    "time.tomorrow": "Tomorrow",
    "time.yesterday": "Yesterday",

    // Currency
    "currency.from": "From",
    "currency.total": "Total",
    "currency.subtotal": "Subtotal",
    "currency.tax": "Tax",
    "currency.fee": "Fee",

    // Legal
    "legal.terms": "Terms of Service",
    "legal.privacy": "Privacy Policy",
    "legal.cookies": "Cookie Policy",
    "legal.partner_disclosure": "Partner Disclosure",

    // Errors
    "error.generic": "Something went wrong. Please try again.",
    "error.network": "Network error. Please check your connection.",
    "error.unauthorized": "Please log in to continue.",
    "error.not_found": "Page not found.",
  },

  flights: {
    "flights.search_title": "Search Flights",
    "flights.from": "From",
    "flights.to": "To",
    "flights.departure": "Departure",
    "flights.return": "Return",
    "flights.passengers": "Passengers",
    "flights.class": "Class",
    "flights.roundtrip": "Round Trip",
    "flights.oneway": "One Way",
    "flights.economy": "Economy",
    "flights.business": "Business",
    "flights.first": "First Class",
    "flights.results": "Flight Results",
    "flights.no_results": "No flights found",
    "flights.price_disclaimer": "Prices shown are indicative. Final price confirmed on partner checkout.",
  },

  hotels: {
    "hotels.search_title": "Find Hotels",
    "hotels.destination": "Destination",
    "hotels.checkin": "Check-in",
    "hotels.checkout": "Check-out",
    "hotels.guests": "Guests",
    "hotels.rooms": "Rooms",
    "hotels.per_night": "per night",
    "hotels.results": "Hotel Results",
    "hotels.no_results": "No hotels found",
  },

  cars: {
    "cars.search_title": "Rent a Car",
    "cars.pickup_location": "Pickup Location",
    "cars.dropoff_location": "Drop-off Location",
    "cars.pickup_date": "Pickup Date",
    "cars.dropoff_date": "Drop-off Date",
    "cars.per_day": "per day",
    "cars.results": "Available Cars",
    "cars.no_results": "No cars available",
  },

  auth: {
    "auth.login_title": "Welcome Back",
    "auth.signup_title": "Create Account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirm_password": "Confirm Password",
    "auth.forgot_password": "Forgot Password?",
    "auth.no_account": "Don't have an account?",
    "auth.have_account": "Already have an account?",
  },
};

// In-memory translation cache
let translationCache: Map<string, Map<string, string>> = new Map();
let currentLanguage = "en";

/**
 * Initialize i18n with a language code
 */
export async function initI18n(languageCode: string = "en"): Promise<void> {
  currentLanguage = languageCode;

  // Always start with defaults
  if (!translationCache.has("en")) {
    const enMap = new Map<string, string>();
    Object.entries(defaultTranslations).forEach(([namespace, keys]) => {
      Object.entries(keys).forEach(([key, value]) => {
        enMap.set(`${namespace}.${key}`, value);
        enMap.set(key, value); // Also store without namespace
      });
    });
    translationCache.set("en", enMap);
  }

  // If not English, try to load from database
  if (languageCode !== "en" && !translationCache.has(languageCode)) {
    try {
      const { data, error } = await supabase
        .from("ui_translations")
        .select("namespace, key, value")
        .eq("language_code", languageCode);

      if (!error && data) {
        const langMap = new Map<string, string>();
        data.forEach((row) => {
          langMap.set(`${row.namespace}.${row.key}`, row.value);
          langMap.set(row.key, row.value);
        });
        translationCache.set(languageCode, langMap);
      }
    } catch {
      // Fallback to English
      console.warn(`Failed to load translations for ${languageCode}`);
    }
  }
}

/**
 * Get translation for a key
 * Supports interpolation with {{variable}} syntax
 */
export function t(key: string, variables?: Record<string, string | number>): string {
  // Try current language first
  let translation = translationCache.get(currentLanguage)?.get(key);

  // Fall back to English
  if (!translation) {
    translation = translationCache.get("en")?.get(key);
  }

  // If still not found, return the key itself
  if (!translation) {
    return key;
  }

  // Replace variables
  if (variables) {
    Object.entries(variables).forEach(([varKey, varValue]) => {
      translation = translation!.replace(new RegExp(`{{${varKey}}}`, "g"), String(varValue));
    });
  }

  return translation;
}

/**
 * Get current language code
 */
export function getCurrentLanguage(): string {
  return currentLanguage;
}

/**
 * Set current language
 */
export async function setLanguage(languageCode: string): Promise<void> {
  await initI18n(languageCode);
}

/**
 * Check if a language is loaded
 */
export function isLanguageLoaded(languageCode: string): boolean {
  return translationCache.has(languageCode);
}

/**
 * Get all available translation keys for a namespace
 */
export function getNamespaceKeys(namespace: string): string[] {
  const keys: string[] = [];
  const langMap = translationCache.get(currentLanguage) || translationCache.get("en");
  
  if (langMap) {
    langMap.forEach((_, key) => {
      if (key.startsWith(`${namespace}.`)) {
        keys.push(key);
      }
    });
  }
  
  return keys;
}

// Initialize with English on load
initI18n("en");
