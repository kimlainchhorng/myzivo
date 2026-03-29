import type { CapacitorConfig } from '@capacitor/cli';

const devServerUrl = process.env.CAPACITOR_DEV_SERVER_URL;

// Production: always load from published URL so updates deploy instantly
// without needing a new App Store review.
// Dev: override with CAPACITOR_DEV_SERVER_URL for hot-reload.
const serverUrl = devServerUrl || 'https://myzivo.lovable.app';

const config: CapacitorConfig = {
  appId: 'app.lovable.72f993409c9f453aacff60e5a9b25774',
  appName: 'myzivo',
  webDir: 'dist',
  server: {
    url: serverUrl,
    cleartext: true,
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
    },
    SplashScreen: {
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
