import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.72f993409c9f453aacff60e5a9b25774',
  appName: 'myzivo',
  webDir: 'dist',
  server: {
    url: 'https://72f99340-9c9f-453a-acff-60e5a9b25774.lovableproject.com?forceHideBadge=true',
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
