/**
 * ZIVO i18n React Hook
 * React integration for the i18n framework
 */

import { useState, useEffect, useCallback } from "react";
import { t, initI18n, getCurrentLanguage, setLanguage } from "@/lib/i18n";
import { useSupportedLanguages } from "@/hooks/useGlobalExpansion";

export function useI18n() {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [isReady, setIsReady] = useState(false);
  const { data: languages } = useSupportedLanguages(true);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      await initI18n(currentLang);
      setIsReady(true);
    };
    init();
  }, []);

  // Change language
  const changeLanguage = useCallback(async (langCode: string) => {
    await setLanguage(langCode);
    setCurrentLang(langCode);
  }, []);

  // Get translation
  const translate = useCallback(
    (key: string, variables?: Record<string, string | number>) => {
      return t(key, variables);
    },
    [currentLang] // Re-render when language changes
  );

  // Get current language info
  const currentLanguage = languages?.find((l) => l.code === currentLang);

  return {
    t: translate,
    currentLanguage: currentLang,
    currentLanguageInfo: currentLanguage,
    changeLanguage,
    isReady,
    availableLanguages: languages || [],
    isRTL: currentLanguage?.direction === "rtl",
  };
}

/**
 * Hook for component-level translations with namespace
 */
export function useTranslation(namespace: string = "common") {
  const { t: globalT, ...rest } = useI18n();

  const t = useCallback(
    (key: string, variables?: Record<string, string | number>) => {
      // Try namespaced key first, then global
      const namespacedKey = `${namespace}.${key}`;
      const result = globalT(namespacedKey, variables);
      
      // If namespaced key wasn't found (returns itself), try without namespace
      if (result === namespacedKey) {
        return globalT(key, variables);
      }
      return result;
    },
    [globalT, namespace]
  );

  return { t, ...rest };
}
