import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export type NotificationData = {
  type: 'job_request' | 'job_cancelled' | 'job_completed' | 'payout_processed' | 'support_message';
  jobId?: string;
  jobType?: 'ride' | 'eats' | 'move';
  amount?: number;
  [key: string]: unknown;
};

type NotificationCallback = (notification: PushNotificationSchema) => void;
type ActionCallback = (action: ActionPerformed) => void;

class PushNotificationServiceClass {
  private token: string | null = null;
  private notificationListeners: Set<NotificationCallback> = new Set();
  private actionListeners: Set<ActionCallback> = new Set();
  private isRegistered = false;

  /**
   * Register for push notifications and get the device token
   */
  async register(): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not available on web');
      return null;
    }

    try {
      // Check current permission status
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('Push notification permission not granted');
        return null;
      }

      // Register with APNs/FCM
      await PushNotifications.register();

      return this.token;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return null;
    }
  }

  /**
   * Set up all push notification listeners
   */
  setupListeners(): void {
    if (!Capacitor.isNativePlatform() || this.isRegistered) {
      return;
    }

    // On registration success
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token:', token.value);
      this.token = token.value;
    });

    // On registration error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // On notification received while app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
      this.notificationListeners.forEach(listener => listener(notification));
    });

    // On notification action (user tapped notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push notification action:', action);
      this.actionListeners.forEach(listener => listener(action));
    });

    this.isRegistered = true;
  }

  /**
   * Save the device token to the database for a driver
   */
  async saveToken(driverId: string): Promise<void> {
    if (!this.token) {
      console.warn('No push token available to save');
      return;
    }

    const platform = Capacitor.getPlatform();
    const updateData: Record<string, string> = {
      device_platform: platform,
    };

    if (platform === 'ios') {
      updateData.apns_token = this.token;
    } else if (platform === 'android') {
      updateData.fcm_token = this.token;
    }

    const { error } = await supabase
      .from('drivers')
      .update(updateData)
      .eq('id', driverId);

    if (error) {
      console.error('Failed to save push token:', error);
    }
  }

  /**
   * Clear the device token from the database
   */
  async clearToken(driverId: string): Promise<void> {
    const { error } = await supabase
      .from('drivers')
      .update({
        fcm_token: null,
        apns_token: null,
        device_platform: null,
      })
      .eq('id', driverId);

    if (error) {
      console.error('Failed to clear push token:', error);
    }
  }

  /**
   * Add a listener for incoming notifications
   */
  onNotificationReceived(callback: NotificationCallback): () => void {
    this.notificationListeners.add(callback);
    return () => this.notificationListeners.delete(callback);
  }

  /**
   * Add a listener for notification actions (taps)
   */
  onNotificationAction(callback: ActionCallback): () => void {
    this.actionListeners.add(callback);
    return () => this.actionListeners.delete(callback);
  }

  /**
   * Get the current push token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Remove all delivered notifications
   */
  async clearNotifications(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await PushNotifications.removeAllDeliveredNotifications();
    }
  }
}

// Singleton instance
export const PushNotificationService = new PushNotificationServiceClass();
