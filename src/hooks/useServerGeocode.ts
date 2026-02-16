/**
 * useServerGeocode Hook
 * 
 * Server-side address autocomplete using Google Places API via edge function.
 * Replaces client-side useGoogleMapsGeocode for better security.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { getAutocompleteSuggestions, getPlaceDetails, PlaceSuggestion, PlaceDetails } from "@/services/mapsApi";

import { MOCK_PLACE_SUGGESTIONS, MOCK_COORDS } from "@/data/mockLocations";

const MOCK_SUGGESTIONS: PlaceSuggestion[] = MOCK_PLACE_SUGGESTIONS;

export interface ServerSuggestion extends PlaceSuggestion {
  coords?: { lat: number; lng: number };
}

interface UseServerGeocodeReturn {
  suggestions: ServerSuggestion[];
  isLoading: boolean;
  error: string | null;
  fetchSuggestions: (query: string, proximity?: { lat: number; lng: number }) => void;
  getCoordinates: (placeId: string) => Promise<PlaceDetails | null>;
  clearSuggestions: () => void;
}

export function useServerGeocode(): UseServerGeocodeReturn {
  const [suggestions, setSuggestions] = useState<ServerSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortRef.current) {
        abortRef.current.abort();
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

    // Abort previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    // Show mock suggestions for very short queries
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions(MOCK_SUGGESTIONS.slice(0, 6));
      return;
    }

    // Debounce API calls (300ms)
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      abortRef.current = new AbortController();

      try {
        const results = await getAutocompleteSuggestions(query, proximity);
        
        if (results.length > 0) {
          setSuggestions(results);
        } else {
          // Fall back to filtered mock suggestions
          const filtered = MOCK_SUGGESTIONS.filter(s =>
            s.description.toLowerCase().includes(query.toLowerCase())
          );
          setSuggestions(filtered.length > 0 ? filtered : []);
        }
      } catch (e) {
        console.error("[useServerGeocode] Error:", e);
        setError("Failed to fetch suggestions");
        
        // Fall back to mock suggestions on error
        const filtered = MOCK_SUGGESTIONS.filter(s =>
          s.description.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filtered);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  const getCoordinates = useCallback(async (placeId: string): Promise<PlaceDetails | null> => {
    // Handle mock place IDs
    if (placeId.startsWith("mock-")) {
      const coords = MOCK_COORDS[placeId] || { lat: 40.7484, lng: -73.9857 };
      const suggestion = MOCK_SUGGESTIONS.find(s => s.place_id === placeId);
      
      return {
        address: suggestion?.description || "Baton Rouge, LA",
        name: suggestion?.main_text || "Location",
        ...coords,
      };
    }

    return await getPlaceDetails(placeId);
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
    getCoordinates,
    clearSuggestions,
  };
}
