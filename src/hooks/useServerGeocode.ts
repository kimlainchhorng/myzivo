/**
 * useServerGeocode Hook
 * 
 * Server-side address autocomplete using Google Places API via edge function.
 * Replaces client-side useGoogleMapsGeocode for better security.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { getAutocompleteSuggestions, getPlaceDetails, PlaceSuggestion, PlaceDetails } from "@/services/mapsApi";

// Fallback mock suggestions for offline/demo mode
const MOCK_SUGGESTIONS: PlaceSuggestion[] = [
  { description: "109 Hickory Street, Denham Springs, LA", place_id: "mock-1", main_text: "109 Hickory Street" },
  { description: "875 Florida Blvd, Baton Rouge, LA", place_id: "mock-2", main_text: "875 Florida Blvd" },
  { description: "6401 Bluebonnet Blvd, Baton Rouge, LA", place_id: "mock-3", main_text: "6401 Bluebonnet Blvd" },
  { description: "660 Arlington Creek Centre, Baton Rouge, LA", place_id: "mock-4", main_text: "660 Arlington Creek Centre" },
  { description: "1 Airport Rd, Baton Rouge, LA", place_id: "mock-5", main_text: "Baton Rouge Airport" },
  { description: "3900 N I-10 Service Rd, Metairie, LA", place_id: "mock-6", main_text: "3900 N I-10 Service Rd" },
];

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
      // Return Baton Rouge area coordinates for mock places
      const mockCoords: Record<string, { lat: number; lng: number }> = {
        "mock-1": { lat: 30.4515, lng: -91.1871 },
        "mock-2": { lat: 30.4568, lng: -91.1421 },
        "mock-3": { lat: 30.3987, lng: -91.0873 },
        "mock-4": { lat: 30.3654, lng: -91.0567 },
        "mock-5": { lat: 30.5339, lng: -91.1490 },
        "mock-6": { lat: 30.0087, lng: -90.1632 },
      };
      
      const coords = mockCoords[placeId] || { lat: 30.4515, lng: -91.1871 };
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
