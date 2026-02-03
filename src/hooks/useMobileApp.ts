/**
 * Mobile App Detection & Features Hook
 * Handles PWA detection, app install prompts, and mobile-specific features
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MobileAppState {
  isStandalone: boolean;
  isPWA: boolean;
  isNativeApp: boolean;
  platform: 'ios' | 'android' | 'web' | 'unknown';
  canInstall: boolean;
  isOnline: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useMobileApp() {
  const { user } = useAuth();
  const [state, setState] = useState<MobileAppState>({
    isStandalone: false,
    isPWA: false,
    isNativeApp: false,
    platform: 'unknown',
    canInstall: false,
    isOnline: true,
  });

  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Detect platform and mode
  useEffect(() => {
    const detectPlatform = (): 'ios' | 'android' | 'web' => {
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) return 'ios';
      if (/android/.test(ua)) return 'android';
      return 'web';
    };

    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    const isPWA = isStandalone && !window.matchMedia('(display-mode: browser)').matches;

    // Check if running in Capacitor/native
    const isNativeApp = !!(window as any).Capacitor;

    setState(prev => ({
      ...prev,
      isStandalone,
      isPWA,
      isNativeApp,
      platform: detectPlatform(),
      isOnline: navigator.onLine,
    }));

    // Track app install
    if ((isPWA || isNativeApp) && user) {
      trackAppInstall(user.id, detectPlatform());
    }
  }, [user]);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      installPromptRef.current = e as BeforeInstallPromptEvent;
      setState(prev => ({ ...prev, canInstall: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show install prompt
  const showInstallPrompt = useCallback(async (): Promise<boolean> => {
    if (!installPromptRef.current) {
      console.warn('[MobileApp] No install prompt available');
      return false;
    }

    try {
      await installPromptRef.current.prompt();
      const { outcome } = await installPromptRef.current.userChoice;
      
      if (outcome === 'accepted') {
        setState(prev => ({ ...prev, canInstall: false }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('[MobileApp] Install prompt error:', error);
      return false;
    }
  }, []);

  // Get iOS install instructions
  const getIOSInstallInstructions = useCallback(() => {
    return [
      'Tap the Share button at the bottom of your browser',
      'Scroll down and tap "Add to Home Screen"',
      'Tap "Add" to confirm',
    ];
  }, []);

  // Check if should show install banner
  const shouldShowInstallBanner = useCallback(() => {
    if (state.isStandalone || state.isNativeApp) return false;
    
    // Check if user dismissed recently
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) {
      const dismissedAt = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return false;
    }

    return state.canInstall || state.platform === 'ios';
  }, [state]);

  // Dismiss install banner
  const dismissInstallBanner = useCallback(() => {
    localStorage.setItem('pwa_install_dismissed', new Date().toISOString());
  }, []);

  return {
    ...state,
    showInstallPrompt,
    getIOSInstallInstructions,
    shouldShowInstallBanner,
    dismissInstallBanner,
  };
}

// Track app install in database
async function trackAppInstall(userId: string, platform: 'ios' | 'android' | 'web') {
  try {
    const deviceId = getOrCreateDeviceId();
    
    await supabase
      .from('app_installs')
      .upsert({
        user_id: userId,
        device_id: deviceId,
        platform: platform === 'web' ? 'pwa' : platform,
        install_source: document.referrer ? 'referral' : 'direct',
        last_active_at: new Date().toISOString(),
      }, {
        onConflict: 'device_id,platform',
      }) as any;
  } catch (error) {
    console.error('[MobileApp] Failed to track install:', error);
  }
}

function getOrCreateDeviceId(): string {
  const key = 'zivo_device_id';
  let deviceId = localStorage.getItem(key);
  
  if (!deviceId) {
    deviceId = `DV_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem(key, deviceId);
  }
  
  return deviceId;
}
