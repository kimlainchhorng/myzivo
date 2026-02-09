/**
 * Preferences Sync Component
 * Renders nothing — just syncs DB-stored preferences to CurrencyContext and i18n on login
 */

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useI18n } from "@/hooks/useI18n";
import { usePersonalizationSettings } from "@/hooks/usePersonalizationSettings";

export function PreferencesSync() {
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { currentLanguage, changeLanguage } = useI18n();
  const { settings, isLoading } = usePersonalizationSettings();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!user) {
      hasSynced.current = false;
      return;
    }

    if (hasSynced.current || isLoading) return;

    const prefCurrency = settings.preferred_currency;
    const prefLanguage = settings.preferred_language;

    if (prefCurrency && prefCurrency !== currency) {
      setCurrency(prefCurrency);
    }

    if (prefLanguage && prefLanguage !== currentLanguage) {
      changeLanguage(prefLanguage);
    }

    hasSynced.current = true;
  }, [user, isLoading, settings, currency, setCurrency, currentLanguage, changeLanguage]);

  return null;
}

export default PreferencesSync;
