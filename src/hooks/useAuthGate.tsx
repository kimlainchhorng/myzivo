/**
 * useAuthGate — opens a friendly "Sign in to continue" sheet for guest users.
 *
 * Usage:
 *   const { requireAuth, sheet } = useAuthGate();
 *   const handleLike = () => requireAuth("like a post", () => doLike());
 *   return (<>{sheet}<Button onClick={handleLike} /></>);
 */
import { useState, useCallback, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthGatePrompt from "@/components/auth/AuthGatePrompt";

export function useAuthGate() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("continue");

  const requireAuth = useCallback(
    (action: string, fn: () => void | Promise<void>) => {
      if (user) {
        fn();
        return true;
      }
      setReason(action);
      setOpen(true);
      return false;
    },
    [user]
  );

  const sheet: ReactNode = (
    <AuthGatePrompt open={open} reason={reason} onClose={() => setOpen(false)} />
  );

  return { requireAuth, sheet, isGuest: !user };
}
