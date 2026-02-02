import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

interface ActiveJob {
  id: string;
  type: 'ride' | 'eats' | 'move';
  status: string;
}

interface DriverState {
  isOnline: boolean;
  activeJob: ActiveJob | null;
  enabledServices: {
    rides: boolean;
    eats: boolean;
    move: boolean;
  };
}

const STORAGE_KEYS = {
  IS_ONLINE: 'driver_is_online',
  ACTIVE_JOB: 'driver_active_job',
  ENABLED_SERVICES: 'driver_enabled_services',
};

export const useDriverState = (driverId: string | undefined) => {
  const [state, setState] = useState<DriverState>({
    isOnline: false,
    activeJob: null,
    enabledServices: { rides: true, eats: true, move: true },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(true);

  // Restore state from local storage on mount
  useEffect(() => {
    const restoreState = async () => {
      try {
        const [onlineResult, jobResult, servicesResult] = await Promise.all([
          Preferences.get({ key: STORAGE_KEYS.IS_ONLINE }),
          Preferences.get({ key: STORAGE_KEYS.ACTIVE_JOB }),
          Preferences.get({ key: STORAGE_KEYS.ENABLED_SERVICES }),
        ]);

        const restoredState: Partial<DriverState> = {};

        if (onlineResult.value) {
          restoredState.isOnline = JSON.parse(onlineResult.value);
        }

        if (jobResult.value) {
          restoredState.activeJob = JSON.parse(jobResult.value);
        }

        if (servicesResult.value) {
          restoredState.enabledServices = JSON.parse(servicesResult.value);
        }

        setState(prev => ({ ...prev, ...restoredState }));
      } catch (error) {
        console.error('Failed to restore driver state:', error);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreState();
  }, []);

  // Sync with database when driverId is available
  useEffect(() => {
    if (!driverId || isRestoring) return;

    const syncWithDatabase = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('is_online, rides_enabled, eats_enabled, move_enabled')
          .eq('id', driverId)
          .single();

        if (error) throw error;

        if (data) {
          const dbState: Partial<DriverState> = {
            isOnline: data.is_online ?? false,
            enabledServices: {
              rides: data.rides_enabled ?? true,
              eats: data.eats_enabled ?? true,
              move: data.move_enabled ?? true,
            },
          };

          setState(prev => ({ ...prev, ...dbState }));

          // Persist to local storage
          await Preferences.set({
            key: STORAGE_KEYS.IS_ONLINE,
            value: JSON.stringify(dbState.isOnline),
          });
          await Preferences.set({
            key: STORAGE_KEYS.ENABLED_SERVICES,
            value: JSON.stringify(dbState.enabledServices),
          });
        }

        // Check for active job in database
        const { data: activeTrip } = await supabase
          .from('trips')
          .select('id, status, service_type')
          .eq('driver_id', driverId)
          .in('status', ['accepted', 'en_route', 'arrived', 'in_progress'])
          .maybeSingle();

        if (activeTrip) {
          const activeJob: ActiveJob = {
            id: activeTrip.id,
            type: (activeTrip.service_type as 'ride' | 'eats' | 'move') || 'ride',
            status: activeTrip.status || 'accepted',
          };
          setState(prev => ({ ...prev, activeJob }));
          await Preferences.set({
            key: STORAGE_KEYS.ACTIVE_JOB,
            value: JSON.stringify(activeJob),
          });
        }
      } catch (error) {
        console.error('Failed to sync driver state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    syncWithDatabase();
  }, [driverId, isRestoring]);

  // Handle app lifecycle events
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listenerHandle: { remove: () => void } | null = null;

    const setupListener = async () => {
      listenerHandle = await App.addListener('appStateChange', async ({ isActive }) => {
        if (isActive && driverId) {
          // App came to foreground - sync state
          const { data } = await supabase
            .from('drivers')
            .select('is_online')
            .eq('id', driverId)
            .single();

          if (data) {
            setState(prev => ({ ...prev, isOnline: data.is_online ?? false }));
          }
        }
      });
    };

    setupListener();

    return () => {
      listenerHandle?.remove();
    };
  }, [driverId]);

  // Set online status
  const setOnline = useCallback(async (isOnline: boolean) => {
    setState(prev => ({ ...prev, isOnline }));
    await Preferences.set({
      key: STORAGE_KEYS.IS_ONLINE,
      value: JSON.stringify(isOnline),
    });

    if (driverId) {
      await supabase
        .from('drivers')
        .update({ is_online: isOnline })
        .eq('id', driverId);
    }
  }, [driverId]);

  // Set active job
  const setActiveJob = useCallback(async (job: ActiveJob | null) => {
    setState(prev => ({ ...prev, activeJob: job }));
    
    if (job) {
      await Preferences.set({
        key: STORAGE_KEYS.ACTIVE_JOB,
        value: JSON.stringify(job),
      });
    } else {
      await Preferences.remove({ key: STORAGE_KEYS.ACTIVE_JOB });
    }
  }, []);

  // Update enabled services
  const setEnabledServices = useCallback(async (services: { rides?: boolean; eats?: boolean; move?: boolean }) => {
    const newServices = { ...state.enabledServices, ...services };
    setState(prev => ({ ...prev, enabledServices: newServices }));
    
    await Preferences.set({
      key: STORAGE_KEYS.ENABLED_SERVICES,
      value: JSON.stringify(newServices),
    });

    if (driverId) {
      await supabase
        .from('drivers')
        .update({
          rides_enabled: newServices.rides,
          eats_enabled: newServices.eats,
          move_enabled: newServices.move,
        })
        .eq('id', driverId);
    }
  }, [driverId, state.enabledServices]);

  // Clear all stored state
  const clearState = useCallback(async () => {
    setState({
      isOnline: false,
      activeJob: null,
      enabledServices: { rides: true, eats: true, move: true },
    });
    
    await Promise.all([
      Preferences.remove({ key: STORAGE_KEYS.IS_ONLINE }),
      Preferences.remove({ key: STORAGE_KEYS.ACTIVE_JOB }),
      Preferences.remove({ key: STORAGE_KEYS.ENABLED_SERVICES }),
    ]);
  }, []);

  return {
    ...state,
    isLoading: isLoading || isRestoring,
    setOnline,
    setActiveJob,
    setEnabledServices,
    clearState,
  };
};
