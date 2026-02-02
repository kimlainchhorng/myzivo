import { Capacitor } from '@capacitor/core';

/**
 * Opens the native maps application with turn-by-turn navigation to the destination.
 * Uses Apple Maps on iOS and Google Maps on Android.
 */
export const openNativeNavigation = (lat: number, lng: number, label?: string) => {
  const platform = Capacitor.getPlatform();
  const encodedLabel = label ? encodeURIComponent(label) : '';
  
  if (platform === 'ios') {
    // Apple Maps with driving directions
    const url = `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d${encodedLabel ? `&q=${encodedLabel}` : ''}`;
    window.open(url, '_system');
  } else if (platform === 'android') {
    // Google Maps navigation mode
    const url = `google.navigation:q=${lat},${lng}`;
    window.open(url, '_system');
  } else {
    // Web fallback - open Google Maps in browser
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
  }
};

/**
 * Opens the native maps application to show a location (without navigation).
 */
export const openNativeMap = (lat: number, lng: number, label?: string) => {
  const platform = Capacitor.getPlatform();
  const encodedLabel = label ? encodeURIComponent(label) : '';
  
  if (platform === 'ios') {
    const url = `maps://maps.apple.com/?ll=${lat},${lng}${encodedLabel ? `&q=${encodedLabel}` : ''}`;
    window.open(url, '_system');
  } else if (platform === 'android') {
    const url = `geo:${lat},${lng}?q=${lat},${lng}${encodedLabel ? `(${encodedLabel})` : ''}`;
    window.open(url, '_system');
  } else {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  }
};

/**
 * Check if the app is running as a native mobile app
 */
export const isNativePlatform = (): boolean => {
  const platform = Capacitor.getPlatform();
  return platform === 'ios' || platform === 'android';
};

/**
 * Get the current platform
 */
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};
