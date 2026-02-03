/**
 * Hotelbeds Activities Hook
 * Provides activity search and booking functionality
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ActivitySearchParams,
  ActivitySearchResponse,
  ActivityBookingRequest,
  ActivityBookingResponse,
  HotelbedsActivity,
  ZivoActivity,
  ZivoActivityModality,
  HotelbedsApiResponse,
  GuestInfo,
} from "@/types/hotelbeds";

const HOTELBEDS_ACTIVITIES_FUNCTION = "hotelbeds-activities";

// Transform Hotelbeds activity to ZIVO format
function transformActivity(activity: HotelbedsActivity): ZivoActivity {
  const content = activity.content;
  
  // Get primary image
  const images = content?.media?.images?.flatMap(img => 
    img.urls.map(u => u.resource)
  ) || [];
  
  // Transform modalities
  const modalities: ZivoActivityModality[] = activity.modalities.map(mod => {
    const minPrice = mod.amountsFrom.reduce((min, amt) => 
      amt.amount < min ? amt.amount : min, 
      mod.amountsFrom[0]?.amount || 0
    );
    
    return {
      code: mod.code,
      name: mod.name,
      duration: mod.duration ? `${mod.duration.value} ${mod.duration.metric}` : undefined,
      price: minPrice,
      currency: activity.currencyName,
      rateKey: mod.rates?.[0]?.rateKey,
      sessions: mod.rates?.[0]?.sessions?.map(s => ({
        code: s.code,
        time: s.startTime,
      })),
    };
  });

  // Get minimum price across all modalities
  const minPrice = modalities.reduce((min, mod) => 
    mod.price < min ? mod.price : min,
    modalities[0]?.price || 0
  );

  return {
    id: `ha-${activity.code}`,
    code: activity.code,
    name: activity.name,
    description: content?.description || "",
    shortDescription: content?.shortDescription,
    imageUrl: images[0] || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
    images,
    destination: activity.destination.name,
    country: activity.country.name,
    duration: content?.scheduling?.duration 
      ? `${content.scheduling.duration.value} ${content.scheduling.duration.metric}`
      : undefined,
    minPrice,
    currency: activity.currencyName,
    highlights: content?.highligths,
    meetingPoint: content?.scheduling?.meetingPoint,
    modalities,
  };
}

export interface ActivitySearchFilters {
  priceRange: [number, number];
  duration: string[];
  categories: string[];
}

export interface ActivityBookingFormData {
  holder: {
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  activity: {
    rateKey: string;
    from: string;
    to: string;
    participants: GuestInfo[];
  };
  remarks?: string;
}

export interface ActivityBookingResult {
  reference: string;
  clientReference: string;
  status: string;
  activityName: string;
  totalAmount: number;
  currency: string;
}

export function useHotelbedsActivities() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ZivoActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ZivoActivity | null>(null);

  // Search activities
  const search = useCallback(async (params: ActivitySearchParams): Promise<ZivoActivity[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Build paxes array
      const paxes: Array<{ type: string; age?: number }> = [];
      for (let i = 0; i < (params.adults || 2); i++) {
        paxes.push({ type: "ADULT" });
      }
      if (params.childAges) {
        for (const age of params.childAges) {
          paxes.push({ type: "CHILD", age });
        }
      } else if (params.children) {
        for (let i = 0; i < params.children; i++) {
          paxes.push({ type: "CHILD", age: 10 });
        }
      }

      const { data, error: fetchError } = await supabase.functions.invoke<HotelbedsApiResponse<ActivitySearchResponse>>(
        HOTELBEDS_ACTIVITIES_FUNCTION,
        {
          body: {
            action: "search",
            from: params.from,
            to: params.to,
            destination: params.destination,
            language: "en",
            paxes,
            pagination: {
              itemsPerPage: 50,
              page: 1,
            },
          },
        }
      );

      if (fetchError) throw fetchError;
      if (!data?.success) throw new Error(data?.error || "Search failed");

      const activities = data.data?.activities || [];
      const transformedActivities = activities.map(transformActivity);
      
      setResults(transformedActivities);
      return transformedActivities;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Search failed";
      setError(message);
      setResults([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get activity details
  const getDetails = useCallback(async (code: string): Promise<ZivoActivity | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.functions.invoke<HotelbedsApiResponse<{ activity: HotelbedsActivity }>>(
        HOTELBEDS_ACTIVITIES_FUNCTION,
        {
          body: {
            action: "details",
            code,
          },
        }
      );

      if (fetchError) throw fetchError;
      if (!data?.success) throw new Error(data?.error || "Failed to get activity details");

      if (data.data?.activity) {
        const activity = transformActivity(data.data.activity);
        setSelectedActivity(activity);
        return activity;
      }
      
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get activity details";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Book activity
  const book = useCallback(async (formData: ActivityBookingFormData): Promise<ActivityBookingResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const clientReference = `ZIVO-ACT-${Date.now().toString(36).toUpperCase()}`;

      const bookingRequest: ActivityBookingRequest = {
        holder: {
          name: formData.holder.name,
          surname: formData.holder.surname,
          email: formData.holder.email,
          telephones: [{
            type: "MOBILE",
            number: formData.holder.phone,
          }],
        },
        activities: [{
          rateKey: formData.activity.rateKey,
          from: formData.activity.from,
          to: formData.activity.to,
          paxes: formData.activity.participants,
        }],
        clientReference,
      };

      const { data, error: fetchError } = await supabase.functions.invoke<HotelbedsApiResponse<ActivityBookingResponse>>(
        HOTELBEDS_ACTIVITIES_FUNCTION,
        {
          body: {
            action: "book",
            ...bookingRequest,
          },
        }
      );

      if (fetchError) throw fetchError;
      if (!data?.success) throw new Error(data?.error || "Booking failed");

      const booking = data.data?.booking;
      if (!booking) {
        throw new Error("Booking confirmation not received");
      }

      return {
        reference: booking.reference,
        clientReference: booking.clientReference,
        status: booking.status,
        activityName: booking.activities?.[0]?.name || "Activity",
        totalAmount: booking.totalAmount,
        currency: booking.currency,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Booking failed";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check API status
  const checkStatus = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error: fetchError } = await supabase.functions.invoke(
        HOTELBEDS_ACTIVITIES_FUNCTION,
        { body: { action: "status" } }
      );
      
      if (fetchError) return false;
      return data?.success === true;
    } catch {
      return false;
    }
  }, []);

  return {
    isLoading,
    error,
    results,
    selectedActivity,
    search,
    getDetails,
    book,
    checkStatus,
    setSelectedActivity,
  };
}
