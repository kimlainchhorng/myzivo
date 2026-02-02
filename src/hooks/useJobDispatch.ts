import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LocationService, LocationCoordinates } from '@/services/LocationService';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export type JobType = 'ride' | 'eats' | 'move';

export interface IncomingJob {
  id: string;
  type: JobType;
  pickup: {
    lat: number;
    lng: number;
    address: string;
  };
  dropoff: {
    lat: number;
    lng: number;
    address: string;
  };
  estimatedPayout: number;
  distanceToPickup: number; // in miles
  expiresAt: Date;
  customerName?: string;
  customerPhone?: string;
  restaurantName?: string; // for eats
  packageSize?: string; // for move
}

interface UseJobDispatchOptions {
  driverId: string | undefined;
  isOnline: boolean;
  enabledServices: {
    rides: boolean;
    eats: boolean;
    move: boolean;
  };
  driverLocation: LocationCoordinates | null;
  onJobAccepted?: (job: IncomingJob) => void;
}

const JOB_TIMEOUT_SECONDS = 30;

export const useJobDispatch = ({
  driverId,
  isOnline,
  enabledServices,
  driverLocation,
  onJobAccepted,
}: UseJobDispatchOptions) => {
  const queryClient = useQueryClient();
  const [incomingJob, setIncomingJob] = useState<IncomingJob | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(JOB_TIMEOUT_SECONDS);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate distance between driver and pickup
  const calculateDistanceToPickup = useCallback((pickupLat: number, pickupLng: number): number => {
    if (!driverLocation) return 0;
    const distanceKm = LocationService.calculateDistance(driverLocation, { lat: pickupLat, lng: pickupLng });
    return LocationService.kmToMiles(distanceKm);
  }, [driverLocation]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/job-request.mp3');
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }, []);

  // Trigger haptic feedback
  const triggerHaptic = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (error) {
        console.error('Haptic feedback failed:', error);
      }
    }
  }, []);

  // Start countdown timer
  const startCountdown = useCallback(() => {
    setTimeRemaining(JOB_TIMEOUT_SECONDS);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time expired - auto decline
          clearInterval(timerRef.current!);
          setIncomingJob(null);
          toast.info('Job request expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Stop countdown timer
  const stopCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Accept job
  const acceptJob = useCallback(async () => {
    if (!incomingJob || !driverId) return;

    setIsAccepting(true);
    stopCountdown();

    try {
      let updateResult;

      switch (incomingJob.type) {
        case 'ride':
          updateResult = await supabase
            .from('trips')
            .update({ driver_id: driverId, status: 'accepted' })
            .eq('id', incomingJob.id)
            .eq('status', 'requested')
            .is('driver_id', null);
          break;
        case 'eats':
          updateResult = await supabase
            .from('food_orders')
            .update({ driver_id: driverId, status: 'in_progress' })
            .eq('id', incomingJob.id)
            .eq('status', 'ready_for_pickup')
            .is('driver_id', null);
          break;
        case 'move':
          updateResult = await supabase
            .from('package_deliveries')
            .update({ driver_id: driverId, status: 'accepted', accepted_at: new Date().toISOString() })
            .eq('id', incomingJob.id)
            .eq('status', 'requested')
            .is('driver_id', null);
          break;
      }

      if (updateResult?.error) throw updateResult.error;

      toast.success('Job accepted!');
      onJobAccepted?.(incomingJob);
      setIncomingJob(null);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['driver-active-trip'] });
      queryClient.invalidateQueries({ queryKey: ['available-trip-requests'] });
    } catch (error: any) {
      console.error('Failed to accept job:', error);
      toast.error('Failed to accept job', { description: error.message });
    } finally {
      setIsAccepting(false);
    }
  }, [incomingJob, driverId, stopCountdown, onJobAccepted, queryClient]);

  // Decline job
  const declineJob = useCallback(async () => {
    if (!incomingJob) return;

    setIsDeclining(true);
    stopCountdown();
    setIncomingJob(null);
    setIsDeclining(false);
    toast.info('Job declined');
  }, [incomingJob, stopCountdown]);

  // Process incoming ride request
  const processRideRequest = useCallback((data: any) => {
    if (!enabledServices.rides) return;

    const job: IncomingJob = {
      id: data.id,
      type: 'ride',
      pickup: {
        lat: data.pickup_lat,
        lng: data.pickup_lng,
        address: data.pickup_address,
      },
      dropoff: {
        lat: data.dropoff_lat,
        lng: data.dropoff_lng,
        address: data.dropoff_address,
      },
      estimatedPayout: data.fare_amount || 0,
      distanceToPickup: calculateDistanceToPickup(data.pickup_lat, data.pickup_lng),
      expiresAt: new Date(Date.now() + JOB_TIMEOUT_SECONDS * 1000),
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
    };

    setIncomingJob(job);
    startCountdown();
    playNotificationSound();
    triggerHaptic();
  }, [enabledServices.rides, calculateDistanceToPickup, startCountdown, playNotificationSound, triggerHaptic]);

  // Process incoming food order
  const processFoodOrder = useCallback((data: any) => {
    if (!enabledServices.eats) return;

    const job: IncomingJob = {
      id: data.id,
      type: 'eats',
      pickup: {
        lat: data.restaurant?.lat || 0,
        lng: data.restaurant?.lng || 0,
        address: data.restaurant?.address || 'Restaurant',
      },
      dropoff: {
        lat: data.delivery_lat || 0,
        lng: data.delivery_lng || 0,
        address: data.delivery_address || '',
      },
      estimatedPayout: data.delivery_fee || 0,
      distanceToPickup: calculateDistanceToPickup(data.restaurant?.lat || 0, data.restaurant?.lng || 0),
      expiresAt: new Date(Date.now() + JOB_TIMEOUT_SECONDS * 1000),
      customerName: data.customer_name,
      restaurantName: data.restaurant?.name,
    };

    setIncomingJob(job);
    startCountdown();
    playNotificationSound();
    triggerHaptic();
  }, [enabledServices.eats, calculateDistanceToPickup, startCountdown, playNotificationSound, triggerHaptic]);

  // Process incoming package delivery
  const processPackageDelivery = useCallback((data: any) => {
    if (!enabledServices.move) return;

    const job: IncomingJob = {
      id: data.id,
      type: 'move',
      pickup: {
        lat: data.pickup_lat,
        lng: data.pickup_lng,
        address: data.pickup_address,
      },
      dropoff: {
        lat: data.dropoff_lat,
        lng: data.dropoff_lng,
        address: data.dropoff_address,
      },
      estimatedPayout: data.estimated_payout || 0,
      distanceToPickup: calculateDistanceToPickup(data.pickup_lat, data.pickup_lng),
      expiresAt: new Date(Date.now() + JOB_TIMEOUT_SECONDS * 1000),
      customerName: data.customer_name,
      packageSize: data.package_size,
    };

    setIncomingJob(job);
    startCountdown();
    playNotificationSound();
    triggerHaptic();
  }, [enabledServices.move, calculateDistanceToPickup, startCountdown, playNotificationSound, triggerHaptic]);

  // Subscribe to real-time job requests
  useEffect(() => {
    if (!driverId || !isOnline || incomingJob) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Subscribe to ride requests
    if (enabledServices.rides) {
      const ridesChannel = supabase
        .channel('ride-requests')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'trips',
            filter: 'status=eq.requested',
          },
          (payload) => {
            if (!payload.new.driver_id) {
              processRideRequest(payload.new);
            }
          }
        )
        .subscribe();
      channels.push(ridesChannel);
    }

    // Subscribe to food order requests
    if (enabledServices.eats) {
      const eatsChannel = supabase
        .channel('eats-requests')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'food_orders',
            filter: 'status=eq.ready_for_pickup',
          },
          (payload) => {
            if (!payload.new.driver_id) {
              processFoodOrder(payload.new);
            }
          }
        )
        .subscribe();
      channels.push(eatsChannel);
    }

    // Subscribe to package delivery requests
    if (enabledServices.move) {
      const moveChannel = supabase
        .channel('move-requests')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'package_deliveries',
            filter: 'status=eq.requested',
          },
          (payload) => {
            if (!payload.new.driver_id) {
              processPackageDelivery(payload.new);
            }
          }
        )
        .subscribe();
      channels.push(moveChannel);
    }

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
      stopCountdown();
    };
  }, [
    driverId,
    isOnline,
    incomingJob,
    enabledServices,
    processRideRequest,
    processFoodOrder,
    processPackageDelivery,
    stopCountdown,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCountdown();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [stopCountdown]);

  return {
    incomingJob,
    timeRemaining,
    isAccepting,
    isDeclining,
    acceptJob,
    declineJob,
    dismissJob: declineJob,
  };
};
