import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zivo.app',
  appName: 'myzivo',
  webDir: 'dist',
  server: {
    // Use the live published URL so OAuth redirects work correctly in the WebView
    url: 'https://myzivo.lovable.app',
    cleartext: true,
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
    },
  },
};

export default config;
