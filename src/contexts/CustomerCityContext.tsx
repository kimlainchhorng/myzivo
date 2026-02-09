/**
 * Customer City Context
 * Manages selected city for filtering restaurants and pricing
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
const STORAGE_KEY = "zivo-customer-city";

export interface CustomerCity {
  id: string;
  name: string;
  zoneCode: string;
}

interface CustomerCityContextType {
  selectedCity: CustomerCity | null;
  cities: CustomerCity[];
  isLoading: boolean;
  isDetecting: boolean;
  showCityModal: boolean;
  setCity: (city: CustomerCity) => void;
  clearCity: () => void;
  detectCity: () => Promise<void>;
  openCityModal: () => void;
  closeCityModal: () => void;
}

const CustomerCityContext = createContext<CustomerCityContextType | undefined>(undefined);

export function CustomerCityProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCity] = useState<CustomerCity | null>(null);
  const [cities, setCities] = useState<CustomerCity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  
  const { getCurrentLocation, reverseGeocode } = useCurrentLocation();

  // Fetch available cities from eats_zones
  useEffect(() => {
    async function fetchCities() {
      try {
        const { data, error } = await supabase
          .from("eats_zones")
          .select("id, city_name, zone_code")
          .eq("is_active", true)
          .neq("zone_code", "DEFAULT")
          .order("city_name");

        if (error) throw error;

        const cityList = data?.map(z => ({
          id: z.id,
          name: z.city_name,
          zoneCode: z.zone_code,
        })) || [];

        setCities(cityList);
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    }

    fetchCities();
  }, []);

  // Load saved city from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CustomerCity;
        setSelectedCity(parsed);
      }
    } catch (err) {
      console.error("Error loading saved city:", err);
    } finally {
      setHasCheckedStorage(true);
      setIsLoading(false);
    }
  }, []);

  // Check user profile for saved city if logged in and no local selection
  useEffect(() => {
    if (!hasCheckedStorage || selectedCity) return;

    async function checkProfile() {
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session?.session?.user?.id;
        if (!userId) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("selected_city_id, selected_city_name")
          .eq("user_id", userId)
          .single();

        if (profile?.selected_city_id && profile?.selected_city_name && cities.length > 0) {
          const matchedCity = cities.find(c => c.id === profile.selected_city_id);
          if (matchedCity) {
            setSelectedCity(matchedCity);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(matchedCity));
          }
        }
      } catch (err) {
        console.error("Error checking profile city:", err);
      }
    }

    if (cities.length > 0) {
      checkProfile();
    }
  }, [hasCheckedStorage, selectedCity, cities]);

  // Show modal on first visit if no city selected
  useEffect(() => {
    if (hasCheckedStorage && !isLoading && !selectedCity && cities.length > 0) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setShowCityModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasCheckedStorage, isLoading, selectedCity, cities]);

  // Detect city from device location
  const detectCity = useCallback(async () => {
    if (!MAPBOX_TOKEN || cities.length === 0) return;

    setIsDetecting(true);
    try {
      const coords = await getCurrentLocation();
      
      // Use Mapbox to get city name
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?types=place&access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const detectedCityName = data.features[0].text;
        
        // Try to match with our available cities
        const matched = cities.find(c => 
          c.name.toLowerCase() === detectedCityName.toLowerCase() ||
          c.name.toLowerCase().includes(detectedCityName.toLowerCase()) ||
          detectedCityName.toLowerCase().includes(c.name.toLowerCase())
        );

        if (matched) {
          setCity(matched);
        } else {
          // No match - use first city as default
          console.log(`No match for detected city: ${detectedCityName}, using default`);
          if (cities.length > 0) {
            setCity(cities[0]);
          }
        }
      }
    } catch (err) {
      console.error("Error detecting city:", err);
    } finally {
      setIsDetecting(false);
    }
  }, [cities, getCurrentLocation]);

  // Set city and persist
  const setCity = useCallback(async (city: CustomerCity) => {
    setSelectedCity(city);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
    setShowCityModal(false);

    // Also update profile if logged in
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      if (userId) {
        await supabase
          .from("profiles")
          .update({
            selected_city_id: city.id,
            selected_city_name: city.name,
          })
          .eq("user_id", userId);
      }
    } catch (err) {
      console.error("Error saving city to profile:", err);
    }
  }, []);

  // Clear city
  const clearCity = useCallback(() => {
    setSelectedCity(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const openCityModal = useCallback(() => setShowCityModal(true), []);
  const closeCityModal = useCallback(() => setShowCityModal(false), []);

  return (
    <CustomerCityContext.Provider
      value={{
        selectedCity,
        cities,
        isLoading,
        isDetecting,
        showCityModal,
        setCity,
        clearCity,
        detectCity,
        openCityModal,
        closeCityModal,
      }}
    >
      {children}
    </CustomerCityContext.Provider>
  );
}

export function useCustomerCity() {
  const context = useContext(CustomerCityContext);
  if (context === undefined) {
    throw new Error("useCustomerCity must be used within a CustomerCityProvider");
  }
  return context;
}
