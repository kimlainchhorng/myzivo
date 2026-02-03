/**
 * ZIVO Global Expansion Hooks
 * Country management, services, and analytics
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Country, 
  CountryService, 
  CountryWithServices,
  SupportedLanguage,
  CountryAnalytics,
  RegionStats 
} from "@/types/global";
import { useToast } from "@/hooks/use-toast";

// Fetch all countries
export function useCountries(activeOnly = false) {
  return useQuery({
    queryKey: ["countries", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("countries")
        .select("*")
        .order("name");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Country[];
    },
  });
}

// Fetch countries with their services
export function useCountriesWithServices() {
  return useQuery({
    queryKey: ["countries-with-services"],
    queryFn: async () => {
      const { data: countries, error: countriesError } = await supabase
        .from("countries")
        .select("*")
        .order("name");

      if (countriesError) throw countriesError;

      const { data: services, error: servicesError } = await supabase
        .from("country_services")
        .select("*");

      if (servicesError) throw servicesError;

      // Map services to countries
      return (countries as Country[]).map((country) => ({
        ...country,
        services: (services as CountryService[]).filter(
          (s) => s.country_id === country.id
        ),
      })) as CountryWithServices[];
    },
  });
}

// Fetch services for a specific country
export function useCountryServices(countryCode: string) {
  return useQuery({
    queryKey: ["country-services", countryCode],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_country_services", {
        p_country_code: countryCode,
      });
      if (error) throw error;
      return data as { service_type: string; is_enabled: boolean; is_beta: boolean }[];
    },
    enabled: !!countryCode,
  });
}

// Fetch supported languages
export function useSupportedLanguages(activeOnly = false) {
  return useQuery({
    queryKey: ["supported-languages", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("supported_languages")
        .select("*")
        .order("sort_order");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SupportedLanguage[];
    },
  });
}

// Fetch country analytics
export function useCountryAnalytics(countryId?: string, days = 30) {
  return useQuery({
    queryKey: ["country-analytics", countryId, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from("country_analytics")
        .select("*")
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: false });

      if (countryId) {
        query = query.eq("country_id", countryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CountryAnalytics[];
    },
  });
}

// Global overview stats
export function useGlobalOverview() {
  return useQuery({
    queryKey: ["global-overview"],
    queryFn: async () => {
      const [countriesRes, languagesRes, analyticsRes] = await Promise.all([
        supabase.from("countries").select("id, is_active, region"),
        supabase.from("supported_languages").select("id, is_active"),
        supabase
          .from("country_analytics")
          .select("country_id, total_users, total_revenue_usd")
          .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
      ]);

      const countries = countriesRes.data || [];
      const languages = languagesRes.data || [];
      const analytics = analyticsRes.data || [];

      // Calculate region stats
      const regionMap = new Map<string, RegionStats>();
      countries.forEach((c: any) => {
        if (!regionMap.has(c.region)) {
          regionMap.set(c.region, {
            region: c.region,
            countries: 0,
            activeCountries: 0,
            totalUsers: 0,
            totalRevenue: 0,
          });
        }
        const stats = regionMap.get(c.region)!;
        stats.countries++;
        if (c.is_active) stats.activeCountries++;

        // Add analytics for this country
        const countryAnalytics = analytics.filter((a: any) => a.country_id === c.id);
        countryAnalytics.forEach((a: any) => {
          stats.totalUsers += a.total_users || 0;
          stats.totalRevenue += parseFloat(a.total_revenue_usd) || 0;
        });
      });

      return {
        totalCountries: countries.length,
        activeCountries: countries.filter((c: any) => c.is_active).length,
        totalLanguages: languages.length,
        activeLanguages: languages.filter((l: any) => l.is_active).length,
        totalUsers: analytics.reduce((sum: number, a: any) => sum + (a.total_users || 0), 0),
        revenueByRegion: Array.from(regionMap.values()),
      };
    },
  });
}

// Update country
export function useUpdateCountry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Country> & { id: string }) => {
      const { data, error } = await supabase
        .from("countries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      queryClient.invalidateQueries({ queryKey: ["countries-with-services"] });
      toast({ title: "Country updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update country", description: error.message, variant: "destructive" });
    },
  });
}

// Update country service
export function useUpdateCountryService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_enabled, is_beta, launched_at }: { 
      id: string; 
      is_enabled?: boolean; 
      is_beta?: boolean; 
      launched_at?: string;
    }) => {
      const { data, error } = await supabase
        .from("country_services")
        .update({ is_enabled, is_beta, launched_at })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries-with-services"] });
      queryClient.invalidateQueries({ queryKey: ["country-services"] });
      toast({ title: "Service updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update service", description: error.message, variant: "destructive" });
    },
  });
}

// Toggle language active status
export function useToggleLanguage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("supported_languages")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["supported-languages"] });
      toast({ title: `${data.name} ${data.is_active ? "enabled" : "disabled"}` });
    },
    onError: (error) => {
      toast({ title: "Failed to update language", description: error.message, variant: "destructive" });
    },
  });
}
