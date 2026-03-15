/** Global expansion — US + Cambodia */
import { COUNTRIES } from "@/config/internationalExpansion";

export function useGlobalExpansion() {
  return { countries: COUNTRIES, isLoading: false };
}
export function useSupportedLanguages(_enabled?: boolean) {
  return {
    data: [
      { code: "en", name: "English", native_name: "English", flag_emoji: "US", is_active: true },
      { code: "km", name: "Khmer", native_name: "ភាសាខ្មែរ", flag_emoji: "KH", is_active: true },
    ],
    isLoading: false,
  };
}
