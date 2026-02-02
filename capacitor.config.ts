import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.72f993409c9f453aacff60e5a9b25774',
  appName: 'ZIVO Driver',
  webDir: 'dist',
  server: {
    url: 'https://72f99340-9c9f-453a-acff-60e5a9b25774.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
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
