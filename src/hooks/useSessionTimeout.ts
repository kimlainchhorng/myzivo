import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UseSessionTimeoutOptions {
  warningMinutes?: number; // Minutes before expiry to show warning
  onSessionExpired?: () => void;
  onWarning?: (minutesRemaining: number) => void;
}

export const useSessionTimeout = ({
  warningMinutes = 5,
  onSessionExpired,
  onWarning,
}: UseSessionTimeoutOptions = {}) => {
  const { session, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState<number | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Failed to refresh session:", error);
        return false;
      }
      setShowWarning(false);
      setMinutesRemaining(null);
      return true;
    } catch (err) {
      console.error("Error refreshing session:", err);
      return false;
    }
  }, []);

  const handleSessionExpired = useCallback(async () => {
    setShowWarning(false);
    setMinutesRemaining(null);
    onSessionExpired?.();
    await signOut();
  }, [onSessionExpired, signOut]);

  useEffect(() => {
    if (!session?.expires_at) return;

    const checkSession = () => {
      const expiresAt = session.expires_at * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeRemaining = expiresAt - now;
      const minutesLeft = Math.floor(timeRemaining / 60000);

      if (timeRemaining <= 0) {
        handleSessionExpired();
        return;
      }

      if (minutesLeft <= warningMinutes && minutesLeft > 0) {
        setShowWarning(true);
        setMinutesRemaining(minutesLeft);
        onWarning?.(minutesLeft);
      } else {
        setShowWarning(false);
        setMinutesRemaining(null);
      }
    };

    // Check immediately
    checkSession();

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, [session?.expires_at, warningMinutes, onWarning, handleSessionExpired]);

  return {
    showWarning,
    minutesRemaining,
    refreshSession,
    dismissWarning: () => setShowWarning(false),
  };
};
