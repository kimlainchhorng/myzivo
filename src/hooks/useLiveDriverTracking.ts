/**
 * useLiveDriverTracking - Comprehensive real-time driver tracking system
 * 
 * Features:
 * - Real-time driver location updates via Supabase Realtime
 * - ETA calculation based on actual distance to pickup
 * - Driver availability monitoring
 * - Assignment flow coordination
 * - Connection health monitoring with auto-reconnect
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Haversine distance calculation (miles)
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate ETA in seconds based on distance (average 25 mph in city)
function calculateETA(distanceMiles: number): number {
  const avgSpeedMph = 25;
  const hours = distanceMiles / avgSpeedMph;
  return Math.round(hours * 3600); // Convert to seconds
}

export interface DriverLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface NearbyDriver {
  id: string;
  name: string;
  vehicleType: string;
  vehicleModel: string | null;
  plate: string;
  rating: number | null;
  avatarUrl: string | null;
  location: DriverLocation;
  distanceMiles: number;
  etaSeconds: number;
}

export interface LiveDriverState {
  // Connection
  isConnected: boolean;
  isReconnecting: boolean;
  lastUpdate: number | null;
  
  // Assigned driver tracking
  assignedDriver: NearbyDriver | null;
  driverLocation: DriverLocation | null;
  etaSeconds: number;
  distanceToPickup: number;
  hasArrived: boolean;
  
  // Nearby drivers (for availability display)
  nearbyDrivers: NearbyDriver[];
  nearbyCount: number;
}

interface UseLiveDriverTrackingOptions {
  tripId?: string | null;
  driverId?: string | null;
  pickupLocation?: { lat: number; lng: number } | null;
  arrivalThresholdMiles?: number;
  enableNearbyTracking?: boolean;
  nearbyRadiusMiles?: number;
}

export function useLiveDriverTracking({
  tripId,
  driverId,
  pickupLocation,
  arrivalThresholdMiles = 0.1, // 0.1 miles = ~528 feet
  enableNearbyTracking = false,
  nearbyRadiusMiles = 5,
}: UseLiveDriverTrackingOptions = {}) {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const nearbyChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<LiveDriverState>({
    isConnected: false,
    isReconnecting: false,
    lastUpdate: null,
    assignedDriver: null,
    driverLocation: null,
    etaSeconds: 0,
    distanceToPickup: 0,
    hasArrived: false,
    nearbyDrivers: [],
    nearbyCount: 0,
  });

  // Update driver location and calculate derived values
  const updateDriverLocation = useCallback((
    lat: number,
    lng: number,
    driverData?: Partial<NearbyDriver>
  ) => {
    setState(prev => {
      const newLocation: DriverLocation = {
        lat,
        lng,
        timestamp: Date.now(),
      };

      let distanceToPickup = prev.distanceToPickup;
      let etaSeconds = prev.etaSeconds;
      let hasArrived = prev.hasArrived;

      if (pickupLocation) {
        distanceToPickup = haversineDistance(
          lat, lng,
          pickupLocation.lat, pickupLocation.lng
        );
        etaSeconds = calculateETA(distanceToPickup);
        hasArrived = distanceToPickup <= arrivalThresholdMiles;
      }

      // Update assigned driver info if provided
      const assignedDriver = driverData ? {
        ...prev.assignedDriver,
        ...driverData,
        location: newLocation,
        distanceMiles: distanceToPickup,
        etaSeconds,
      } as NearbyDriver : prev.assignedDriver ? {
        ...prev.assignedDriver,
        location: newLocation,
        distanceMiles: distanceToPickup,
        etaSeconds,
      } : null;

      return {
        ...prev,
        driverLocation: newLocation,
        distanceToPickup,
        etaSeconds,
        hasArrived,
        assignedDriver,
        lastUpdate: Date.now(),
      };
    });
  }, [pickupLocation, arrivalThresholdMiles]);

  // Subscribe to assigned driver location updates
  useEffect(() => {
    if (!driverId) return;

    console.log(`[LiveDriver] Subscribing to driver: ${driverId}`);

    // Fetch initial driver data
    const fetchDriverData = async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, full_name, vehicle_type, vehicle_model, vehicle_plate, rating, avatar_url, current_lat, current_lng")
        .eq("id", driverId)
        .single();

      if (error) {
        console.error("[LiveDriver] Error fetching driver:", error);
        return;
      }

      if (data?.current_lat && data?.current_lng) {
        updateDriverLocation(data.current_lat, data.current_lng, {
          id: data.id,
          name: data.full_name,
          vehicleType: data.vehicle_type,
          vehicleModel: data.vehicle_model,
          plate: data.vehicle_plate,
          rating: data.rating,
          avatarUrl: data.avatar_url,
        });
      }
    };

    fetchDriverData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`live-driver-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drivers",
          filter: `id=eq.${driverId}`,
        },
        (payload) => {
          const { current_lat, current_lng, is_online } = payload.new as {
            current_lat: number | null;
            current_lng: number | null;
            is_online: boolean | null;
          };

          if (current_lat && current_lng) {
            updateDriverLocation(current_lat, current_lng);
          }

          // Handle driver going offline
          if (is_online === false) {
            toast.warning("Driver went offline", {
              description: "Looking for another driver...",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`[LiveDriver] Channel status: ${status}`);
        setState(prev => ({
          ...prev,
          isConnected: status === "SUBSCRIBED",
          isReconnecting: status === "CLOSED" || status === "CHANNEL_ERROR",
        }));

        if (status === "CHANNEL_ERROR") {
          // Auto-reconnect after 2 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("[LiveDriver] Attempting reconnect...");
            channel.subscribe();
          }, 2000);
        }
      });

    channelRef.current = channel;

    return () => {
      console.log(`[LiveDriver] Unsubscribing from driver: ${driverId}`);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [driverId, updateDriverLocation]);

  // Subscribe to trip status changes
  useEffect(() => {
    if (!tripId) return;

    console.log(`[LiveDriver] Subscribing to trip: ${tripId}`);

    const channel = supabase
      .channel(`live-trip-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trips",
          filter: `id=eq.${tripId}`,
        },
        (payload) => {
          const { status, driver_id } = payload.new as {
            status: string;
            driver_id: string | null;
          };

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["active-rider-trip"] });
          queryClient.invalidateQueries({ queryKey: ["trips"] });

          // Handle status changes
          switch (status) {
            case "arrived":
              setState(prev => ({ ...prev, hasArrived: true }));
              break;
            case "cancelled":
              setState(prev => ({
                ...prev,
                assignedDriver: null,
                driverLocation: null,
                hasArrived: false,
              }));
              break;
          }

          console.log(`[LiveDriver] Trip ${tripId} status: ${status}, driver: ${driver_id}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient]);

  // Subscribe to nearby drivers (for availability display)
  useEffect(() => {
    if (!enableNearbyTracking || !pickupLocation) return;

    console.log("[LiveDriver] Starting nearby drivers tracking");

    // Fetch initial nearby drivers
    const fetchNearbyDrivers = async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, full_name, vehicle_type, vehicle_model, vehicle_plate, rating, avatar_url, current_lat, current_lng")
        .eq("is_online", true)
        .eq("status", "verified")
        .not("current_lat", "is", null)
        .not("current_lng", "is", null);

      if (error) {
        console.error("[LiveDriver] Error fetching nearby drivers:", error);
        return;
      }

      const nearby = (data || [])
        .map(driver => {
          const distance = haversineDistance(
            driver.current_lat!,
            driver.current_lng!,
            pickupLocation.lat,
            pickupLocation.lng
          );
          return {
            id: driver.id,
            name: driver.full_name,
            vehicleType: driver.vehicle_type,
            vehicleModel: driver.vehicle_model,
            plate: driver.vehicle_plate,
            rating: driver.rating,
            avatarUrl: driver.avatar_url,
            location: {
              lat: driver.current_lat!,
              lng: driver.current_lng!,
              timestamp: Date.now(),
            },
            distanceMiles: distance,
            etaSeconds: calculateETA(distance),
          };
        })
        .filter(d => d.distanceMiles <= nearbyRadiusMiles)
        .sort((a, b) => a.distanceMiles - b.distanceMiles);

      setState(prev => ({
        ...prev,
        nearbyDrivers: nearby,
        nearbyCount: nearby.length,
      }));
    };

    fetchNearbyDrivers();

    // Subscribe to all driver updates for nearby tracking
    const channel = supabase
      .channel("nearby-drivers-live")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drivers",
        },
        () => {
          // Refetch nearby drivers on any driver update
          fetchNearbyDrivers();
        }
      )
      .subscribe();

    nearbyChannelRef.current = channel;

    // Refresh every 30 seconds as fallback
    const interval = setInterval(fetchNearbyDrivers, 30000);

    return () => {
      clearInterval(interval);
      if (nearbyChannelRef.current) {
        supabase.removeChannel(nearbyChannelRef.current);
        nearbyChannelRef.current = null;
      }
    };
  }, [enableNearbyTracking, pickupLocation, nearbyRadiusMiles]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.subscribe();
    }
  }, []);

  // Format ETA for display
  const formatETA = useCallback((seconds: number): string => {
    if (seconds <= 0) return "Arriving";
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  }, []);

  return {
    ...state,
    reconnect,
    formatETA,
  };
}

// Simplified hook for just driver availability count
export function useDriverAvailability(
  pickupLocation?: { lat: number; lng: number } | null,
  radiusMiles: number = 5
) {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [closestETA, setClosestETA] = useState<number | null>(null);

  useEffect(() => {
    if (!pickupLocation) {
      setCount(0);
      setIsLoading(false);
      return;
    }

    const fetchCount = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("drivers")
        .select("id, current_lat, current_lng")
        .eq("is_online", true)
        .eq("status", "verified")
        .not("current_lat", "is", null)
        .not("current_lng", "is", null);

      if (error) {
        console.error("[DriverAvailability] Error:", error);
        setIsLoading(false);
        return;
      }

      const nearby = (data || []).filter(driver => {
        const distance = haversineDistance(
          driver.current_lat!,
          driver.current_lng!,
          pickupLocation.lat,
          pickupLocation.lng
        );
        return distance <= radiusMiles;
      });

      // Calculate closest driver ETA
      let minDistance = Infinity;
      nearby.forEach(driver => {
        const distance = haversineDistance(
          driver.current_lat!,
          driver.current_lng!,
          pickupLocation.lat,
          pickupLocation.lng
        );
        if (distance < minDistance) {
          minDistance = distance;
        }
      });

      setCount(nearby.length);
      setClosestETA(minDistance < Infinity ? calculateETA(minDistance) : null);
      setIsLoading(false);
    };

    fetchCount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchCount, 30000);

    return () => clearInterval(interval);
  }, [pickupLocation, radiusMiles]);

  return {
    count,
    hasDrivers: count > 0,
    isLoading,
    closestETA,
    closestETAMinutes: closestETA ? Math.ceil(closestETA / 60) : null,
  };
}
