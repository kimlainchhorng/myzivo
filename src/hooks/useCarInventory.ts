/**
 * Hook for Car Inventory Search with cascading filters
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  CarMake, 
  CarModel, 
  CarInventoryItem, 
  CarSearchFilters, 
  initialCarSearchFilters 
} from "@/types/carInventory";

export function useCarInventory() {
  // Filter state
  const [filters, setFilters] = useState<CarSearchFilters>(initialCarSearchFilters);
  
  // Data state
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [results, setResults] = useState<CarInventoryItem[]>([]);
  
  // Loading states
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch all makes on mount
  useEffect(() => {
    async function fetchMakes() {
      setLoadingMakes(true);
      const { data, error } = await supabase
        .from("car_makes")
        .select("*")
        .order("name");
      
      if (!error && data) {
        setMakes(data);
      }
      setLoadingMakes(false);
    }
    fetchMakes();
  }, []);

  // Fetch models when make changes
  useEffect(() => {
    async function fetchModels() {
      if (!filters.makeId) {
        setModels([]);
        return;
      }
      
      setLoadingModels(true);
      const { data, error } = await supabase
        .from("car_models")
        .select("*")
        .eq("make_id", filters.makeId)
        .order("name");
      
      if (!error && data) {
        setModels(data);
      }
      setLoadingModels(false);
    }
    fetchModels();
  }, [filters.makeId]);

  // Fetch available years when model changes
  useEffect(() => {
    async function fetchYears() {
      if (!filters.makeId || !filters.modelId) {
        setYears([]);
        return;
      }
      
      setLoadingYears(true);
      const { data, error } = await supabase
        .from("car_inventory")
        .select("year")
        .eq("make_id", filters.makeId)
        .eq("model_id", filters.modelId)
        .order("year", { ascending: false });
      
      if (!error && data) {
        // Get unique years
        const uniqueYears = [...new Set(data.map(d => d.year))];
        setYears(uniqueYears);
      }
      setLoadingYears(false);
    }
    fetchYears();
  }, [filters.makeId, filters.modelId]);

  // Update individual filter
  const updateFilter = useCallback(<K extends keyof CarSearchFilters>(
    key: K, 
    value: CarSearchFilters[K]
  ) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      
      // Clear dependent filters when parent changes
      if (key === "makeId") {
        next.modelId = null;
        next.year = null;
      } else if (key === "modelId") {
        next.year = null;
      }
      
      return next;
    });
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(initialCarSearchFilters);
    setResults([]);
    setHasSearched(false);
  }, []);

  // Search vehicles
  const searchVehicles = useCallback(async () => {
    setLoadingResults(true);
    setHasSearched(true);
    
    let query = supabase
      .from("car_inventory")
      .select(`
        *,
        make:car_makes(*),
        model:car_models(*)
      `)
      .order("created_at", { ascending: false });
    
    // Apply filters
    if (filters.makeId) {
      query = query.eq("make_id", filters.makeId);
    }
    if (filters.modelId) {
      query = query.eq("model_id", filters.modelId);
    }
    if (filters.year) {
      query = query.eq("year", filters.year);
    }
    if (filters.minPrice) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }
    if (filters.minMileage) {
      query = query.gte("mileage", filters.minMileage);
    }
    if (filters.maxMileage) {
      query = query.lte("mileage", filters.maxMileage);
    }
    if (filters.fuel) {
      query = query.eq("fuel", filters.fuel);
    }
    if (filters.transmission) {
      query = query.eq("transmission", filters.transmission);
    }
    if (filters.location) {
      query = query.or(`location_city.ilike.%${filters.location}%,location_state.ilike.%${filters.location}%`);
    }
    
    const { data, error } = await query;
    
    if (!error && data) {
      setResults(data as CarInventoryItem[]);
    } else {
      setResults([]);
    }
    
    setLoadingResults(false);
  }, [filters]);

  return {
    // Filter state
    filters,
    updateFilter,
    resetFilters,
    
    // Data
    makes,
    models,
    years,
    results,
    
    // Loading states
    loadingMakes,
    loadingModels,
    loadingYears,
    loadingResults,
    
    // Actions
    searchVehicles,
    hasSearched,
  };
}
