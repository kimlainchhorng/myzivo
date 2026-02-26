import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hizovo.app',
  appName: 'ZIVO',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#0D0D0F',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0D0D0F'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    Haptics: {}
  },
  ios: {
    backgroundColor: '#0D0D0F',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true
  },
  android: {
    backgroundColor: '#0D0D0F',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    adjustMarginsForEdgeToEdge: 'auto'
  }
};

export default config;
