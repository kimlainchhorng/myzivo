/**
 * useOfflineQueue Hook
 * 
 * Manages a persistent queue of actions to be synced when the app comes back online.
 * Actions are stored in localStorage and synced via the sync-offline-actions edge function.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OfflineAction {
  id: string;
  type: 'update_order_status' | 'update_trip_status' | 'location_update';
  payload: Record<string, unknown>;
  created_at: string;
  synced: boolean;
  retryCount: number;
}

interface SyncResult {
  action_id: string;
  success: boolean;
  message: string;
  current_status?: string;
}

interface SyncResponse {
  success: boolean;
  total: number;
  synced: number;
  failed: number;
  results: SyncResult[];
}

const STORAGE_KEY = 'zivo_offline_queue';
const MAX_RETRIES = 3;
const BATCH_SIZE = 20;

export const useOfflineQueue = (isOnline: boolean) => {
  const [queue, setQueue] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncingRef = useRef(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OfflineAction[];
        // Filter out already synced actions
        const pending = parsed.filter(a => !a.synced);
        setQueue(pending);
      }
    } catch (error) {
      console.error('[OfflineQueue] Failed to load queue:', error);
    }
  }, []);

  // Persist queue to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('[OfflineQueue] Failed to save queue:', error);
    }
  }, [queue]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !syncingRef.current) {
      syncQueue();
    }
  }, [isOnline, queue.length]);

  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add action to queue
  const queueAction = useCallback((
    type: OfflineAction['type'],
    payload: Record<string, unknown>
  ): string => {
    const id = generateId();
    const action: OfflineAction = {
      id,
      type,
      payload,
      created_at: new Date().toISOString(),
      synced: false,
      retryCount: 0,
    };

    setQueue(prev => [...prev, action]);
    
    if (!isOnline) {
      toast.info('Action queued', {
        description: 'Will sync when connection is restored',
      });
    }

    return id;
  }, [isOnline]);

  // Sync queue with server
  const syncQueue = useCallback(async () => {
    if (syncingRef.current || queue.length === 0) return;
    
    syncingRef.current = true;
    setIsSyncing(true);

    try {
      // Get pending actions
      const pendingActions = queue
        .filter(a => !a.synced && a.retryCount < MAX_RETRIES)
        .slice(0, BATCH_SIZE);

      if (pendingActions.length === 0) {
        syncingRef.current = false;
        setIsSyncing(false);
        return;
      }

      console.log(`[OfflineQueue] Syncing ${pendingActions.length} actions...`);

      const { data, error } = await supabase.functions.invoke<SyncResponse>(
        'sync-offline-actions',
        {
          body: {
            actions: pendingActions.map(a => ({
              id: a.id,
              type: a.type,
              payload: a.payload,
              created_at: a.created_at,
            })),
          },
        }
      );

      if (error) {
        console.error('[OfflineQueue] Sync error:', error);
        toast.error('Sync failed', {
          description: 'Will retry when connection improves',
        });
        
        // Increment retry count for failed actions
        setQueue(prev => prev.map(a => 
          pendingActions.find(p => p.id === a.id)
            ? { ...a, retryCount: a.retryCount + 1 }
            : a
        ));
      } else if (data) {
        // Process results
        const successIds = new Set(
          data.results.filter(r => r.success).map(r => r.action_id)
        );
        const failedIds = new Set(
          data.results.filter(r => !r.success).map(r => r.action_id)
        );

        setQueue(prev => prev
          .map(a => {
            if (successIds.has(a.id)) {
              return { ...a, synced: true };
            }
            if (failedIds.has(a.id)) {
              return { ...a, retryCount: a.retryCount + 1 };
            }
            return a;
          })
          // Remove synced actions
          .filter(a => !a.synced)
        );

        if (data.synced > 0) {
          toast.success(`Synced ${data.synced} pending actions`);
        }

        if (data.failed > 0) {
          console.warn(`[OfflineQueue] ${data.failed} actions failed to sync`);
        }
      }
    } catch (error) {
      console.error('[OfflineQueue] Sync exception:', error);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [queue]);

  // Remove a specific action from queue
  const removeAction = useCallback((actionId: string) => {
    setQueue(prev => prev.filter(a => a.id !== actionId));
  }, []);

  // Clear all pending actions
  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Get pending count (not yet synced)
  const pendingCount = queue.filter(a => !a.synced && a.retryCount < MAX_RETRIES).length;

  // Get failed count (exceeded retries)
  const failedCount = queue.filter(a => a.retryCount >= MAX_RETRIES).length;

  return {
    queue,
    pendingCount,
    failedCount,
    isSyncing,
    queueAction,
    syncQueue,
    removeAction,
    clearQueue,
  };
};

export default useOfflineQueue;
