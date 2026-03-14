/** i18n with persistent language state */
import { useState, useCallback, useSyncExternalStore } from "react";

/* ── Shared reactive store so all components see the same language ── */
let _lang = localStorage.getItem("zivo_lang") || "en";
const _listeners = new Set<() => void>();

function setGlobalLang(code: string) {
  _lang = code;
  localStorage.setItem("zivo_lang", code);
  _listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  _listeners.add(cb);
  return () => { _listeners.delete(cb); };
}

function getSnapshot() { return _lang; }

/* ── Translation maps ── */
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    "flights.roundtrip": "Round Trip",
    "flights.oneway": "One Way",
    "flights.from": "From",
    "flights.to": "To",
    "flights.departure": "Departure",
    "flights.return": "Return",
    "flights.passengers": "Passengers",
    "flights.class": "Cabin Class",
    "flights.search_title": "Search Flights",
    "ride.where_to": "Where to?",
    "ride.add_stop": "Add Stop",
    "ride.pick_up_other": "Pick up other",
    "ride.choose_ride": "Choose a ride",
    "ride.confirm": "Confirm",
    "ride.pickup": "Pickup",
    "ride.destination": "Destination",
    "ride.trip_time": "Trip time",
    "ride.distance": "Distance",
    "ride.traffic": "Traffic",
    "ride.restaurants": "RESTAURANTS",
    "ride.nearby": "nearby",
    "ride.book": "Book",
    "ride.reserve": "Reserve",
    "ride.map": "Map",
    "ride.history": "History",
    "ride.searching": "Searching for driver...",
    "ride.cancel": "Cancel",
    "ride.fare_breakdown": "Fare Breakdown",
    "ride.base_fare": "Base fare",
    "ride.booking_fee": "Booking fee",
    "ride.total": "Total",
    "ride.light": "Light",
    "ride.moderate": "Moderate",
    "ride.heavy": "Heavy",
    // Auth
    "auth.welcome_back": "Welcome back, Traveler",
    "auth.get_started": "Get Started Free — No credit card needed",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirm_password": "Confirm Password",
    "auth.full_name": "Full Name",
    "auth.forgot": "Forgot?",
    "auth.sign_in": "Sign In",
    "auth.create_account": "Create Account",
    "auth.or_continue": "Or continue with",
    "auth.encrypted": "256-bit encrypted",
    "auth.no_spam": "No spam, ever",
    "auth.no_account": "Don't have an account?",
    "auth.have_account": "Already have an account?",
    "auth.sign_up": "Sign Up",
    "auth.log_in": "Log In",
    "auth.protected": "Protected by enterprise-grade security",
    "auth.terms_agree": "By signing up, you agree to our Terms of Service",
    "auth.go_home": "Go to Home",
  },
  km: {
    "flights.roundtrip": "ទៅមក",
    "flights.oneway": "ទៅមួយផ្លូវ",
    "flights.from": "ចេញពី",
    "flights.to": "ទៅកាន់",
    "flights.departure": "ថ្ងៃចេញ",
    "flights.return": "ថ្ងៃត្រឡប់",
    "flights.passengers": "អ្នកដំណើរ",
    "flights.class": "ថ្នាក់កៅអី",
    "flights.search_title": "ស្វែងរកជើងហោះហើរ",
    "ride.where_to": "ទៅណា?",
    "ride.add_stop": "បន្ថែមចំណត",
    "ride.pick_up_other": "ជូនអ្នកផ្សេង",
    "ride.choose_ride": "ជ្រើសរើសការធ្វើដំណើរ",
    "ride.confirm": "បញ្ជាក់",
    "ride.pickup": "ទីតាំងឡើង",
    "ride.destination": "គោលដៅ",
    "ride.trip_time": "រយៈពេលធ្វើដំណើរ",
    "ride.distance": "ចម្ងាយ",
    "ride.traffic": "ស្ថានភាពចរាចរ",
    "ride.restaurants": "ភោជនីយដ្ឋាន",
    "ride.nearby": "នៅជិត",
    "ride.book": "កក់",
    "ride.reserve": "កក់ទុក",
    "ride.map": "ផែនទី",
    "ride.history": "ប្រវត្តិ",
    "ride.searching": "កំពុងស្វែងរកអ្នកបើកបរ...",
    "ride.cancel": "បោះបង់",
    "ride.fare_breakdown": "ព័ត៌មានតម្លៃ",
    "ride.base_fare": "តម្លៃមូលដ្ឋាន",
    "ride.booking_fee": "ថ្លៃកក់",
    "ride.total": "សរុប",
    "ride.light": "ស្រាល",
    "ride.moderate": "មធ្យម",
    "ride.heavy": "កកស្ទះ",
    // Auth
    "auth.welcome_back": "សូមស្វាគមន៍មកវិញ អ្នកធ្វើដំណើរ",
    "auth.get_started": "ចាប់ផ្តើមឥតគិតថ្លៃ — មិនត្រូវការកាត",
    "auth.email": "អ៊ីមែល",
    "auth.password": "ពាក្យសម្ងាត់",
    "auth.confirm_password": "បញ្ជាក់ពាក្យសម្ងាត់",
    "auth.full_name": "ឈ្មោះពេញ",
    "auth.forgot": "ភ្លេច?",
    "auth.sign_in": "ចូល",
    "auth.create_account": "បង្កើតគណនី",
    "auth.or_continue": "ឬបន្តជាមួយ",
    "auth.encrypted": "អ៊ិនគ្រីប 256-bit",
    "auth.no_spam": "គ្មានសារឥតប្រយោជន៍",
    "auth.no_account": "មិនមានគណនីមែនទេ?",
    "auth.have_account": "មានគណនីរួចហើយ?",
    "auth.sign_up": "ចុះឈ្មោះ",
    "auth.log_in": "ចូល",
    "auth.protected": "ការពារដោយសុវត្ថិភាពកម្រិតខ្ពស់",
    "auth.terms_agree": "ដោយចុះឈ្មោះ អ្នកយល់ព្រមលក្ខខណ្ឌប្រើប្រាស់",
    "auth.go_home": "ទៅទំព័រដើម",
  },
};

/* ── Hooks ── */
export function useTranslation(_ns?: string) {
  const locale = useSyncExternalStore(subscribe, getSnapshot);
  const t = useCallback(
    (key: string) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS.en?.[key] || key,
    [locale]
  );
  return { t, locale };
}

export function useI18n() {
  const locale = useSyncExternalStore(subscribe, getSnapshot);
  const t = useCallback(
    (key: string) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS.en?.[key] || key,
    [locale]
  );
  return {
    locale,
    currentLanguage: locale,
    setLocale: setGlobalLang,
    changeLanguage: setGlobalLang,
    t,
  };
}
