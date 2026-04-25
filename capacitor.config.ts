import type { CapacitorConfig } from '@capacitor/cli';

const devServerUrl = process.env.CAPACITOR_DEV_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.hizovo.app',
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
