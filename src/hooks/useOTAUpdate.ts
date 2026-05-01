import { useEffect } from "react";

const MANIFEST_URL =
  "https://slirphzzwcogdbkeicff.supabase.co/storage/v1/object/public/app-updates/latest.json";

interface UpdateManifest {
  version: string;
  url: string;
  checksum?: string;
}

export function useOTAUpdate() {
  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { CapacitorUpdater } = await import("@capgo/capacitor-updater");

        const res = await fetch(MANIFEST_URL, { cache: "no-store" });
        if (!res.ok || cancelled) return;

        const manifest: UpdateManifest = await res.json();

        const { bundle } = await CapacitorUpdater.current();
        // bundle.version is empty string for the built-in (store) bundle
        const runningVersion = bundle.version || import.meta.env.VITE_APP_VERSION;

        if (runningVersion === manifest.version || cancelled) return;

        const newBundle = await CapacitorUpdater.download({
          url: manifest.url,
          version: manifest.version,
          ...(manifest.checksum ? { checksum: manifest.checksum } : {}),
        });

        if (cancelled) return;

        // Apply on next launch — no forced restart, smooth UX
        await CapacitorUpdater.next(newBundle);
      } catch {
        // Silent — update is best-effort, never crash the app
      }
    }

    check();
    return () => { cancelled = true; };
  }, []);
}
