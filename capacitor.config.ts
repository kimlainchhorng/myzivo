import type { CapacitorConfig } from '@capacitor/cli';

// Only allow a dev-server override in explicit development mode.
// NODE_ENV=production (set automatically by all CI/CD and release build tools)
// prevents this from ever being baked into a store release.
const devServerUrl =
  process.env.NODE_ENV !== 'production'
    ? process.env.CAPACITOR_DEV_SERVER_URL
    : undefined;

const config: CapacitorConfig = {
  appId: 'com.myzivo.app',
  appName: 'Zivo',
  webDir: 'dist',
  ...(devServerUrl
    ? {
        server: {
          url: devServerUrl,
          cleartext: true,
        },
      }
    : {}),
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,   // we check manually via useOTAUpdate hook
      statsUrl: "",        // no Capgo cloud reporting
      channelUrl: "",      // no Capgo cloud channel
    },
    StatusBar: {
      // Edge-to-edge: webview extends under the native status bar so cover
      // photos, gradients, and headers reach the very top of the screen.
      // Interactive controls must use env(safe-area-inset-top) (or the
      // .pt-safe / --zivo-safe-top-sticky tokens) to stay clear of the
      // status bar area.
      overlaysWebView: true,
      style: 'DARK',
    },
    SplashScreen: {
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
