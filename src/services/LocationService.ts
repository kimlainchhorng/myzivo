import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

type LocationCallback = (location: LocationCoordinates) => void;

class LocationServiceClass {
  private watchId: string | null = null;
  private lastKnownLocation: LocationCoordinates | null = null;
  private listeners: Set<LocationCallback> = new Set();

  /**
   * Check if location permissions are granted
   */
  async checkPermissions(): Promise<PermissionStatus> {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback
      return { location: 'granted', coarseLocation: 'granted' };
    }
    return await Geolocation.checkPermissions();
  }

  /**
   * Request location permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // For web, just try to get position which triggers browser permission
        await Geolocation.getCurrentPosition();
        return true;
      }

      const result = await Geolocation.requestPermissions();
      return result.location === 'granted';
    } catch (error) {
      console.error('Failed to request location permissions:', error);
      return false;
    }
  }

  /**
   * Get the current position once
   */
  async getCurrentPosition(): Promise<LocationCoordinates | null> {
    try {
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      const location: LocationCoordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading ?? undefined,
        speed: position.coords.speed ?? undefined,
      };

      this.lastKnownLocation = location;
      return location;
    } catch (error) {
      console.error('Failed to get current position:', error);
      return this.lastKnownLocation;
    }
  }

  /**
   * Start continuous location tracking
   */
  async startTracking(callback?: LocationCallback): Promise<void> {
    if (callback) {
      this.listeners.add(callback);
    }

    if (this.watchId) {
      // Already tracking
      return;
    }

    try {
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        },
        (position, error) => {
          if (error) {
            console.error('Location tracking error:', error);
            return;
          }

          if (position) {
            const location: LocationCoordinates = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              heading: position.coords.heading ?? undefined,
              speed: position.coords.speed ?? undefined,
            };

            this.lastKnownLocation = location;
            
            // Notify all listeners
            this.listeners.forEach(listener => listener(location));
          }
        }
      );
    } catch (error) {
      console.error('Failed to start location tracking:', error);
    }
  }

  /**
   * Stop location tracking
   */
  async stopTracking(): Promise<void> {
    if (this.watchId) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
    this.listeners.clear();
  }

  /**
   * Add a listener without starting tracking
   */
  addListener(callback: LocationCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Remove a specific listener
   */
  removeListener(callback: LocationCallback): void {
    this.listeners.delete(callback);
  }

  /**
   * Get the last known location
   */
  getLastKnownLocation(): LocationCoordinates | null {
    return this.lastKnownLocation;
  }

  /**
   * Check if currently tracking
   */
  isTracking(): boolean {
    return this.watchId !== null;
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  calculateDistance(
    from: LocationCoordinates,
    to: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(to.lat - from.lat);
    const dLng = this.toRad(to.lng - from.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.lat)) *
        Math.cos(this.toRad(to.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert distance to miles
   */
  kmToMiles(km: number): number {
    return km * 0.621371;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

// Singleton instance
export const LocationService = new LocationServiceClass();
