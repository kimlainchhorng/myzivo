import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const APP_URLS = {
  main: "https://myzivo.lovable.app",
  restaurant: "https://zivorestaurant.lovable.app",
  driver: "https://zivodriver.lovable.app",
} as const;

export type AppType = keyof typeof APP_URLS;

export const useCrossAppAuth = () => {
  const { user, session } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const navigateToApp = async (appType: AppType) => {
    if (!session?.access_token) {
      // Not logged in, just redirect
      window.location.href = APP_URLS[appType];
      return;
    }

    setIsRedirecting(true);

    try {
      const targetUrl = APP_URLS[appType].replace("https://", "");
      
      const { data, error } = await supabase.functions.invoke("create-auth-token", {
        body: { targetApp: targetUrl },
      });

      if (error) {
        console.error("Failed to create cross-app token:", error);
        // Fallback: just redirect without auth
        window.location.href = APP_URLS[appType];
        return;
      }

      // Redirect with token
      window.location.href = `${APP_URLS[appType]}/auth-callback?token=${data.token}`;
    } catch (err) {
      console.error("Cross-app auth error:", err);
      window.location.href = APP_URLS[appType];
    } finally {
      setIsRedirecting(false);
    }
  };

  return {
    navigateToApp,
    isRedirecting,
    appUrls: APP_URLS,
  };
};

export const useExchangeAuthToken = () => {
  const [isExchanging, setIsExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exchangeToken = async (token: string): Promise<string | null> => {
    setIsExchanging(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("exchange-auth-token", {
        body: { token },
      });

      if (fnError || !data?.redirect_url) {
        setError("Invalid or expired authentication token");
        return null;
      }

      return data.redirect_url;
    } catch (err) {
      setError("Failed to authenticate");
      return null;
    } finally {
      setIsExchanging(false);
    }
  };

  return {
    exchangeToken,
    isExchanging,
    error,
  };
};
