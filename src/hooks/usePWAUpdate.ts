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
              console.debug('[PWA] New content available, update ready');
              setNeedRefresh(true);
            }
          },
          onOfflineReady() {
            console.debug('[PWA] App ready to work offline');
          },
          onRegisteredSW(swUrl, registration) {
            console.debug('[PWA] Service worker registered:', swUrl);

            if (registration?.waiting) {
              console.debug('[PWA] Waiting service worker found, applying update');
              setNeedRefresh(true);
              updateFn(true);
              return;
            }

            if (registration) {
              const checkForUpdate = () => registration.update();
              setInterval(checkForUpdate, 60 * 1000);
              document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') checkForUpdate();
              });
            }
          },
          onRegisterError(error) {
            console.error('[PWA] Service worker registration error:', error);
          },
        });

        updateSWRef.current = updateFn;
      } catch (e) {
        // In dev mode or if PWA plugin isn't active, this is expected
        console.debug('[PWA] Service worker registration skipped:', e);
      }
    };

    registerSW();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSW = useCallback((reloadPage = true) => {
    if (updateSWRef.current) {
      // Apply the SW update without letting vite-plugin-pwa reload —
      // a normal window.location.reload() keeps Capacitor inside its WebView,
      // whereas the plugin's built-in reload can open Safari.
      updateSWRef.current(false).then(() => {
        if (reloadPage) {
          window.location.reload();
        }
      });
    }
  }, []);

  return { needRefresh, updateSW };
}
