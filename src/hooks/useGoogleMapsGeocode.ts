/**
 * useGoogleMapsGeocode Hook
 * 
 * Provides address autocomplete suggestions using Google Places API
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { getAddressSuggestions, hasGoogleMapsKey } from "@/services/googleMaps";

// Louisiana mock address suggestions as fallback
const MOCK_SUGGESTIONS = [
  "109 Hickory Street, Denham Springs, LA",
  "875 Florida Blvd, Baton Rouge, LA",
  "6401 Bluebonnet Blvd, Baton Rouge, LA",
  "660 Arlington Creek Centre, Baton Rouge, LA",
  "1 Airport Rd, Baton Rouge, LA",
  "3900 N I-10 Service Rd, Metairie, LA",
  "10000 Perkins Rowe, Baton Rouge, LA",
  "2142 O'Neal Lane, Baton Rouge, LA",
  "7707 Bluebonnet Blvd, Baton Rouge, LA",
  "3535 S Sherwood Forest Blvd, Baton Rouge, LA",
];

export interface Suggestion {
  id: string;
  placeName: string;
  text: string;
  coords?: { lat: number; lng: number };
}

interface UseGoogleMapsGeocodeReturn {
  suggestions: Suggestion[];
  isLoading: boolean;
  fetchSuggestions: (query: string, proximity?: { lat: number; lng: number }) => void;
  clearSuggestions: () => void;
  hasRealGeocode: boolean;
}

export function useGoogleMapsGeocode(): UseGoogleMapsGeocodeReturn {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasToken = hasGoogleMapsKey();

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const fetchSuggestions = useCallback((
    query: string,
    proximity?: { lat: number; lng: number }
  ) => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // If no token, use mock suggestions
    if (!hasToken) {
      if (!query.trim()) {
        setSuggestions(
          MOCK_SUGGESTIONS.slice(0, 6).map((s, i) => ({
            id: `mock-${i}`,
            placeName: s,
            text: s.split(",")[0],
          }))
        );
        return;
      }
      
      const filtered = MOCK_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);
      
      setSuggestions(
        filtered.map((s, i) => ({
          id: `mock-${i}`,
          placeName: s,
          text: s.split(",")[0],
        }))
      );
      return;
    }

    // Debounce API calls
    debounceRef.current = setTimeout(async () => {
      if (!query.trim() || query.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);

      try {
        const results = await getAddressSuggestions(query, proximity);
        
        setSuggestions(
          results.map((r) => ({
            id: r.id,
            placeName: r.placeName,
            text: r.text,
            coords: r.center[0] !== 0 
              ? { lat: r.center[1], lng: r.center[0] } 
              : undefined,
          }))
        );
      } catch (error) {
        console.error("Autocomplete error:", error);
        // Fall back to mock suggestions
        const filtered = MOCK_SUGGESTIONS.filter((s) =>
          s.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6);
        
        setSuggestions(
          filtered.map((s, i) => ({
            id: `fallback-${i}`,
            placeName: s,
            text: s.split(",")[0],
          }))
        );
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce
  }, [hasToken]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    isLoading,
    fetchSuggestions,
    clearSuggestions,
    hasRealGeocode: hasToken,
  };
}
