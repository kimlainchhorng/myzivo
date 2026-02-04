/**
 * GEO-DETECTION HOOK
 * 
 * Detects user location for localized experience
 * Preselects departure country, airports, and currency
 */

import { useState, useEffect, useCallback } from "react";
import { 
  COUNTRIES, 
  getCountryByCode, 
  type GeoDetectionResult,
  type CountryConfig 
} from "@/config/internationalExpansion";
import { DEFAULT_CURRENCY } from "@/config/currencies";

const GEO_STORAGE_KEY = "zivo_geo_detection";
const GEO_OVERRIDE_KEY = "zivo_geo_override";

interface StoredGeoData {
  result: GeoDetectionResult;
  detectedAt: number;
}

interface UseGeoDetectionReturn {
  /** Detected or overridden geo data */
  geo: GeoDetectionResult | null;
  /** Whether detection is in progress */
  isLoading: boolean;
  /** Whether user has manually overridden */
  isOverridden: boolean;
  /** Country config for detected country */
  country: CountryConfig | undefined;
  /** Manually set country */
  setCountry: (code: string) => void;
  /** Reset to detected location */
  resetToDetected: () => void;
}

const DEFAULT_GEO: GeoDetectionResult = {
  countryCode: "US",
  currency: "USD",
  language: "en",
  timezone: "America/New_York",
  nearestAirport: "JFK",
};

/**
 * Detect country from browser timezone
 */
function detectFromTimezone(): string | null {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Map timezones to country codes
    const timezoneMap: Record<string, string> = {
      "America/New_York": "US",
      "America/Los_Angeles": "US",
      "America/Chicago": "US",
      "America/Denver": "US",
      "America/Toronto": "CA",
      "America/Vancouver": "CA",
      "Europe/London": "GB",
      "Europe/Berlin": "DE",
      "Europe/Paris": "FR",
      "Europe/Madrid": "ES",
      "Europe/Rome": "IT",
      "Europe/Amsterdam": "NL",
      "Australia/Sydney": "AU",
      "Australia/Melbourne": "AU",
      "Asia/Tokyo": "JP",
      "Asia/Singapore": "SG",
      "Asia/Seoul": "KR",
    };
    
    // Check exact match first
    if (timezoneMap[timezone]) {
      return timezoneMap[timezone];
    }
    
    // Check prefix match
    if (timezone.startsWith("America/")) return "US";
    if (timezone.startsWith("Europe/")) return "GB";
    if (timezone.startsWith("Australia/")) return "AU";
    if (timezone.startsWith("Asia/Tokyo")) return "JP";
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Detect country from browser language
 */
function detectFromLanguage(): string | null {
  try {
    const lang = navigator.language || "en-US";
    const parts = lang.split("-");
    
    if (parts.length >= 2) {
      const region = parts[parts.length - 1].toUpperCase();
      // Verify it's a valid country code
      if (getCountryByCode(region)) {
        return region;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Build geo result from country code
 */
function buildGeoResult(countryCode: string): GeoDetectionResult {
  const country = getCountryByCode(countryCode);
  
  if (!country) {
    return DEFAULT_GEO;
  }
  
  return {
    countryCode: country.code,
    currency: country.currency,
    language: country.language,
    timezone: country.timezone,
    nearestAirport: country.primaryAirport,
  };
}

export function useGeoDetection(): UseGeoDetectionReturn {
  const [geo, setGeo] = useState<GeoDetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOverridden, setIsOverridden] = useState(false);
  
  // Load cached or detect on mount
  useEffect(() => {
    const detect = async () => {
      setIsLoading(true);
      
      try {
        // 1. Check for manual override
        const overrideCode = localStorage.getItem(GEO_OVERRIDE_KEY);
        if (overrideCode) {
          const result = buildGeoResult(overrideCode);
          setGeo(result);
          setIsOverridden(true);
          setIsLoading(false);
          return;
        }
        
        // 2. Check cached detection
        const cached = localStorage.getItem(GEO_STORAGE_KEY);
        if (cached) {
          try {
            const parsed: StoredGeoData = JSON.parse(cached);
            // Cache valid for 24 hours
            if (Date.now() - parsed.detectedAt < 24 * 60 * 60 * 1000) {
              setGeo(parsed.result);
              setIsLoading(false);
              return;
            }
          } catch {
            // Invalid cache, continue to detection
          }
        }
        
        // 3. Detect from timezone
        let detectedCode = detectFromTimezone();
        
        // 4. Fall back to language detection
        if (!detectedCode) {
          detectedCode = detectFromLanguage();
        }
        
        // 5. Default to US
        const finalCode = detectedCode || "US";
        const result = buildGeoResult(finalCode);
        
        // Cache the result
        const cacheData: StoredGeoData = {
          result,
          detectedAt: Date.now(),
        };
        localStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(cacheData));
        
        setGeo(result);
      } catch {
        // Fallback on any error
        setGeo(DEFAULT_GEO);
      } finally {
        setIsLoading(false);
      }
    };
    
    detect();
  }, []);
  
  // Manual country override
  const setCountry = useCallback((code: string) => {
    const result = buildGeoResult(code);
    setGeo(result);
    setIsOverridden(true);
    localStorage.setItem(GEO_OVERRIDE_KEY, code);
  }, []);
  
  // Reset to detected
  const resetToDetected = useCallback(() => {
    localStorage.removeItem(GEO_OVERRIDE_KEY);
    setIsOverridden(false);
    
    // Re-detect
    const cached = localStorage.getItem(GEO_STORAGE_KEY);
    if (cached) {
      try {
        const parsed: StoredGeoData = JSON.parse(cached);
        setGeo(parsed.result);
        return;
      } catch {
        // Fall through to default
      }
    }
    
    setGeo(DEFAULT_GEO);
  }, []);
  
  const country = geo ? getCountryByCode(geo.countryCode) : undefined;
  
  return {
    geo,
    isLoading,
    isOverridden,
    country,
    setCountry,
    resetToDetected,
  };
}

/**
 * Simple hook for just getting the detected country
 */
export function useDetectedCountry(): CountryConfig | undefined {
  const { country } = useGeoDetection();
  return country;
}
