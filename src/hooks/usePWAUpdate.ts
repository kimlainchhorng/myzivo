/**
 * PWA Update Detection Hook
 * Registers the service worker via vite-plugin-pwa and detects updates.
 */
import { useEffect, useRef, useState, useCallback } from 'react';

interface PWAUpdateState {
  needRefresh: boolean;
  updateSW: (reloadPage?: boolean) => void;
}

export function usePWAUpdate(): PWAUpdateState {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    let cancelled = false;

    const registerSW = async () => {
      try {
        // Dynamic import to avoid SSR issues and handle environments where the virtual module doesn't exist
        const { registerSW } = await import('virtual:pwa-register');

        const updateFn = registerSW({
          immediate: true,
          onNeedRefresh() {
            if (!cancelled) {
              console.log('[PWA] New content available, update ready');
              setNeedRefresh(true);
            }
          },
          onOfflineReady() {
            console.log('[PWA] App ready to work offline');
          },
          onRegisteredSW(swUrl, registration) {
            console.log('[PWA] Service worker registered:', swUrl);
            // Check for updates every 60 seconds
            if (registration) {
              setInterval(() => {
                registration.update();
              }, 60 * 1000);
            }
          },
          onRegisterError(error) {
            console.error('[PWA] Service worker registration error:', error);
          },
        });

        updateSWRef.current = updateFn;
      } catch (e) {
        // In dev mode or if PWA plugin isn't active, this is expected
        console.log('[PWA] Service worker registration skipped:', e);
      }
    };

    registerSW();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSW = useCallback((reloadPage = true) => {
    if (updateSWRef.current) {
      updateSWRef.current(reloadPage);
    }
  }, []);

  return { needRefresh, updateSW };
}
