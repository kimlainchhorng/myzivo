/** Global expansion — US + Cambodia */
import { COUNTRIES } from "@/config/internationalExpansion";

export function useGlobalExpansion() {
  return { countries: COUNTRIES, isLoading: false };
}

export function useSupportedLanguages(_enabled?: boolean) {
  return {
    data: [
      { code: "en", name: "English", native_name: "English", flag_emoji: "🇺🇸", is_active: true },
      { code: "ar", name: "Arabic", native_name: "العربية", flag_emoji: "🇸🇦", is_active: true },
      { code: "bg", name: "Bulgarian", native_name: "Български", flag_emoji: "🇧🇬", is_active: true },
      { code: "ca", name: "Catalan", native_name: "Català", flag_emoji: "🇪🇸", is_active: true },
      { code: "zh", name: "Chinese (Simplified)", native_name: "简体中文", flag_emoji: "🇨🇳", is_active: true },
      { code: "kw", name: "Cornish", native_name: "Kernewek", flag_emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", is_active: true },
      { code: "hr", name: "Croatian", native_name: "Hrvatski", flag_emoji: "🇭🇷", is_active: true },
      { code: "cs", name: "Czech", native_name: "Čeština", flag_emoji: "🇨🇿", is_active: true },
      { code: "da", name: "Danish", native_name: "Dansk", flag_emoji: "🇩🇰", is_active: true },
      { code: "nl", name: "Dutch", native_name: "Nederlands", flag_emoji: "🇳🇱", is_active: true },
      { code: "fi", name: "Finnish", native_name: "Suomi", flag_emoji: "🇫🇮", is_active: true },
      { code: "fr", name: "French", native_name: "Français", flag_emoji: "🇫🇷", is_active: true },
      { code: "de", name: "German", native_name: "Deutsch", flag_emoji: "🇩🇪", is_active: true },
      { code: "el", name: "Greek", native_name: "Ελληνικά", flag_emoji: "🇬🇷", is_active: true },
      { code: "he", name: "Hebrew", native_name: "עברית", flag_emoji: "🇮🇱", is_active: true },
      { code: "hu", name: "Hungarian", native_name: "Magyar", flag_emoji: "🇭🇺", is_active: true },
      { code: "is", name: "Icelandic", native_name: "Íslenska", flag_emoji: "🇮🇸", is_active: true },
      { code: "id", name: "Indonesian", native_name: "Bahasa Indonesia", flag_emoji: "🇮🇩", is_active: true },
      { code: "it", name: "Italian", native_name: "Italiano", flag_emoji: "🇮🇹", is_active: true },
      { code: "ja", name: "Japanese", native_name: "日本語", flag_emoji: "🇯🇵", is_active: true },
      { code: "km", name: "Khmer", native_name: "ភាសាខ្មែរ", flag_emoji: "🇰🇭", is_active: true },
      { code: "ko", name: "Korean", native_name: "한국어", flag_emoji: "🇰🇷", is_active: true },
      { code: "lt", name: "Lithuanian", native_name: "Lietuvių", flag_emoji: "🇱🇹", is_active: true },
      { code: "no", name: "Norwegian", native_name: "Norsk", flag_emoji: "🇳🇴", is_active: true },
      { code: "om", name: "Oromo", native_name: "Afaan Oromoo", flag_emoji: "🇪🇹", is_active: true },
      { code: "pl", name: "Polish", native_name: "Polski", flag_emoji: "🇵🇱", is_active: true },
      { code: "ro", name: "Romanian", native_name: "Română", flag_emoji: "🇷🇴", is_active: true },
      { code: "ru", name: "Russian", native_name: "Русский", flag_emoji: "🇷🇺", is_active: true },
      { code: "sr", name: "Serbian", native_name: "Српски", flag_emoji: "🇷🇸", is_active: true },
      { code: "sk", name: "Slovak", native_name: "Slovenčina", flag_emoji: "🇸🇰", is_active: true },
      { code: "es", name: "Spanish", native_name: "Español", flag_emoji: "🇪🇸", is_active: true },
      { code: "sv", name: "Swedish", native_name: "Svenska", flag_emoji: "🇸🇪", is_active: true },
      { code: "th", name: "Thai", native_name: "ไทย", flag_emoji: "🇹🇭", is_active: true },
      { code: "tr", name: "Turkish", native_name: "Türkçe", flag_emoji: "🇹🇷", is_active: true },
      { code: "uk", name: "Ukrainian", native_name: "Українська", flag_emoji: "🇺🇦", is_active: true },
      { code: "vi", name: "Vietnamese", native_name: "Tiếng Việt", flag_emoji: "🇻🇳", is_active: true },
    ],
    isLoading: false,
  };
}
