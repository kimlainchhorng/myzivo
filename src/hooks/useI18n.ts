/** i18n with persistent language state — translations lazy-loaded */
import { useCallback, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  applyLanguageToDocument,
  cacheLanguage,
  rememberLanguageChoice,
  resolveInitialLanguage,
  syncAccountLanguage,
} from "@/lib/i18n/languagePreference";

/* ── Available languages ── */
export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "th", label: "ไทย", flag: "🇹🇭" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ms", label: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "fil", label: "Filipino", flag: "🇵🇭" },
  { code: "uk", label: "Українська", flag: "🇺🇦" },
  { code: "he", label: "עברית", flag: "🇮🇱" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
  { code: "am", label: "አማርኛ", flag: "🇪🇹" },
  { code: "km", label: "ភាសាខ្មែរ", flag: "🇰🇭" },
];

/** Every code the app can render; a stored or linked choice may be any of them. */
const SUPPORTED_CODES = LANGUAGES.map((language) => language.code);

/* ── Shared reactive store so all components see the same language ── */
function readInitialLanguage() {
  const query = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("lang");
  return resolveInitialLanguage({ query, supported: SUPPORTED_CODES });
}
const _initial = readInitialLanguage();
let _lang = _initial.code;
// Cache, but do not mark as chosen: writing the storage key on boot is what made
// the very first visit look like a decision and kept the browser locale from
// ever being consulted again.
cacheLanguage(_lang);
const _listeners = new Set<() => void>();

function setGlobalLang(code: string) {
  _lang = code;
  ensureLocaleLoaded(code);
  // Selecting a language is a decision; from here on the browser locale is not
  // consulted, so choosing English on a Khmer phone sticks.
  rememberLanguageChoice(code);
  applyLanguageToDocument(code);
  window.dispatchEvent(new CustomEvent("zivo-lang-change", { detail: code }));
  window.dispatchEvent(new CustomEvent("zivo:lang-change", { detail: code }));
  void supabase.auth.getUser().then(({ data }) => {
    const userId = data.user?.id;
    if (userId) void supabase.from("profiles").update({ preferred_language: code }).eq("user_id", userId);
  }).catch(() => undefined);
  _listeners.forEach((l) => l());
}

applyLanguageToDocument(_lang);

function subscribe(cb: () => void) {
  _listeners.add(cb);
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<string>).detail;
    // The public hub dispatches this too, so a switch made there lands here
    // without a reload.
    _lang = typeof detail === "string" ? detail : readInitialLanguage().code;
    applyLanguageToDocument(_lang);
    cb();
  };
  window.addEventListener("zivo-lang-change", handler);
  return () => {
    _listeners.delete(cb);
    window.removeEventListener("zivo-lang-change", handler);
  };
}

function getSnapshot() { return _lang; }

/* ── Translations ──────────────────────────────────────────────────
 * en (the fallback every lookup ends at) and km (the primary market) are
 * bundled, so t() stays synchronous and neither audience ever sees a flash.
 * The other 35 locales were ~150 KB of the entry graph that almost nobody
 * used; they are fetched the first time someone actually selects one.
 */
import coreTranslations from "@/i18n/translations.core";

const _translations: Record<string, Record<string, string>> = { ...coreTranslations };

let _extraLoaded = false;
let _extraLoading: Promise<void> | null = null;

function ensureLocaleLoaded(code: string) {
  if (_extraLoaded || _translations[code] || typeof window === "undefined") return;
  if (!_extraLoading) {
    _extraLoading = import("@/i18n/translations.extra")
      .then((mod) => {
        Object.assign(_translations, mod.default);
        _extraLoaded = true;
        // Re-render subscribers now that the strings exist; until this
        // resolves they render English rather than raw keys.
        _listeners.forEach((l) => l());
      })
      .catch(() => {
        // Stay on the English fallback rather than breaking the screen.
        _extraLoading = null;
      });
  }
}

// A returning user whose stored language is not bundled needs it immediately.
ensureLocaleLoaded(_lang);

// The account preference is what makes the choice follow the person to a new
// device instead of living in one browser's storage. It must not override a
// `?lang=` link or a selection already made in this session, which is what the
// resolved source is for.
if (typeof window !== "undefined") {
  void syncAccountLanguage({
    current: _lang,
    source: _initial.source,
    supported: SUPPORTED_CODES,
    load: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user?.id) return null;
      const { data: profile } = await supabase.from("profiles").select("preferred_language").eq("user_id", data.user.id).maybeSingle();
      return profile?.preferred_language ?? null;
    },
    apply: setGlobalLang,
  });
}


export function useI18n() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  // Accepts an optional fallback string to render when the key is missing
  // from both the active locale and English. Without this, `t("foo") || "Bar"`
  // never falls back because the key string itself is truthy.
  const t = useCallback(
    (key: string, fallback?: string) =>
      _translations?.[locale]?.[key] ?? _translations?.en?.[key] ?? fallback ?? key,
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

/** Alias for compatibility — namespace param is ignored (flat key lookup) */
export function useTranslation(_ns?: string) {
  return useI18n();
}
