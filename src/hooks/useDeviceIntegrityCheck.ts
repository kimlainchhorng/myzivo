/**
 * Device Integrity Check Hook
 * On customer app start, links the device and checks for multi-account abuse.
 * Runs once per session. Silent detection — does not block the user.
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getOrCreateDeviceId } from '@/lib/deviceId';

export function useDeviceIntegrityCheck() {
  const { user } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user || hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      try {
        const deviceId = getOrCreateDeviceId();

        // 1. Link device
        await supabase.rpc('link_user_device', {
          p_device_id: deviceId,
          p_role: 'customer',
        });

        // 2. Check multi-account
        const { data: check, error } = await supabase.rpc('check_multi_account', {
          p_device_id: deviceId,
          p_role: 'customer',
          p_max_users: 3,
          p_days: 30,
        });

        if (error) {
          console.error('[DeviceIntegrity] check_multi_account error:', error);
          return;
        }

        const result = check as { flagged: boolean; user_count: number; threshold: number } | null;

        if (result?.flagged) {
          console.warn('[DeviceIntegrity] Multi-account flagged', result);

          // 3. Log risk event
          await supabase.rpc('log_risk_event', {
            p_role: 'customer',
            p_event_type: 'multi_account',
            p_details: {
              device_id: deviceId,
              user_count: result.user_count,
              threshold: result.threshold,
            } as any,
          });
        }
      } catch (err) {
        console.error('[DeviceIntegrity] Unexpected error:', err);
      }
    };

    run();
  }, [user]);
}
