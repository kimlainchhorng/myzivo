/** Global expansion stub */
export function useGlobalExpansion() {
  return { countries: [], isLoading: false };
}
export function useSupportedLanguages(_enabled?: boolean) {
  return {
    data: [
      { code: "en", name: "English", native_name: "English", flag_emoji: "🇺🇸", is_active: true },
    ],
    isLoading: false,
  };
}
