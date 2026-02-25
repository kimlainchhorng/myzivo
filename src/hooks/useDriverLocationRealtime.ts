/** Driver location realtime stub */
export function useDriverLocationRealtime(_driverId?: string) {
  return {
    location: null,
    isConnected: false,
  };
}
