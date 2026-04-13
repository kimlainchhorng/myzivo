/** i18n with persistent language state — translations lazy-loaded */
import { useCallback, useSyncExternalStore } from "react";

/* ── Shared reactive store so all components see the same language ── */
let _lang = localStorage.getItem("zivo_lang") || "en";
const _listeners = new Set<() => void>();

function setGlobalLang(code: string) {
  _lang = code;
  localStorage.setItem("zivo_lang", code);
  document.documentElement.setAttribute("lang", code);
  _listeners.forEach((l) => l());
}

// Set initial lang attribute
document.documentElement.setAttribute("lang", _lang);

function subscribe(cb: () => void) {
  _listeners.add(cb);
  const handler = () => {
    _lang = localStorage.getItem("zivo_lang") || "en";
    cb();
  };
  window.addEventListener("zivo-lang-change", handler);
  return () => {
    _listeners.delete(cb);
    window.removeEventListener("zivo-lang-change", handler);
  };
}

function getSnapshot() { return _lang; }

/* ── Lazy-loaded translations (separate chunk) ── */
let _translations: Record<string, Record<string, string>> | null = null;
let _loadPromise: Promise<void> | null = null;

function ensureTranslations() {
  if (_translations) return;
  if (!_loadPromise) {
    _loadPromise = import("@/i18n/translations").then((mod) => {
      _translations = mod.default;
      // Trigger re-render for any subscribed components
      _listeners.forEach((l) => l());
    });
  }
}

// Start loading immediately but don't block
ensureTranslations();

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
];

export function useI18n() {
  const locale = useSyncExternalStore(subscribe, getSnapshot);
  const t = useCallback(
    (key: string) => _translations?.[locale]?.[key] || _translations?.en?.[key] || key,
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
