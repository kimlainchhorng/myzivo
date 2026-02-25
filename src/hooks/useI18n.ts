/** i18n stub */
export function useTranslation(_ns?: string) {
  return {
    t: (key: string) => {
      const map: Record<string, string> = {
        "flights.roundtrip": "Round Trip",
        "flights.oneway": "One Way",
        "flights.from": "From",
        "flights.to": "To",
        "flights.departure": "Departure",
        "flights.return": "Return",
      };
      return map[key] || key;
    },
    locale: "en",
  };
}

export function useI18n() {
  return {
    locale: "en",
    currentLanguage: "en",
    setLocale: (_locale: string) => {},
    changeLanguage: (_lang: string) => {},
    t: (key: string) => key,
  };
}
