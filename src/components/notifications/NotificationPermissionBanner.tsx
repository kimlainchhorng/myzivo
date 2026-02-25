/**
 * NotificationPermissionBanner
 * Prompts users to enable push notifications
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useWebPush } from "@/hooks/useWebPush";
import { toast } from "sonner";

const DISMISS_KEY = "zivo_notification_banner_dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function NotificationPermissionBanner() {
  const { user } = useAuth();
  const { isSupported, permission, isConfigured, subscribe, isLoading } = useWebPush();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if:
    // 1. User is logged in
    // 2. Browser supports push
    // 3. Permission not yet asked (or denied but we can ask again)
    // 4. Not recently dismissed
    // 5. VAPID is configured
    const shouldShow = () => {
      if (!user) return false;
      if (!isSupported) return false;
      if (permission === "granted") return false;
      if (!isConfigured) return false;

      // Check if dismissed recently
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10);
        if (Date.now() - dismissedTime < DISMISS_DURATION) {
          return false;
        }
      }

      return true;
    };

    // Delay showing the banner
    const timer = setTimeout(() => {
      setIsVisible(shouldShow());
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, isSupported, permission, isConfigured]);

  const handleEnable = async () => {
    const subscription = await subscribe();
    if (subscription) {
      toast.success("Notifications enabled! 🔔");
      setIsVisible(false);
    } else {
      toast.error("Could not enable notifications");
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50 p-3 safe-area-top"
        >
          <div className="max-w-lg mx-auto">
            <div className="bg-card border border-border rounded-2xl shadow-lg p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">
                    Stay updated on your orders
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Get real-time notifications for order status, support replies, and deals.
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={handleEnable}
                      disabled={isLoading}
                      className="h-8 text-xs"
                    >
                      {isLoading ? "Enabling..." : "Enable"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismiss}
                      className="h-8 text-xs text-muted-foreground"
                    >
                      Not now
                    </Button>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="p-2 rounded-full hover:bg-muted active:scale-90 transition-all duration-200 touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
