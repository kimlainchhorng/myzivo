import { useState, useCallback } from "react";
import { reverseGeocode as mapsReverseGeocode } from "@/services/mapsApi";

export type CurrentLocation = {
  lat: number;
  lng: number;
  accuracy: number;
};

export const useCurrentLocation = () => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback((): Promise<CurrentLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = "Geolocation is not supported by your browser";
        setError(error);
        reject(new Error(error));
        return;
      }

      setIsGettingLocation(true);
      setError(null);

      // Try fast location first (cached/low accuracy), then high accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsGettingLocation(false);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (err) => {
          setIsGettingLocation(false);
          let errorMessage = "Failed to get location";
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = "Location permission denied";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Location unavailable";
              break;
            case err.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          
          setError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: false, // Faster - use network/cached location
          timeout: 5000, // Reduced timeout for faster response
          maximumAge: 300000, // Accept cached location up to 5 minutes old
        }
      );
    });
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    return mapsReverseGeocode(lat, lng);
  }, []);

  return {
    getCurrentLocation,
    reverseGeocode,
    isGettingLocation,
    error,
  };
};
