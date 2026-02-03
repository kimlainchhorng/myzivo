/**
 * Native Features Hook
 * Provides access to device capabilities for Capacitor apps
 */
import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Network, ConnectionStatus } from "@capacitor/network";
import { App, AppState, URLOpenListenerEvent } from "@capacitor/app";

export interface NativeState {
  platform: "ios" | "android" | "web";
  isNative: boolean;
  isOnline: boolean;
  connectionType: string;
  appState: "active" | "inactive" | "background";
}

export const useNativeFeatures = () => {
  const [state, setState] = useState<NativeState>({
    platform: "web",
    isNative: false,
    isOnline: true,
    connectionType: "unknown",
    appState: "active",
  });

  // Initialize native features
  useEffect(() => {
    const platform = Capacitor.getPlatform() as "ios" | "android" | "web";
    const isNative = Capacitor.isNativePlatform();

    setState(prev => ({ ...prev, platform, isNative }));

    if (!isNative) return;

    // Set up network status listener
    const setupNetwork = async () => {
      const status = await Network.getStatus();
      setState(prev => ({
        ...prev,
        isOnline: status.connected,
        connectionType: status.connectionType,
      }));

      Network.addListener("networkStatusChange", (status: ConnectionStatus) => {
        setState(prev => ({
          ...prev,
          isOnline: status.connected,
          connectionType: status.connectionType,
        }));
      });
    };

    // Set up app state listener
    const setupAppState = () => {
      App.addListener("appStateChange", (state: AppState) => {
        setState(prev => ({
          ...prev,
          appState: state.isActive ? "active" : "background",
        }));
      });

      // Handle deep links
      App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
        const url = event.url;
        // Handle deep link navigation
        handleDeepLink(url);
      });
    };

    setupNetwork();
    setupAppState();

    return () => {
      Network.removeAllListeners();
      App.removeAllListeners();
    };
  }, []);

  // Handle deep links
  const handleDeepLink = (url: string) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      // Navigate to the path if it's a valid app route
      if (path && path !== "/") {
        window.location.href = path;
      }
    } catch (error) {
      console.error("[DeepLink] Error parsing URL:", error);
    }
  };

  // Haptic feedback
  const hapticImpact = useCallback(async (style: "light" | "medium" | "heavy" = "medium") => {
    if (!Capacitor.isNativePlatform()) return;
    
    const impactStyle = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    }[style];

    await Haptics.impact({ style: impactStyle });
  }, []);

  const hapticNotification = useCallback(async (type: "success" | "warning" | "error" = "success") => {
    if (!Capacitor.isNativePlatform()) return;
    
    const notificationType = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error,
    }[type];

    await Haptics.notification({ type: notificationType });
  }, []);

  const hapticVibrate = useCallback(async (duration: number = 300) => {
    if (!Capacitor.isNativePlatform()) return;
    
    await Haptics.vibrate({ duration });
  }, []);

  // Exit app (Android only)
  const exitApp = useCallback(async () => {
    if (Capacitor.getPlatform() === "android") {
      await App.exitApp();
    }
  }, []);

  // Get app info
  const getAppInfo = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      return { name: "ZIVO", version: "1.0.0", build: "1" };
    }
    
    const info = await App.getInfo();
    return info;
  }, []);

  // Open URL in browser
  const openInBrowser = useCallback(async (url: string) => {
    // Use window.open for all platforms - Capacitor handles this
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  return {
    ...state,
    hapticImpact,
    hapticNotification,
    hapticVibrate,
    exitApp,
    getAppInfo,
    openInBrowser,
  };
};
