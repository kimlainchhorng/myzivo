import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zivo.travel',
  appName: 'ZIVO',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Geolocation: {
      requestPermissions: true
    },
    Camera: {
      presentationStyle: 'fullscreen'
    }
  },
  ios: {
    backgroundColor: '#000000',
    contentInset: 'automatic'
  },
  android: {
    backgroundColor: '#000000',
    allowMixedContent: true
  }
};

export default config;
