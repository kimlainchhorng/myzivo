/**
 * useOTAUpdate — checks Supabase Storage for a newer web bundle and (if
 * present) downloads it via @capgo/capacitor-updater. The new bundle is
 * scheduled for the next launch automatically, but the hook also exposes
 * `pending` state and `applyNow()` so the UI can offer the user a
 * "Reload now" banner — handy for hot-fixes you don't want to wait for an
 * app cold-start to deliver.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const MANIFEST_URL =
  "https://slirphzzwcogdbkeicff.supabase.co/storage/v1/object/public/app-updates/latest.json";

interface UpdateManifest {
  version: string;
  url: string;
  checksum?: string;
}

interface OTAState {
  /** True once a newer bundle has been downloaded and is queued. */
  pending: boolean;
  /** Version string of the downloaded bundle, e.g. "1.0.7". */
  pendingVersion: string | null;
  /** Apply the downloaded bundle immediately (causes a reload). */
  applyNow: () => Promise<void>;
  /** Hide the banner without applying — bundle still loads on next launch. */
  dismiss: () => void;
  /** True while the dismiss banner has been silenced for this session. */
  dismissed: boolean;
}

export function useOTAUpdate(): OTAState {
  const [pending, setPending] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  // Holds the downloaded bundle reference so applyNow() doesn't have to
  // re-download or re-look it up. We avoid putting it in state because the
  // shape from @capgo isn't relevant to React rendering.
  const downloadedRef = useRef<{ id?: string; version?: string } | null>(null);

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

        // Schedule for next launch — guaranteed delivery even if user
        // never taps the banner.
        await CapacitorUpdater.next(newBundle);

        downloadedRef.current = newBundle;
        setPendingVersion(manifest.version);
        setPending(true);
      } catch {
        // Silent — update is best-effort, never crash the app
      }
    }

    check();
    return () => { cancelled = true; };
  }, []);

  const applyNow = useCallback(async () => {
    if (!downloadedRef.current) return;
    try {
      const { CapacitorUpdater } = await import("@capgo/capacitor-updater");
      // set() switches active bundle and reloads the WebView immediately.
      await CapacitorUpdater.set(downloadedRef.current as { id: string; version: string });
    } catch {
      /* If set() fails the bundle is still queued via next() — silent. */
    }
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  return { pending, pendingVersion, applyNow, dismiss, dismissed };
}
